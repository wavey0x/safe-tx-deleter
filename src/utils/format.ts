export const shortenHex = (value: string, start = 4, end = 4) => {
  if (!value) return "";
  if (value.length <= start + end + 2) return value;
  return `${value.slice(0, start + 2)}...${value.slice(-end)}`;
};

export const formatAge = (isoDate?: string) => {
  if (!isoDate) return "--";
  const date = new Date(isoDate);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  if (diffMs < 0) return "--";

  const minutes = Math.floor(diffMs / 60000);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) {
    return `${days}d${hours % 24 ? `${hours % 24}h` : ""}`;
  }

  if (hours > 0) {
    return `${hours}h${minutes % 60}m`;
  }

  return `${minutes}m`;
};

export const formatNumber = (value?: number | string) => {
  if (value === undefined || value === null) return "--";
  const numeric = typeof value === "string" ? Number(value) : value;
  return Number.isFinite(numeric) ? numeric.toString() : "--";
};
