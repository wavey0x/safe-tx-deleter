import { useToast } from "../contexts/ToastContext";
import styles from "./ToastStack.module.css";

const ToastStack = () => {
  const { toasts } = useToast();

  if (toasts.length === 0) return null;

  return (
    <div className={styles.stack}>
      {toasts.map((toast) => (
        <div key={toast.id} className={styles.toast}>
          {toast.message}
        </div>
      ))}
    </div>
  );
};

export default ToastStack;
