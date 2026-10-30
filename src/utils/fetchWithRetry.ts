/**
 * Reusable network utility with configurable timeout and exponential backoff retry.
 * Prevents UI failures on transient connection glitches or slow API responses.
 */
export interface RetryConfig<T> {
  retries?: number;
  initialDelay?: number;
  backoffMultiplier?: number;
  timeoutMs?: number;
  fallback?: T;
}

export async function fetchWithRetry<T = any>(
  url: string,
  options: RequestInit = {},
  config: RetryConfig<T> = {}
): Promise<T> {
  const {
    retries = 3,
    initialDelay = 1000,
    backoffMultiplier = 2,
    timeoutMs = 15000, // Timeout increased beyond 6s to 15s
    fallback = null as unknown as T
  } = config;

  let attempt = 0;

  while (attempt < retries) {
    attempt++;
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal
      });
      clearTimeout(timer);

      if (!response.ok) {
        throw new Error(`HTTP error ${response.status}: ${response.statusText}`);
      }

      const text = await response.text();
      const trimmed = text.trim();

      if (!text || trimmed.startsWith('<') || trimmed.startsWith('export')) {
        throw new Error(`Invalid non-JSON payload returned from ${url}`);
      }

      return JSON.parse(text) as T;
    } catch (err: any) {
      clearTimeout(timer);
      const isAbort = err.name === 'AbortError' || String(err).includes('abort');
      const errorMsg = isAbort ? `Request timed out after ${Math.round(timeoutMs / 1000)}s` : err.message;

      if (attempt >= retries) {
        console.info(`[fetchWithRetry] All ${retries} attempts failed for ${url} (${errorMsg}). Returning fallback.`);
        return fallback;
      }

      const delay = Math.round(initialDelay * Math.pow(backoffMultiplier, attempt - 1) + Math.random() * 250);
      console.info(`[fetchWithRetry] Attempt ${attempt}/${retries} failed for ${url} (${errorMsg}). Retrying in ${delay}ms...`);
      await new Promise(r => setTimeout(r, delay));
    }
  }

  return fallback;
}
