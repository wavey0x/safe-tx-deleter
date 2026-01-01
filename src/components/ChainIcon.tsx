import { getChainByKey, type ChainKey } from "../utils/chains";
import styles from "./ChainIcon.module.css";

type ChainIconProps = {
  chainKey: ChainKey;
  size?: number;
};

const ChainIcon = ({ chainKey, size = 14 }: ChainIconProps) => {
  const chain = getChainByKey(chainKey);
  if (!chain) return null;

  return (
    <img
      src={chain.logoUrl}
      alt={chain.displayName}
      className={styles.icon}
      style={{ width: size, height: size }}
    />
  );
};

export default ChainIcon;
