import { saveVisaDetails } from './src/db/immigrationDatabase';

function seedPilot() {
  const enrichedData = {
    programId: 'us-TOU-001',
    countryOverview: {
      name: 'United States',
      capital: 'Washington, D.C.',
      language: 'English',
      currency: 'USD ($)',
      bestTravelSeason: 'Spring (April-May) and Autumn (September-October)',
      safety: 'Generally safe; exercise standard precautions in major cities.',
      travelAdvisory: 'Standard precautions apply.'
    },
    visaOverview: {
      name: 'B1/B2 Visitor Visa',
      category: 'Non-immigrant',
      code: 'B1/B2',
      purpose: 'Tourism, medical treatment, conferences, and business meetings.',
      validity: 'Up to 10 years (reciprocal for Indian passport holders).',
      stay: 'Decided by CBP at Port of Entry; up to 6 months is typical.',
      entries: 'Multiple',
      fee: '$185 USD'
    },
    eligibility: {
      summary: 'Applicants must demonstrate strong ties to their home country (family, employment, assets) and clear intent to return.',
      restrictions: 'B1/B2 visa does not permit unauthorized employment or long-term residence.'
    },
    financial: {
      recommendedFunds: '$215 per day of planned stay.',
      bankStatementRequirement: 'Last 3-6 months showing consistent income.',
      sourceOfFunds: 'Must demonstrate legal origin of large deposits.'
    },
    documentChecklist: [
      { item: 'Valid Passport', mandatory: true, reason: 'Travel identification' },
      { item: 'DS-160 Confirmation', mandatory: true, reason: 'Proof of application' },
      { item: 'Appointment Confirmation', mandatory: true, reason: 'Embassy entry' },
      { item: 'Proof of Financial Support', mandatory: true, reason: 'Proof of funds' }
    ],
    applicationFields: ['Full name', 'Passport info', 'Employment details', 'Travel history'],
    applicationSteps: [
      'Determine visa category',
      'Fill DS-160',
      'Pay fee',
      'Book appointment',
      'Attend interview'
    ],
    interviewPrep: {
      commonQuestions: ['Purpose of visit', 'Who is paying', 'Why India'],
      tips: 'Be truthful, consistent, and confident.'
    },
    embassyDirectory: [
      { name: 'US Embassy New Delhi', address: 'Shantipath, Chanakyapuri' },
      { name: 'US Consulate General Mumbai', address: 'Bandra Kurla Complex' }
    ],
    refusalAppeal: { grounds: 'Section 214(b) - failure to prove intent to return.' },
    afterApproval: { entryConditions: 'Admissibility is determined by CBP officer at port of entry.' },
    costCalculator: {
      fees: { governmentFee: 185, serviceFee: 0 },
      estimates: { travel: 1500, accommodation: 1000 }
    },
    faq: [{ q: 'Can I work?', a: 'No, unauthorized work is prohibited.' }],
    legalEvidence: [{ claim: 'Reciprocity', source: 'https://travel.state.gov' }],
    verificationStatus: 'VERIFIED'
  };
  saveVisaDetails(enrichedData);
  console.log("Enriched pilot data seeded.");
}

seedPilot();
