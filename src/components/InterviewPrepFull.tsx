import React, { useState } from 'react';
import { NAME_MAP_249, FLAG_MAP_249, getLiveVisaCount } from '../data/fullVisaDatabase';
import { getCountryMeta } from '../data/countryMetaData';
import { getEmbassyInfo } from '../data/embassyAddresses';
import { generateChecklistPDF, parseHotelPriceUSD } from '../utils/countryLiveUtils';

interface InterviewPrepFullProps {
  countryCode: string;
  onNavigate: (path: string) => void;
}

export interface InterviewQA {
  number: number;
  category: string;
  question: string;
  idealAnswer: string;
  officerLooksFor: string;
}

export function get20InterviewQuestions(code: string, countryName: string): InterviewQA[] {
  const c = code.toLowerCase();
  const meta = getCountryMeta(c);

  return [
    {
      number: 1,
      category: 'Purpose of Travel',
      question: `Why do you want to visit ${countryName} at this particular time?`,
      idealAnswer: `"I am travelling to ${countryName} for a 10-day vacation during the ${meta.bestTime} season to visit ${meta.capital} and experience ${meta.festivals}. I have approved annual leave from my employer in India from [Start Date] to [End Date]."`,
      officerLooksFor: 'Clear, specific travel purpose with exact dates matching your leave approval letter.',
    },
    {
      number: 2,
      category: 'Duration & Itinerary',
      question: `How long will you stay in ${countryName} and what is your day-by-day itinerary?`,
      idealAnswer: `"I will stay for exactly 10 nights. I arrive in ${meta.capital} for the first 5 nights, followed by 5 nights exploring major cultural landmarks before flying back to India on my confirmed return ticket."`,
      officerLooksFor: 'Realistic itinerary matching hotel bookings and flight reservations.',
    },
    {
      number: 3,
      category: 'Employment & Ties',
      question: 'What do you do in India and how long have you worked with your current organization?',
      idealAnswer: `"I work as a Senior Manager at [Company Name] in Bengaluru, where I have been employed full-time for the past 4.5 years. My role involves leading a 12-member operations team."`,
      officerLooksFor: 'Job stability, seniority, and strong professional anchors in India.',
    },
    {
      number: 4,
      category: 'Financial Capacity',
      question: `Who is sponsoring your trip to ${countryName} and what is your annual income?`,
      idealAnswer: `"I am self-funding this trip. My gross annual income as per my latest Indian Income Tax Return (ITR) is ₹18.5 Lakhs, and I maintain a liquid savings balance of ₹6.5 Lakhs in my primary salary account."`,
      officerLooksFor: 'Consistency between stated salary, 3-year ITRs, salary slips, and bank balance.',
    },
    {
      number: 5,
      category: 'Accommodation',
      question: `Where will you be staying in ${meta.capital}?`,
      idealAnswer: `"I have reserved a refundable hotel room in central ${meta.capital} (${meta.hotelPrice}) for the duration of my stay. Here is my printed hotel confirmation voucher with the property address and contact number."`,
      officerLooksFor: 'Verifiable hotel booking matching your stated budget and daily itinerary.',
    },
    {
      number: 6,
      category: 'Home Country Ties',
      question: `What guarantees that you will return to India after visiting ${countryName}?`,
      idealAnswer: `"I have my permanent career at [Company Name] with an official NOC requiring me back in office on [Date], my spouse and parents residing with me in India, and residential property/financial investments in my name."`,
      officerLooksFor: 'Strong economic, social, and family ties that prevent visa overstay.',
    },
    {
      number: 7,
      category: 'Relatives & Friends',
      question: `Do you have any family members, relatives, or close friends living in ${countryName}?`,
      idealAnswer: `"No, I do not have any relatives or friends in ${countryName}; this is purely a tourism visit." (OR if yes: "Yes, my cousin lives in ${meta.capital} on a work visa. I have declared their details honestly on my visa application form.")`,
      officerLooksFor: '100% honesty matching your DS-160 / visa application form declarations.',
    },
    {
      number: 8,
      category: 'Previous Travel History',
      question: 'Have you travelled outside India before?',
      idealAnswer: `"Yes, I have previously visited Singapore, UAE, and Thailand for tourism and returned to India well within my permitted visa validity on every trip." (Or if first trip: "This is my first international trip, as I am now financially well-settled in my career.")`,
      officerLooksFor: 'Compliance record with foreign immigration laws on prior trips.',
    },
    {
      number: 9,
      category: 'Travel Companions',
      question: 'Are you travelling alone or with family/friends?',
      idealAnswer: `"I am travelling with my spouse. Both of us are employed in India and have approved leave from our respective companies for this 10-day holiday."`,
      officerLooksFor: 'Clear explanation of who accompanies you and how their expenses are covered.',
    },
    {
      number: 10,
      category: 'Trip Budget',
      question: `How much will this entire trip to ${countryName} cost you in Indian Rupees?`,
      idealAnswer: `"The total estimated cost is approximately ₹2.2 Lakhs, which includes round-trip flights, hotel stays in ${meta.capital} at ${meta.hotelPrice}, travel insurance, and daily expenses in ${meta.currency}."`,
      officerLooksFor: 'Awareness of realistic travel costs in the destination currency.',
    },
    {
      number: 11,
      category: 'Leave Approval (NOC)',
      question: 'Has your employer approved your leave? Who handles your duties while you are away?',
      idealAnswer: `"Yes, my Reporting Manager and HR department have issued a signed No Objection Certificate (NOC) for my 10-day leave. My deputy team lead will cover urgent tasks until I resume work on [Date]."`,
      officerLooksFor: 'Proof that your absence from work is authorized and temporary.',
    },
    {
      number: 12,
      category: 'Business Owners / Self-Employed',
      question: 'If you run a business in India, what is the nature of your company and annual turnover?',
      idealAnswer: `"I am the Managing Partner of a GST-registered software consultancy in Pune operating since 2019, with an annual turnover of ₹85 Lakhs and 14 full-time employees."`,
      officerLooksFor: 'GST certificate, current account statements, and active business operations.',
    },
    {
      number: 13,
      category: 'Student / Study Applicants',
      question: `Why did you choose ${countryName} and ${meta.topUnis.split(',')[0]} over universities in India?`,
      idealAnswer: `"The specialized curriculum and research labs at ${meta.topUnis.split(',')[0]} align directly with my career goal of returning to India's rapidly growing ${meta.topJobs.split(',')[0]} sector."`,
      officerLooksFor: 'Genuine academic intent, university research, and post-graduation career plan.',
    },
    {
      number: 14,
      category: 'Work / Employment Applicants',
      question: `Why did the sponsoring company in ${countryName} select you for this role?`,
      idealAnswer: `"I hold 6+ years of specialized experience in ${meta.topJobs} that matches the verified job offer and work permit sponsorship issued by the employer in ${meta.capital}."`,
      officerLooksFor: 'Alignment between your degree, work experience, and official work permit.',
    },
    {
      number: 15,
      category: 'Prior Visa Refusals',
      question: 'Have you ever been refused a visa to any country in the past?',
      idealAnswer: `"No, I have never had a visa refusal." (OR if refused previously: "Yes, my application was refused in 2023 due to insufficient financial documentation. Since then, my income and savings have grown substantially, and I have brought complete ITRs today.")`,
      officerLooksFor: 'Never hide a prior refusal—embassies share biometric records globally.',
    },
    {
      number: 16,
      category: 'Bank Account Activity',
      question: 'Can you explain any large recent deposits in your bank statement?',
      idealAnswer: `"My bank statement reflects my regular monthly salary credits and a documented annual performance bonus credited by my employer in March, supported by my pay stub."`,
      officerLooksFor: 'Absence of sudden unexplained lump-sum cash deposits borrowed just for the visa.',
    },
    {
      number: 17,
      category: 'Medical & Travel Insurance',
      question: `Do you have valid international medical insurance for your stay in ${countryName}?`,
      idealAnswer: `"Yes, I have purchased comprehensive travel and medical insurance with $50,000 / €30,000 emergency coverage valid across ${countryName} for my entire travel window."`,
      officerLooksFor: 'Preparedness for medical emergencies without becoming a public burden.',
    },
    {
      number: 18,
      category: 'Language & Communication',
      question: `How will you communicate in ${countryName} where ${meta.language} is spoken?`,
      idealAnswer: `"Major tourist hubs, hotels, and transit networks in ${meta.capital} widely support English alongside ${meta.language}, and I have pre-booked guided city tours."`,
      officerLooksFor: 'Practical readiness for navigating the destination.',
    },
    {
      number: 19,
      category: 'Work Prohibition on Tourist Visa',
      question: `Do you intend to look for jobs or work while visiting ${countryName} on a visitor visa?`,
      idealAnswer: `"Strictly no. I am well-settled in my career in India and am visiting ${countryName} solely for a short recreational holiday before returning to my job in India."`,
      officerLooksFor: 'Zero intent of unauthorized employment on a tourist/visitor visa.',
    },
    {
      number: 20,
      category: 'Closing Verification',
      question: 'Do you have all original supporting documents ready if I ask to inspect them?',
      idealAnswer: `"Yes Officer, I have organized my current and old passports, 6 months bank statements, 3 years ITR, employer NOC, confirmed return flights, and hotel vouchers in this folder."`,
      officerLooksFor: 'Confidence, organization, and document readiness.',
    },
  ];
}

export const InterviewPrepFull: React.FC<InterviewPrepFullProps> = ({
  countryCode,
  onNavigate,
}) => {
  const code = countryCode.toLowerCase();
  const countryName = NAME_MAP_249[code] || code.toUpperCase();
  const flag = FLAG_MAP_249[code] || '🌍';
  const meta = getCountryMeta(code);
  const embassy = getEmbassyInfo(code.toUpperCase());
  const visaCount = getLiveVisaCount(code);
  const questions = get20InterviewQuestions(code, countryName);
  const hotelUSD = parseHotelPriceUSD(meta.hotelPrice);

  // Mock Interview Bot State
  const [mockIndex, setMockIndex] = useState<number>(0);
  const [userAnswer, setUserAnswer] = useState<string>('');
  const [mockFeedback, setMockFeedback] = useState<{
    score: number;
    verdict: string;
    tips: string;
  } | null>(null);
  const [selectedCountrySwitch, setSelectedCountrySwitch] = useState(code);

  const currentMockQ = questions[mockIndex] || questions[0];

  const handleEvaluateMockAnswer = (e: React.FormEvent) => {
    e.preventDefault();
    const ans = userAnswer.trim();
    if (!ans) return;

    const wordCount = ans.split(/\s+/).length;
    const hasSpecifics =
      /\d/.test(ans) ||
      ans.toLowerCase().includes('india') ||
      ans.toLowerCase().includes(meta.capital.toLowerCase()) ||
      ans.toLowerCase().includes('company') ||
      ans.toLowerCase().includes('return') ||
      ans.toLowerCase().includes('lakh') ||
      ans.toLowerCase().includes('days');

    let score = 72;
    if (wordCount >= 15 && wordCount <= 65) score += 14;
    if (hasSpecifics) score += 11;
    if (wordCount < 8) score = 54;

    const verdict =
      score >= 85
        ? '✅ Strong Consular Answer — Clear, specific & confident!'
        : score >= 70
        ? '👍 Good Answer — Add 1-2 specific numbers (dates, INR amount, or company tenure) to make it 10/10.'
        : '⚠️ Too Brief / Vague — Visa officers prefer specific 2-sentence answers mentioning your dates, role, or ties to India.';

    setMockFeedback({
      score,
      verdict,
      tips: `Compare with Ideal Answer: ${currentMockQ.idealAnswer}`,
    });
  };

  return (
    <div style={{ maxWidth: '1140px', margin: '0 auto', padding: '32px 16px 80px' }}>
      {/* Breadcrumb & Country Switcher */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '12px',
          marginBottom: '20px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#64748b' }}>
          <button
            type="button"
            onClick={() => onNavigate('/')}
            style={{ background: 'none', border: 'none', color: '#2563eb', fontWeight: 700, cursor: 'pointer' }}
          >
            Home
          </button>
          <span>/</span>
          <button
            type="button"
            onClick={() => onNavigate(`/in-to-${code}`)}
            style={{ background: 'none', border: 'none', color: '#2563eb', fontWeight: 700, cursor: 'pointer' }}
          >
            {countryName} Visa
          </button>
          <span>/</span>
          <span style={{ color: '#0f172a', fontWeight: 700 }}>Consular Interview Prep</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '12px', fontWeight: 700, color: '#475569' }}>Switch Country (249):</span>
          <select
            value={selectedCountrySwitch}
            onChange={(e) => {
              setSelectedCountrySwitch(e.target.value);
              onNavigate(`/interview-prep/${e.target.value}`);
            }}
            style={{
              padding: '8px 12px',
              borderRadius: '10px',
              border: '1px solid #cbd5e1',
              fontSize: '13px',
              fontWeight: 700,
              background: 'white',
            }}
          >
            {Object.keys(NAME_MAP_249)
              .sort((a, b) => NAME_MAP_249[a].localeCompare(NAME_MAP_249[b]))
              .map((c) => (
                <option key={c} value={c}>
                  {FLAG_MAP_249[c]} {NAME_MAP_249[c]}
                </option>
              ))}
          </select>
        </div>
      </div>

      {/* Hero Banner */}
      <div
        style={{
          background: 'linear-gradient(135deg,#0f172a,#1e293b)',
          borderRadius: '24px',
          padding: '32px',
          color: 'white',
          marginBottom: '28px',
          boxShadow: '0 12px 32px rgba(15,23,42,0.18)',
        }}
      >
        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', gap: '20px' }}>
          <div style={{ maxWidth: '720px' }}>
            <div
              style={{
                display: 'inline-block',
                background: 'rgba(16,185,129,0.2)',
                color: '#34d399',
                padding: '5px 12px',
                borderRadius: '8px',
                fontSize: '11px',
                fontWeight: 800,
                marginBottom: '12px',
              }}
            >
              🎤 2026 CONSULAR INTERVIEW MASTERCLASS • {visaCount} VISA CATEGORIES
            </div>
            <h1 style={{ fontSize: '30px', fontWeight: 900, margin: '0 0 10px' }}>
              {flag} {countryName} Visa Interview Questions & Answers for Indians
            </h1>
            <p style={{ color: '#cbd5e1', fontSize: '15px', lineHeight: 1.6, margin: 0 }}>
              Master the top 20 consular officer questions for {countryName} ({meta.capital}), practice with our interactive Mock Interview simulator, and review the mandatory dress code, document folder order, and approval strategies ({meta.successRate} Indian approval rate).
            </p>
          </div>

          <div
            style={{
              background: 'rgba(255,255,255,0.08)',
              border: '1px solid rgba(255,255,255,0.15)',
              borderRadius: '16px',
              padding: '18px',
              minWidth: '250px',
            }}
          >
            <div style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 700 }}>INDIAN APPROVAL RATE</div>
            <div style={{ fontSize: '26px', fontWeight: 900, color: '#34d399', marginTop: '2px' }}>
              {meta.successRate}
            </div>
            <div style={{ fontSize: '12px', color: '#e2e8f0', marginTop: '6px' }}>
              ⏱️ Processing: <strong>{meta.processing}</strong>
            </div>
            <div style={{ fontSize: '12px', color: '#e2e8f0', marginTop: '4px' }}>
              🏛️ Embassy: <strong>{embassy.inIndia?.[0]?.city || 'New Delhi'}</strong>
            </div>
            <button
              type="button"
              onClick={() =>
                generateChecklistPDF({
                  visaName: `${countryName} Consular Interview & Visa Checklist`,
                  countryName,
                  countryCode: code,
                  processing: meta.processing,
                })
              }
              style={{
                marginTop: '12px',
                width: '100%',
                padding: '10px',
                background: '#2563eb',
                color: 'white',
                border: 'none',
                borderRadius: '10px',
                fontWeight: 800,
                fontSize: '12px',
                cursor: 'pointer',
              }}
            >
              📄 Download {countryName} PDF Checklist
            </button>
          </div>
        </div>
      </div>

      {/* Interactive Mock Interview Simulator */}
      <div
        style={{
          background: 'linear-gradient(135deg,#eff6ff,#f8fafc)',
          border: '2px solid #bfdbfe',
          borderRadius: '20px',
          padding: '24px',
          marginBottom: '32px',
        }}
      >
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: '12px',
            marginBottom: '16px',
          }}
        >
          <div>
            <span
              style={{
                background: '#2563eb',
                color: 'white',
                padding: '4px 10px',
                borderRadius: '6px',
                fontSize: '11px',
                fontWeight: 800,
              }}
            >
              🤖 INTERACTIVE MOCK INTERVIEW BOT
            </span>
            <h2 style={{ fontSize: '20px', fontWeight: 900, color: '#0f172a', margin: '8px 0 2px' }}>
              Practice Live with {countryName} Visa Officer Simulator
            </h2>
            <p style={{ fontSize: '13px', color: '#475569', margin: 0 }}>
              Question {mockIndex + 1} of {questions.length} • Category: <strong>{currentMockQ.category}</strong>
            </p>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              type="button"
              onClick={() => {
                setMockIndex((prev) => (prev > 0 ? prev - 1 : questions.length - 1));
                setUserAnswer('');
                setMockFeedback(null);
              }}
              style={{
                padding: '8px 14px',
                background: 'white',
                border: '1px solid #cbd5e1',
                borderRadius: '10px',
                fontWeight: 700,
                fontSize: '12px',
                cursor: 'pointer',
              }}
            >
              ← Prev Question
            </button>
            <button
              type="button"
              onClick={() => {
                setMockIndex((prev) => (prev + 1) % questions.length);
                setUserAnswer('');
                setMockFeedback(null);
              }}
              style={{
                padding: '8px 14px',
                background: '#0f172a',
                color: 'white',
                border: 'none',
                borderRadius: '10px',
                fontWeight: 700,
                fontSize: '12px',
                cursor: 'pointer',
              }}
            >
              Next Question →
            </button>
          </div>
        </div>

        <div
          style={{
            background: 'white',
            border: '1px solid #dbeafe',
            borderRadius: '14px',
            padding: '16px',
            marginBottom: '14px',
          }}
        >
          <div style={{ fontSize: '12px', fontWeight: 800, color: '#2563eb', marginBottom: '4px' }}>
            👮‍♂️ CONSULAR OFFICER ASKS:
          </div>
          <div style={{ fontSize: '17px', fontWeight: 800, color: '#0f172a' }}>
            "{currentMockQ.question}"
          </div>
        </div>

        <form onSubmit={handleEvaluateMockAnswer}>
          <textarea
            value={userAnswer}
            onChange={(e) => setUserAnswer(e.target.value)}
            rows={3}
            placeholder={`Type how you would answer the ${countryName} Visa Officer (e.g. mention your travel dates, job role in India, and sponsorship)...`}
            style={{
              width: '100%',
              padding: '12px 14px',
              borderRadius: '12px',
              border: '1px solid #cbd5e1',
              fontSize: '14px',
              outline: 'none',
              marginBottom: '10px',
              boxSizing: 'border-box',
            }}
          />
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <button
              type="submit"
              style={{
                padding: '10px 20px',
                background: '#2563eb',
                color: 'white',
                border: 'none',
                borderRadius: '10px',
                fontWeight: 800,
                fontSize: '13px',
                cursor: 'pointer',
              }}
            >
              ✅ Evaluate My Answer
            </button>
            <button
              type="button"
              onClick={() => setUserAnswer(currentMockQ.idealAnswer.replace(/^"|"$/g, ''))}
              style={{
                padding: '10px 16px',
                background: '#f1f5f9',
                color: '#334155',
                border: '1px solid #cbd5e1',
                borderRadius: '10px',
                fontWeight: 700,
                fontSize: '13px',
                cursor: 'pointer',
              }}
            >
              💡 Fill Sample Ideal Answer
            </button>
          </div>
        </form>

        {mockFeedback && (
          <div
            style={{
              marginTop: '14px',
              background: 'white',
              border: '1px solid #86efac',
              borderRadius: '12px',
              padding: '14px',
            }}
          >
            <div style={{ fontWeight: 800, fontSize: '14px', color: '#0f172a' }}>
              Confidence Score: <span style={{ color: '#059669' }}>{mockFeedback.score}/100</span> — {mockFeedback.verdict}
            </div>
            <div style={{ fontSize: '13px', color: '#334155', marginTop: '6px' }}>
              {mockFeedback.tips}
            </div>
          </div>
        )}
      </div>

      {/* 20 Most Asked Questions & Ideal Answers */}
      <h2 style={{ fontSize: '24px', fontWeight: 900, color: '#0f172a', marginBottom: '16px' }}>
        📋 Top 20 {countryName} Visa Interview Questions & Ideal Answers (2026)
      </h2>
      <div style={{ display: 'grid', gap: '14px', marginBottom: '36px' }}>
        {questions.map((q) => (
          <div
            key={q.number}
            style={{
              background: 'white',
              border: '1px solid #e2e8f0',
              borderRadius: '16px',
              padding: '20px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <span
                style={{
                  background: '#eff6ff',
                  color: '#1d4ed8',
                  padding: '4px 10px',
                  borderRadius: '6px',
                  fontSize: '11px',
                  fontWeight: 800,
                }}
              >
                QUESTION #{q.number} • {q.category.toUpperCase()}
              </span>
            </div>
            <h3 style={{ fontSize: '17px', fontWeight: 800, color: '#0f172a', margin: '0 0 10px' }}>
              Q{q.number}: {q.question}
            </h3>
            <div
              style={{
                background: '#f0fdf4',
                borderLeft: '4px solid #16a34a',
                padding: '12px 14px',
                borderRadius: '8px',
                fontSize: '14px',
                color: '#14532d',
                lineHeight: 1.55,
                marginBottom: '8px',
              }}
            >
              <strong>✅ Ideal Answer:</strong> {q.idealAnswer}
            </div>
            <div style={{ fontSize: '12px', color: '#64748b' }}>
              🎯 <strong>What the Consular Officer looks for:</strong> {q.officerLooksFor}
            </div>
          </div>
        ))}
      </div>

      {/* Do's & Don'ts + Dress Code + Documents + Rejection Reasons */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(310px, 1fr))',
          gap: '20px',
          marginBottom: '32px',
        }}
      >
        {/* Do's and Don'ts */}
        <div
          style={{
            background: 'white',
            border: '1px solid #e2e8f0',
            borderRadius: '18px',
            padding: '22px',
          }}
        >
          <h3 style={{ fontSize: '18px', fontWeight: 900, color: '#0f172a', marginTop: 0 }}>
            ✅ Interview Do's & ❌ Don'ts
          </h3>
          <div style={{ fontSize: '13px', color: '#334155', lineHeight: 1.7 }}>
            <p style={{ margin: '0 0 8px', color: '#059669', fontWeight: 700 }}>
              ✅ DO: Arrive at the {countryName} Embassy/VAC 20 minutes before your slot.
            </p>
            <p style={{ margin: '0 0 8px', color: '#059669', fontWeight: 700 }}>
              ✅ DO: Answer in 2-3 crisp sentences with exact numbers (dates, INR salary, hotel name in {meta.capital}).
            </p>
            <p style={{ margin: '0 0 8px', color: '#059669', fontWeight: 700 }}>
              ✅ DO: Maintain calm eye contact and hand over documents only when requested.
            </p>
            <hr style={{ border: 'none', borderTop: '1px solid #e2e8f0', margin: '10px 0' }} />
            <p style={{ margin: '0 0 8px', color: '#dc2626', fontWeight: 700 }}>
              ❌ DON'T: Memorize robotic paragraphs or contradict your submitted application form.
            </p>
            <p style={{ margin: '0 0 8px', color: '#dc2626', fontWeight: 700 }}>
              ❌ DON'T: Carry mobile phones, smartwatches, USB drives, or sealed envelopes inside the consulate.
            </p>
            <p style={{ margin: 0, color: '#dc2626', fontWeight: 700 }}>
              ❌ DON'T: Argue with the consular officer or volunteer unnecessary tangential details.
            </p>
          </div>
        </div>

        {/* Documents to Carry & Dress Code */}
        <div
          style={{
            background: 'white',
            border: '1px solid #e2e8f0',
            borderRadius: '18px',
            padding: '22px',
          }}
        >
          <h3 style={{ fontSize: '18px', fontWeight: 900, color: '#0f172a', marginTop: 0 }}>
            📁 Documents to Carry & 👔 Dress Code
          </h3>
          <div style={{ fontSize: '13px', color: '#334155', lineHeight: 1.65 }}>
            <div style={{ fontWeight: 800, color: '#1e293b', marginBottom: '4px' }}>
              Mandatory Transparent Folder Order:
            </div>
            1. Appointment Confirmation + Visa Fee Receipt<br />
            2. Current Passport (6+ months validity) + All Old Passports<br />
            3. Employer Leave Approval (NOC) + Last 3 Months Salary Slips<br />
            4. 6 Months Stamped Bank Statement + 3 Years ITR V<br />
            5. Confirmed Hotel Voucher in {meta.capital} + Return Flight Itinerary<br />
            <div style={{ fontWeight: 800, color: '#1e293b', margin: '12px 0 4px' }}>
              Recommended Consular Dress Code:
            </div>
            • <strong>Men:</strong> Collared formal shirt (light blue/white/pastel), formal trousers, and closed shoes.<br />
            • <strong>Women:</strong> Smart business formals, formal kurta/salwar suit, or blazer with minimal accessories.
          </div>
        </div>

        {/* Common Rejection Reasons & Approval Boosters */}
        <div
          style={{
            background: 'white',
            border: '1px solid #e2e8f0',
            borderRadius: '18px',
            padding: '22px',
          }}
        >
          <h3 style={{ fontSize: '18px', fontWeight: 900, color: '#0f172a', marginTop: 0 }}>
            🚀 Avoid Rejections & Boost Success Rate
          </h3>
          <div style={{ fontSize: '13px', color: '#334155', lineHeight: 1.65 }}>
            <div style={{ fontWeight: 800, color: '#dc2626', marginBottom: '4px' }}>
              Top 3 {countryName} Rejection Reasons:
            </div>
            • Unexplained lump-sum deposits in bank account right before applying.<br />
            • Weak home-country ties (no leave letter / unclear job role in India).<br />
            • Fake/cancelled dummy hotel bookings that fail verification.<br />
            <div style={{ fontWeight: 800, color: '#059669', margin: '12px 0 4px' }}>
              How to Increase Approval Odds ({meta.successRate}):
            </div>
            • Use genuine Free-Cancellation hotel bookings in {meta.capital} (${hotelUSD}/night avg).<br />
            • Attach a 1-page signed Cover Letter summarizing your itinerary and sponsor details.
          </div>
        </div>
      </div>

      {/* Booking.com Hotel Verification Banner */}
      <div
        style={{
          background: 'linear-gradient(135deg,#003580,#00224f)',
          borderRadius: '20px',
          padding: '24px',
          color: 'white',
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '16px',
        }}
      >
        <div>
          <div style={{ fontSize: '11px', fontWeight: 800, color: '#93c5fd', textTransform: 'uppercase' }}>
            OFFICIAL CONSULAR REQUIREMENT • BOOKING.COM PARTNER (AID 8119919)
          </div>
          <h3 style={{ fontSize: '20px', fontWeight: 900, margin: '4px 0' }}>
            Need a Verifiable Hotel Voucher in {meta.capital} for Your {countryName} Interview?
          </h3>
          <p style={{ fontSize: '13px', color: '#dbeafe', margin: 0 }}>
            Book refundable hotels in {countryName} from {meta.hotelPrice} — Pay at property & download instant PDF confirmation for your embassy file.
          </p>
        </div>
        <a
          href={`https://www.booking.com/searchresults.html?ss=${encodeURIComponent(countryName)}&aid=8119919&label=interview-prep-${code}`}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            background: '#febb02',
            color: '#003580',
            padding: '12px 22px',
            borderRadius: '12px',
            fontWeight: 900,
            fontSize: '14px',
            textDecoration: 'none',
            whiteSpace: 'nowrap',
          }}
        >
          🏨 Book {countryName} Visa Hotels →
        </a>
      </div>
    </div>
  );
};
