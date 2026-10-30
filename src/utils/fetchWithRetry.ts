/**
 * Robust network utility with 30-second timeout and exponential backoff retry with jitter.
 * Specifically handles HTTP 500 and 503 errors with distinct backoff increments to accommodate
 * transient internal errors vs. overloaded upstream services.
 */
export interface RetryConfig<T> {
  retries?: number;
  initialDelay?: number;
  maxDelay?: number;
  backoffMultiplier?: number;
  /** Distinct linear backoff increment (ms per attempt) added on HTTP 500 Internal Server Error */
  backoffIncrement500?: number;
  /** Distinct linear backoff increment (ms per attempt) added on HTTP 503 Service Unavailable */
  backoffIncrement503?: number;
  /** Distinct exponential multiplier for HTTP 500 errors */
  backoffMultiplier500?: number;
  /** Distinct exponential multiplier for HTTP 503 errors */
  backoffMultiplier503?: number;
  timeoutMs?: number;
  fallback?: T;
}

function isRetryableStatus(status: number): boolean {
  return status === 408 || status === 425 || status === 429 || status >= 500;
}

/**
 * Computes the backoff delay for a given retry attempt, applying distinct increments
 * and multipliers specifically for HTTP 500 vs HTTP 503 status codes.
 */
export function calculateBackoffDelay(
  attempt: number,
  status: number | undefined,
  config: Required<
    Pick<
      RetryConfig<any>,
      | 'initialDelay'
      | 'maxDelay'
      | 'backoffMultiplier'
      | 'backoffIncrement500'
      | 'backoffIncrement503'
      | 'backoffMultiplier500'
      | 'backoffMultiplier503'
    >
  >,
  retryAfterMs = 0
): number {
  const {
    initialDelay,
    maxDelay,
    backoffMultiplier,
    backoffIncrement500,
    backoffIncrement503,
    backoffMultiplier500,
    backoffMultiplier503
  } = config;

  let baseDelay: number;

  if (status === 503) {
    // 503 Service Unavailable: steeper exponential curve + larger step increment to let overloaded services recover
    baseDelay =
      initialDelay * Math.pow(backoffMultiplier503, attempt - 1) +
      backoffIncrement503 * attempt;
  } else if (status === 500) {
    // 500 Internal Server Error: moderate exponential curve + dedicated 500 step increment
    baseDelay =
      initialDelay * Math.pow(backoffMultiplier500, attempt - 1) +
      backoffIncrement500 * attempt;
  } else {
    // Default exponential backoff for 408/429/502/504 or network/timeout errors
    baseDelay = initialDelay * Math.pow(backoffMultiplier, attempt - 1);
  }

  const clampedDelay = Math.min(maxDelay, baseDelay);
  const jitter = Math.round(Math.random() * 350);
  return Math.max(retryAfterMs || 0, Math.round(clampedDelay + jitter));
}

export async function fetchWithRetry<T = any>(
  url: string,
  options: RequestInit = {},
  config: RetryConfig<T> = {}
): Promise<T> {
  const {
    retries = 4,
    initialDelay = 1000,
    maxDelay = 15000,
    backoffMultiplier = 2,
    backoffIncrement500 = 1500,
    backoffIncrement503 = 3000,
    backoffMultiplier500 = 2,
    backoffMultiplier503 = 2.5,
    timeoutMs = 30000, // 30s timeout to accommodate complex FAQ & guide generations
    fallback = null as unknown as T
  } = config;

  let attempt = 0;

  while (attempt < retries) {
    attempt++;
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);

    if (options.signal) {
      if (options.signal.aborted) {
        clearTimeout(timer);
        return fallback;
      }
      options.signal.addEventListener('abort', () => controller.abort(), { once: true });
    }

    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal
      });
      clearTimeout(timer);

      if (!response.ok) {
        if (!isRetryableStatus(response.status)) {
          // Non-retryable 4xx status (e.g. 400, 401, 403, 404)
          return fallback;
        }
        const retryAfterHeader = response.headers?.get?.('retry-after');
        const retryAfterMs = retryAfterHeader ? Number(retryAfterHeader) * 1000 : 0;
        const err: any = new Error(`HTTP status ${response.status}`);
        err.status = response.status;
        err.retryAfterMs = Number.isFinite(retryAfterMs) && retryAfterMs > 0 ? retryAfterMs : 0;
        throw err;
      }

      const text = await response.text();
      const trimmed = text.trim();

      if (!text || trimmed.startsWith('<') || trimmed.startsWith('export')) {
        throw new Error(`Invalid non-JSON payload from ${url}`);
      }

      return JSON.parse(text) as T;
    } catch (err: any) {
      clearTimeout(timer);

      if (options.signal?.aborted) {
        return fallback;
      }

      if (attempt >= retries) {
        return fallback;
      }

      const computedDelay = calculateBackoffDelay(
        attempt,
        err?.status,
        {
          initialDelay,
          maxDelay,
          backoffMultiplier,
          backoffIncrement500,
          backoffIncrement503,
          backoffMultiplier500,
          backoffMultiplier503
        },
        err?.retryAfterMs || 0
      );

      await new Promise(r => setTimeout(r, computedDelay));
    }
  }

  return fallback;
}

