import { useState, useRef, useEffect } from "react";
import { shortenAddress } from "../utils/safeLabels";
import styles from "./EditableLabel.module.css";

type EditableLabelProps = {
  address: string;
  label: string;
  onSave: (label: string) => void;
  externalUrl?: string;
  chainIconUrl?: string;
  trailing?: React.ReactNode;
};

const EditableLabel = ({
  address,
  label,
  onSave,
  externalUrl,
  chainIconUrl,
  trailing,
}: EditableLabelProps) => {
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(label);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setValue(label);
  }, [label]);

  useEffect(() => {
    if (editing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [editing]);

  const handleSave = () => {
    onSave(value.trim());
    setEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSave();
    } else if (e.key === "Escape") {
      setValue(label);
      setEditing(false);
    }
  };

  const handleEditClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setEditing(true);
  };

  const handleLinkClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  if (editing) {
    return (
      <div className={styles.editContainer} onClick={(e) => e.stopPropagation()}>
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onBlur={handleSave}
          onKeyDown={handleKeyDown}
          placeholder="Enter a name..."
          className={styles.input}
        />
        <span className={styles.suffix}>({shortenAddress(address)})</span>
      </div>
    );
  }

  const displayText = label
    ? `${label} (${shortenAddress(address)})`
    : address;

  return (
    <div className={styles.container}>
      {chainIconUrl ? (
        <img
          src={chainIconUrl}
          alt=""
          className={styles.chainLogo}
          loading="lazy"
        />
      ) : null}
      <span className={`${styles.text} mono`}>{displayText}</span>
      <button
        type="button"
        className={styles.iconButton}
        onClick={handleEditClick}
        aria-label="Edit name"
      >
        <svg viewBox="0 0 12 12" className={styles.icon} aria-hidden="true">
          <path
            d="M9 1l2 2-7 7H2V8l7-7z"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.2"
          />
        </svg>
      </button>
      {externalUrl && (
        <a
          href={externalUrl}
          target="_blank"
          rel="noreferrer"
          className={styles.iconButton}
          onClick={handleLinkClick}
          aria-label="Open in Safe"
        >
          <svg viewBox="0 0 12 12" className={styles.icon} aria-hidden="true">
            <path
              d="M4 1H1v10h10V8M7 1h4v4M11 1L5 7"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.2"
            />
          </svg>
        </a>
      )}
      {trailing}
    </div>
  );
};

export default EditableLabel;
