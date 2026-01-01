import { createConfig, http } from "wagmi";
import { coinbaseWallet, injected, walletConnect } from "wagmi/connectors";
import { wagmiChains } from "./utils/chains";

const projectId = import.meta.env.VITE_WALLETCONNECT_PROJECT_ID as
  | string
  | undefined;

if (!projectId && import.meta.env.DEV) {
  console.warn(
    "WalletConnect disabled: VITE_WALLETCONNECT_PROJECT_ID not set. " +
      "Get a project ID at https://cloud.walletconnect.com"
  );
}

const connectors = [
  injected(),
  coinbaseWallet({
    appName: "Safe Queue Deleter",
  }),
];

if (projectId) {
  connectors.push(
    walletConnect({
      projectId,
      showQrModal: true,
    })
  );
}

const transports = Object.fromEntries(
  wagmiChains.map((chain) => [chain.id, http(chain.rpcUrls.default.http[0])])
);

export const config = createConfig({
  chains: wagmiChains,
  connectors,
  transports,
});
