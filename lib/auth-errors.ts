export async function readAuthError(response: Response): Promise<string> {
  const fallback = `Request failed (${response.status}).`;

  try {
    const data: unknown = await response.json();

    if (data && typeof data === "object") {
      const record = data as Record<string, unknown>;

      if (typeof record.message === "string" && record.message) {
        return record.message;
      }

      if (typeof record.error === "string" && record.error) {
        return record.error;
      }

      if (record.error && typeof record.error === "object") {
        const error = record.error as Record<string, unknown>;

        if (typeof error.message === "string" && error.message) {
          return error.message;
        }
      }
    }
  } catch {
    // Fall back to the status message when the response is not JSON.
  }

  return fallback;
}
