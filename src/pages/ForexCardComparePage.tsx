import React, { useState, useMemo } from 'react';
import {
  CreditCard,
  CheckCircle2,
  ExternalLink,
  Sparkles,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  Wallet,
  Banknote,
  TrendingDown
} from 'lucide-react';
import { EmailSubscribeBox } from '../components/EmailSubscribeBox';
import { PageBackBar, PageBottomBack } from '../components/PageBackBar';

interface ForexCardComparePageProps {
  onNavigate?: (path: string) => void;
}

export const ForexCardComparePage: React.FC<ForexCardComparePageProps> = ({
  onNavigate = (p) => {
    window.history.pushState({}, '', p);
    window.scrollTo(0, 0);
  }
}) => {
  const [selectedDestination, setSelectedDestination] = useState<string>('Europe (EUR / CHF / GBP)');
  const [selectedBudget, setSelectedBudget] = useState<string>('200000');
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const budgetNum = parseInt(selectedBudget, 10) || 200000;
  const budgetLabel =
    budgetNum === 100000 ? 'Rs 1 Lakh (₹1,00,000)' : budgetNum === 200000 ? 'Rs 2 Lakhs (₹2,00,000)' : 'Rs 5 Lakhs (₹5,00,000)';

  const cards = useMemo(() => {
    // Standard bank credit/debit card charges ~3.5% + 18% GST = ~4.13% forex markup
    const typicalBankMarkupInr = Math.round(budgetNum * 0.0413);

    return [
      {
        name: 'Niyo Global',
        subtitle: 'Zero Forex Markup Visa Signature Card (DCB / Equitas)',
        badge: 'Best Overall • 0% Forex Markup',
        issuanceFee: 'Rs 0 (Lifetime Free)',
        markup: '0% (Zero Forex Markup)',
        atmCharge: 'Rs 0 – Rs 425 + GST (1 Free Intl ATM/Qtr)',
        estimatedSavingsInr: typicalBankMarkupInr,
        highlights: [
          'Load money in INR via UPI/IMPS & spend in 130+ currencies at live Visa exchange rate',
          'Earn 6.5%–7.25% p.a. interest on your INR balance even while traveling',
          '1 Complimentary International Airport Lounge Access per quarter'
        ],
        applyUrl: 'https://goniyo.com'
      },
      {
        name: 'Wise',
        subtitle: 'Wise Multi-Currency Account & International Card',
        badge: 'Real Mid-Market Google Rate',
        issuanceFee: 'Rs 0 Account (Card Fee Minimal)',
        markup: '0% Mid-Market Rate (~0.4% Conversion)',
        atmCharge: 'Free up to $200/month (Then 1.75%)',
        estimatedSavingsInr: Math.round(budgetNum * 0.036),
        highlights: [
          'Hold & convert 40+ currencies (USD, EUR, GBP, AED, THB, SGD) instantly',
          'Zero hidden exchange rate spreads — uses live Reuters/Google rate',
          'Instant mobile freeze/unfreeze and virtual cards for safe online bookings'
        ],
        applyUrl: 'https://wise.com'
      },
      {
        name: 'HDFC ForexPlus',
        subtitle: 'HDFC Multicurrency Platinum ForexPlus Chip Card',
        badge: 'Best Traditional Bank Backup',
        issuanceFee: 'Rs 499 + GST',
        markup: '0% on Loaded Currency (2% Cross-Currency)',
        atmCharge: '$2.00 per ATM Withdrawal',
        estimatedSavingsInr: Math.round(budgetNum * 0.028),
        highlights: [
          'Lock in exchange rates across 22 major currencies (USD, EUR, GBP, AUD, CAD, AED)',
          'Complimentary ₹5 Lakhs protection against skimming & counterfeit fraud',
          'Emergency cash delivery assistance across global destinations'
        ],
        applyUrl: 'https://www.hdfcbank.com/personal/pay/cards/forex-cards'
      },
      {
        name: 'BookMyForex',
        subtitle: 'BookMyForex Yes Bank / Axis Multi-Currency Forex Card',
        badge: 'True 0% Markup + Doorstep Delivery',
        issuanceFee: 'Rs 0 (Free Issuance & Reload)',
        markup: '0% Interbank Rate',
        atmCharge: '$1.50 – $2.00 per Withdrawal',
        estimatedSavingsInr: typicalBankMarkupInr,
        highlights: [
          'Zero issuance fee, zero reload fee, and zero annual maintenance charges',
          'Same-day doorstep card delivery in 25+ Indian cities before your flight',
          'Easy online unload back to your Indian bank account after returning home'
        ],
        applyUrl: 'https://www.bookmyforex.com'
      }
    ];
  }, [budgetNum]);

  const faqs = [
    {
      q: 'Why should I carry a Zero-Markup Forex Card instead of using my normal Indian Debit or Credit Card abroad?',
      a: 'Regular Indian bank debit and credit cards charge a 3.5% Foreign Currency Markup Fee plus 18% GST on that fee—costing you 4.13% extra on every swipe. On a ₹2,00,000 trip budget, a zero-markup card like Niyo Global or BookMyForex saves you over ₹8,260 in unnecessary bank charges.'
    },
    {
      q: 'Does loading a Forex Card or spending on Niyo Global attract 20% TCS (Tax Collected at Source)?',
      a: 'Under Reserve Bank of India (RBI) LRS rules, there is 0% TCS on total international forex spending up to ₹7,00,000 per financial year per PAN card. Even if TCS applies above ₹7 Lakhs, 100% of it can be claimed back or adjusted when filing your Income Tax Return (ITR).'
    },
    {
      q: 'Should I carry only a Forex Card or also keep foreign currency cash?',
      a: 'Never rely on a single payment method abroad. Follow the 70-20-10 rule: carry 70% of your trip budget on a 0%-markup Forex Card (Niyo Global / BookMyForex), 20% on a backup Credit Card for hotel security deposits and car rentals, and 10% in physical foreign currency cash for local taxis, street markets, and tips.'
    },
    {
      q: 'How long does it take to get a Niyo Global or BookMyForex card before my flight?',
      a: 'BookMyForex provides same-day or 24-hour doorstep delivery in major Indian cities, while Niyo Global delivers a physical Visa Signature card in 3–5 days (and provides instant virtual card access upon digital KYC verification).'
    }
  ];

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((f) => ({
      '@type': 'Question',
      name: f.q,
      acceptedAnswer: {
        '@type': 'Answer',
        text: f.a
      }
    }))
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 pb-16">
      {/* FAQ JSON-LD Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      {/* Top Back to Home */}
      <PageBackBar onNavigate={onNavigate} pageName="Forex Card Compare" />

      {/* Blue Hero Header */}
      <div className="bg-gradient-to-r from-[#0B2A5B] via-[#0B3D91] to-[#082247] text-white py-10 px-4 sm:px-6 lg:px-8 border-b border-blue-900">
        <div className="max-w-6xl mx-auto text-center space-y-3">
          <div className="inline-flex items-center gap-2 bg-emerald-500/20 px-4 py-1.5 rounded-full text-xs font-black text-emerald-300 border border-emerald-400/40">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>FREE COMPARE • SAVE UP TO 4.13% FOREX MARKUP ABROAD</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white">
            Forex Card Compare - Best Card to Carry Abroad
          </h1>
          <p className="text-sm sm:text-lg text-blue-100 max-w-3xl mx-auto leading-relaxed">
            Compare Niyo Global, Wise, HDFC ForexPlus, and BookMyForex side by side. Check issuance fees, 0% forex markup savings, and ATM charges for USA, Europe, Dubai, and Thailand.
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6 space-y-8">
        {/* Selector Tool Card */}
        <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-md border border-slate-200 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200">
            <div>
              <span className="text-xs font-black uppercase tracking-wider text-emerald-800 bg-emerald-100 px-3 py-1 rounded-full">
                FREE Compare
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 mt-2">
                Select Your Destination &amp; Trip Budget
              </h2>
            </div>

            <div className="bg-emerald-50 border border-emerald-200 px-4 py-2.5 rounded-xl text-xs font-bold text-emerald-900">
              💰 Estimated Savings on {budgetLabel}:{' '}
              <strong className="text-sm font-black text-emerald-700 tabular-nums">
                Rs {Math.round(budgetNum * 0.0413).toLocaleString('en-IN')}
              </strong>{' '}
              with 0% Markup Card
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Destination */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
              <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-700 mb-2">
                1. Select Destination
              </label>
              <select
                aria-label="Select Destination"
                value={selectedDestination}
                onChange={(e) => setSelectedDestination(e.target.value)}
                className="w-full px-3.5 py-3 bg-white border border-slate-300 rounded-xl text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0B3D91] cursor-pointer"
              >
                <option value="USA (USD)">🇺🇸 USA (US Dollar - USD)</option>
                <option value="Europe (EUR / CHF / GBP)">🇪🇺 Europe (Euro / Swiss Franc / GBP)</option>
                <option value="Dubai (AED)">🇦🇪 Dubai / UAE (UAE Dirham - AED)</option>
                <option value="Thailand (THB)">🇹🇭 Thailand &amp; Southeast Asia (THB / SGD)</option>
              </select>
            </div>

            {/* Trip Budget */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
              <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-700 mb-2">
                2. Select Trip Spending Budget
              </label>
              <select
                aria-label="Select Trip Budget"
                value={selectedBudget}
                onChange={(e) => setSelectedBudget(e.target.value)}
                className="w-full px-3.5 py-3 bg-white border border-slate-300 rounded-xl text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0B3D91] cursor-pointer"
              >
                <option value="100000">Rs 1L (₹1,00,000 Budget)</option>
                <option value="200000">Rs 2L (₹2,00,000 Budget)</option>
                <option value="500000">Rs 5L (₹5,00,000 Budget)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Comparison Table */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-5 sm:p-6 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-lg sm:text-xl font-black text-slate-900">
                Top 4 International Forex Cards Compared ({selectedDestination} • {budgetLabel})
              </h2>
              <p className="text-xs text-slate-600 mt-1">
                Compare issuance fees, forex markup percentages, ATM withdrawal charges, and total markup saved.
              </p>
            </div>
            <span className="bg-emerald-100 text-emerald-800 text-xs font-black px-3 py-1 rounded-full self-start sm:self-center">
              FREE Compare
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-900 text-white text-xs uppercase tracking-wider">
                  <th className="py-3.5 px-4 font-extrabold">Forex Card</th>
                  <th className="py-3.5 px-4 font-extrabold">Issuance Fee</th>
                  <th className="py-3.5 px-4 font-extrabold">Forex Markup</th>
                  <th className="py-3.5 px-4 font-extrabold">ATM Charge</th>
                  <th className="py-3.5 px-4 font-extrabold">Savings on {budgetLabel.split(' ')[0]} {budgetLabel.split(' ')[1]}</th>
                  <th className="py-3.5 px-4 font-extrabold text-right">Apply Online</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 text-xs sm:text-sm">
                {cards.map((c, idx) => (
                  <tr key={idx} className="hover:bg-blue-50/40 transition-colors">
                    <td className="py-5 px-4 max-w-xs">
                      <span className="inline-block text-[10px] font-black uppercase bg-blue-100 text-[#0B3D91] px-2 py-0.5 rounded-full mb-1">
                        {c.badge}
                      </span>
                      <div className="text-base font-black text-slate-900">{c.name}</div>
                      <div className="text-xs text-slate-500 font-semibold">{c.subtitle}</div>
                      <ul className="space-y-1 text-[11px] text-slate-600 mt-2">
                        {c.highlights.map((h, hIdx) => (
                          <li key={hIdx} className="flex items-start gap-1.5">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                            <span>{h}</span>
                          </li>
                        ))}
                      </ul>
                    </td>
                    <td className="py-5 px-4 font-black text-slate-900 tabular-nums">
                      {c.issuanceFee}
                    </td>
                    <td className="py-5 px-4">
                      <span className="inline-block bg-emerald-100 text-emerald-900 font-black text-xs px-2.5 py-1 rounded-full">
                        {c.markup}
                      </span>
                    </td>
                    <td className="py-5 px-4 font-semibold text-slate-700 tabular-nums">
                      {c.atmCharge}
                    </td>
                    <td className="py-5 px-4 tabular-nums">
                      <div className="text-base font-black text-emerald-700">
                        Save Rs {c.estimatedSavingsInr.toLocaleString('en-IN')}
                      </div>
                      <div className="text-[11px] text-slate-500">vs 3.5%+GST bank card</div>
                    </td>
                    <td className="py-5 px-4 text-right">
                      <a
                        href={c.applyUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center justify-center gap-1.5 py-2.5 px-4 bg-[#0B3D91] hover:bg-[#0B2A5B] text-white font-black text-xs rounded-xl shadow-xs transition-all whitespace-nowrap"
                      >
                        <span>Apply →</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Cash vs Card vs Forex Card — Which is Best? */}
        <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-slate-200 space-y-6">
          <div>
            <span className="text-xs font-black uppercase tracking-wider text-[#0B3D91] bg-blue-50 px-3 py-1 rounded-full">
              Smart Travel Money Strategy
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 mt-2">
              Cash vs Card vs Forex Card — Which is Best?
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 mt-1">
              Experienced international travelers never carry 100% cash or pay 4.13% bank credit card markups. Compare all 3 methods below:
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* 1. Foreign Currency Cash */}
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black uppercase bg-amber-100 text-amber-900 px-2.5 py-1 rounded-full">
                  Carry 10% Only
                </span>
                <Banknote className="w-5 h-5 text-amber-600" />
              </div>
              <h3 className="text-lg font-black text-slate-900">1. Foreign Cash (Notes)</h3>
              <ul className="space-y-1.5 text-xs text-slate-700">
                <li>• <strong>Markup Cost:</strong> 1.5% to 3% currency exchange dealer spread (up to 8% at airports).</li>
                <li>• <strong>Safety Risk:</strong> High risk of theft or loss; zero recovery if wallet is misplaced.</li>
                <li>• <strong>Best Used For:</strong> Small street markets, local tips, buses, and places that only take cash (like Thailand night markets).</li>
              </ul>
            </div>

            {/* 2. Regular Bank Credit / Debit Card */}
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black uppercase bg-blue-100 text-[#0B3D91] px-2.5 py-1 rounded-full">
                  Carry 20% Backup
                </span>
                <CreditCard className="w-5 h-5 text-[#0B3D91]" />
              </div>
              <h3 className="text-lg font-black text-slate-900">2. Regular Credit / Debit Card</h3>
              <ul className="space-y-1.5 text-xs text-slate-700">
                <li>• <strong>Markup Cost:</strong> Expensive 3.5% Forex Markup + 18% GST = <strong>4.13% extra loss</strong> on every swipe.</li>
                <li>• <strong>Safety Risk:</strong> Safe and widely accepted for hotel check-in security deposits and car rentals.</li>
                <li>• <strong>Best Used For:</strong> Pre-authorizing hotel deposits or emergency backup if your primary card is locked.</li>
              </ul>
            </div>

            {/* 3. Zero-Markup Forex Card */}
            <div className="p-5 rounded-2xl bg-emerald-50 border-2 border-emerald-500 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black uppercase bg-emerald-600 text-white px-2.5 py-1 rounded-full">
                  🏆 Winner • Carry 70%
                </span>
                <Wallet className="w-5 h-5 text-emerald-700" />
              </div>
              <h3 className="text-lg font-black text-emerald-950">3. Zero-Markup Forex Card</h3>
              <ul className="space-y-1.5 text-xs text-emerald-950">
                <li>• <strong>Markup Cost:</strong> <strong>0% Forex Markup</strong> (Live Visa/Mastercard or Interbank exchange rate).</li>
                <li>• <strong>Safety Risk:</strong> Instant app lock/unlock, PIN change, and zero exposure to your main savings account.</li>
                <li>• <strong>Best Used For:</strong> 70%–80% of all daily dining, shopping, metro tap-to-pay, and attraction tickets abroad.</li>
              </ul>
            </div>
          </div>
        </div>

        {/* FAQs */}
        <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-slate-200">
          <div className="flex items-center gap-3 mb-6">
            <HelpCircle className="w-6 h-6 text-[#0B2A5B]" />
            <h2 className="text-xl font-black text-slate-900">
              Frequently Asked Questions (Forex Card Compare)
            </h2>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, idx) => {
              const isOpen = openFaq === idx;
              return (
                <div key={idx} className="border border-slate-200 rounded-xl overflow-hidden">
                  <button
                    type="button"
                    onClick={() => setOpenFaq(isOpen ? null : idx)}
                    className="w-full p-4 text-left font-bold text-sm sm:text-base text-slate-900 bg-slate-50/60 hover:bg-slate-100/80 flex justify-between items-center gap-3 cursor-pointer"
                  >
                    <span>{faq.q}</span>
                    {isOpen ? (
                      <ChevronUp className="w-4 h-4 text-slate-500 shrink-0" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-slate-500 shrink-0" />
                    )}
                  </button>
                  {isOpen && (
                    <div className="p-4 bg-white text-xs sm:text-sm text-slate-700 leading-relaxed border-t border-slate-100">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Bottom Email Only Subscribe Box */}
        <EmailSubscribeBox pageContext="Forex Card Compare" />
      </div>

      {/* Bottom Back to Home */}
      <PageBottomBack onNavigate={onNavigate} />
    </div>
  );
};
