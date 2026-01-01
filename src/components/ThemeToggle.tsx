import { useTheme } from "../contexts/ThemeContext";
import styles from "./ThemeToggle.module.css";

const ThemeToggle = () => {
  const { resolvedTheme, toggleTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  return (
    <button
      type="button"
      className={styles.toggle}
      onClick={toggleTheme}
      aria-label="Toggle theme"
    >
      {isDark ? (
        <svg
          viewBox="0 0 24 24"
          aria-hidden="true"
          className={styles.icon}
        >
          <path
            d="M12 4.5a7.5 7.5 0 1 0 7.5 7.5c0-3.79-2.79-6.96-6.42-7.42a.75.75 0 0 0-.83.9 5.25 5.25 0 0 1-6.37 6.37.75.75 0 0 0-.9.83A7.52 7.52 0 0 0 12 19.5"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
          />
        </svg>
      ) : (
        <svg
          viewBox="0 0 24 24"
          aria-hidden="true"
          className={styles.icon}
        >
          <circle
            cx="12"
            cy="12"
            r="4.5"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
          />
          <path
            d="M12 2.5v3M12 18.5v3M4.5 12h-3M22.5 12h-3M5.1 5.1l-2.1-2.1M21 21l-2.1-2.1M5.1 18.9l-2.1 2.1M21 3l-2.1 2.1"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </svg>
      )}
    </button>
  );
};

export default ThemeToggle;
