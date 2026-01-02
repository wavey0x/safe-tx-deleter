import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAccount } from "wagmi";
import { chainRegistry, type ChainKey, getChainByKey, getSafeQueueUrl } from "../utils/chains";
import { fetchOwnerSafes } from "../utils/safeApi";
import { useFavorites } from "../utils/favorites";
import { useSafeLabels } from "../utils/safeLabels";
import { useToast } from "../contexts/ToastContext";
import { normalizeAddress } from "../utils/address";
import StarButton from "../components/StarButton";
import EditableLabel from "../components/EditableLabel";
import Spinner from "../components/Spinner";
import { RefreshCcw } from "lucide-react";
import styles from "./HomePage.module.css";

const LOADING_MESSAGES = [
  "Loading Safes...",
  "This may take a while...",
  "Fetching from multiple chains...",
  "Rate limits may slow things down...",
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

const HomePage = () => {
  const navigate = useNavigate();
  const { address, isConnected } = useAccount();
  const { favorites, toggleFavorite, isFavorite } = useFavorites();
  const { getLabel, setLabel } = useSafeLabels();
  const { addToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [ownerSafes, setOwnerSafes] = useState<
    Record<string, string[]>
  >({});
  const hasSafes = useMemo(
    () =>
      Object.values(ownerSafes).some((safes) => safes && safes.length > 0),
    [ownerSafes]
  );

  const loadSafes = useCallback(async () => {
    if (!address) return;
    setLoading(true);
    const next: Record<string, string[]> = {};

    const results = await Promise.allSettled(
      chainRegistry.map((chain) => fetchOwnerSafes(chain.chainKey, address))
    );

    let hasError = false;
    results.forEach((result, i) => {
      if (result.status === "fulfilled") {
        next[chainRegistry[i].chainKey] = result.value.safes ?? [];
      } else {
        hasError = true;
      }
    });

    setOwnerSafes(next);
    setLoaded(true);
    if (hasError) {
      addToast("Some chains failed to load.");
    }
    setLoading(false);
  }, [address, addToast]);

  const handleOpenSafe = (chainKey: ChainKey, safeAddress: string) => {
    const normalized = normalizeAddress(safeAddress);
    if (!normalized) {
      addToast("Invalid Safe address.");
      return;
    }
    navigate(`/safe/${chainKey}/${normalized}`);
  };

  const groupedFavorites = useMemo(() => {
    return favorites.reduce<Record<string, string[]>>((acc, fav) => {
      if (!acc[fav.chainKey]) acc[fav.chainKey] = [];
      acc[fav.chainKey].push(fav.safeAddress);
      return acc;
    }, {});
  }, [favorites]);

  return (
    <div>
      <section className="section">
        <div className={styles.searchWrapper}>
          <ManualSearch onSubmit={handleOpenSafe} />
        </div>
      </section>

      <section className="section">
        <div className="sectionTitle">Favorites</div>
        {favorites.length === 0 ? (
          <div className="muted">No favorites yet.</div>
        ) : (
          <div className={styles.list}>
            {Object.entries(groupedFavorites).map(([chainKey, safes]) => {
              const chain = getChainByKey(chainKey);
              if (!chain) return null;
              return (
                <div key={chainKey} className={styles.group}>
                  <div className={styles.groupHeader}>
                    {chain.displayName}
                  </div>
                  {safes.map((safe) => (
                    <div
                      key={`${chainKey}-${safe}`}
                      className={styles.card}
                      onClick={() => handleOpenSafe(chain.chainKey, safe)}
                    >
                      <div className={styles.cardRow}>
                        <EditableLabel
                          address={safe}
                          label={getLabel(safe)}
                          onSave={(label) => setLabel(safe, label)}
                          externalUrl={getSafeQueueUrl(chain.chainKey, safe)}
                        />
                        <StarButton
                          active
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleFavorite({
                              chainKey: chain.chainKey,
                              safeAddress: safe,
                            });
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              );
            })}
          </div>
        )}
      </section>

      <section className={`section ${styles.sectionDivider}`}>
        <div className="sectionTitle">My Safes</div>
        {!isConnected ? (
          <div className="muted">Connect a wallet to see your Safes.</div>
        ) : !loaded && !loading ? (
          <div className={styles.loadButtonWrapper}>
            <button type="button" onClick={loadSafes}>
              <span className={styles.loadIcon} aria-hidden="true">
                <RefreshCcw size={14} strokeWidth={1.6} />
              </span>
              Load My Safes
            </button>
          </div>
        ) : loading ? (
          <div className={styles.loadButtonWrapper}>
            <div className={styles.loadingInline}>
              <Spinner size={18} />
              <CyclingText />
            </div>
          </div>
        ) : !hasSafes ? (
          <div className="muted">No Safes found for this owner.</div>
        ) : (
          <div className={styles.list}>
            {chainRegistry.map((chain) => {
              const safes = ownerSafes[chain.chainKey] ?? [];
              if (safes.length === 0) return null;

              return (
                <div key={chain.chainKey} className={styles.group}>
                  <div className={styles.groupHeader}>{chain.displayName}</div>
                  {safes.map((safe) => (
                    <div
                      key={safe}
                      className={styles.card}
                      onClick={() => handleOpenSafe(chain.chainKey, safe)}
                    >
                      <div className={styles.cardRow}>
                        <EditableLabel
                          address={safe}
                          label={getLabel(safe)}
                          onSave={(label) => setLabel(safe, label)}
                          externalUrl={getSafeQueueUrl(chain.chainKey, safe)}
                        />
                        <StarButton
                          active={isFavorite(chain.chainKey, safe)}
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleFavorite({
                              chainKey: chain.chainKey,
                              safeAddress: safe,
                            });
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              );
            })}
          </div>
        )}
      </section>

    </div>
  );
};

const ManualSearch = ({
  onSubmit,
}: {
  onSubmit: (chainKey: ChainKey, safeAddress: string) => void;
}) => {
  const [chainKey, setChainKey] = useState<ChainKey>("eth");
  const [safeAddress, setSafeAddress] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmed = safeAddress.trim();
    const isValid = /^0x[a-fA-F0-9]{40}$/.test(trimmed);
    if (!isValid) {
      setError("Enter a valid Safe address.");
      return;
    }
    setError("");
    const normalized = normalizeAddress(trimmed);
    if (!normalized) {
      setError("Enter a valid Safe address.");
      return;
    }
    onSubmit(chainKey, normalized);
  };

  return (
    <form className={styles.searchForm} onSubmit={handleSubmit}>
      <div className={styles.selectWrapper}>
        <select
          className={styles.select}
          value={chainKey}
          onChange={(event) => setChainKey(event.target.value as ChainKey)}
        >
          {chainRegistry.map((chain) => (
            <option key={chain.chainKey} value={chain.chainKey}>
              {chain.displayName}
            </option>
          ))}
        </select>
      </div>
      <input
        type="text"
        placeholder="Safe address"
        value={safeAddress}
        onChange={(event) => {
          setSafeAddress(event.target.value);
          if (error) setError("");
        }}
        className={styles.searchInput}
      />
      <button type="submit">Search</button>
      {error ? <div className={styles.error}>{error}</div> : null}
    </form>
  );
};

export default HomePage;
