import styles from "./Spinner.module.css";

type SpinnerProps = {
  size?: number;
};

const Spinner = ({ size = 16 }: SpinnerProps) => {
  return (
    <span
      className={styles.spinner}
      style={{ width: size, height: size }}
    />
  );
};

export default Spinner;
