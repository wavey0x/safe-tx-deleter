import { getAddress, isAddress } from "viem";

export const normalizeAddress = (value: string) => {
  if (!value) return null;
  return isAddress(value) ? getAddress(value) : null;
};
