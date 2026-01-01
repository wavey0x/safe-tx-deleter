import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useAccount, useSignTypedData, useSwitchChain } from "wagmi";
import {
  fetchQueuedTransactions,
  type MultisigTransaction,
  deleteQueuedTransaction,
  ApiError,
  fetchSafeInfo,
} from "../utils/safeApi";
import {
  getChainByKey,
  getSafeQueueTxUrl,
  getSafeQueueUrl,
  type ChainKey,
} from "../utils/chains";
import { formatAge, shortenHex } from "../utils/format";
import { useToast } from "../contexts/ToastContext";
import { useFavorites } from "../utils/favorites";
import { useSafeLabels } from "../utils/safeLabels";
import { normalizeAddress } from "../utils/address";
import StarButton from "../components/StarButton";
import EditableLabel from "../components/EditableLabel";
import styles from "./SafeQueuePage.module.css";

const PAGE_SIZE = 20;

const LOADING_MESSAGES = [
  "Loading queue...",
  "Fetching transactions...",
  "This may take a moment...",
  "Checking for queued items...",
];

const CyclingText = () => {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((i) => (i + 1) % LOADING_MESSAGES.length);
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  return <span className="muted">{LOADING_MESSAGES[index]}</span>;
};

const SafeQueuePage = () => {
  const { chainKey, safeAddress } = useParams();
  const chain = getChainByKey(chainKey ?? "");
  const normalizedSafeAddress = normalizeAddress(safeAddress ?? "");
  const { address, chainId } = useAccount();
  const { switchChainAsync } = useSwitchChain();
  const { signTypedDataAsync } = useSignTypedData();
  const { addToast } = useToast();
  const { isFavorite, toggleFavorite } = useFavorites();
  const { getLabel, setLabel } = useSafeLabels();

  const [transactions, setTransactions] = useState<MultisigTransaction[]>([]);
  const [loading, setLoading] = useState(false);
  const [confirmTx, setConfirmTx] = useState<MultisigTransaction | null>(null);
  const [safeNonce, setSafeNonce] = useState<number | null>(null);
  const [retryNotice, setRetryNotice] = useState("");

  const loadQueue = useCallback(
    async (nextOffset = 0) => {
      if (!chain || !normalizedSafeAddress) return;
      setLoading(true);
      setRetryNotice("");

      try {
        let currentNonce = safeNonce;
        if (nextOffset === 0) {
          const safeInfo = await fetchSafeInfo(chain.chainKey, normalizedSafeAddress);
          const nonceValue = Number(safeInfo.nonce);
          currentNonce = nonceValue;
          setSafeNonce(nonceValue);
        }
        const data = await fetchQueuedTransactions(
          chain.chainKey,
          normalizedSafeAddress,
          PAGE_SIZE,
          nextOffset,
          currentNonce ?? undefined
        );
        setTransactions((prev) => {
          const next = nextOffset === 0 ? data.results : [...prev, ...data.results];
          if (currentNonce === null || currentNonce === undefined) return next;
          return next.filter((tx) => Number(tx.nonce) >= currentNonce);
        });
      } catch (error) {
        if (error instanceof ApiError && error.status === 429) {
          setRetryNotice("Rate limited. Please wait while we retry every 3s.");
        } else {
          addToast("Failed to load queue. Try again later.");
        }
      } finally {
        setLoading(false);
      }
    },
    [chain, normalizedSafeAddress, safeNonce, addToast]
  );

  useEffect(() => {
    loadQueue(0);
  }, [loadQueue]);

  useEffect(() => {
    const handleVisibility = () => {
      if (document.visibilityState === "visible" && chain && normalizedSafeAddress) {
        loadQueue(0);
      }
    };
    document.addEventListener("visibilitychange", handleVisibility);
    return () => document.removeEventListener("visibilitychange", handleVisibility);
  }, [loadQueue]);

  type Eligibility = "yours" | "not-yours" | "unknown";

  const eligibleMap = useMemo(() => {
    const lower = address?.toLowerCase();
    return new Map<string, Eligibility>(
      transactions.map((tx) => {
        const proposerRaw = tx.proposedByDelegate || tx.proposer;
        if (!proposerRaw) {
          return [tx.safeTxHash, "unknown"];
        }
        const proposer = proposerRaw.toLowerCase();
        const isYours = Boolean(lower && proposer === lower);
        return [tx.safeTxHash, isYours ? "yours" : "not-yours"];
      })
    );
  }, [transactions, address]);

  const hasEligible = useMemo(() => {
    return transactions.some((tx) => eligibleMap.get(tx.safeTxHash) === "yours");
  }, [transactions, eligibleMap]);

  const handleDelete = async (tx: MultisigTransaction) => {
    if (!chain || !normalizedSafeAddress) return;
    if (!address) {
      addToast("Connect a wallet to delete.");
      return;
    }

    try {
      if (chainId !== chain.chainId) {
        try {
          await switchChainAsync({ chainId: chain.chainId });
        } catch {
          addToast(`Please switch to ${chain.displayName} to delete.`);
          setConfirmTx(null);
          return;
        }
      }

      const totp = Math.floor(Date.now() / 1000 / 3600);
      const signature = await signTypedDataAsync({
        domain: {
          name: "Safe Transaction Service",
          version: "1.0",
          chainId: chain.chainId,
          verifyingContract: normalizedSafeAddress,
        },
        types: {
          DeleteRequest: [
            { name: "safeTxHash", type: "bytes32" },
            { name: "totp", type: "uint256" },
          ],
        },
        primaryType: "DeleteRequest",
        message: {
          safeTxHash: tx.safeTxHash,
          totp,
        },
      });

      await deleteQueuedTransaction(chain.chainKey, tx.safeTxHash, signature, totp);
      setTransactions((prev) => prev.filter((item) => item.safeTxHash !== tx.safeTxHash));
      addToast("Transaction deleted.");
    } catch (error) {
      if (error instanceof ApiError) {
        if (error.status === 404) {
          addToast("Transaction not found or already removed.");
          setTransactions((prev) => prev.filter((item) => item.safeTxHash !== tx.safeTxHash));
        } else if (error.status === 401 || error.status === 403) {
          addToast("Signature invalid or not proposer.");
        } else if (error.status === 429) {
          addToast("Too many requests. Please wait a moment.");
        } else {
          addToast("Delete failed. Try again later.");
        }
      } else {
        addToast("Delete failed. Try again later.");
      }
    } finally {
      setConfirmTx(null);
    }
  };

  if (!chain || !normalizedSafeAddress) {
    return (
      <div>
        <div className="sectionTitle">Invalid Safe</div>
        <div className="muted">Chain or Safe address not recognized.</div>
      </div>
    );
  }

  return (
    <div>
      <div className={styles.header}>
        <div className={styles.headerInfo}>
          <div className={styles.titleRow}>
            <Link to="/" className={styles.backIcon} aria-label="Back">
              <svg viewBox="0 0 16 16" aria-hidden="true">
                <path
                  d="M9.5 3.5L5 8l4.5 4.5M5 8h7"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </Link>
            <div className={styles.title}>Queue</div>
          </div>
          <EditableLabel
            address={normalizedSafeAddress}
            label={getLabel(normalizedSafeAddress)}
            onSave={(label) => setLabel(normalizedSafeAddress, label)}
            externalUrl={getSafeQueueUrl(chain.chainKey, normalizedSafeAddress)}
            chainIconUrl={chain.logoUrl}
            trailing={
              <StarButton
                active={isFavorite(chain.chainKey, normalizedSafeAddress)}
                onClick={(_e) => {
                  toggleFavorite({
                    chainKey: chain.chainKey,
                    safeAddress: normalizedSafeAddress,
                  });
                }}
              />
            }
          />
        </div>
      </div>

      {loading ? (
        <div className={styles.loadingWrap}>
          <div className={styles.spinner} aria-label="Loading" />
          <CyclingText />
        </div>
      ) : retryNotice ? (
        <div className="muted">{retryNotice}</div>
      ) : transactions.length === 0 ? (
        <div className={styles.centerMessage}>No queued transactions.</div>
      ) : (
        <div className={styles.table}>
          <div className={styles.tableHeader}>
            <span>Age</span>
            <span>Nonce</span>
            <span>Safe Tx Hash</span>
            <span>Proposer</span>
            <span className={styles.alignRight}>Action</span>
          </div>
          {transactions.map((tx) => {
            const proposer = tx.proposedByDelegate || tx.proposer || "--";
            const eligibility = eligibleMap.get(tx.safeTxHash) ?? "unknown";
            const rowClass =
              eligibility === "yours" ? styles.tableRow : styles.tableRowDisabled;
            return (
              <div key={tx.safeTxHash} className={rowClass}>
                <span>{formatAge(tx.submissionDate)}</span>
                <span className="mono">{tx.nonce}</span>
                <span className="mono">{shortenHex(tx.safeTxHash, 6, 6)}</span>
                <span className="mono">{shortenHex(proposer)}</span>
                <span className={styles.alignRight}>
                  <div className={styles.rowActions}>
                    <a
                      href={getSafeQueueTxUrl(
                        chain.chainKey,
                        normalizedSafeAddress,
                        tx.safeTxHash
                      )}
                      target="_blank"
                      rel="noreferrer"
                      className={styles.linkButton}
                    >
                      View →
                    </a>
                    {eligibility === "yours" ? (
                      <button
                        type="button"
                        onClick={() => setConfirmTx(tx)}
                        className={`${styles.linkButton} ${styles.deleteButton}`}
                      >
                        Delete
                      </button>
                    ) : (
                      <button
                        type="button"
                        disabled
                        title="Connected wallet is not the proposer, thus cannot delete."
                        className={`${styles.linkButton} ${styles.deleteButton} ${styles.deleteButtonDisabled}`}
                      >
                        Delete
                      </button>
                    )}
                  </div>
                </span>
              </div>
            );
          })}
        </div>
      )}

      {confirmTx && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <div className={styles.modalTitle}>Confirm deletion</div>
            <p className="muted">
              Delete queued transaction {shortenHex(confirmTx.safeTxHash, 6, 6)}?
            </p>
            <div className={styles.modalActions}>
              <button type="button" onClick={() => setConfirmTx(null)}>
                Cancel
              </button>
              <button type="button" onClick={() => handleDelete(confirmTx)}>
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default SafeQueuePage;
