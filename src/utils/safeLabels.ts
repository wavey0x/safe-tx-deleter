import { useCallback, useEffect, useMemo, useState } from "react";

type SafeLabels = Record<string, string>;

const STORAGE_KEY = "safe-deleter:labels";

const loadLabels = (): SafeLabels => {
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) return {};
  try {
    return JSON.parse(raw) as SafeLabels;
  } catch {
    return {};
  }
};

const saveLabels = (labels: SafeLabels) => {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(labels));
  } catch {
    console.error("Failed to save labels to localStorage");
  }
};

export const useSafeLabels = () => {
  const [labels, setLabels] = useState<SafeLabels>({});

  useEffect(() => {
    setLabels(loadLabels());
  }, []);

  const getLabel = useCallback(
    (safeAddress: string) => labels[safeAddress.toLowerCase()] ?? "",
    [labels]
  );

  const setLabel = useCallback((safeAddress: string, label: string) => {
    setLabels((prev) => {
      const key = safeAddress.toLowerCase();
      const next = { ...prev };
      if (label.trim()) {
        next[key] = label.trim();
      } else {
        delete next[key];
      }
      saveLabels(next);
      return next;
    });
  }, []);

  const value = useMemo(
    () => ({ labels, getLabel, setLabel }),
    [labels, getLabel, setLabel]
  );

  return value;
};

export const shortenAddress = (address: string): string => {
  if (address.length < 12) return address;
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
};

export const formatSafeDisplay = (
  address: string,
  label: string | undefined
): string => {
  if (label) {
    return `${label} (${shortenAddress(address)})`;
  }
  return address;
};
