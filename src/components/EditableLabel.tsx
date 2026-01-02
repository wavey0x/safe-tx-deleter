import { useState, useRef, useEffect } from "react";
import { ExternalLink, Pencil } from "lucide-react";
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
        <Pencil size={12} strokeWidth={1.6} />
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
          <ExternalLink size={12} strokeWidth={1.6} />
        </a>
      )}
      {trailing}
    </div>
  );
};

export default EditableLabel;
