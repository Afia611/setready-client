const DEFAULT_NEXT = "/dashboard";
const UNSAFE_PATH_CHARACTERS = /[\u0000-\u001f\u007f\\]/;

export function safeNextPath(
  value: string | string[] | undefined,
  fallback = DEFAULT_NEXT,
): string {
  const candidate = Array.isArray(value) ? value[0] : value;

  if (!candidate) {
    return fallback;
  }

  const trimmed = candidate.trim();

  if (
    !trimmed.startsWith("/") ||
    trimmed.startsWith("//") ||
    UNSAFE_PATH_CHARACTERS.test(trimmed)
  ) {
    return fallback;
  }

  try {
    const base = new URL("http://setready.local");
    const destination = new URL(trimmed, base);

    if (destination.origin !== base.origin) {
      return fallback;
    }

    return `${destination.pathname}${destination.search}${destination.hash}`;
  } catch {
    return fallback;
  }
}

export function withNotice(path: string, notice: string): string {
  const destination = new URL(safeNextPath(path), "http://setready.local");
  destination.searchParams.set("notice", notice);

  return `${destination.pathname}${destination.search}${destination.hash}`;
}
