const ADMIN_CSRF_COOKIE = 'visaapply_admin_csrf';
const LEGACY_STORAGE_KEYS = ['adminToken', 'admin_token', 'visaapply_admin_token'];

let inMemoryCsrfToken: string | null = null;

/**
 * Scrubs any legacy authentication tokens previously persisted in browser storage.
 * Sensitive admin session tokens are held exclusively in server-set HttpOnly cookies.
 */
export function purgeLegacyAdminStorage(): void {
  if (typeof window === 'undefined') return;
  try {
    for (const key of LEGACY_STORAGE_KEYS) {
      window.localStorage.removeItem(key);
      window.sessionStorage.removeItem(key);
    }
  } catch {
    // ignore storage errors
  }
}

function readCookieFromDocument(name: string): string | null {
  if (typeof document === 'undefined' || !document.cookie) return null;
  const parts = document.cookie.split(';');
  for (const part of parts) {
    const idx = part.indexOf('=');
    if (idx === -1) continue;
    const key = part.slice(0, idx).trim();
    if (key === name) {
      try {
        return decodeURIComponent(part.slice(idx + 1).trim()) || null;
      } catch {
        return null;
      }
    }
  }
  return null;
}

export function getAdminCsrfToken(): string | null {
  return readCookieFromDocument(ADMIN_CSRF_COOKIE) || inMemoryCsrfToken;
}

export function setAdminCsrfToken(token: string | null): void {
  inMemoryCsrfToken = token ? token.trim() : null;
}

export function clearAdminAuthState(): void {
  inMemoryCsrfToken = null;
  purgeLegacyAdminStorage();
}

export function getAdminRequestHeaders(
  extraHeaders: Record<string, string> = {}
): Record<string, string> {
  const csrf = getAdminCsrfToken();
  return {
    'X-Requested-With': 'XMLHttpRequest',
    ...(csrf ? { 'X-CSRF-Token': csrf } : {}),
    ...extraHeaders
  };
}

/**
 * Legacy compatibility shim: always returns null and clears any stale localStorage/sessionStorage tokens.
 * Admin authentication now uses HttpOnly session cookies + CSRF header protection.
 */
export function getStoredAdminToken(): string | null {
  purgeLegacyAdminStorage();
  return null;
}

/**
 * Legacy compatibility shim: never persists tokens to localStorage or sessionStorage.
 */
export function setStoredAdminToken(_token: string | null): void {
  purgeLegacyAdminStorage();
}
