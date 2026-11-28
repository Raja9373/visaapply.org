import React, { useState, useEffect } from 'react';
import {
  Shield,
  RefreshCw,
  FileText,
  CheckCircle2,
  Trash2
} from 'lucide-react';
import {
  getAdminRequestHeaders,
  purgeLegacyAdminStorage,
  setAdminCsrfToken
} from '../utils/adminAuth';
import { TRAVELPAYOUTS_CONFIG } from '../data/travelpayoutsConfig';

interface AdminArticle {
  slug: string;
  title: string;
  from: string;
  to: string;
  type: string;
  date: string;
  fees: string;
  docs: string;
  content?: string;
}

// ----------------------------------------------------
// Admin Login View (/admin/login) & Protected Admin Portal
// ----------------------------------------------------
export function AdminLoginView({
  isAuthenticated,
  intendedPath,
  onLoginSuccess,
  navigate
}: {
  isAuthenticated: boolean;
  adminSessionChecked: boolean;
  intendedPath: string;
  onLoginSuccess: (token: string, targetPath: string) => void;
  navigate: (path: string) => void;
}) {
  const [passwordInput, setPasswordInput] = useState('');
  const [authError, setAuthError] = useState<string | null>(null);
  const [loadingAuth, setLoadingAuth] = useState(false);

  useEffect(() => {
    if (window.location.pathname !== '/admin/login') {
      window.history.replaceState({}, '', '/admin/login');
    }
    if (isAuthenticated) {
      navigate(intendedPath && intendedPath !== '/admin/login' ? intendedPath : '/admin/updates');
    }
  }, [isAuthenticated, intendedPath, navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoadingAuth(true);
    setAuthError(null);
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ password: passwordInput })
      });
      const text = await res.text();
      if (!text || text.trim().startsWith('<')) {
        setAuthError('Server error: authentication endpoint returned an invalid response.');
        setLoadingAuth(false);
        return;
      }
      const data = JSON.parse(text);
      if (res.ok && data.success && data.authenticated) {
        purgeLegacyAdminStorage();
        setAdminCsrfToken(typeof data.csrfToken === 'string' ? data.csrfToken : null);
        const params = new URLSearchParams(window.location.search);
        const redirectParam = params.get('redirect');
        const safeTarget =
          redirectParam && redirectParam.startsWith('/admin') && redirectParam !== '/admin/login'
            ? redirectParam
            : intendedPath && intendedPath.startsWith('/admin') && intendedPath !== '/admin/login'
              ? intendedPath
              : '/admin/updates';
        onLoginSuccess('', safeTarget);
      } else {
        setAuthError(data.message || data.error || 'Invalid administrator password.');
      }
    } catch {
      setAuthError('Authentication failed. Please try again.');
    } finally {
      setLoadingAuth(false);
    }
  };

  return (
    <div className="min-h-[75vh] flex items-center justify-center px-4 bg-slate-50">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl border border-slate-200 p-8">
        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center mx-auto mb-3">
            <Shield className="w-6 h-6" />
          </div>
          <h1 className="text-xl font-extrabold text-slate-900">Admin Login</h1>
          <p className="text-xs text-slate-600 mt-1">
            Restricted access • Authenticate with your administrator passphrase to unlock /admin pages
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label htmlFor="admin-password-input" className="block text-xs font-semibold text-slate-700 mb-1">Admin Password</label>
            <input
              id="admin-password-input"
              type="password"
              value={passwordInput}
              onChange={(e) => setPasswordInput(e.target.value)}
              placeholder="Enter administrator password"
              aria-invalid={Boolean(authError)}
              aria-describedby={authError ? 'admin-auth-error' : undefined}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0B3D91]"
              required
              autoFocus
            />
          </div>

          {authError && (
            <div id="admin-auth-error" role="alert" className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 font-medium text-center">
              {authError}
            </div>
          )}

          <button
            type="submit"
            disabled={loadingAuth}
            className="w-full py-3 bg-[#0B3D91] text-white font-semibold rounded-xl text-sm hover:bg-[#09327a] transition-colors shadow-md disabled:opacity-50 cursor-pointer"
          >
            {loadingAuth ? 'Verifying Session...' : 'Sign In to Admin Portal'}
          </button>
        </form>
      </div>
    </div>
  );
}

export function AdminPortal({
  drafts,
  articles,
  setArticles,
  cronLoading,
  cronResult,
  onTriggerCron,
  onApprove,
  onDelete,
  navigate,
  isAdminAuthenticated,
  onLogout,
  detectedCountry,
  uiLang,
  onSimulateVpnCountry
}: any) {
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    if (!isAdminAuthenticated) {
      navigate('/admin/login');
    }
  }, [isAdminAuthenticated, navigate]);

  const handleTriggerWithCooldown = async () => {
    if (cooldown > 0 || cronLoading) return;
    setCooldown(30);
    const interval = setInterval(() => {
      setCooldown(c => {
        if (c <= 1) {
          clearInterval(interval);
          return 0;
        }
        return c - 1;
      });
    }, 1000);

    await onTriggerCron();
  };

  const handleClearDuplicates = () => {
    const unique = articles.filter((g: any, index: number, self: any[]) => index === self.findIndex(t => t.title === g.title));
    setArticles(unique);
    localStorage.setItem('publishedGuides', JSON.stringify(unique));
  };

  if (!isAdminAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="bg-slate-950 border-b border-slate-800 px-4 py-3 text-white">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1.5 bg-amber-500/20 text-amber-300 border border-amber-400/30 px-3 py-1 rounded-lg text-xs font-bold">
              🔒 Admin Session Active
            </span>
            <button
              onClick={() => navigate('/admin')}
              className="text-xs font-semibold text-white bg-slate-800 px-3 py-1.5 rounded-lg cursor-pointer"
            >
              Dashboard (/admin)
            </button>
            <button
              onClick={() => navigate('/admin/updates')}
              className="text-xs font-semibold text-cyan-300 hover:text-white transition-colors cursor-pointer"
            >
              249-Country Auto-Sync (/admin/updates)
            </button>
          </div>
          <button
            onClick={onLogout}
            className="px-4 py-1.5 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-lg transition-colors cursor-pointer shadow-sm"
          >
            Logout
          </button>
        </div>
      </div>

      {onSimulateVpnCountry && (
        <div className="bg-slate-900 text-slate-200 border-b border-slate-800 px-4 py-2 text-xs">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
            <div className="flex items-center gap-2 flex-wrap justify-center sm:justify-start">
              <span className="inline-flex items-center gap-1 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded-full font-bold text-[11px]">
                🔧 ADMIN DEBUG: AUTO-GEO
              </span>
              <span className="font-semibold text-white">
                {detectedCountry ? (
                  <>
                    Simulated: {detectedCountry.flag} {detectedCountry.name} ({detectedCountry.code}) • UI: {uiLang?.toUpperCase()}
                  </>
                ) : (
                  'Auto-detect mode active'
                )}
              </span>
            </div>
            <div className="flex items-center gap-1.5 flex-wrap justify-center">
              <span className="text-[11px] text-slate-400 font-medium">Instant Country/VPN Test:</span>
              {[
                { code: 'PL', label: '🇵🇱 Poland' },
                { code: 'DE', label: '🇩🇪 Germany' },
                { code: 'ES', label: '🇪🇸 Spain' },
                { code: 'FR', label: '🇫🇷 France' },
                { code: 'AE', label: '🇦🇪 UAE' },
                { code: 'IN', label: '🇮🇳 India' },
                { code: 'US', label: '🇺🇸 USA' }
              ].map((item) => {
                const isCurrent = detectedCountry?.code === item.code;
                return (
                  <button
                    key={item.code}
                    type="button"
                    onClick={() => onSimulateVpnCountry(item.code)}
                    className={`px-2 py-0.5 rounded-md text-[11px] font-bold transition-colors cursor-pointer ${
                      isCurrent
                        ? 'bg-blue-600 text-white border border-blue-400'
                        : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700'
                    }`}
                  >
                    {item.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8 pb-6 border-b border-slate-200">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-amber-600 mb-1">
              <Shield className="w-4 h-4" />
              <span>Admin Editorial Portal</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">VisaApply.org Management</h1>
          </div>

          <div className="flex items-center gap-3">
            <button
              disabled={cronLoading || cooldown > 0}
              onClick={handleTriggerWithCooldown}
              className="px-5 py-3 bg-[#0B3D91] text-white font-semibold rounded-xl text-sm hover:bg-[#09327a] transition-all flex items-center gap-2 shadow-md cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${cronLoading ? 'animate-spin' : ''}`} />
              <span>{cronLoading ? 'Generating AI Guides...' : cooldown > 0 ? `Generating... Please wait (${cooldown}s)` : 'Trigger Gemini AI Auto-Blogger Now'}</span>
            </button>
            <button
              onClick={onLogout}
              className="px-4 py-3 bg-red-600 text-white font-semibold rounded-xl text-sm hover:bg-red-700 transition-colors cursor-pointer shadow-sm"
            >
              Logout
            </button>
          </div>
        </div>

        {cronResult && (
          <div className="mb-8 p-4 bg-blue-50 border border-blue-200 rounded-xl text-sm text-blue-900 font-medium flex items-center justify-between">
            <span>{cronResult}</span>
            <button onClick={() => window.location.reload()} className="text-xs underline font-semibold">Refresh Page</button>
          </div>
        )}

        <div className="bg-white rounded-2xl p-5 border border-slate-200 mb-8">
          <h3 className="font-extrabold text-lg text-slate-900 m-0">💰 Monetization Dashboard — Monetization Status</h3>
          <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="bg-blue-50 p-3 rounded-xl border border-blue-200">
              <div className="text-[11px] font-bold text-blue-800">BOOKING.COM</div>
              <div className="text-sm font-extrabold mt-1 text-slate-900">ID {TRAVELPAYOUTS_CONFIG.bookingComAid} ✅ Approved</div>
              <div className="text-[11px] text-slate-500 mt-0.5">6 placements • &amp;label tracking • $15-$40/booking</div>
            </div>
            <div className="bg-green-50 p-3 rounded-xl border border-green-200">
              <div className="text-[11px] font-bold text-green-700">TRAVELPAYOUTS</div>
              <div className="text-sm font-extrabold mt-1 text-slate-900">ID {TRAVELPAYOUTS_CONFIG.id} ✅ Approved</div>
              <div className="text-[11px] text-slate-500 mt-0.5">Aviasales + 100 airlines • $2-$10/booking • Live NOW</div>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-slate-900 to-[#0B3D91] text-white p-6 sm:p-8 rounded-2xl mb-10 shadow-lg">
          <h2 className="text-lg font-bold mb-2 flex items-center gap-2">
            <span>🛠️ Verification & SEO Infrastructure Tools</span>
          </h2>
          <p className="text-xs text-blue-200 mb-6">
            Access real-time audit reporting and public sitemap indices for 1001+ visa and immigration programme records (USA: 164 Official Visas + 37 Programmes = 201).
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div
              onClick={() => navigate('/admin/updates')}
              className="p-5 bg-white/10 border border-white/20 rounded-xl hover:bg-white/20 transition-all cursor-pointer flex flex-col justify-between"
            >
              <div>
                <div className="text-2xl mb-2">🔄</div>
                <h3 className="font-extrabold text-base text-cyan-300">Last 30 Days Immigration Auto-Sync</h3>
                <p className="text-xs text-slate-200 mt-1">Daily 3:00 AM IST sync of 249 official gov portals + Manual Admin Override.</p>
              </div>
              <span className="text-xs font-bold text-cyan-300 mt-4 inline-flex items-center gap-1">Open Immigration Updates →</span>
            </div>

            <div
              onClick={() => navigate('/audit')}
              className="p-5 bg-white/10 border border-white/20 rounded-xl hover:bg-white/20 transition-all cursor-pointer flex flex-col justify-between"
            >
              <div>
                <div className="text-2xl mb-2">🔍</div>
                <h3 className="font-extrabold text-base text-emerald-300">Live Audit (1001+ Records) – Admin Only</h3>
                <p className="text-xs text-slate-200 mt-1">Real-time database count, USA 164 Visas + 37 Programmes split, document completeness checks, country-wise matrix.</p>
              </div>
              <span className="text-xs font-bold text-emerald-300 mt-4 inline-flex items-center gap-1">Open Live Audit Report →</span>
            </div>

            <div
              onClick={() => navigate('/sitemap')}
              className="p-5 bg-white/10 border border-white/20 rounded-xl hover:bg-white/20 transition-all cursor-pointer flex flex-col justify-between"
            >
              <div>
                <div className="text-2xl mb-2">🗺️</div>
                <h3 className="font-extrabold text-base text-blue-200">Sitemap (61,752+ Routes) – Public + Admin</h3>
                <p className="text-xs text-slate-200 mt-1">Indexed links for verified visa guides & 61,752 bilateral routes across 249 countries.</p>
              </div>
              <span className="text-xs font-bold text-blue-200 mt-4 inline-flex items-center gap-1">Open Public Sitemap →</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-10">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <span className="text-xs text-slate-500 font-medium">Published Guides</span>
            <p className="text-3xl font-extrabold text-slate-900 mt-2">{articles.length}</p>
          </div>
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <span className="text-xs text-slate-500 font-medium">Pending Drafts (AI Generated)</span>
            <p className="text-3xl font-extrabold text-amber-600 mt-2">{drafts.length}</p>
          </div>
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <span className="text-xs text-slate-500 font-medium">Automated Cron Schedule</span>
            <p className="text-lg font-bold text-slate-800 mt-2">Daily at 5:30 AM IST (00:00 UTC)</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 mb-12">
          <h2 className="text-lg font-bold text-slate-900 mb-6 flex items-center justify-between">
            <span>Pending AI Drafts ({drafts.length})</span>
            <span className="text-xs text-slate-400 font-normal">Review before publishing</span>
          </h2>

          {drafts.length === 0 ? (
            <div className="text-center py-12 text-slate-500 bg-slate-50 rounded-xl border border-dashed border-slate-200">
              <FileText className="w-10 h-10 text-slate-300 mx-auto mb-2" />
              <p className="text-sm font-medium text-slate-700">No pending drafts found.</p>
              <p className="text-xs text-slate-400 mt-1">Click the "Trigger Gemini AI Auto-Blogger" button above to generate new drafts.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {drafts.map((draft: AdminArticle) => (
                <div key={draft.slug} className="p-5 rounded-xl border border-slate-200 bg-slate-50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
                      <span className="uppercase text-amber-600 bg-amber-50 px-2 py-0.5 rounded">Draft</span>
                      <span>·</span>
                      <span className="uppercase">{draft.type} visa</span>
                      <span>·</span>
                      <span>{draft.date}</span>
                    </div>
                    <h3 className="font-bold text-slate-900 text-base">{draft.title}</h3>
                    <p className="text-xs text-slate-600 line-clamp-1">{draft.content?.substring(0, 120)}...</p>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <button
                      onClick={() => onApprove(draft.slug)}
                      className="px-4 py-2 bg-emerald-600 text-white font-semibold rounded-lg text-xs hover:bg-emerald-700 transition-colors flex items-center gap-1.5 shadow-sm"
                    >
                      <CheckCircle2 className="w-4 h-4" /> Approve & Publish
                    </button>
                    <button
                      onClick={() => onDelete(draft.slug)}
                      className="p-2 text-slate-400 hover:text-red-600 transition-colors rounded-lg hover:bg-red-50"
                      title="Delete Draft"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <h2 className="text-lg font-bold text-slate-900">Published Guides ({articles.length})</h2>
            <button
              onClick={handleClearDuplicates}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition-colors shadow-sm"
            >
              Clear All Duplicates
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-100 text-slate-700 font-semibold text-xs uppercase tracking-wider">
                <tr>
                  <th className="p-3">Title</th>
                  <th className="p-3">Route</th>
                  <th className="p-3">Visa Type</th>
                  <th className="p-3">Date</th>
                  <th className="p-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {articles.map((art: AdminArticle) => (
                  <tr key={art.slug} className="hover:bg-slate-50">
                    <td className="p-3 font-semibold text-slate-900">{art.title}</td>
                    <td className="p-3 font-mono text-xs text-slate-600">/{art.slug}</td>
                    <td className="p-3 uppercase text-xs font-medium text-[#0B3D91]">{art.type}</td>
                    <td className="p-3 text-slate-500 text-xs">{art.date}</td>
                    <td className="p-3 text-right">
                      <button
                        onClick={() => navigate(`/${art.slug}`)}
                        className="text-xs font-semibold text-[#0B3D91] hover:underline"
                      >
                        View Live
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="mt-8 text-center text-xs text-slate-500 font-medium">
          VisaApply.org Editorial Management Portal · Support: <a href="mailto:contact@visaapply.org" className="text-[#0B3D91] font-bold hover:underline">contact@visaapply.org</a>
        </div>
      </div>
    </div>
  );
}

export function AdminSlotAlertPage({ navigate, onLogout }: any) {
  const [statusData, setStatusData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [cronRunning, setCronRunning] = useState<boolean>(false);
  const [cronResult, setCronResult] = useState<string>('');

  const fetchStatus = async () => {
    try {
      const res = await fetch('/api/admin/slot-alert/subscribers', {
        credentials: 'include',
        headers: getAdminRequestHeaders()
      });
      if (res.status === 401) {
        onLogout?.();
        return;
      }
      const data = await res.json();
      if (data.success) {
        setStatusData(data);
      }
    } catch {
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
  }, []);

  const runCronNow = async () => {
    setCronRunning(true);
    setCronResult('');
    try {
      const res = await fetch('/api/cron/slot-check', {
        method: 'POST',
        credentials: 'include',
        headers: getAdminRequestHeaders()
      });
      if (res.status === 401) {
        onLogout?.();
        return;
      }
      const data = await res.json();
      if (data.success) {
        setCronResult(`Cron check completed successfully! Emails sent: ${data.emailsSent}`);
        fetchStatus();
      } else {
        setCronResult(data.error || 'Cron check failed');
      }
    } catch (err: any) {
      setCronResult(err.message || 'Error running cron');
    } finally {
      setCronRunning(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-16">
      <div className="bg-slate-950 border-b border-slate-800 px-4 py-3 text-white">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1.5 bg-amber-500/20 text-amber-300 border border-amber-400/30 px-3 py-1 rounded-lg text-xs font-bold">
              🔒 Admin Session Active
            </span>
            <button onClick={() => navigate('/admin')} className="text-xs font-semibold text-white bg-slate-800 px-3 py-1.5 rounded-lg cursor-pointer">
              Dashboard
            </button>
            <button onClick={() => navigate('/admin/updates')} className="text-xs font-semibold text-cyan-300 hover:text-white transition-colors cursor-pointer">
              249-Country Auto-Sync
            </button>
            <button onClick={() => navigate('/admin/slot-alert')} className="text-xs font-semibold text-amber-300 hover:text-white transition-colors cursor-pointer">
              Slot Monitor (/admin/slot-alert)
            </button>
          </div>
          <button onClick={onLogout} className="px-4 py-1.5 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-lg transition-colors cursor-pointer shadow-sm">
            Logout
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-6 border-b border-slate-200">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900">Embassy Slot Auto Monitor</h1>
            <p className="text-xs sm:text-sm text-slate-600 mt-1">
              Fully automated cron checks every 30 minutes. Auto-emails subscribers when slots open.
            </p>
          </div>
          <button
            onClick={runCronNow}
            disabled={cronRunning}
            className="px-5 py-3 bg-[#0B3D91] hover:bg-[#082e6d] text-white text-sm font-bold rounded-xl shadow-md transition-all cursor-pointer disabled:opacity-50 flex items-center gap-2"
          >
            <span>{cronRunning ? 'Checking Slots...' : '⚡ Run Slot Check Cron Now (Backup)'}</span>
          </button>
        </div>

        {cronResult && (
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl text-sm text-blue-900 font-bold">
            {cronResult}
          </div>
        )}

        {loading ? (
          <div className="p-12 text-center text-slate-500 font-bold">Loading slot monitoring data...</div>
        ) : (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                <span className="text-xs font-bold text-slate-500 uppercase block">Last Automated Check</span>
                <span className="text-lg sm:text-xl font-black text-slate-900 mt-1 block">
                  {statusData?.lastCheckTime ? new Date(statusData.lastCheckTime).toLocaleString() : 'Never'}
                </span>
              </div>
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                <span className="text-xs font-bold text-slate-500 uppercase block">Total Email Subscribers</span>
                <span className="text-xl sm:text-2xl font-black text-blue-600 mt-1 block">
                  {statusData?.totalSubscribers || 0} Subscribed
                </span>
              </div>
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                <span className="text-xs font-bold text-slate-500 uppercase block">Automated Cron Interval</span>
                <span className="text-xl sm:text-2xl font-black text-emerald-600 mt-1 block">
                  Every 30 Minutes
                </span>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="p-5 border-b border-slate-100 font-black text-slate-900">
                Monitored Embassies &amp; Consular Status
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs sm:text-sm">
                  <thead>
                    <tr className="bg-slate-900 text-white font-bold">
                      <th className="p-3">Embassy / Consulate</th>
                      <th className="p-3">Current Status</th>
                      <th className="p-3">Available Slot Date</th>
                      <th className="p-3">Last Alert Dispatched</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {Object.entries(statusData?.embassies || {}).map(([emb, info]: [string, any]) => {
                      const isOpen = info.status === 'Open';
                      return (
                        <tr key={emb} className="hover:bg-slate-50">
                          <td className="p-3 font-bold text-slate-900">{emb}</td>
                          <td className="p-3">
                            <span className={`px-2.5 py-1 rounded-full font-extrabold text-xs ${isOpen ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-700'}`}>
                              {isOpen ? '🟢 OPEN' : '🔴 Closed'}
                            </span>
                          </td>
                          <td className="p-3 font-semibold text-slate-700">{info.lastSlotDate || 'N/A'}</td>
                          <td className="p-3 text-slate-500 text-xs">
                            {info.lastAlertTime ? new Date(info.lastAlertTime).toLocaleString() : 'No alert sent yet'}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
              <h3 className="font-black text-slate-900 text-lg mb-4">Subscribers Grouped by Route ({statusData?.subscribers?.length || 0} Total)</h3>
              {(!statusData?.subscribers || statusData.subscribers.length === 0) ? (
                <p className="text-sm text-slate-500">No email subscribers yet.</p>
              ) : (
                <div className="space-y-4">
                  <div className="flex flex-wrap gap-2.5">
                    {Object.entries(
                      (statusData.subscribers || []).reduce((acc: any, s: any) => {
                        const key = `${s.fromCountry || 'IN'} -> ${s.toCountry || 'US'}`;
                        acc[key] = (acc[key] || 0) + 1;
                        return acc;
                      }, {})
                    ).map(([route, count]: [string, any]) => (
                      <div key={route} className="bg-blue-50 border border-blue-200 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-extrabold text-[#0B3D91]">
                        {route}: <span className="text-emerald-700">{count} {count === 1 ? 'user' : 'users'}</span>
                      </div>
                    ))}
                  </div>

                  <div className="border-t border-slate-100 pt-4">
                    <span className="text-xs font-bold text-slate-500 block mb-2">Individual Subscriptions:</span>
                    <ul className="space-y-2 max-h-56 overflow-y-auto pr-2">
                      {statusData.subscribers.map((sub: any) => (
                        <li key={sub.id} className="flex items-center justify-between p-2.5 bg-slate-50 rounded-xl border border-slate-100 text-xs sm:text-sm">
                          <span className="font-bold text-slate-800">{sub.email}</span>
                          <span className="bg-blue-100 text-[#0B3D91] font-bold px-2.5 py-0.5 rounded-md">
                            {sub.fromCountry || 'IN'} → {sub.toCountry || 'US'} ({sub.embassyCity || 'Hub'})
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
