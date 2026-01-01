# Safe Queue Deleter Web UI - Specification (Minimal SPA)

## Overview
Build a minimal, client-side web app that lets any user connect a wallet, discover Safes they own across supported networks, manually open a Safe’s queue, and delete only queued multisig transactions they personally proposed. The app uses the Safe Transaction Service API directly and has no backend.

## Key Decisions
- SPA with client-side routing (React + Vite + React Router).
- Wallet connection via `wagmi` + `viem`.
- State via React hooks + context only (no external state library).
- TypeScript codebase.
- Styling: CSS Modules with a small global reset and CSS variables.
- No API server; all data comes from Safe Transaction Service.
- No caching of API data; only favorites stored in `localStorage`.
- Supported chains = Safe Transaction Service supported networks (hardcoded list, updated manually).

## Goals
- Connected-wallet signing only (no keystore/private keys).
- Discover owner Safes across all supported chains.
- Manual Safe lookup by address + chain.
- Clearly show which queued transactions are deletable by the connected wallet.
- Allow starring Safes for quick access on home.

## Non-Goals
- Creating or executing transactions.
- Confirmation/approval flows.
- Delegate discovery across all Safes.
- Backend services or off-chain indexing.

## Supported Networks
- Base URL: `https://api.safe.global/tx-service/{chain}/`.
- Maintain a hardcoded chain registry with:
  - `chainKey` (Safe API segment, e.g., `eth`, `matic`, `arb1`)
  - `chainId`
  - `displayName`
  - `explorerBaseUrl`
- Initial list should cover major Safe-supported networks, and be easy to extend:
  - `eth` (1), `matic` (137), `arb1` (42161), `opt` (10), `base` (8453), `gnosis` (100), `bsc` (56), `avax` (43114)

## Core API Calls
- **List Safes by owner**
  - `GET /api/v1/owners/{address}/safes/`
  - Returns `{ safes: [safeAddress] }`.

- **List queued multisig transactions (preferred)**
  - `GET /api/v2/safes/{address}/multisig-transactions/?executed=false&queued=true`
  - If `queued` is unsupported, fall back to:
    - `GET /api/v2/safes/{address}/multisig-transactions/` and filter client-side.

- **Get transaction details**
  - `GET /api/v2/multisig-transactions/{safe_tx_hash}/`
  - Used for refresh or deep details.

- **Delete queued multisig transaction**
  - `DELETE /api/v2/multisig-transactions/{safe_tx_hash}/`
  - Body: `{ signature, totp }`.

## Transaction Eligibility Logic
A transaction is deletable by the connected wallet if:
- It is queued and not executed.
- The connected wallet is the proposer of record.
- Determine proposer by priority:
  - `proposedByDelegate` if present and non-null
  - otherwise `proposer`

Queued filters (if needed client-side):
- `isExecuted == false`
- `executor == null` (or absent)
- `executionDate == null` (when present)

## EIP-712 Delete Signature
Use wallet signing to delete queued transactions.

**Domain**
- `name`: `Safe Transaction Service`
- `version`: `1.0`
- `chainId`: active chainId
- `verifyingContract`: Safe address

**Primary type**: `DeleteRequest`

**Message**
- `safeTxHash`: `bytes32`
- `totp`: `Math.floor(Date.now() / 1000 / 3600)`

**Signing**
- Use `eth_signTypedData_v4` via wagmi/viem typed data helpers.
- Send `DELETE` with JSON body `{ signature, totp }`.

## Routes (SPA)
- `/` Home
  - **Favorites** (from `localStorage`)
  - **My Safes** (owner discovery across chains)
  - **Manual Safe Search** (address + chain)

- `/safe/:chainKey/:safeAddress`
  - Queue list with delete actions
  - Safe metadata header (address, chain, link to Safe UI)
  - Manual refresh action

## Home Page Sections
### Favorites
- Saved Safes from `localStorage`.
- Each entry shows chain, short address, and a “Go to queue” link.
- Allow star/unstar from Safe detail view (and optionally from list rows).

### My Safes
- For each supported chain:
  - Call owner safes endpoint.
  - Aggregate and display results grouped by chain.
- Dedupe by address + chain.

### Manual Safe Search
- Input Safe address and chain selector.
- Validate address formatting.
- Navigate to queue route.

## Safe Queue Page
- Fetch queued multisig transactions for the Safe.
- Sort by submission date (oldest first), fixed (no toggle).
- Row shows: age, nonce, short safeTxHash, proposer, and eligibility state.
- Clear visual differentiation:
  - **Eligible**: active delete button.
  - **Ineligible**: disabled row and button, helper text: “Only proposer can delete.”

## Favorites
- Store list in `localStorage` only.
- Schema (example):
  - `[{ chainKey, safeAddress, label? }]`
- Optional label can be user-assigned on star.

## Wallet UI
- Connection status button always in top right.
- Shows short address when connected, “Connect Wallet” when not.
- No dedicated “connect section.”
- Wallet connectors: Injected, WalletConnect, and Coinbase Wallet.
- Network switching: prompt and request via `wallet_switchEthereumChain` when signing on a different chain.
- Dark mode toggle (moon/sun) in header; default follows system preference.
- WalletConnect Project ID from `VITE_WALLETCONNECT_PROJECT_ID` (required for WC).

## Error Handling
- 404 on delete: “Transaction not found or already removed.”
- 401/403: “Signature invalid or not proposer.”
- Rate limit: back off with user feedback.
- If chain mismatch for signing, prompt to switch networks.

## Performance
- Avoid unnecessary polling.
- Use pagination if Safe has many queued items.
- No API data caching beyond in-memory state.
- Refresh is manual, plus after successful delete and on page focus.

## UX Notes
- Delete is single-transaction only (no batching).
- Deletion uses a confirmation dialog before signature.
- Post-delete: show toast and remove row from list.
- Empty states (no illustrations):
  - No wallet connected: “Connect a wallet to see your Safes.” 
  - No Safes found: “No Safes found for this owner.” 
  - No queued transactions: “No queued transactions.” 
  - No deletable transactions: “No queued transactions proposed by this wallet.”

## Pagination
- Use a simple “Load more” button.
- Page size defaults to 20 (Safe API default) unless overridden.

## Age Formatting
- Display relative age in compact form: `4h12m`, `2d4h`, `15m`.
- If older than 30 days, display `YYYY-MM-DD`.

## Safe App Links
- Safe UI base: `https://app.safe.global/`.
- Safe link: `https://app.safe.global/transactions/queue?safe={chainKey}:{safeAddress}`.
- Transaction link: same URL with `&txHash={safeTxHash}` if supported; fall back to safe link otherwise.

## Security & Privacy
- All signatures local via wallet.
- No private keys or backend storage.
- Only Safe Transaction Service endpoints used.
