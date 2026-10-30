const AUSTRALIA_OFFICIAL_VISAS = [
  {
    "code": "186",
    "name": "Employer Nomination Scheme visa",
    "cat": "work",
    "fee": "AUD $4,770",
    "valid": "Permanent",
    "stay": "Permanent",
    "purpose": "Permanent employer sponsored work"
  },
  {
    "code": "189",
    "name": "Skilled Independent visa",
    "cat": "work",
    "fee": "AUD $4,770",
    "valid": "Permanent",
    "stay": "Permanent",
    "purpose": "Points-tested permanent skilled - Most Popular"
  },
  {
    "code": "190",
    "name": "Skilled Nominated visa",
    "cat": "work",
    "fee": "AUD $4,770",
    "valid": "Permanent",
    "stay": "Permanent",
    "purpose": "State nominated permanent skilled"
  },
  {
    "code": "191",
    "name": "Permanent Residence (Skilled Regional) visa",
    "cat": "pr",
    "fee": "AUD $500",
    "valid": "Permanent",
    "stay": "Permanent",
    "purpose": "Permanent for 491/494 holders"
  },
  {
    "code": "192",
    "name": "Pacific Engagement visa",
    "cat": "work",
    "fee": "AUD $325",
    "valid": "Permanent",
    "stay": "Permanent",
    "purpose": "Permanent for Pacific island citizens"
  },
  {
    "code": "400",
    "name": "Temporary Work (Short Stay Specialist) visa",
    "cat": "work",
    "fee": "AUD $415",
    "valid": "Up to 6 months",
    "stay": "Up to 6 months",
    "purpose": "Short stay highly specialized work"
  },
  {
    "code": "403",
    "name": "Temporary Work (International Relations) visa",
    "cat": "work",
    "fee": "AUD $355",
    "valid": "Up to 4 years",
    "stay": "Up to 4 years",
    "purpose": "International relations work"
  },
  {
    "code": "407",
    "name": "Training visa",
    "cat": "student",
    "fee": "AUD $405",
    "valid": "Up to 2 years",
    "stay": "Up to 2 years",
    "purpose": "Occupational training"
  },
  {
    "code": "408",
    "name": "Temporary Activity visa",
    "cat": "work",
    "fee": "AUD $415",
    "valid": "Up to 2 years",
    "stay": "Up to 2 years",
    "purpose": "Temporary activity - entertainment, sport"
  },
  {
    "code": "482",
    "name": "Skills in Demand visa",
    "cat": "work",
    "fee": "AUD $1,455 - $3,035",
    "valid": "Up to 4 years",
    "stay": "Up to 4 years",
    "purpose": "Employer sponsored skills in demand - Replaces TSS"
  },
  {
    "code": "485",
    "name": "Temporary Graduate visa",
    "cat": "student",
    "fee": "AUD $2,235",
    "valid": "Up to 4 years",
    "stay": "Up to 4 years",
    "purpose": "Post-study work for international students"
  },
  {
    "code": "491",
    "name": "Skilled Work Regional (Provisional) visa",
    "cat": "work",
    "fee": "AUD $4,770",
    "valid": "5 years",
    "stay": "5 years",
    "purpose": "Regional provisional points-tested"
  },
  {
    "code": "494",
    "name": "Skilled Employer Sponsored Regional (Provisional) visa",
    "cat": "work",
    "fee": "AUD $4,770",
    "valid": "5 years",
    "stay": "5 years",
    "purpose": "Regional employer sponsored provisional"
  },
  {
    "code": "858",
    "name": "National Innovation visa",
    "cat": "pr",
    "fee": "AUD $4,770",
    "valid": "Permanent",
    "stay": "Permanent",
    "purpose": "National innovation - Global talent"
  },
  {
    "code": "600",
    "name": "Visitor visa",
    "cat": "tourist",
    "fee": "AUD $195 - $1,100",
    "valid": "Up to 12 months",
    "stay": "3, 6 or 12 months",
    "purpose": "Tourist, Business Visitor, Family Sponsored"
  },
  {
    "code": "601",
    "name": "Electronic Travel Authority (ETA)",
    "cat": "tourist",
    "fee": "AUD $20",
    "valid": "12 months",
    "stay": "3 months per visit",
    "purpose": "ETA for eligible passports"
  },
  {
    "code": "651",
    "name": "eVisitor visa",
    "cat": "tourist",
    "fee": "Free",
    "valid": "12 months",
    "stay": "3 months per visit",
    "purpose": "eVisitor for EU passports"
  },
  {
    "code": "771",
    "name": "Transit visa",
    "cat": "tourist",
    "fee": "Free",
    "valid": "72 hours",
    "stay": "72 hours",
    "purpose": "Transit through Australia"
  },
  {
    "code": "417",
    "name": "Working Holiday visa",
    "cat": "tourist",
    "fee": "AUD $670",
    "valid": "12 months",
    "stay": "12 months",
    "purpose": "Working holiday for eligible countries"
  },
  {
    "code": "462",
    "name": "Work and Holiday visa",
    "cat": "tourist",
    "fee": "AUD $670",
    "valid": "12 months",
    "stay": "12 months",
    "purpose": "Work and holiday for India and other countries"
  },
  {
    "code": "500",
    "name": "Student visa",
    "cat": "student",
    "fee": "AUD $1,600",
    "valid": "Up to 5 years",
    "stay": "Duration of course",
    "purpose": "Full-time study in Australia"
  },
  {
    "code": "590",
    "name": "Student Guardian visa",
    "cat": "family",
    "fee": "AUD $1,000",
    "valid": "Duration of student stay",
    "stay": "Duration of student stay",
    "purpose": "Guardian for student under 18"
  },
  {
    "code": "100",
    "name": "Partner visa (Migrant)",
    "cat": "family",
    "fee": "AUD $9,955",
    "valid": "Permanent",
    "stay": "Permanent",
    "purpose": "Permanent partner"
  },
  {
    "code": "101",
    "name": "Child visa",
    "cat": "family",
    "fee": "AUD $3,720",
    "valid": "Permanent",
    "stay": "Permanent",
    "purpose": "Child of Australian citizen/PR"
  },
  {
    "code": "102",
    "name": "Adoption visa",
    "cat": "family",
    "fee": "AUD $3,720",
    "valid": "Permanent",
    "stay": "Permanent",
    "purpose": "Adopted child overseas"
  },
  {
    "code": "103",
    "name": "Parent visa",
    "cat": "family",
    "fee": "AUD $5,125",
    "valid": "Permanent",
    "stay": "Permanent",
    "purpose": "Parent - Queue"
  },
  {
    "code": "114",
    "name": "Aged Dependent Relative visa",
    "cat": "family",
    "fee": "AUD $5,125",
    "valid": "Permanent",
    "stay": "Permanent",
    "purpose": "Aged dependent relative"
  },
  {
    "code": "115",
    "name": "Remaining Relative visa",
    "cat": "family",
    "fee": "AUD $5,125",
    "valid": "Permanent",
    "stay": "Permanent",
    "purpose": "Last remaining relative"
  },
  {
    "code": "116",
    "name": "Carer visa",
    "cat": "family",
    "fee": "AUD $2,140",
    "valid": "Permanent",
    "stay": "Permanent",
    "purpose": "Carer for relative"
  },
  {
    "code": "143",
    "name": "Contributory Parent visa",
    "cat": "family",
    "fee": "AUD $31,930",
    "valid": "Permanent",
    "stay": "Permanent",
    "purpose": "Fast-track contributory parent"
  },
  {
    "code": "173",
    "name": "Contributory Parent (Temporary) visa",
    "cat": "family",
    "fee": "AUD $32,730",
    "valid": "2 years",
    "stay": "2 years",
    "purpose": "Temporary to 143"
  },
  {
    "code": "300",
    "name": "Prospective Marriage visa",
    "cat": "family",
    "fee": "AUD $9,955",
    "valid": "9-15 months",
    "stay": "9-15 months",
    "purpose": "Fiance to marry in Australia"
  },
  {
    "code": "309",
    "name": "Partner visa (Provisional)",
    "cat": "family",
    "fee": "AUD $9,955",
    "valid": "Temporary",
    "stay": "Until 100 granted",
    "purpose": "Provisional partner offshore"
  },
  {
    "code": "445",
    "name": "Dependent Child visa",
    "cat": "family",
    "fee": "AUD $3,720",
    "valid": "Temporary",
    "stay": "Until parent permanent",
    "purpose": "Dependent child added"
  },
  {
    "code": "461",
    "name": "New Zealand Citizen Family Relationship visa",
    "cat": "family",
    "fee": "AUD $460",
    "valid": "5 years",
    "stay": "5 years",
    "purpose": "Family of NZ citizen"
  },
  {
    "code": "801",
    "name": "Partner visa (Permanent)",
    "cat": "family",
    "fee": "Included in 820/309",
    "valid": "Permanent",
    "stay": "Permanent",
    "purpose": "Permanent partner stage"
  },
  {
    "code": "802",
    "name": "Child visa (Onshore)",
    "cat": "family",
    "fee": "AUD $3,720",
    "valid": "Permanent",
    "stay": "Permanent",
    "purpose": "Child onshore"
  },
  {
    "code": "804",
    "name": "Aged Parent visa",
    "cat": "family",
    "fee": "AUD $5,125",
    "valid": "Permanent",
    "stay": "Permanent",
    "purpose": "Aged parent onshore"
  },
  {
    "code": "820",
    "name": "Partner visa (Temporary)",
    "cat": "family",
    "fee": "AUD $9,955",
    "valid": "Temporary",
    "stay": "Until 801",
    "purpose": "Temporary partner onshore"
  },
  {
    "code": "864",
    "name": "Contributory Aged Parent visa",
    "cat": "family",
    "fee": "AUD $31,930",
    "valid": "Permanent",
    "stay": "Permanent",
    "purpose": "Contributory aged parent onshore"
  },
  {
    "code": "870",
    "name": "Sponsored Parent (Temporary) visa",
    "cat": "family",
    "fee": "AUD $5,000 - $10,000",
    "valid": "3 or 5 years",
    "stay": "3 or 5 years",
    "purpose": "Temporary sponsored parent"
  },
  {
    "code": "884",
    "name": "Contributory Aged Parent (Temporary) visa",
    "cat": "family",
    "fee": "AUD $32,730",
    "valid": "2 years",
    "stay": "2 years",
    "purpose": "Temporary to 864"
  },
  {
    "code": "188",
    "name": "Business Innovation and Investment (Provisional) visa",
    "cat": "business",
    "fee": "AUD $6,085 - $9,455",
    "valid": "Up to 5 years",
    "stay": "Up to 5 years",
    "purpose": "Business innovation provisional - Check status"
  },
  {
    "code": "888",
    "name": "Business Innovation and Investment (Permanent) visa",
    "cat": "business",
    "fee": "AUD $2,890 - $4,045",
    "valid": "Permanent",
    "stay": "Permanent",
    "purpose": "Permanent after 188"
  },
  {
    "code": "187",
    "name": "Regional Sponsored Migration Scheme visa",
    "cat": "pr",
    "fee": "AUD $4,770",
    "valid": "Permanent",
    "stay": "Permanent",
    "purpose": "Regional employer - Historical/Restricted"
  },
  {
    "code": "887",
    "name": "Skilled Regional visa",
    "cat": "pr",
    "fee": "AUD $490",
    "valid": "Permanent",
    "stay": "Permanent",
    "purpose": "Permanent for 489/491/494 regional"
  },
  {
    "code": "200",
    "name": "Refugee visa",
    "cat": "pr",
    "fee": "Free",
    "valid": "Permanent",
    "stay": "Permanent",
    "purpose": "Refugee - Offshore referral"
  },
  {
    "code": "202",
    "name": "Global Special Humanitarian visa",
    "cat": "pr",
    "fee": "Free",
    "valid": "Permanent",
    "stay": "Permanent",
    "purpose": "Humanitarian offshore"
  },
  {
    "code": "866",
    "name": "Protection visa",
    "cat": "pr",
    "fee": "AUD $50",
    "valid": "Permanent",
    "stay": "Permanent",
    "purpose": "Protection onshore - Asylum"
  },
  {
    "code": "785",
    "name": "Temporary Protection visa",
    "cat": "pr",
    "fee": "Free",
    "valid": "3 years",
    "stay": "3 years",
    "purpose": "Temporary protection"
  },
  {
    "code": "010",
    "name": "Bridging visa A",
    "cat": "business",
    "fee": "Free",
    "valid": "Until decision",
    "stay": "Until decision",
    "purpose": "Bridging during processing"
  },
  {
    "code": "020",
    "name": "Bridging visa B",
    "cat": "business",
    "fee": "AUD $185",
    "valid": "Until decision",
    "stay": "Travel allowed",
    "purpose": "Bridging with travel"
  },
  {
    "code": "155",
    "name": "Five Year Resident Return visa",
    "cat": "pr",
    "fee": "AUD $490",
    "valid": "5 years travel",
    "stay": "Permanent resident return",
    "purpose": "Resident return 5 years"
  },
  {
    "code": "157",
    "name": "Three Month Resident Return visa",
    "cat": "pr",
    "fee": "AUD $490",
    "valid": "3 months travel",
    "stay": "Resident return 3 months",
    "purpose": "Resident return 3 months"
  },
  {
    "code": "444",
    "name": "Special Category visa",
    "cat": "tourist",
    "fee": "Free",
    "valid": "Temporary",
    "stay": "While in Australia",
    "purpose": "NZ citizen special category"
  },
  {
    "code": "602",
    "name": "Medical Treatment visa",
    "cat": "tourist",
    "fee": "AUD $355 - Free",
    "valid": "Up to 12 months",
    "stay": "Up to 12 months",
    "purpose": "Medical treatment"
  },
  {
    "code": "988",
    "name": "Maritime Crew visa",
    "cat": "business",
    "fee": "Free",
    "valid": "3 years",
    "stay": "Per entry",
    "purpose": "Maritime crew"
  }
];
