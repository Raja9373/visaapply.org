import { GoogleGenAI, Type, ThinkingLevel } from '@google/genai';

export interface AiEligibilityInput {
  fromCountry: string;
  toCountry: string;
  toCode?: string;
  visaType: string;
  duration: string;
  passportValidity: string;
  monthlyIncome: string;
  bankBalance: string;
  travelHistory: string;
  jobType: string;
}

export interface AlternativeCountrySuggestion {
  name: string;
  code: string;
  flag: string;
  chance: string;
  reason: string;
}

export interface AiEligibilityResult {
  score: number;
  verdict: 'High Chance' | 'Medium Chance' | 'Low Chance';
  source: 'gemini-ai' | 'rule-based';
  why: string;
  whatToFix: string[];
  alternativeCountries: AlternativeCountrySuggestion[];
  documentsNeeded: string[];
}

const STRICT_DESTINATIONS = new Set([
  'us', 'usa', 'united states',
  'gb', 'uk', 'united kingdom',
  'ca', 'canada',
  'au', 'australia',
  'de', 'germany',
  'fr', 'france',
  'it', 'italy',
  'es', 'spain',
  'ch', 'switzerland',
  'nl', 'netherlands',
  'nz', 'new zealand',
  'ie', 'ireland',
  'se', 'sweden',
  'no', 'norway',
  'dk', 'denmark',
  'at', 'austria',
  'be', 'belgium'
]);

const EASY_DESTINATIONS = new Set([
  'th', 'thailand',
  'ae', 'uae', 'united arab emirates', 'dubai',
  'my', 'malaysia',
  'id', 'indonesia',
  'vn', 'vietnam',
  'lk', 'sri lanka',
  'mv', 'maldives',
  'mu', 'mauritius',
  'np', 'nepal',
  'bt', 'bhutan',
  'kz', 'kazakhstan',
  'uz', 'uzbekistan',
  'qa', 'qatar',
  'om', 'oman'
]);

export function computeRuleBasedEligibility(input: AiEligibilityInput): AiEligibilityResult {
  const fromName = input.fromCountry || 'India';
  const toName = input.toCountry || 'United States';
  const toKey = (input.toCode || toName).toLowerCase().trim();
  const isStrict = STRICT_DESTINATIONS.has(toKey) || STRICT_DESTINATIONS.has(toName.toLowerCase());
  const isEasy = EASY_DESTINATIONS.has(toKey) || EASY_DESTINATIONS.has(toName.toLowerCase());
  const isPassportInvalid = (input.passportValidity || '').toLowerCase().includes('less than 6');

  if (isPassportInvalid) {
    return {
      score: 15,
      verdict: 'Low Chance',
      source: 'rule-based',
      why: `Your passport currently has less than 6 months validity. Consulates and airlines for ${toName} strictly require at least 6 months of validity beyond your planned departure date before accepting a visa application.`,
      whatToFix: [
        'Renew your passport immediately via Passport Seva (Normal takes 7–15 days, Tatkal takes 1–3 days).',
        input.bankBalance === '< Rs 1L'
          ? 'Increase your savings bank balance to at least Rs 3L+ with steady monthly credits before applying.'
          : 'Maintain your current bank balance steadily without sudden lump-sum cash deposits.',
        'Prepare your last 6 months bank statements and employment/student proof while waiting for your new passport.'
      ],
      alternativeCountries: [
        {
          name: 'Thailand',
          code: 'th',
          flag: '🇹🇭',
          chance: '99% (After Passport Renewal)',
          reason: 'Visa-Free / Visa Exemption for Indian passport holders once passport has 6+ months validity.'
        },
        {
          name: 'United Arab Emirates (Dubai)',
          code: 'ae',
          flag: '🇦🇪',
          chance: '95% (After Passport Renewal)',
          reason: 'Fast 3–4 day e-Visa approval with minimal financial paperwork once passport is renewed.'
        }
      ],
      documentsNeeded: [
        'Renewed Passport with at least 6+ months validity and 2 blank visa pages',
        'Old expired/expiring passport showing any previous visas and travel stamps',
        'Last 6 months bank statements with official bank stamp',
        'Passport renewal receipt and updated biometric visa photographs (35x45mm or 2x2 inch)'
      ]
    };
  }

  let score = isEasy ? 72 : isStrict ? 44 : 58;

  // 1. Bank Balance scoring
  if (input.bankBalance === 'Rs 5L+') {
    score += 20;
  } else if (input.bankBalance === 'Rs 3L-5L') {
    score += 14;
  } else if (input.bankBalance === 'Rs 1L-3L') {
    score += isEasy ? 10 : 3;
  } else {
    // < Rs 1L
    score -= isStrict ? 18 : isEasy ? 4 : 10;
  }

  // 2. Monthly Income scoring
  if (input.monthlyIncome === 'Rs 1L+') {
    score += 14;
  } else if (input.monthlyIncome === 'Rs 60k-1L') {
    score += 10;
  } else if (input.monthlyIncome === 'Rs 30k-60k') {
    score += isEasy ? 8 : 3;
  } else {
    // < Rs 30k
    score -= isStrict ? 10 : 3;
  }

  // 3. Travel History scoring
  if (input.travelHistory === '3+ Countries') {
    score += 14;
  } else if (input.travelHistory === '1-2 Countries') {
    score += 7;
  } else {
    // No Travel
    score -= isStrict ? 8 : 0;
  }

  // 4. Job Type scoring
  if (input.jobType === 'Salaried') {
    score += 8;
  } else if (input.jobType === 'Business') {
    score += 7;
  } else if (input.jobType === 'Student') {
    score += 4;
  } else if (input.jobType === 'Unemployed') {
    score -= isStrict ? 14 : 6;
  }

  score = Math.max(12, Math.min(98, Math.round(score)));

  const verdict: 'High Chance' | 'Medium Chance' | 'Low Chance' =
    score >= 80 ? 'High Chance' : score >= 50 ? 'Medium Chance' : 'Low Chance';

  const cleanVisaType = (input.visaType || 'Tourist').replace(/^[^\w]+/, '').trim();

  // Build "Why?" explanation in 2-3 simple English lines
  const whyParts: string[] = [];
  if (verdict === 'High Chance') {
    whyParts.push(
      `Your profile shows strong eligibility for a ${toName} ${cleanVisaType} Visa with a ${input.bankBalance} bank balance, ${input.monthlyIncome} monthly income, and ${input.jobType.toLowerCase()} status.`
    );
    whyParts.push(
      input.travelHistory === 'No Travel'
        ? `Even as a first-time international traveler from ${fromName}, your financial stability meets official consular benchmarks for ${toName}.`
        : `Your prior travel history (${input.travelHistory}) combined with a valid passport gives visa officers high confidence in your genuine travel intent.`
    );
  } else if (verdict === 'Medium Chance') {
    whyParts.push(
      `You have a moderate chance for a ${toName} ${cleanVisaType} Visa based on your ${input.bankBalance} bank balance, ${input.monthlyIncome} monthly income, and ${input.travelHistory.toLowerCase()} background.`
    );
    whyParts.push(
      `Consular officers for ${toName} look closely at steady 6-month savings and strong home-country ties (${input.jobType}), so strengthening your financial and employment proofs will significantly boost approval.`
    );
  } else {
    whyParts.push(
      `Your current profile (${input.bankBalance} balance, ${input.monthlyIncome} income, ${input.travelHistory}, ${input.jobType}) faces a higher risk of refusal under ${toName}'s strict financial and home-ties assessment.`
    );
    whyParts.push(
      `Embassy officers for ${toName} typically require higher liquid savings, verifiable regular income, or prior international travel history before granting a ${cleanVisaType} visa.`
    );
  }

  // Build "What to Fix?" (2-3 actionable tips)
  const whatToFix: string[] = [];
  if (input.bankBalance === '< Rs 1L' || (isStrict && input.bankBalance === 'Rs 1L-3L')) {
    whatToFix.push(
      isStrict
        ? `Increase your closing bank balance to at least Rs 3,00,000 – Rs 5,00,000 gradually over 3–6 months (never deposit a sudden lump sum before applying).`
        : `Increase your bank balance to at least Rs 1,50,000 – Rs 3,00,000 with steady monthly transactions.`
    );
  }
  if (input.travelHistory === 'No Travel' && isStrict) {
    whatToFix.push(
      `Build international travel history first by visiting 1–2 easy visa/e-Visa countries such as Thailand, Dubai (UAE), Singapore, or Vietnam before applying to ${toName}.`
    );
  }
  if (input.jobType === 'Unemployed') {
    whatToFix.push(
      `Include a strong Financial Sponsorship Affidavit from an immediate family member (parent/spouse) along with their 6-month bank statement and 3-year ITR.`
    );
  } else if (input.jobType === 'Student') {
    whatToFix.push(
      `Attach your Bona Fide Student Certificate, parent/guardian sponsorship letter, and parent's 6-month bank statements + ITR.`
    );
  } else if (input.jobType === 'Business') {
    whatToFix.push(
      `Attach GST registration / MSME certificate, last 3 years company + personal ITR, and a current account bank statement.`
    );
  } else {
    whatToFix.push(
      `Attach an official Employer Leave Approval (NOC) letter on company letterhead, last 3 months salary slips, and Form-16 / ITR.`
    );
  }
  if (whatToFix.length < 3) {
    whatToFix.push(
      `Include a clear day-by-day travel itinerary, verifiable flight & hotel booking, and a formal Visa Cover Letter explaining your ties to ${fromName}.`
    );
  }

  // Build Best Alternative Countries (2 easier countries with high approval)
  const alternativeCountries: AlternativeCountrySuggestion[] = [
    {
      name: 'Thailand',
      code: 'th',
      flag: '🇹🇭',
      chance: '99% Approval',
      reason: '60-Day Visa-Free entry for Indian passports; zero embassy interview and minimal bank balance needed.'
    },
    {
      name: 'United Arab Emirates (Dubai)',
      code: 'ae',
      flag: '🇦🇪',
      chance: '95% Approval',
      reason: '100% online e-Visa processed in 3–4 working days; ideal for building strong international travel history.'
    }
  ];

  if (toKey === 'th') {
    alternativeCountries[0] = {
      name: 'Malaysia',
      code: 'my',
      flag: '🇲🇾',
      chance: '99% Approval',
      reason: '30-Day Visa-Free entry with simple online MDAC Digital Arrival Card.'
    };
  } else if (toKey === 'ae') {
    alternativeCountries[1] = {
      name: 'Singapore',
      code: 'sg',
      flag: '🇸🇬',
      chance: '94% Approval',
      reason: 'Fast 3–5 day e-Visa approval and highly respected stamp for future US/Schengen/UK visas.'
    };
  }

  // Build tailored Documents Needed based on Job Type & Visa Type
  const documentsNeeded: string[] = [
    'Original Passport with 6+ months validity & at least 2 blank pages',
    `Last 6 months personal bank statements showing steady balance (${input.bankBalance} bracket)`,
    `Verifiable Return Flight Reservation & Hotel Booking for ${input.duration.replace('📅 ', '')}`
  ];

  if (input.jobType === 'Salaried') {
    documentsNeeded.push('Last 3 months Salary Slips, Employer NOC / Leave Approval Letter & 2–3 years ITR');
  } else if (input.jobType === 'Business') {
    documentsNeeded.push('Business Registration (GST / Udhyam / MOA), Company Bank Statement & 3 years ITR');
  } else if (input.jobType === 'Student') {
    documentsNeeded.push('School/College ID Card, NOC, Parent Sponsorship Affidavit & Parent 6-Month Bank Statement');
  } else {
    documentsNeeded.push('Blood-Relative Sponsorship Affidavit, Sponsor 6-Month Bank Statements, ITR & Proof of Property/Ties');
  }

  documentsNeeded.push(
    `Signed Visa Cover Letter explaining purpose of ${cleanVisaType} trip and strong ties to ${fromName}`,
    'Travel Medical Insurance ($50,000 / €30,000 coverage) & 2 Biometric Visa Photos'
  );

  return {
    score,
    verdict,
    source: 'rule-based',
    why: whyParts.join(' '),
    whatToFix: whatToFix.slice(0, 3),
    alternativeCountries,
    documentsNeeded
  };
}

export default async function handleAiEligibilityRequest(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed. Use POST.' });
  }

  const body: AiEligibilityInput = {
    fromCountry: String(req.body?.fromCountry || 'India'),
    toCountry: String(req.body?.toCountry || 'United States'),
    toCode: String(req.body?.toCode || 'us'),
    visaType: String(req.body?.visaType || 'Tourist'),
    duration: String(req.body?.duration || '15 Days'),
    passportValidity: String(req.body?.passportValidity || 'Passport Validity 6+ Months'),
    monthlyIncome: String(req.body?.monthlyIncome || 'Rs 60k-1L'),
    bankBalance: String(req.body?.bankBalance || 'Rs 3L-5L'),
    travelHistory: String(req.body?.travelHistory || '1-2 Countries'),
    jobType: String(req.body?.jobType || 'Salaried')
  };

  const fallbackResult = computeRuleBasedEligibility(body);

  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey === 'dummy_key' || apiKey.trim() === '') {
      return res.status(200).json(fallbackResult);
    }

    const ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build'
        }
      }
    });

    const prompt = `Evaluate visa eligibility for this applicant profile in simple Pure English:
- Citizen / Passport: ${body.fromCountry}
- Destination Country: ${body.toCountry} (${body.toCode?.toUpperCase()})
- Visa Type: ${body.visaType}
- Intended Stay: ${body.duration}
- Passport Validity: ${body.passportValidity}
- Monthly Income: ${body.monthlyIncome}
- Bank Balance: ${body.bankBalance}
- Travel History: ${body.travelHistory}
- Job Type: ${body.jobType}

Instructions:
1. Calculate a realistic visa approval score from 0 to 100. (If passport validity is less than 6 months, score must be under 25).
2. Set verdict to "High Chance" (80-100), "Medium Chance" (50-79), or "Low Chance" (0-49).
3. Write "why" in 2-3 clear sentences in simple Pure English explaining why they got this score based on their exact financial, job, and travel history profile.
4. Provide 3 specific actionable tips in "whatToFix" (e.g., "Increase bank balance to Rs 3L+", "Build travel history with Thailand or Dubai first").
5. Provide 2 easier high-approval alternative countries in "alternativeCountries" (such as Thailand 99% or Dubai/UAE 95%) with 2-letter lowercase ISO code, flag emoji, approval chance label, and 1-sentence reason.
6. Provide 5 tailored "documentsNeeded" specific to their ${body.jobType} status and ${body.visaType} visa.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        systemInstruction:
          'You are a senior consular visa eligibility analyst. Respond strictly in Pure English JSON matching the schema.',
        thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            score: { type: Type.INTEGER, description: 'Eligibility score between 0 and 100' },
            verdict: {
              type: Type.STRING,
              description: 'Must be High Chance, Medium Chance, or Low Chance'
            },
            why: {
              type: Type.STRING,
              description: '2-3 lines in simple Pure English explaining the score'
            },
            whatToFix: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: '2-3 actionable tips to improve visa approval chances'
            },
            alternativeCountries: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING },
                  code: { type: Type.STRING },
                  flag: { type: Type.STRING },
                  chance: { type: Type.STRING },
                  reason: { type: Type.STRING }
                },
                required: ['name', 'code', 'flag', 'chance', 'reason']
              }
            },
            documentsNeeded: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: 'Tailored mandatory document checklist for this applicant'
            }
          },
          required: ['score', 'verdict', 'why', 'whatToFix', 'alternativeCountries', 'documentsNeeded']
        }
      }
    });

    const rawText = (response.text ?? '').trim();
    if (!rawText) {
      return res.status(200).json(fallbackResult);
    }

    const parsed = JSON.parse(rawText);
    const numScore = Math.max(0, Math.min(100, Number(parsed.score) || fallbackResult.score));
    const computedVerdict: 'High Chance' | 'Medium Chance' | 'Low Chance' =
      numScore >= 80 ? 'High Chance' : numScore >= 50 ? 'Medium Chance' : 'Low Chance';

    const result: AiEligibilityResult = {
      score: numScore,
      verdict: computedVerdict,
      source: 'gemini-ai',
      why: String(parsed.why || fallbackResult.why),
      whatToFix:
        Array.isArray(parsed.whatToFix) && parsed.whatToFix.length > 0
          ? parsed.whatToFix.slice(0, 3).map(String)
          : fallbackResult.whatToFix,
      alternativeCountries:
        Array.isArray(parsed.alternativeCountries) && parsed.alternativeCountries.length > 0
          ? parsed.alternativeCountries.slice(0, 2).map((c: any) => ({
              name: String(c.name || 'Thailand'),
              code: String(c.code || 'th').toLowerCase(),
              flag: String(c.flag || '🇹🇭'),
              chance: String(c.chance || '99% Approval'),
              reason: String(c.reason || 'Easy e-Visa / Visa-Free entry for building travel history.')
            }))
          : fallbackResult.alternativeCountries,
      documentsNeeded:
        Array.isArray(parsed.documentsNeeded) && parsed.documentsNeeded.length > 0
          ? parsed.documentsNeeded.slice(0, 6).map(String)
          : fallbackResult.documentsNeeded
    };

    return res.status(200).json(result);
  } catch (err) {
    return res.status(200).json(fallbackResult);
  }
}
