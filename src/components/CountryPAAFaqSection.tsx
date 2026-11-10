import React, { useState } from 'react';
import { ChevronDown, HelpCircle, ArrowRight, ExternalLink } from 'lucide-react';

export interface PAAQuestion {
  q: string;
  a: string;
  linkText?: string;
  linkUrl?: string;
}

interface CountryPAAFaqSectionProps {
  countryName: string;
  countryCode: string;
  fromCountryName?: string;
  fromCode?: string;
  onNavigate?: (path: string) => void;
  className?: string;
}

export function getTop20CountryFAQs(
  countryName: string,
  countryCode: string,
  fromCountryName = 'India',
  fromCode = 'IN'
): PAAQuestion[] {
  const cName = countryName || 'Destination Country';
  const fromName = fromCountryName || 'India';
  const fCode = (fromCode || 'in').toLowerCase();
  const tCode = (countryCode || 'us').toLowerCase();
  const routeUrl = `/${fCode}-to-${tCode}`;

  return [
    {
      q: `How to apply for ${cName} visa from ${fromName}?`,
      a: `To apply for a ${cName} visa from ${fromName}, select your travel category, gather mandatory documents (passport, financial proof, flight itinerary), complete the official online visa application form, pay consular fees, and schedule a biometric/interview appointment at the designated VFS or embassy portal.`,
      linkText: `Explore Full ${fromName} to ${cName} Visa Guide`,
      linkUrl: routeUrl
    },
    {
      q: `What documents are required for ${cName} visa?`,
      a: `Mandatory documents for a ${cName} visa include an original passport with at least 6 months validity, 2 recent passport-size biometric photographs, completed application form, 6 months bank statements, hotel reservation, flight itinerary, cover letter, and travel medical insurance.`
    },
    {
      q: `How much bank balance is required for ${cName} visa?`,
      a: `Most consulates recommend holding liquid bank savings of ₹3 Lakhs to ₹5 Lakhs (or equivalent in local currency) per applicant to prove sufficient funds for stay, accommodation, and return travel. Ensure your account statements are seasoned for at least 3 months without sudden unverified deposits.`,
      linkText: `View Official Bank Balance & Fund Rules Guide`,
      linkUrl: `/bank-statement-guide`
    },
    {
      q: `How long does ${cName} visa take?`,
      a: `Standard processing time for a ${cName} visa ranges from 5 to 15 working days for e-Visas/tourist visas, and up to 3 to 6 weeks for long-term work, study, or family settlement permits. Apply at least 3 to 4 weeks prior to your intended departure date.`
    },
    {
      q: `What is the ${cName} visa fee for ${fromName} passport holders?`,
      a: `Visa fees for ${cName} vary by category, typically ranging from $25 to $185 USD for short-stay tourist visas/e-Visas, and $200 to $450+ USD for long-term work, study, or permanent settlement permits. Consular fees are paid online or at VFS application centers.`
    },
    {
      q: `Can I apply for ${cName} visa without flight ticket?`,
      a: `Yes, you do not need to purchase an expensive non-refundable flight ticket before your visa is approved. Consulates recommend submitting a verifiable flight itinerary or dummy flight reservation with an active airline PNR for visa processing.`,
      linkText: `Get Verifiable Flight Reservation for Visa`,
      linkUrl: `/dummy-ticket`
    },
    {
      q: `Can I work on tourist visa in ${cName}?`,
      a: `No, working on a standard tourist or visitor visa in ${cName} is strictly prohibited under national immigration law. To work legally, you must hold an employer-sponsored work permit, Working Holiday visa, or valid digital nomad residence permit.`
    },
    {
      q: `Is visa required for ${cName} for ${fromName} passport holders?`,
      a: `Yes, ${fromName} passport holders generally require a valid visa, pre-approved e-Visa, or travel authorization before entering ${cName}, unless holding a diplomatic passport or qualifying for specific bilateral visa exemptions.`,
      linkText: `Check World Visa Requirement Map`,
      linkUrl: `/visa-map`
    },
    {
      q: `Why was my ${cName} visa rejected?`,
      a: `Common reasons for ${cName} visa refusal include insufficient bank funds, unseasoned sudden account deposits, incomplete document checklists, unclear travel purpose, unconfirmed accommodation, or failure to establish strong economic/family ties to your home country.`
    },
    {
      q: `Can I extend my tourist visa in ${cName}?`,
      a: `Tourist visa extension rules depend on ${cName} immigration policy. Short-stay e-Visas are generally non-extendable inside the country, whereas certain paper tourist visas may be extended at local immigration offices for valid emergency or humanitarian reasons.`
    },
    {
      q: `What is dummy ticket for ${cName} visa? Is it legal?`,
      a: `A dummy flight ticket is an official, verifiable flight reservation with a live airline PNR issued for visa application purposes. It is 100% legal, accepted by embassies worldwide, and recommended by consulates to avoid flight cancellation penalties before visa approval.`,
      linkText: `Learn How Dummy Flight Tickets Work`,
      linkUrl: `/dummy-ticket`
    },
    {
      q: `How to check ${cName} visa status?`,
      a: `You can track your ${cName} visa application status live by entering your passport number and application reference tracking number on the official government visa portal or VFS Global tracking system.`,
      linkText: `Track Your Visa Status Live`,
      linkUrl: `/visa-tracking`
    },
    {
      q: `When will ${cName} visa slots open?`,
      a: `Consular visa appointment slots for ${cName} are released dynamically by VFS and embassy portals. High-demand slots (US/Schengen) open 60-90 days in advance; keep checking official portals regularly for cancellation slot updates.`
    },
    {
      q: `What is the difference between offshore and onshore visa for ${cName}?`,
      a: `An offshore visa must be applied for while you are physically outside ${cName} before travel. An onshore visa is applied for while you are already legally present inside ${cName} to extend stay or switch visa status.`,
      linkText: `Explore Offshore vs Onshore Visa Rules`,
      linkUrl: `/visa-map`
    },
    {
      q: `Does ${cName} offer working holiday visa for ${fromName}?`,
      a: `Working Holiday Visa (WHV) policies for ${fromName} citizens depend on specific bilateral agreements. Check official destination criteria for age limits, study requirements, and reciprocal quota allotments.`
    },
    {
      q: `Can I get visa on arrival in ${cName}?`,
      a: `Visa on arrival (VOA) availability for ${cName} depends on your passport nationality and entry port regulations. Verify whether your origin passport qualifies for VOA, e-Visa, or full embassy sticker visa prior to travel.`
    },
    {
      q: `What is the best time to apply for ${cName} visa?`,
      a: `The recommended time to apply for a ${cName} visa is 30 to 60 days before your intended travel date. Most embassies accept short-stay tourist applications up to 6 months prior to departure.`
    },
    {
      q: `Do I need travel insurance for ${cName} visa?`,
      a: `Yes, mandatory travel medical insurance covering emergency medical care, hospitalization, and repatriation (minimum €30,000 for Schengen or $50,000+ for general destinations) is required for most ${cName} visa applications.`
    },
    {
      q: `Can I apply for ${cName} visa without bank statement?`,
      a: `No, a certified 6-month bank statement is mandatory for almost all non-sponsored ${cName} visa applications to demonstrate financial stability. If sponsored by family or employer, sponsor bank statements and NOC are required.`,
      linkText: `Read Bank Statement & Funds Guide`,
      linkUrl: `/bank-statement-guide`
    },
    {
      q: `How to write cover letter for ${cName} visa?`,
      a: `A strong cover letter for ${cName} visa should explain your travel purpose, itinerary details, employment status, proof of funds, list of attached documents, and explicit guarantee of return to your home country before visa expiry.`,
      linkText: `Generate Free Visa Cover Letter Template`,
      linkUrl: `/cover-letter-generator`
    }
  ];
}

export const CountryPAAFaqSection: React.FC<CountryPAAFaqSectionProps> = ({
  countryName,
  countryCode,
  fromCountryName = 'India',
  fromCode = 'IN',
  onNavigate,
  className = ''
}) => {
  const faqs = getTop20CountryFAQs(countryName, countryCode, fromCountryName, fromCode);
  const [openIndices, setOpenIndices] = useState<Record<number, boolean>>({ 0: true, 1: true }); // Open top 2 by default for PAA visibility

  const toggleAccordion = (idx: number) => {
    setOpenIndices(prev => ({ ...prev, [idx]: !prev[idx] }));
  };

  const handleLinkClick = (url?: string) => {
    if (!url) return;
    if (onNavigate) {
      onNavigate(url);
    } else {
      window.location.href = url;
    }
  };

  // Generate FAQPage JSON-LD Schema
  const schemaData = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqs.map(faq => ({
      "@type": "Question",
      "name": faq.q,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": `${faq.a}${faq.linkText && faq.linkUrl ? ` For step-by-step tools, visit https://www.visaapply.org${faq.linkUrl}.` : ''}`
      }
    }))
  };

  return (
    <section className={`w-full space-y-6 ${className}`}>
      {/* FAQPage JSON-LD Structured Data Injection */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaData) }}
      />

      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-4">
        <div>
          <div className="inline-flex items-center gap-1.5 bg-blue-50 text-[#0B3D91] px-3 py-1 rounded-full text-xs font-bold mb-2">
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Google "People Also Ask" Top 20 Keyword Guide</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Frequently Asked Questions - {countryName} Visa
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 mt-1">
            Top 20 official questions, document rules, bank balance requirements, and consular guidance for travel to {countryName}.
          </p>
        </div>
        <span className="text-xs font-bold text-slate-500 bg-slate-100 px-3 py-1.5 rounded-xl self-start sm:self-auto shrink-0 border border-slate-200">
          20 Answered Questions
        </span>
      </div>

      {/* Accordion List (PAA Style) */}
      <div className="space-y-3">
        {faqs.map((faq, idx) => {
          const isOpen = Boolean(openIndices[idx]);
          return (
            <div
              key={idx}
              className={`border rounded-2xl transition-all duration-200 overflow-hidden bg-white ${
                isOpen ? 'border-blue-300 shadow-sm' : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              <button
                type="button"
                onClick={() => toggleAccordion(idx)}
                className="w-full text-left px-5 py-4 flex items-center justify-between gap-4 font-bold text-slate-900 text-sm sm:text-base cursor-pointer hover:bg-slate-50/80 transition-colors"
                aria-expanded={isOpen}
              >
                <span className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-full bg-blue-50 text-[#0B3D91] text-xs font-black flex items-center justify-center shrink-0">
                    {idx + 1}
                  </span>
                  <span>{faq.q}</span>
                </span>
                <ChevronDown
                  className={`w-5 h-5 text-slate-500 shrink-0 transition-transform duration-200 ${
                    isOpen ? 'rotate-180 text-[#0B3D91]' : ''
                  }`}
                />
              </button>

              {isOpen && (
                <div className="px-5 pb-5 pt-1 text-xs sm:text-sm text-slate-700 leading-relaxed border-t border-slate-100 space-y-3 bg-slate-50/50">
                  <p className="text-slate-700 font-medium">{faq.a}</p>
                  {faq.linkText && faq.linkUrl && (
                    <div>
                      <button
                        type="button"
                        onClick={() => handleLinkClick(faq.linkUrl)}
                        className="inline-flex items-center gap-1.5 text-xs font-bold text-[#0B3D91] hover:text-blue-800 bg-blue-50 hover:bg-blue-100 border border-blue-200 px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
                      >
                        <span>{faq.linkText}</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
};
