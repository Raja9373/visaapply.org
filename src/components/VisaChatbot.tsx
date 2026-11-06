import React, { useState, useRef, useEffect } from 'react';
import { NAME_MAP_249, FLAG_MAP_249, getLiveVisaCount } from '../data/fullVisaDatabase';
import { getCountryMeta } from '../data/countryMetaData';
import { getEmbassyInfo } from '../data/embassyAddresses';
import { getContinentForCountry, CONTINENT_MAP_249 } from '../data/continentMap';
import { parseHotelPriceUSD, parseProcessingDays, parseSuccessRateNum } from '../utils/countryLiveUtils';
import { getFlightLinkForCountry } from '../data/travelpayoutsConfig';

interface ChatMessage {
  id: string;
  sender: 'bot' | 'user';
  html: string;
  time: string;
}

const ALL_CODES = Object.keys(NAME_MAP_249);

function findMentionedCountries(query: string): string[] {
  const q = query.toLowerCase();
  const matches: string[] = [];

  // Common aliases
  const aliases: Record<string, string> = {
    usa: 'us',
    'u.s.': 'us',
    'u.s.a': 'us',
    america: 'us',
    'united states': 'us',
    uk: 'gb',
    'u.k.': 'gb',
    britain: 'gb',
    england: 'gb',
    london: 'gb',
    dubai: 'ae',
    uae: 'ae',
    emirates: 'ae',
    schengen: 'de',
    europe: 'fr',
    bangkok: 'th',
    tokyo: 'jp',
    paris: 'fr',
    rome: 'it',
    sydney: 'au',
    toronto: 'ca',
    berlin: 'de',
    singapore: 'sg',
    bali: 'id',
  };

  for (const [alias, code] of Object.entries(aliases)) {
    const regex = new RegExp(`\\b${alias.replace(/\./g, '\\.')}\\b`, 'i');
    if (regex.test(q) && !matches.includes(code)) {
      matches.push(code);
    }
  }

  for (const code of ALL_CODES) {
    const name = NAME_MAP_249[code].toLowerCase();
    const meta = getCountryMeta(code);
    const cap = meta.capital.toLowerCase();
    if (q.includes(name) || (cap.length > 3 && q.includes(cap))) {
      if (!matches.includes(code)) {
        matches.push(code);
      }
    }
  }

  return matches;
}

export function generateChatbotResponse(rawQuery: string): string {
  const q = rawQuery.trim().toLowerCase();
  const mentioned = findMentionedCountries(q);

  // 1. Compare 2 countries
  if ((q.includes('compare') || q.includes('vs') || q.includes('versus') || q.includes('better')) && mentioned.length >= 2) {
    const c1 = mentioned[0];
    const c2 = mentioned[1];
    const n1 = NAME_MAP_249[c1];
    const n2 = NAME_MAP_249[c2];
    const m1 = getCountryMeta(c1);
    const m2 = getCountryMeta(c2);
    const v1 = getLiveVisaCount(c1);
    const v2 = getLiveVisaCount(c2);
    const p1 = parseProcessingDays(m1.processing);
    const p2 = parseProcessingDays(m2.processing);
    const s1 = parseSuccessRateNum(m1.successRate);
    const s2 = parseSuccessRateNum(m2.successRate);

    const faster = p1 <= p2 ? n1 : n2;
    const higherSuccess = s1 >= s2 ? n1 : n2;

    return `
      <div style="font-weight:800; color:#0f172a; margin-bottom:6px;">⚖️ ${FLAG_MAP_249[c1]} ${n1} vs ${FLAG_MAP_249[c2]} ${n2} (2026 Comparison)</div>
      <div style="background:#f8fafc; border:1px solid #e2e8f0; border-radius:10px; padding:10px; font-size:12px; margin-bottom:8px;">
        <div>• <strong>Visa Categories:</strong> ${n1} (${v1}) vs ${n2} (${v2})</div>
        <div>• <strong>Processing Time:</strong> ${n1} (${m1.processing}) vs ${n2} (${m2.processing})</div>
        <div>• <strong>Success Rate:</strong> ${n1} (${m1.successRate}) vs ${n2} (${m2.successRate})</div>
        <div>• <strong>Avg Hotel/Night:</strong> ${n1} (${m1.hotelPrice}) vs ${n2} (${m2.hotelPrice})</div>
        <div>• <strong>Best Time:</strong> ${n1} (${m1.bestTime}) vs ${n2} (${m2.bestTime})</div>
      </div>
      <div style="font-size:12px; color:#059669; font-weight:700; margin-bottom:6px;">
        🏆 Verdict: <strong>${faster}</strong> processes faster, while <strong>${higherSuccess}</strong> has a higher approval rate for Indian passport holders.
      </div>
      <div style="display:flex; gap:6px; flex-wrap:wrap; margin-top:6px;">
        <a href="/in-to-${c1}" style="background:#eff6ff; color:#1d4ed8; padding:4px 8px; border-radius:6px; font-size:11px; font-weight:700; text-decoration:none;">Explore ${n1} →</a>
        <a href="/in-to-${c2}" style="background:#eff6ff; color:#1d4ed8; padding:4px 8px; border-radius:6px; font-size:11px; font-weight:700; text-decoration:none;">Explore ${n2} →</a>
      </div>
    `;
  }

  // 2. Fastest e-Visa / Visa on Arrival query
  if (q.includes('fastest') || q.includes('e-visa') || q.includes('evisa') || q.includes('visa on arrival') || q.includes('voa')) {
    if (mentioned.length === 0) {
      return `
        <div style="font-weight:800; color:#0f172a; margin-bottom:6px;">⚡ Top Fastest e-Visa & Visa-Free Destinations for Indians (2026)</div>
        <div style="font-size:12px; color:#334155; line-height:1.6;">
          1. 🇹🇭 <strong>Thailand</strong> — Visa Free / 60 Days (Instant)<br/>
          2. 🇦🇪 <strong>UAE (Dubai)</strong> — 3-4 Days e-Visa (96% Approval)<br/>
          3. 🇸🇬 <strong>Singapore</strong> — 3-5 Days e-Visa ($30 Fee)<br/>
          4. 🇻🇳 <strong>Vietnam</strong> — 3 Days e-Visa ($25 Official Fee)<br/>
          5. 🇲🇾 <strong>Malaysia</strong> — Visa Free (MDAC Digital Arrival Card)<br/>
          6. 🇮🇩 <strong>Indonesia (Bali)</strong> — Instant e-VOA ($35)
        </div>
        <div style="margin-top:8px;">
          <a href="https://www.booking.com/index.html?aid=8119919&label=chatbot-evisa" target="_blank" rel="noopener noreferrer" style="display:inline-block; background:#003580; color:white; padding:5px 10px; border-radius:6px; font-size:11px; font-weight:700; text-decoration:none;">🏨 Compare Visa-Friendly Hotels on Booking.com →</a>
        </div>
      `;
    }
  }

  // 3. Schengen query
  if (q.includes('schengen')) {
    return `
      <div style="font-weight:800; color:#0f172a; margin-bottom:6px;">🇪🇺 Schengen Visa for Indians (2026 Rules)</div>
      <div style="font-size:12px; color:#334155; line-height:1.5;">
        • <strong>Standard Fee:</strong> €90 (~₹8,200) for adults, €45 for children (6-12 yrs)<br/>
        • <strong>Processing Time:</strong> 15 Calendar Days (Apply up to 6 months early)<br/>
        • <strong>Cascade Multi-Entry Rule:</strong> Indian nationals who lawfully used 2 Schengen visas within the past 3 years are eligible for a <strong>2-year (then 5-year) Multiple Entry Schengen Visa</strong>!<br/>
        • <strong>Highest Approval Embassies:</strong> Germany (88%), France (87%), Switzerland (89%), Spain (86%).<br/>
        • <strong>Mandatory Insurance:</strong> Minimum €30,000 medical coverage across all 29 Schengen states.
      </div>
      <div style="display:flex; gap:6px; flex-wrap:wrap; margin-top:8px;">
        <a href="/in-to-de" style="background:#eff6ff; color:#1d4ed8; padding:4px 8px; border-radius:6px; font-size:11px; font-weight:700; text-decoration:none;">🇩🇪 Germany Guide</a>
        <a href="/in-to-fr" style="background:#eff6ff; color:#1d4ed8; padding:4px 8px; border-radius:6px; font-size:11px; font-weight:700; text-decoration:none;">🇫🇷 France Guide</a>
        <a href="https://www.booking.com/searchresults.html?ss=Europe&aid=8119919&label=chatbot-schengen" target="_blank" rel="noopener noreferrer" style="background:#003580; color:white; padding:4px 8px; border-radius:6px; font-size:11px; font-weight:700; text-decoration:none;">🏨 Schengen Refundable Hotels</a>
      </div>
    `;
  }

  // 4. Specific Country Query
  if (mentioned.length > 0) {
    const code = mentioned[0];
    const name = NAME_MAP_249[code];
    const flag = FLAG_MAP_249[code] || '🌍';
    const meta = getCountryMeta(code);
    const visaCount = getLiveVisaCount(code);
    const embassy = getEmbassyInfo(code.toUpperCase());
    const firstConsulate = embassy.inIndia?.[0];
    const contKey = getContinentForCountry(code);
    const continent = CONTINENT_MAP_249[contKey]?.label || 'Global';
    const hotelNum = parseHotelPriceUSD(meta.hotelPrice);
    const feeINR = code === 'us' ? '₹15,400 ($185)' : code === 'gb' ? '₹12,000 ($145)' : code === 'ca' ? '₹11,500 (CAD 185)' : '₹6,500 ($80)';

    if (q.includes('embassy') || q.includes('vfs') || q.includes('address') || q.includes('delhi') || q.includes('mumbai')) {
      return `
        <div style="font-weight:800; color:#0f172a; margin-bottom:6px;">🏛️ ${flag} ${name} Embassy & VFS in India</div>
        <div style="font-size:12px; color:#334155; line-height:1.5;">
          • <strong>Primary Mission:</strong> ${firstConsulate?.city || 'New Delhi'} — ${firstConsulate?.address || 'Chanakyapuri Diplomatic Enclave, New Delhi'}<br/>
          • <strong>Phone:</strong> ${firstConsulate?.phone || '+91-11-2419-8000'}<br/>
          • <strong>Email:</strong> ${firstConsulate?.email || `consular.${code}@embassy.gov`}<br/>
          • <strong>VFS / Biometrics:</strong> ${embassy.vfs || 'VFS Global Centers in Delhi, Mumbai, Bengaluru, Chennai, Hyderabad & Kolkata'}<br/>
          • <strong>Timings:</strong> ${firstConsulate?.timings || 'Mon-Fri: 09:00 AM - 05:00 PM'}
        </div>
        <div style="display:flex; gap:6px; flex-wrap:wrap; margin-top:8px;">
          <a href="/in-to-${code}" style="background:#eff6ff; color:#1d4ed8; padding:4px 8px; border-radius:6px; font-size:11px; font-weight:700; text-decoration:none;">📍 View Map & Consulates</a>
          <a href="/interview-prep/${code}" style="background:#ecfdf5; color:#047857; padding:4px 8px; border-radius:6px; font-size:11px; font-weight:700; text-decoration:none;">🎤 ${name} Interview Prep</a>
        </div>
      `;
    }

    if (q.includes('interview') || q.includes('question') || q.includes('reject')) {
      return `
        <div style="font-weight:800; color:#0f172a; margin-bottom:6px;">🎤 ${flag} ${name} Visa Interview & Approval Tips</div>
        <div style="font-size:12px; color:#334155; line-height:1.5;">
          • <strong>Approval Rate for Indians:</strong> <span style="color:#059669; font-weight:700;">${meta.successRate}</span><br/>
          • <strong>Top 3 Questions:</strong><br/>
          &nbsp;&nbsp;1. What is the primary purpose of your visit to ${name}?<br/>
          &nbsp;&nbsp;2. Who is sponsoring your trip and what is your annual income?<br/>
          &nbsp;&nbsp;3. What ties bind you back to India after your trip?<br/>
          • <strong>Pro Tip:</strong> Carry 6 months stamped bank statements, 3 years ITR, NOC from employer, and verifiable hotel bookings in ${meta.capital}.
        </div>
        <div style="display:flex; gap:6px; flex-wrap:wrap; margin-top:8px;">
          <a href="/interview-prep/${code}" style="background:#2563eb; color:white; padding:5px 10px; border-radius:6px; font-size:11px; font-weight:700; text-decoration:none;">🎤 Open 20-Question ${name} Mock Interview →</a>
        </div>
      `;
    }

    const flightInfo = getFlightLinkForCountry(code);
    return `
      <div style="font-weight:800; color:#0f172a; margin-bottom:6px;">${flag} ${name} Visa Guide for Indians (2026)</div>
      <div style="font-size:12px; color:#334155; line-height:1.55;">
        • <strong>Continent & Capital:</strong> ${continent} • ${meta.capital}<br/>
        • <strong>Total Visa Categories:</strong> <strong>${visaCount} Official Visas</strong><br/>
        • <strong>Processing Time:</strong> <span style="color:#2563eb; font-weight:700;">${meta.processing}</span><br/>
        • <strong>Est. Visa Fee:</strong> ${feeINR}<br/>
        • <strong>Indian Approval Rate:</strong> <span style="color:#059669; font-weight:700;">${meta.successRate}</span><br/>
        • <strong>Currency & Best Season:</strong> ${meta.currency} (${meta.currencySymbol}) • ${meta.bestTime}<br/>
        • <strong>Flight (${flightInfo.route}):</strong> <strong>From ${flightInfo.priceINR}</strong><br/>
        • <strong>Avg Hotel in ${meta.capital}:</strong> $${hotelNum}/night
      </div>
      <div style="display:flex; gap:6px; flex-wrap:wrap; margin-top:8px;">
        <a href="/in-to-${code}" style="background:#2563eb; color:white; padding:5px 10px; border-radius:6px; font-size:11px; font-weight:700; text-decoration:none;">📋 Full ${name} Checklist</a>
        <a href="${flightInfo.aviasalesLink}" target="_blank" rel="noopener noreferrer" style="background:#10b981; color:white; padding:5px 10px; border-radius:6px; font-size:11px; font-weight:700; text-decoration:none;">✈ Flights (${flightInfo.priceINR})</a>
        <a href="https://www.booking.com/searchresults.html?ss=${encodeURIComponent(name)}&aid=8119919&label=chatbot-${code}" target="_blank" rel="noopener noreferrer" style="background:#003580; color:white; padding:5px 10px; border-radius:6px; font-size:11px; font-weight:700; text-decoration:none;">🏨 Hotels ($${hotelNum})</a>
      </div>
    `;
  }

  // 5. Embassy in Delhi fallback
  if (q.includes('embassy') || q.includes('delhi') || q.includes('vfs')) {
    return `
      <div style="font-weight:800; color:#0f172a; margin-bottom:6px;">🏛️ Embassies & VFS Global Centers in India</div>
      <div style="font-size:12px; color:#334155; line-height:1.5;">
        Most foreign embassies are located in <strong>Chanakyapuri, New Delhi</strong>, with Consulates General in <strong>Mumbai (BKC/Nariman Point), Bengaluru, Chennai, Kolkata, and Hyderabad</strong>.<br/><br/>
        Type any country name + "embassy" (e.g., <em>"USA embassy"</em>, <em>"Germany embassy"</em>, <em>"Japan embassy"</em>) to get exact address, phone, email, and Google Map links!
      </div>
    `;
  }

  // 6. Default helpful response
  return `
    <div style="font-weight:800; color:#0f172a; margin-bottom:6px;">🌍 VisaApply 249-Country Assistant</div>
    <div style="font-size:12px; color:#334155; line-height:1.5;">
      I have live 2026 data for all <strong>249 countries & territories</strong>! Ask me about:<br/>
      • Any country's visa fees, processing time & documents (e.g. <strong>"USA visa fees"</strong>, <strong>"Japan tourist visa"</strong>)<br/>
      • Side-by-side comparisons (e.g. <strong>"Compare USA vs Canada"</strong>)<br/>
      • Embassy & VFS addresses (e.g. <strong>"France embassy in Delhi"</strong>)<br/>
      • Consular interview prep (e.g. <strong>"Germany interview questions"</strong>)
    </div>
  `;
}

interface VisaChatbotProps {
  onNavigate?: (path: string) => void;
}

export const VisaChatbot: React.FC<VisaChatbotProps> = ({ onNavigate }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      sender: 'bot',
      html: '👋 Namaste! I am your <strong>249-Country Visa Assistant</strong>. Ask me anything about visa fees, processing time, documents, eligibility, or embassy addresses!',
      time: 'Just now',
    },
  ]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  const sendQuery = (text: string) => {
    const trimmed = text.trim();
    if (!trimmed) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      html: trimmed,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    const replyHtml = generateChatbotResponse(trimmed);
    const botMsg: ChatMessage = {
      id: `bot-${Date.now() + 1}`,
      sender: 'bot',
      html: replyHtml,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg, botMsg]);
    setInput('');
  };

  const handleMessageClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const target = (e.target as HTMLElement).closest('a');
    if (!target) return;
    const href = target.getAttribute('href');
    if (href && href.startsWith('/') && onNavigate) {
      e.preventDefault();
      onNavigate(href);
    }
  };

  const quickQuestions = [
    { label: '🇺🇸 USA visa fees', query: 'USA visa fees' },
    { label: '🇪🇺 Schengen visa', query: 'Schengen visa' },
    { label: '⚡ Fastest e-Visa', query: 'Fastest e-Visa' },
    { label: '⚖️ USA vs Canada', query: 'Compare USA vs Canada' },
    { label: '🏛️ Embassy in Delhi', query: 'USA Embassy in Delhi' },
  ];

  return (
    <>
      {/* Floating Button */}
      <div
        id="visa-chatbot-btn"
        onClick={() => setIsOpen((prev) => !prev)}
        style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          width: '64px',
          height: '64px',
          borderRadius: '50%',
          background: 'linear-gradient(135deg,#2563eb,#1d4ed8)',
          color: 'white',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '28px',
          cursor: 'pointer',
          boxShadow: '0 8px 24px rgba(37,99,235,0.4)',
          zIndex: 9999,
          transition: 'transform 0.2s',
        }}
        title="Ask 249-Country Visa Assistant"
      >
        {isOpen ? '✕' : '💬'}
      </div>

      {/* Chat Window */}
      {isOpen && (
        <div
          id="visa-chatbot-window"
          style={{
            position: 'fixed',
            bottom: '100px',
            right: '24px',
            width: '380px',
            maxWidth: 'calc(100vw - 32px)',
            height: '520px',
            maxHeight: 'calc(100vh - 140px)',
            background: 'white',
            borderRadius: '20px',
            boxShadow: '0 12px 40px rgba(0,0,0,0.18)',
            display: 'flex',
            flexDirection: 'column',
            zIndex: 9999,
            overflow: 'hidden',
            border: '1px solid #e2e8f0',
          }}
        >
          {/* Header */}
          <div
            style={{
              background: 'linear-gradient(135deg,#0f172a,#1e293b)',
              color: 'white',
              padding: '16px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <div>
              <div style={{ fontWeight: 800, fontSize: '16px' }}>🤖 VisaApply Assistant</div>
              <div style={{ fontSize: '11px', color: '#94a3b8' }}>Instant answers for 249 countries</div>
            </div>
            <span
              onClick={() => setIsOpen(false)}
              style={{ cursor: 'pointer', fontSize: '20px', padding: '4px 8px' }}
            >
              ✕
            </span>
          </div>

          {/* Messages */}
          <div
            id="chatbot-messages"
            onClick={handleMessageClick}
            style={{
              flex: 1,
              padding: '16px',
              overflowY: 'auto',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
              background: '#ffffff',
            }}
          >
            {messages.map((msg) => (
              <div
                key={msg.id}
                style={{
                  alignSelf: msg.sender === 'user' ? 'flex-end' : 'flex-start',
                  background: msg.sender === 'user' ? '#2563eb' : '#f1f5f9',
                  color: msg.sender === 'user' ? 'white' : '#0f172a',
                  padding: '12px',
                  borderRadius:
                    msg.sender === 'user' ? '12px 12px 2px 12px' : '12px 12px 12px 2px',
                  fontSize: '13px',
                  maxWidth: '88%',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
                }}
              >
                <div dangerouslySetInnerHTML={{ __html: msg.html }} />
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Questions */}
          <div
            style={{
              padding: '8px 16px',
              display: 'flex',
              gap: '6px',
              overflowX: 'auto',
              borderTop: '1px solid #f1f5f9',
              background: '#f8fafc',
            }}
          >
            {quickQuestions.map((qq) => (
              <button
                key={qq.label}
                type="button"
                onClick={() => sendQuery(qq.query)}
                style={{
                  padding: '6px 10px',
                  background: '#eff6ff',
                  color: '#2563eb',
                  border: '1px solid #bfdbfe',
                  borderRadius: '8px',
                  fontSize: '11px',
                  fontWeight: 700,
                  whiteSpace: 'nowrap',
                  cursor: 'pointer',
                }}
              >
                {qq.label}
              </button>
            ))}
          </div>

          {/* Input */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              sendQuery(input);
            }}
            style={{
              padding: '12px',
              borderTop: '1px solid #e2e8f0',
              display: 'flex',
              gap: '8px',
              background: 'white',
            }}
          >
            <input
              id="chatbot-input"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask e.g. USA visa fees, Germany processing..."
              style={{
                flex: 1,
                padding: '10px 14px',
                border: '1px solid #e2e8f0',
                borderRadius: '10px',
                fontSize: '13px',
                outline: 'none',
              }}
            />
            <button
              type="submit"
              style={{
                padding: '10px 16px',
                background: '#2563eb',
                color: 'white',
                border: 'none',
                borderRadius: '10px',
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              Send
            </button>
          </form>
        </div>
      )}
    </>
  );
};
