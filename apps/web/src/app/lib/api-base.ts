const DEFAULT_SERVER_API_BASE_URL = "http://localhost:8000";
const PRIVATE_HOST_PATTERNS = [
  /^localhost$/i,
  /^127\./,
  /^10\./,
  /^172\.(1[6-9]|2\d|3[0-1])\./,
  /^192\.168\./,
];

function stripTrailingSlash(value: string) {
  return value.replace(/\/+$/, "");
}

function isPrivateHost(hostname: string) {
  return PRIVATE_HOST_PATTERNS.some((pattern) => pattern.test(hostname));
}

function normalizeConfiguredBaseUrl(value?: string) {
  const normalized = stripTrailingSlash((value || "").trim());
  if (normalized === "undefined" || normalized === "null") return null;
  return normalized || null;
}

function getBrowserApiBaseUrl() {
  const publicBaseUrl = normalizeConfiguredBaseUrl(process.env.NEXT_PUBLIC_API_BASE_URL);
  const currentHost = window.location.hostname;

  if (publicBaseUrl && isPrivateHost(currentHost)) {
    return publicBaseUrl;
  }

  if (!publicBaseUrl && isPrivateHost(currentHost)) {
    return DEFAULT_SERVER_API_BASE_URL;
  }

  const configuredPublicPath = normalizeConfiguredBaseUrl(process.env.NEXT_PUBLIC_API_BASE_PATH);
  if (configuredPublicPath) {
    return `${window.location.origin}${configuredPublicPath.startsWith("/") ? configuredPublicPath : `/${configuredPublicPath}`}`;
  }

  const firstPathSegment = window.location.pathname.split("/").filter(Boolean)[0];
  const inferredBasePath = firstPathSegment === "xingdp" ? "/xingdp" : "";
  return `${window.location.origin}${inferredBasePath}`;
}

function getServerApiBaseUrl() {
  return (
    normalizeConfiguredBaseUrl(process.env.SERVER_API_BASE_URL)
    || normalizeConfiguredBaseUrl(process.env.NEXT_PUBLIC_API_BASE_URL)
    || DEFAULT_SERVER_API_BASE_URL
  );
}

export function buildApiUrl(path: string) {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  const baseUrl = typeof window === "undefined" ? getServerApiBaseUrl() : getBrowserApiBaseUrl();
  return `${baseUrl}${normalizedPath}`;
}
