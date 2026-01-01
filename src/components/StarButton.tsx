import styles from "./StarButton.module.css";

type StarButtonProps = {
  active: boolean;
  onClick: (e: React.MouseEvent) => void;
  label?: string;
};

const StarButton = ({ active, onClick, label }: StarButtonProps) => {
  return (
    <button
      type="button"
      className={styles.button}
      onClick={(e) => onClick(e)}
      aria-label={label ?? (active ? "Unstar Safe" : "Star Safe")}
    >
      <svg viewBox="0 0 24 24" className={styles.icon} aria-hidden="true">
        <path
          d="M12 3.5l2.76 5.6 6.17.9-4.46 4.35 1.05 6.14L12 17.9l-5.52 2.9 1.05-6.14L3.07 10l6.17-.9L12 3.5z"
          fill={active ? "currentColor" : "none"}
          stroke="currentColor"
          strokeWidth="1.2"
        />
      </svg>
    </button>
  );
};

export default StarButton;
