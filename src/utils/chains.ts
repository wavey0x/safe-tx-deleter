import {
  mainnet,
  polygon,
  arbitrum,
  optimism,
  base,
  gnosis,
  bsc,
  avalanche,
  type Chain,
} from "viem/chains";

export type ChainKey =
  | "eth"
  | "arb1"
  | "oeth"
  | "base"
  | "pol"
  | "gno"
  | "bnb"
  | "avax";

export type ChainInfo = {
  chainKey: ChainKey;
  chainId: number;
  displayName: string;
  shortName: string;
  logoUrl: string;
  explorerBaseUrl: string;
  safeApiBaseUrl: string;
  safeAppBaseUrl: string;
  safeAppChainKey: string;
  viemChain: Chain;
};

const SAFE_API_ROOT =
  (import.meta.env.VITE_SAFE_API_ROOT as string | undefined) ??
  (import.meta.env.DEV
    ? "/safe-api"
    : "https://api.safe.global/tx-service");
const SAFE_APP_ROOT = "https://app.safe.global";

const TRUST_WALLET_ASSETS =
  "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains";

export const chainRegistry: ChainInfo[] = [
  {
    chainKey: "eth",
    chainId: 1,
    displayName: "Ethereum",
    shortName: "ETH",
    logoUrl: `${TRUST_WALLET_ASSETS}/ethereum/info/logo.png`,
    explorerBaseUrl: "https://etherscan.io",
    safeApiBaseUrl: `${SAFE_API_ROOT}/eth`,
    safeAppBaseUrl: SAFE_APP_ROOT,
    safeAppChainKey: "eth",
    viemChain: mainnet,
  },
  {
    chainKey: "pol",
    chainId: 137,
    displayName: "Polygon",
    shortName: "POL",
    logoUrl: `${TRUST_WALLET_ASSETS}/polygon/info/logo.png`,
    explorerBaseUrl: "https://polygonscan.com",
    safeApiBaseUrl: `${SAFE_API_ROOT}/pol`,
    safeAppBaseUrl: SAFE_APP_ROOT,
    safeAppChainKey: "matic",
    viemChain: polygon,
  },
  {
    chainKey: "arb1",
    chainId: 42161,
    displayName: "Arbitrum",
    shortName: "ARB",
    logoUrl: `${TRUST_WALLET_ASSETS}/arbitrum/info/logo.png`,
    explorerBaseUrl: "https://arbiscan.io",
    safeApiBaseUrl: `${SAFE_API_ROOT}/arb1`,
    safeAppBaseUrl: SAFE_APP_ROOT,
    safeAppChainKey: "arb1",
    viemChain: arbitrum,
  },
  {
    chainKey: "oeth",
    chainId: 10,
    displayName: "Optimism",
    shortName: "OP",
    logoUrl: `${TRUST_WALLET_ASSETS}/optimism/info/logo.png`,
    explorerBaseUrl: "https://optimistic.etherscan.io",
    safeApiBaseUrl: `${SAFE_API_ROOT}/oeth`,
    safeAppBaseUrl: SAFE_APP_ROOT,
    safeAppChainKey: "oeth",
    viemChain: optimism,
  },
  {
    chainKey: "base",
    chainId: 8453,
    displayName: "Base",
    shortName: "BASE",
    logoUrl: `${TRUST_WALLET_ASSETS}/base/info/logo.png`,
    explorerBaseUrl: "https://basescan.org",
    safeApiBaseUrl: `${SAFE_API_ROOT}/base`,
    safeAppBaseUrl: SAFE_APP_ROOT,
    safeAppChainKey: "base",
    viemChain: base,
  },
  {
    chainKey: "gno",
    chainId: 100,
    displayName: "Gnosis",
    shortName: "GNO",
    logoUrl: `${TRUST_WALLET_ASSETS}/xdai/info/logo.png`,
    explorerBaseUrl: "https://gnosisscan.io",
    safeApiBaseUrl: `${SAFE_API_ROOT}/gno`,
    safeAppBaseUrl: SAFE_APP_ROOT,
    safeAppChainKey: "gno",
    viemChain: gnosis,
  },
  {
    chainKey: "bnb",
    chainId: 56,
    displayName: "BNB Chain",
    shortName: "BNB",
    logoUrl: `${TRUST_WALLET_ASSETS}/smartchain/info/logo.png`,
    explorerBaseUrl: "https://bscscan.com",
    safeApiBaseUrl: `${SAFE_API_ROOT}/bnb`,
    safeAppBaseUrl: SAFE_APP_ROOT,
    safeAppChainKey: "bnb",
    viemChain: bsc,
  },
  {
    chainKey: "avax",
    chainId: 43114,
    displayName: "Avalanche",
    shortName: "AVAX",
    logoUrl: `${TRUST_WALLET_ASSETS}/avalanchec/info/logo.png`,
    explorerBaseUrl: "https://snowtrace.io",
    safeApiBaseUrl: `${SAFE_API_ROOT}/avax`,
    safeAppBaseUrl: SAFE_APP_ROOT,
    safeAppChainKey: "avax",
    viemChain: avalanche,
  },
];

export const wagmiChains = chainRegistry.map((chain) => chain.viemChain);

export const getChainByKey = (chainKey: string) =>
  chainRegistry.find((chain) => chain.chainKey === chainKey);

export const getChainById = (chainId?: number) =>
  chainRegistry.find((chain) => chain.chainId === chainId);

export const getSafeQueueUrl = (chainKey: ChainKey, safeAddress: string) => {
  const chain = getChainByKey(chainKey);
  const safeChainKey = chain?.safeAppChainKey ?? chainKey;
  return `${SAFE_APP_ROOT}/transactions/queue?safe=${safeChainKey}:${safeAddress}`;
};

export const getSafeQueueTxUrl = (
  chainKey: ChainKey,
  safeAddress: string,
  safeTxHash: string
) => `${getSafeQueueUrl(chainKey, safeAddress)}&txHash=${safeTxHash}`;
