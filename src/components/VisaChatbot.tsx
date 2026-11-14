import React, { useState, useRef, useEffect } from 'react';
import { NAME_MAP_249, FLAG_MAP_249, FULL_VISA_DB, getLiveVisaCount } from '../data/fullVisaDatabase';
import { getCountryMeta } from '../data/countryMetaData';
import { getEmbassyInfo } from '../data/embassyAddresses';
import { getContinentForCountry, CONTINENT_MAP_249 } from '../data/continentMap';
import { parseHotelPriceUSD, parseProcessingDays, parseSuccessRateNum } from '../utils/countryLiveUtils';
import { getFlightLinkForCountry } from '../data/travelpayoutsConfig';
import { sanitizeUrl } from '../utils/htmlSanitizer';

export interface ChatbotLink {
  label: string;
  href: string;
  tone: 'blue' | 'primary' | 'emerald' | 'dark';
  external?: boolean;
}

export interface ChatbotStructuredReply {
  title: string;
  lines: Array<{ label?: string; text: string; highlight?: 'blue' | 'emerald' }>;
  verdict?: string;
  links?: ChatbotLink[];
}

interface ChatMessage {
  id: string;
  sender: 'bot' | 'user';
  userText?: string;
  reply?: ChatbotStructuredReply;
  time: string;
}

const ALL_CODES = Object.keys(NAME_MAP_249);

function findMentionedCountries(query: string): string[] {
  const q = query.toLowerCase();
  const matches: string[] = [];

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
    const name = (NAME_MAP_249[code] || '').toLowerCase();
    const meta = getCountryMeta(code);
    const cap = meta.capital.toLowerCase();
    if ((name && q.includes(name)) || (cap.length > 3 && q.includes(cap))) {
      if (!matches.includes(code)) {
        matches.push(code);
      }
    }
  }

  return matches;
}

export function generateChatbotReply(rawQuery: string): ChatbotStructuredReply {
  const q = rawQuery.trim().toLowerCase();
  const mentioned = findMentionedCountries(q);

  // 1. Compare 2 countries
  if ((q.includes('compare') || q.includes('vs') || q.includes('versus') || q.includes('better')) && mentioned.length >= 2) {
    const c1 = mentioned[0];
    const c2 = mentioned[1];
    const n1 = NAME_MAP_249[c1] || c1.toUpperCase();
    const n2 = NAME_MAP_249[c2] || c2.toUpperCase();
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

    return {
      title: `⚖️ ${FLAG_MAP_249[c1] || ''} ${n1} vs ${FLAG_MAP_249[c2] || ''} ${n2} (2026 Comparison)`,
      lines: [
        { label: 'Visa Categories', text: `${n1} (${v1}) vs ${n2} (${v2})` },
        { label: 'Processing Time', text: `${n1} (${m1.processing}) vs ${n2} (${m2.processing})` },
        { label: 'Success Rate', text: `${n1} (${m1.successRate}) vs ${n2} (${m2.successRate})` },
        { label: 'Avg Hotel/Night', text: `${n1} (${m1.hotelPrice}) vs ${n2} (${m2.hotelPrice})` },
        { label: 'Best Time', text: `${n1} (${m1.bestTime}) vs ${n2} (${m2.bestTime})` },
      ],
      verdict: `🏆 Verdict: ${faster} processes faster, while ${higherSuccess} has a higher approval rate for Indian passport holders.`,
      links: [
        { label: `Explore ${n1} →`, href: `/in-to-${c1}`, tone: 'blue' },
        { label: `Explore ${n2} →`, href: `/in-to-${c2}`, tone: 'blue' },
      ],
    };
  }

  // 2. Fastest e-Visa / Visa on Arrival query
  if (q.includes('fastest') || q.includes('e-visa') || q.includes('evisa') || q.includes('visa on arrival') || q.includes('voa')) {
    if (mentioned.length === 0) {
      return {
        title: '⚡ Top Fastest e-Visa & Visa-Free Destinations for Indians (2026)',
        lines: [
          { label: '1. 🇹🇭 Thailand', text: 'Visa Exemption / 60 Days (Check current MFA conditions)' },
          { label: '2. 🇦🇪 UAE (Dubai)', text: '3-4 Days e-Visa (Verify current ICP/GDRFA schedule)' },
          { label: '3. 🇸🇬 Singapore', text: '3-5 Days e-Visa via authorized agent (ICA fee SGD $30)' },
          { label: '4. 🇻🇳 Vietnam', text: '3 Business Days e-Visa ($25 Official Fee)' },
          { label: '5. 🇲🇾 Malaysia', text: 'Visa-Free Short-Stay with MDAC Digital Arrival Card' },
          { label: '6. 🇮🇩 Indonesia (Bali)', text: 'Official e-VOA (IDR 500,000 / ~$35 USD)' },
        ],
        links: [
          {
            label: '🏨 Compare Visa-Friendly Hotels on Booking.com →',
            href: 'https://www.booking.com/index.html?aid=8119919&label=chatbot-evisa',
            tone: 'dark',
            external: true,
          },
        ],
      };
    }
  }

  // 3. Schengen query
  if (q.includes('schengen')) {
    return {
      title: '🇪🇺 Schengen Visa for Indians (2026 Rules)',
      lines: [
        { label: 'Standard Fee', text: '€90 for adults, €45 for children (6-12 yrs)' },
        { label: 'Processing Time', text: '15 Calendar Days standard (Apply up to 6 months early)' },
        { label: 'Cascade Multi-Entry Rule', text: 'Indian nationals who lawfully used 2 Schengen visas within the past 3 years may qualify for a 2-year (then 5-year) Multiple Entry Schengen Visa.' },
        { label: 'Mandatory Insurance', text: 'Minimum €30,000 medical coverage across all 29 Schengen states.' },
      ],
      links: [
        { label: '🇩🇪 Germany Guide', href: '/in-to-de', tone: 'blue' },
        { label: '🇫🇷 France Guide', href: '/in-to-fr', tone: 'blue' },
        {
          label: '🏨 Schengen Refundable Hotels',
          href: 'https://www.booking.com/searchresults.html?ss=Europe&aid=8119919&label=chatbot-schengen',
          tone: 'dark',
          external: true,
        },
      ],
    };
  }

  // 4. Specific Country Query
  if (mentioned.length > 0) {
    const code = mentioned[0];
    const name = NAME_MAP_249[code] || code.toUpperCase();
    const flag = FLAG_MAP_249[code] || '🌍';
    const meta = getCountryMeta(code);
    const visaCount = getLiveVisaCount(code);
    const embassy = getEmbassyInfo(code.toUpperCase());
    const firstConsulate = embassy.inIndia?.[0];
    const contKey = getContinentForCountry(code);
    const continent = CONTINENT_MAP_249[contKey]?.label || 'Global';
    const hotelNum = parseHotelPriceUSD(meta.hotelPrice);
    const dbItem = FULL_VISA_DB['IN']?.[code.toUpperCase()]?.tourist?.[0] || FULL_VISA_DB[code.toUpperCase()]?.tourist?.[0];
    const verifiedFeeText = dbItem?.fee || 'Verify fee on official embassy portal';

    if (q.includes('embassy') || q.includes('vfs') || q.includes('address') || q.includes('delhi') || q.includes('mumbai')) {
      return {
        title: `🏛️ ${flag} ${name} Embassy & VFS in India`,
        lines: [
          { label: 'Primary Mission', text: `${firstConsulate?.city || 'New Delhi'} — ${firstConsulate?.address || 'Check official diplomatic mission directory'}` },
          { label: 'Phone', text: firstConsulate?.phone || 'See official mission directory' },
          { label: 'Email', text: firstConsulate?.email || 'See official mission directory' },
          { label: 'VFS / Biometrics', text: embassy.vfs || 'VFS Global Centers in major Indian cities' },
          { label: 'Timings', text: firstConsulate?.timings || 'Mon-Fri: 09:00 AM - 05:00 PM' },
        ],
        links: [
          { label: '📍 View Map & Consulates', href: `/in-to-${code}`, tone: 'blue' },
          { label: `🎤 ${name} Interview Prep`, href: `/interview-prep/${code}`, tone: 'emerald' },
        ],
      };
    }

    if (q.includes('interview') || q.includes('question') || q.includes('reject')) {
      return {
        title: `🎤 ${flag} ${name} Visa Interview & Approval Tips`,
        lines: [
          { label: 'Approval Benchmark', text: meta.successRate, highlight: 'emerald' },
          { label: 'Question 1', text: `What is the primary purpose of your visit to ${name}?` },
          { label: 'Question 2', text: 'Who is sponsoring your trip and what is your annual income?' },
          { label: 'Question 3', text: 'What ties bind you back to India after your trip?' },
          { label: 'Pro Tip', text: `Carry 6 months stamped bank statements, 3 years ITR, NOC from employer, and verifiable hotel bookings in ${meta.capital}.` },
        ],
        links: [
          { label: `🎤 Open 20-Question ${name} Mock Interview →`, href: `/interview-prep/${code}`, tone: 'primary' },
        ],
      };
    }

    const flightInfo = getFlightLinkForCountry(code);
    return {
      title: `${flag} ${name} Visa Guide for Indians (2026)`,
      lines: [
        { label: 'Continent & Capital', text: `${continent} • ${meta.capital}` },
        { label: 'Visa Categories', text: `${visaCount} Official Visas` },
        { label: 'Processing Time', text: meta.processing, highlight: 'blue' },
        { label: 'Tourist Visa Fee', text: verifiedFeeText },
        { label: 'Indian Approval Benchmark', text: meta.successRate, highlight: 'emerald' },
        { label: 'Currency & Best Season', text: `${meta.currency} (${meta.currencySymbol}) • ${meta.bestTime}` },
        { label: `Flight (${flightInfo.route})`, text: `From ${flightInfo.priceINR}` },
        { label: `Avg Hotel in ${meta.capital}`, text: `$${hotelNum}/night` },
      ],
      links: [
        { label: `📋 Full ${name} Checklist`, href: `/in-to-${code}`, tone: 'primary' },
        { label: `✈ Flights (${flightInfo.priceINR})`, href: flightInfo.aviasalesLink, tone: 'emerald', external: true },
        {
          label: `🏨 Hotels ($${hotelNum})`,
          href: `https://www.booking.com/searchresults.html?ss=${encodeURIComponent(name)}&aid=8119919&label=chatbot-${code}`,
          tone: 'dark',
          external: true,
        },
      ],
    };
  }

  // 5. Embassy in Delhi fallback
  if (q.includes('embassy') || q.includes('delhi') || q.includes('vfs')) {
    return {
      title: '🏛️ Embassies & VFS Global Centers in India',
      lines: [
        { text: 'Most foreign embassies are located in Chanakyapuri, New Delhi, with Consulates General in Mumbai, Bengaluru, Chennai, Kolkata, and Hyderabad.' },
        { text: 'Type any country name + "embassy" (e.g. "USA embassy", "Germany embassy", "Japan embassy") to view mission details.' },
      ],
    };
  }

  // 6. Default helpful response
  return {
    title: '🌍 VisaApply 249-Country Assistant',
    lines: [
      { text: 'Ask about verified visa categories, processing windows, embassies, or bilateral comparisons:' },
      { label: 'Visa Fees & Rules', text: 'e.g. "USA visa fees", "Japan tourist visa"' },
      { label: 'Side-by-Side', text: 'e.g. "Compare USA vs Canada"' },
      { label: 'Embassies & VFS', text: 'e.g. "France embassy in Delhi"' },
      { label: 'Interview Prep', text: 'e.g. "Germany interview questions"' },
    ],
  };
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
      reply: {
        title: '👋 Namaste! 249-Country Visa Assistant',
        lines: [
          {
            text: 'Ask me about official visa categories, processing timelines, documents, eligibility, or embassy addresses!',
          },
        ],
      },
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
      userText: trimmed,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    const reply = generateChatbotReply(trimmed);
    const botMsg: ChatMessage = {
      id: `bot-${Date.now() + 1}`,
      sender: 'bot',
      reply,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg, botMsg]);
    setInput('');
  };

  const quickQuestions = [
    { label: '🇺🇸 USA visa fees', query: 'USA visa fees' },
    { label: '🇪🇺 Schengen visa', query: 'Schengen visa' },
    { label: '⚡ Fastest e-Visa', query: 'Fastest e-Visa' },
    { label: '⚖️ USA vs Canada', query: 'Compare USA vs Canada' },
    { label: '🏛️ Embassy in Delhi', query: 'USA Embassy in Delhi' },
  ];

  const getLinkClasses = (tone: ChatbotLink['tone']): string => {
    switch (tone) {
      case 'primary':
        return 'bg-blue-600 text-white hover:bg-blue-700';
      case 'emerald':
        return 'bg-emerald-600 text-white hover:bg-emerald-700';
      case 'dark':
        return 'bg-[#003580] text-white hover:bg-[#00224f]';
      default:
        return 'bg-blue-50 text-blue-700 hover:bg-blue-100';
    }
  };

  return (
    <>
      <button
        type="button"
        id="visa-chatbot-btn"
        onClick={() => setIsOpen((prev) => !prev)}
        className="fixed bottom-6 right-6 w-16 h-16 rounded-full bg-gradient-to-br from-blue-600 to-blue-800 text-white flex items-center justify-center text-3xl cursor-pointer shadow-lg z-[9999] transition-transform hover:scale-105"
        title="Ask 249-Country Visa Assistant"
        aria-label="Toggle 249-Country Visa Assistant"
      >
        {isOpen ? '✕' : '💬'}
      </button>

      {isOpen && (
        <div
          id="visa-chatbot-window"
          className="fixed bottom-24 right-6 w-[380px] max-w-[calc(100vw-32px)] h-[520px] max-h-[calc(100vh-140px)] bg-white rounded-2xl shadow-2xl flex flex-col z-[9999] overflow-hidden border border-slate-200"
        >
          <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white p-4 flex justify-between items-center">
            <div>
              <div className="font-extrabold text-base">🤖 VisaApply Assistant</div>
              <div className="text-[11px] text-slate-400">Instant answers for 249 countries</div>
            </div>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="cursor-pointer text-xl px-2 py-1 text-slate-300 hover:text-white"
              aria-label="Close assistant"
            >
              ✕
            </button>
          </div>

          <div
            id="chatbot-messages"
            className="flex-1 p-4 overflow-y-auto flex flex-col gap-3 bg-white"
          >
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={
                  msg.sender === 'user'
                    ? 'self-end bg-blue-600 text-white p-3 rounded-xl rounded-br-none text-[13px] max-w-[88%] shadow-xs break-words'
                    : 'self-start bg-slate-100 text-slate-900 p-3 rounded-xl rounded-bl-none text-[13px] max-w-[88%] shadow-xs space-y-2'
                }
              >
                {msg.sender === 'user' ? (
                  <div>{msg.userText}</div>
                ) : msg.reply ? (
                  <div className="space-y-1.5">
                    <div className="font-extrabold text-slate-900">{msg.reply.title}</div>
                    <div className="bg-white/80 border border-slate-200 rounded-lg p-2.5 text-xs text-slate-700 space-y-1 leading-relaxed">
                      {msg.reply.lines.map((line, idx) => (
                        <div key={idx}>
                          {line.label && <strong className="text-slate-900">{line.label}: </strong>}
                          <span
                            className={
                              line.highlight === 'blue'
                                ? 'text-blue-600 font-bold'
                                : line.highlight === 'emerald'
                                ? 'text-emerald-600 font-bold'
                                : ''
                            }
                          >
                            {line.text}
                          </span>
                        </div>
                      ))}
                    </div>
                    {msg.reply.verdict && (
                      <div className="text-xs text-emerald-700 font-bold">{msg.reply.verdict}</div>
                    )}
                    {msg.reply.links && msg.reply.links.length > 0 && (
                      <div className="flex gap-1.5 flex-wrap pt-1">
                        {msg.reply.links.map((lnk, idx) => {
                          const safeHref = sanitizeUrl(lnk.href, { allowRelative: true });
                          if (!safeHref) return null;
                          const isInternal = safeHref.startsWith('/');
                          return (
                            <a
                              key={idx}
                              href={safeHref}
                              target={!isInternal && lnk.external ? '_blank' : undefined}
                              rel={!isInternal && lnk.external ? 'noopener noreferrer' : undefined}
                              onClick={(e) => {
                                if (isInternal && onNavigate) {
                                  e.preventDefault();
                                  onNavigate(safeHref);
                                }
                              }}
                              className={`px-2.5 py-1 rounded-md text-[11px] font-bold no-underline transition-colors ${getLinkClasses(lnk.tone)}`}
                            >
                              {lnk.label}
                            </a>
                          );
                        })}
                      </div>
                    )}
                  </div>
                ) : null}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          <div className="px-4 py-2 flex gap-1.5 overflow-x-auto border-t border-slate-100 bg-slate-50">
            {quickQuestions.map((qq) => (
              <button
                key={qq.label}
                type="button"
                onClick={() => sendQuery(qq.query)}
                className="px-2.5 py-1.5 bg-blue-50 text-blue-600 border border-blue-200 rounded-lg text-[11px] font-bold whitespace-nowrap cursor-pointer hover:bg-blue-100"
              >
                {qq.label}
              </button>
            ))}
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              sendQuery(input);
            }}
            className="p-3 border-t border-slate-200 flex gap-2 bg-white"
          >
            <input
              id="chatbot-input"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask e.g. USA visa fees, Germany processing..."
              className="flex-1 px-3.5 py-2.5 border border-slate-200 rounded-xl text-[13px] outline-none focus:border-blue-500"
            />
            <button
              type="submit"
              className="px-4 py-2.5 bg-blue-600 text-white rounded-xl font-bold cursor-pointer hover:bg-blue-700 text-xs"
            >
              Send
            </button>
          </form>
        </div>
      )}
    </>
  );
};
