import { Link } from "react-router-dom";
import ConnectButton from "./ConnectButton";
import ThemeToggle from "./ThemeToggle";
import styles from "./Header.module.css";

const Header = () => {
  return (
    <header className={styles.header}>
      <div className={styles.inner}>
        <Link to="/" className={styles.brand}>
          Safe Txn Deleter
        </Link>
        <div className={styles.actions}>
          <ThemeToggle />
          <ConnectButton />
        </div>
      </div>
    </header>
  );
};

export default Header;
