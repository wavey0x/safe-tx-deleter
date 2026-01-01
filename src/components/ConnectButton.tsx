import { useMemo, useState } from "react";
import { useAccount, useConnect, useDisconnect } from "wagmi";
import { shortenHex } from "../utils/format";
import styles from "./ConnectButton.module.css";

const ConnectButton = () => {
  const { address, isConnected } = useAccount();
  const { connect, connectors, isPending } = useConnect();
  const { disconnect } = useDisconnect();
  const [open, setOpen] = useState(false);
  const [error, setError] = useState("");

  const connectorList = useMemo(
    () =>
      connectors.map((connector) => ({
        id: connector.id,
        name:
          connector.type === "injected"
            ? connector.name || "Browser Wallet"
            : connector.name || "Wallet",
        ready: connector.ready === false ? false : true,
      })),
    [connectors]
  );

  const handleConnect = (connectorId: string) => {
    const connector = connectors.find((item) => item.id === connectorId);
    if (!connector) return;
    setError("");
    connect(
      { connector },
      {
        onSuccess: () => setOpen(false),
        onError: () => setError("Failed to connect wallet."),
      }
    );
  };

  const handleDisconnect = () => {
    disconnect();
    setOpen(false);
  };

  return (
    <div className={styles.wrapper}>
      <button
        type="button"
        className={styles.button}
        onClick={() => setOpen(true)}
      >
        {isConnected ? shortenHex(address ?? "") : "Connect Wallet"}
      </button>
      {open && (
        <div className={styles.modalOverlay} onClick={() => setOpen(false)}>
          <div
            className={styles.modal}
            onClick={(event) => event.stopPropagation()}
          >
            <div className={styles.modalHeader}>
              <div className={styles.modalTitle}>
                {isConnected ? "Wallet" : "Connect Wallet"}
              </div>
              <button
                type="button"
                className={styles.close}
                onClick={() => setOpen(false)}
                aria-label="Close"
              >
                ×
              </button>
            </div>
            {isConnected ? (
              <div className={styles.modalBody}>
                <div className={styles.address}>{shortenHex(address ?? "")}</div>
                <button
                  type="button"
                  className={styles.action}
                  onClick={handleDisconnect}
                >
                  Disconnect
                </button>
              </div>
            ) : (
              <div className={styles.modalBody}>
                {isPending && (
                  <div className={styles.pending}>Connecting...</div>
                )}
                {error && <div className={styles.error}>{error}</div>}
                {connectorList.map((connector) => (
                  <button
                    type="button"
                    key={connector.id}
                    className={styles.action}
                    onClick={() => handleConnect(connector.id)}
                    disabled={connector.ready === false || isPending}
                  >
                    {connector.name}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ConnectButton;
