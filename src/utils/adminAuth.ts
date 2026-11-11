export function getStoredAdminToken(): string | null {
  if (typeof window === 'undefined') return null;
  try {
    return (
      window.localStorage.getItem('adminToken') ||
      window.localStorage.getItem('admin_token') ||
      window.localStorage.getItem('visaapply_admin_token') ||
      window.sessionStorage.getItem('adminToken') ||
      window.sessionStorage.getItem('admin_token') ||
      null
    );
  } catch {
    return null;
  }
}

export function setStoredAdminToken(token: string | null): void {
  if (typeof window === 'undefined') return;
  try {
    if (token) {
      window.localStorage.setItem('adminToken', token);
    } else {
      window.localStorage.removeItem('adminToken');
    }
  } catch {
    // ignore storage errors
  }
}
