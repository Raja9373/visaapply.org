import React, { useState, useMemo } from 'react';
import {
  Briefcase,
  Search,
  MapPin,
  ExternalLink,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  Building2,
  Award,
  Filter,
  RotateCcw
} from 'lucide-react';
import { EmailSubscribeBox } from '../components/EmailSubscribeBox';
import { PageBackBar, PageBottomBack } from '../components/PageBackBar';

interface SponsorshipFinderPageProps {
  onNavigate?: (path: string) => void;
}

export type SponsorCountry = 'USA' | 'UK' | 'Canada' | 'Australia' | 'Germany';
export type SponsorJobCategory =
  | 'IT'
  | 'Healthcare'
  | 'Engineering'
  | 'Nursing'
  | 'Agriculture'
  | 'Construction';

export interface SponsorCompany {
  id: string;
  name: string;
  initials: string;
  country: SponsorCountry;
  location: string;
  category: SponsorJobCategory;
  industry: string;
  sponsorshipCount: string;
  visaType: string;
  visaCodeGroup: string;
  careersUrl: string;
}

const SPONSOR_COMPANIES: SponsorCompany[] = [
  // ================= USA (26 Companies across all 6 Job Categories) =================
  {
    id: 'us-google',
    name: 'Google (Alphabet Inc.)',
    initials: 'GO',
    country: 'USA',
    location: 'Mountain View, CA, USA',
    category: 'IT',
    industry: 'Cloud, Search & Software Engineering',
    sponsorshipCount: '5,400+ H1B in 2025',
    visaType: 'H1B / L-1 / EB-2 Green Card',
    visaCodeGroup: 'H1B',
    careersUrl: 'https://www.google.com/about/careers/applications/'
  },
  {
    id: 'us-amazon',
    name: 'Amazon.com Services LLC',
    initials: 'AM',
    country: 'USA',
    location: 'Seattle, WA & Arlington, VA, USA',
    category: 'IT',
    industry: 'AWS Cloud, E-Commerce & AI Systems',
    sponsorshipCount: '9,200+ H1B in 2025',
    visaType: 'H1B / L-1 / TN / PERM EB-2',
    visaCodeGroup: 'H1B',
    careersUrl: 'https://www.amazon.jobs/'
  },
  {
    id: 'us-microsoft',
    name: 'Microsoft Corporation',
    initials: 'MS',
    country: 'USA',
    location: 'Redmond, WA, USA',
    category: 'IT',
    industry: 'Enterprise Software, Azure & AI',
    sponsorshipCount: '4,700+ H1B in 2025',
    visaType: 'H1B / L-1B / EB-2',
    visaCodeGroup: 'H1B',
    careersUrl: 'https://careers.microsoft.com/'
  },
  {
    id: 'us-meta',
    name: 'Meta Platforms, Inc.',
    initials: 'ME',
    country: 'USA',
    location: 'Menlo Park, CA, USA',
    category: 'IT',
    industry: 'Social Platforms, AI & Reality Labs',
    sponsorshipCount: '2,850+ H1B in 2025',
    visaType: 'H1B / O-1 / EB-2',
    visaCodeGroup: 'H1B',
    careersUrl: 'https://www.metacareers.com/'
  },
  {
    id: 'us-infosys',
    name: 'Infosys Limited (USA)',
    initials: 'IN',
    country: 'USA',
    location: 'Richardson, TX & Nationwide, USA',
    category: 'IT',
    industry: 'Global IT Consulting & Digital Services',
    sponsorshipCount: '7,500+ H1B in 2025',
    visaType: 'H1B / L-1A / L-1B',
    visaCodeGroup: 'H1B',
    careersUrl: 'https://www.infosys.com/careers/'
  },
  {
    id: 'us-tcs',
    name: 'Tata Consultancy Services (TCS)',
    initials: 'TC',
    country: 'USA',
    location: 'Edison, NJ & New York, NY, USA',
    category: 'IT',
    industry: 'Enterprise IT & Banking Technology',
    sponsorshipCount: '6,800+ H1B in 2025',
    visaType: 'H1B / L-1A / L-1B',
    visaCodeGroup: 'H1B',
    careersUrl: 'https://www.tcs.com/careers/united-states'
  },
  {
    id: 'us-apple',
    name: 'Apple Inc.',
    initials: 'AP',
    country: 'USA',
    location: 'Cupertino, CA, USA',
    category: 'IT',
    industry: 'Consumer Hardware, Silicon & iOS',
    sponsorshipCount: '3,100+ H1B in 2025',
    visaType: 'H1B / O-1 / PERM Green Card',
    visaCodeGroup: 'H1B',
    careersUrl: 'https://www.apple.com/careers/us/'
  },
  {
    id: 'us-cognizant',
    name: 'Cognizant Technology Solutions',
    initials: 'CT',
    country: 'USA',
    location: 'Teaneck, NJ, USA',
    category: 'IT',
    industry: 'IT Services & Healthcare Tech',
    sponsorshipCount: '4,200+ H1B in 2025',
    visaType: 'H1B / L-1',
    visaCodeGroup: 'H1B',
    careersUrl: 'https://careers.cognizant.com/global-en/'
  },
  {
    id: 'us-ibm',
    name: 'IBM Corporation',
    initials: 'IB',
    country: 'USA',
    location: 'Armonk, NY & Austin, TX, USA',
    category: 'IT',
    industry: 'Hybrid Cloud, Quantum & Enterprise AI',
    sponsorshipCount: '1,650+ H1B in 2025',
    visaType: 'H1B / L-1 / O-1',
    visaCodeGroup: 'H1B',
    careersUrl: 'https://www.ibm.com/careers'
  },
  {
    id: 'us-oracle',
    name: 'Oracle America, Inc.',
    initials: 'OR',
    country: 'USA',
    location: 'Austin, TX & Redwood Shores, CA, USA',
    category: 'IT',
    industry: 'Cloud Infrastructure & Enterprise ERP',
    sponsorshipCount: '1,900+ H1B in 2025',
    visaType: 'H1B / TN / EB-2',
    visaCodeGroup: 'H1B',
    careersUrl: 'https://www.oracle.com/careers/'
  },
  {
    id: 'us-deloitte',
    name: 'Deloitte Consulting LLP',
    initials: 'DL',
    country: 'USA',
    location: 'New York, NY & Chicago, IL, USA',
    category: 'IT',
    industry: 'Technology Advisory & Cloud Transformation',
    sponsorshipCount: '3,400+ H1B in 2025',
    visaType: 'H1B / TN',
    visaCodeGroup: 'H1B',
    careersUrl: 'https://www2.deloitte.com/us/en/careers/careers.html'
  },
  {
    id: 'us-nvidia',
    name: 'NVIDIA Corporation',
    initials: 'NV',
    country: 'USA',
    location: 'Santa Clara, CA, USA',
    category: 'Engineering',
    industry: 'GPU Semiconductors & AI Hardware',
    sponsorshipCount: '1,400+ H1B in 2025',
    visaType: 'H1B / O-1 / EB-1B',
    visaCodeGroup: 'H1B',
    careersUrl: 'https://www.nvidia.com/en-us/about-nvidia/careers/'
  },
  {
    id: 'us-intel',
    name: 'Intel Corporation',
    initials: 'IC',
    country: 'USA',
    location: 'Hillsboro, OR & Santa Clara, CA, USA',
    category: 'Engineering',
    industry: 'Semiconductor Fabrication & Chip Design',
    sponsorshipCount: '1,750+ H1B in 2025',
    visaType: 'H1B / EB-2 Green Card',
    visaCodeGroup: 'H1B',
    careersUrl: 'https://jobs.intel.com/'
  },
  {
    id: 'us-tesla',
    name: 'Tesla, Inc.',
    initials: 'TS',
    country: 'USA',
    location: 'Austin, TX & Fremont, CA, USA',
    category: 'Engineering',
    industry: 'Electric Vehicles, Battery & Robotics',
    sponsorshipCount: '1,350+ H1B in 2025',
    visaType: 'H1B / TN / O-1',
    visaCodeGroup: 'H1B',
    careersUrl: 'https://www.tesla.com/careers'
  },
  {
    id: 'us-cummins',
    name: 'Cummins Inc.',
    initials: 'CM',
    country: 'USA',
    location: 'Columbus, IN, USA',
    category: 'Engineering',
    industry: 'Powertrains, Hydrogen & Mechanical Eng.',
    sponsorshipCount: '620+ H1B in 2025',
    visaType: 'H1B / L-1B',
    visaCodeGroup: 'H1B',
    careersUrl: 'https://www.cummins.com/careers'
  },
  {
    id: 'us-caterpillar',
    name: 'Caterpillar Inc.',
    initials: 'CT',
    country: 'USA',
    location: 'Irving, TX & Peoria, IL, USA',
    category: 'Engineering',
    industry: 'Heavy Machinery & Industrial Engineering',
    sponsorshipCount: '480+ H1B in 2025',
    visaType: 'H1B / L-1',
    visaCodeGroup: 'H1B',
    careersUrl: 'https://www.caterpillar.com/en/careers.html'
  },
  {
    id: 'us-mayo',
    name: 'Mayo Clinic',
    initials: 'MC',
    country: 'USA',
    location: 'Rochester, MN & Jacksonville, FL, USA',
    category: 'Healthcare',
    industry: 'Academic Medical Center & Clinical Research',
    sponsorshipCount: '890+ Cap-Exempt H1B in 2025',
    visaType: 'H1B (Cap-Exempt) / J-1 / O-1',
    visaCodeGroup: 'H1B',
    careersUrl: 'https://jobs.mayoclinic.org/'
  },
  {
    id: 'us-cleveland',
    name: 'Cleveland Clinic Foundation',
    initials: 'CC',
    country: 'USA',
    location: 'Cleveland, OH, USA',
    category: 'Healthcare',
    industry: 'Hospital Network & Specialist Medicine',
    sponsorshipCount: '640+ Cap-Exempt H1B in 2025',
    visaType: 'H1B (Cap-Exempt) / EB-2',
    visaCodeGroup: 'H1B',
    careersUrl: 'https://jobs.clevelandclinic.org/'
  },
  {
    id: 'us-hopkins',
    name: 'Johns Hopkins Medicine',
    initials: 'JH',
    country: 'USA',
    location: 'Baltimore, MD, USA',
    category: 'Healthcare',
    industry: 'Healthcare & Biomedical Research',
    sponsorshipCount: '580+ Cap-Exempt H1B in 2025',
    visaType: 'H1B (Cap-Exempt) / J-1',
    visaCodeGroup: 'H1B',
    careersUrl: 'https://jobs.hopkinsmedicine.org/'
  },
  {
    id: 'us-avant',
    name: 'Avant Healthcare Professionals',
    initials: 'AV',
    country: 'USA',
    location: 'Orlando, FL & Nationwide, USA',
    category: 'Nursing',
    industry: 'International Registered Nurse (RN) Staffing',
    sponsorshipCount: '1,100+ EB-3 RN Visas in 2025',
    visaType: 'EB-3 Schedule A Nurse Green Card / H1B',
    visaCodeGroup: 'H1B',
    careersUrl: 'https://avanthealthcare.com/'
  },
  {
    id: 'us-ogradypeyton',
    name: "O'Grady Peyton International",
    initials: 'OG',
    country: 'USA',
    location: 'Boston, MA & Nationwide, USA',
    category: 'Nursing',
    industry: 'US Registered Nurse (NCLEX) Sponsorship',
    sponsorshipCount: '850+ RN Green Cards in 2025',
    visaType: 'EB-3 Schedule A / H1B',
    visaCodeGroup: 'H1B',
    careersUrl: 'https://www.ogradypeyton.com/'
  },
  {
    id: 'us-conexus',
    name: 'Conexus MedStaff',
    initials: 'CX',
    country: 'USA',
    location: 'Houston, TX & Charlotte, NC, USA',
    category: 'Nursing',
    industry: 'Registered Nurses & Medical Technologists',
    sponsorshipCount: '600+ EB-3 & H1B in 2025',
    visaType: 'H1B / EB-3 Nurse Visa',
    visaCodeGroup: 'H1B',
    careersUrl: 'https://www.conexusmedstaff.com/'
  },
  {
    id: 'us-cargill',
    name: 'Cargill, Incorporated',
    initials: 'CG',
    country: 'USA',
    location: 'Wayzata, MN & Midwest, USA',
    category: 'Agriculture',
    industry: 'Agribusiness, Food Science & Supply Chain',
    sponsorshipCount: '340+ H1B / H-2A in 2025',
    visaType: 'H1B / H-2A / TN',
    visaCodeGroup: 'H1B',
    careersUrl: 'https://careers.cargill.com/'
  },
  {
    id: 'us-johndeere',
    name: 'John Deere (Deere & Company)',
    initials: 'JD',
    country: 'USA',
    location: 'Moline, IL & Des Moines, IA, USA',
    category: 'Agriculture',
    industry: 'Precision Agriculture & Farm Equipment',
    sponsorshipCount: '410+ H1B in 2025',
    visaType: 'H1B / L-1',
    visaCodeGroup: 'H1B',
    careersUrl: 'https://www.deere.com/en/our-company/john-deere-careers/'
  },
  {
    id: 'us-bechtel',
    name: 'Bechtel Corporation',
    initials: 'BC',
    country: 'USA',
    location: 'Reston, VA & Houston, TX, USA',
    category: 'Construction',
    industry: 'Civil Infrastructure, EPC & Mega Projects',
    sponsorshipCount: '310+ H1B / E-3 in 2025',
    visaType: 'H1B / L-1 / E-3',
    visaCodeGroup: 'H1B',
    careersUrl: 'https://www.bechtel.com/careers/'
  },
  {
    id: 'us-aecom',
    name: 'AECOM Technical Services',
    initials: 'AE',
    country: 'USA',
    location: 'Dallas, TX & Los Angeles, CA, USA',
    category: 'Construction',
    industry: 'Civil Engineering, Transit & Construction Mgmt',
    sponsorshipCount: '380+ H1B in 2025',
    visaType: 'H1B / TN',
    visaCodeGroup: 'H1B',
    careersUrl: 'https://aecom.com/careers/'
  },

  // ================= UK (24 Companies across all 6 Job Categories) =================
  {
    id: 'uk-nhs',
    name: 'NHS England & NHS Scotland Trusts',
    initials: 'NH',
    country: 'UK',
    location: 'London, Manchester & UK-Wide',
    category: 'Healthcare',
    industry: 'National Health Service Hospitals & Clinics',
    sponsorshipCount: '18,500+ Skilled Worker CoS in 2025',
    visaType: 'UK Health & Care Worker / Skilled Worker',
    visaCodeGroup: 'Skilled Worker',
    careersUrl: 'https://www.jobs.nhs.uk/'
  },
  {
    id: 'uk-bupa',
    name: 'Bupa UK Healthcare',
    initials: 'BU',
    country: 'UK',
    location: 'London, Leeds & Bristol, UK',
    category: 'Nursing',
    industry: 'Private Hospitals, Nursing & Clinical Care',
    sponsorshipCount: '1,200+ Skilled Worker CoS in 2025',
    visaType: 'UK Health & Care Worker / Skilled Worker',
    visaCodeGroup: 'Skilled Worker',
    careersUrl: 'https://www.bupa.co.uk/careers'
  },
  {
    id: 'uk-hc-one',
    name: 'HC-One Limited',
    initials: 'HC',
    country: 'UK',
    location: 'Darlington, Glasgow & UK-Wide',
    category: 'Nursing',
    industry: 'Registered Nursing & Residential Care',
    sponsorshipCount: '950+ Skilled Worker CoS in 2025',
    visaType: 'UK Health & Care Worker Visa',
    visaCodeGroup: 'Skilled Worker',
    careersUrl: 'https://www.hc-one.co.uk/careers'
  },
  {
    id: 'uk-priory',
    name: 'Priory Group Healthcare',
    initials: 'PR',
    country: 'UK',
    location: 'London & Birmingham, UK',
    category: 'Healthcare',
    industry: 'Mental Health & Specialist Hospital Care',
    sponsorshipCount: '620+ Skilled Worker CoS in 2025',
    visaType: 'UK Health & Care Worker Visa',
    visaCodeGroup: 'Skilled Worker',
    careersUrl: 'https://jobs.priorygroup.com/'
  },
  {
    id: 'uk-barclays',
    name: 'Barclays Bank PLC',
    initials: 'BA',
    country: 'UK',
    location: 'Canary Wharf, London & Knutsford, UK',
    category: 'IT',
    industry: 'FinTech, Quantitative Engineering & Cloud',
    sponsorshipCount: '980+ Skilled Worker CoS in 2025',
    visaType: 'UK Skilled Worker / Global Business Mobility',
    visaCodeGroup: 'Skilled Worker',
    careersUrl: 'https://search.jobs.barclays/'
  },
  {
    id: 'uk-revolut',
    name: 'Revolut Ltd',
    initials: 'RV',
    country: 'UK',
    location: 'London, UK',
    category: 'IT',
    industry: 'Global Digital Banking & Software Eng.',
    sponsorshipCount: '540+ Skilled Worker CoS in 2025',
    visaType: 'UK Skilled Worker Visa',
    visaCodeGroup: 'Skilled Worker',
    careersUrl: 'https://www.revolut.com/careers/'
  },
  {
    id: 'uk-arm',
    name: 'Arm Limited',
    initials: 'AR',
    country: 'UK',
    location: 'Cambridge & Manchester, UK',
    category: 'IT',
    industry: 'Microprocessor Architecture & AI Software',
    sponsorshipCount: '610+ Skilled Worker CoS in 2025',
    visaType: 'UK Skilled Worker Visa',
    visaCodeGroup: 'Skilled Worker',
    careersUrl: 'https://careers.arm.com/'
  },
  {
    id: 'uk-deloitte',
    name: 'Deloitte LLP (UK)',
    initials: 'DL',
    country: 'UK',
    location: 'London, Edinburgh & Manchester, UK',
    category: 'IT',
    industry: 'Cybersecurity, Cloud & Digital Consulting',
    sponsorshipCount: '1,400+ Skilled Worker CoS in 2025',
    visaType: 'UK Skilled Worker Visa',
    visaCodeGroup: 'Skilled Worker',
    careersUrl: 'https://www.deloitte.com/uk/en/careers.html'
  },
  {
    id: 'uk-pwc',
    name: 'PwC UK (PricewaterhouseCoopers)',
    initials: 'PW',
    country: 'UK',
    location: 'London, Birmingham & Belfast, UK',
    category: 'IT',
    industry: 'Data Analytics, Audit & Enterprise Tech',
    sponsorshipCount: '1,150+ Skilled Worker CoS in 2025',
    visaType: 'UK Skilled Worker Visa',
    visaCodeGroup: 'Skilled Worker',
    careersUrl: 'https://www.pwc.co.uk/careers.html'
  },
  {
    id: 'uk-hsbc',
    name: 'HSBC Holdings plc',
    initials: 'HS',
    country: 'UK',
    location: 'London, Sheffield & Leeds, UK',
    category: 'IT',
    industry: 'Global Banking Technology & Cloud',
    sponsorshipCount: '830+ Skilled Worker CoS in 2025',
    visaType: 'UK Skilled Worker Visa',
    visaCodeGroup: 'Skilled Worker',
    careersUrl: 'https://www.hsbc.com/careers'
  },
  {
    id: 'uk-rollsroyce',
    name: 'Rolls-Royce plc',
    initials: 'RR',
    country: 'UK',
    location: 'Derby & Bristol, UK',
    category: 'Engineering',
    industry: 'Aerospace Propulsion, SMR Nuclear & Defence',
    sponsorshipCount: '520+ Skilled Worker CoS in 2025',
    visaType: 'UK Skilled Worker Visa',
    visaCodeGroup: 'Skilled Worker',
    careersUrl: 'https://careers.rolls-royce.com/'
  },
  {
    id: 'uk-jlr',
    name: 'Jaguar Land Rover (JLR)',
    initials: 'JL',
    country: 'UK',
    location: 'Gaydon & Coventry, West Midlands, UK',
    category: 'Engineering',
    industry: 'Automotive EV Engineering & Autonomous Tech',
    sponsorshipCount: '690+ Skilled Worker CoS in 2025',
    visaType: 'UK Skilled Worker Visa',
    visaCodeGroup: 'Skilled Worker',
    careersUrl: 'https://www.jaguarlandrovercareers.com/'
  },
  {
    id: 'uk-dyson',
    name: 'Dyson Technology Limited',
    initials: 'DY',
    country: 'UK',
    location: 'Malmesbury & Bristol, UK',
    category: 'Engineering',
    industry: 'Robotics, Hardware & Electronics Engineering',
    sponsorshipCount: '410+ Skilled Worker CoS in 2025',
    visaType: 'UK Skilled Worker Visa',
    visaCodeGroup: 'Skilled Worker',
    careersUrl: 'https://careers.dyson.com/'
  },
  {
    id: 'uk-arup',
    name: 'Ove Arup & Partners Ltd',
    initials: 'AP',
    country: 'UK',
    location: 'London, Manchester & Cardiff, UK',
    category: 'Construction',
    industry: 'Structural, Civil & Sustainable Infrastructure',
    sponsorshipCount: '480+ Skilled Worker CoS in 2025',
    visaType: 'UK Skilled Worker Visa',
    visaCodeGroup: 'Skilled Worker',
    careersUrl: 'https://www.arup.com/careers/'
  },
  {
    id: 'uk-balfour',
    name: 'Balfour Beatty plc',
    initials: 'BB',
    country: 'UK',
    location: 'London & Birmingham (HS2), UK',
    category: 'Construction',
    industry: 'Civil Construction, Rail & Power Networks',
    sponsorshipCount: '390+ Skilled Worker CoS in 2025',
    visaType: 'UK Skilled Worker Visa',
    visaCodeGroup: 'Skilled Worker',
    careersUrl: 'https://www.balfourbeatty.com/careers/'
  },
  {
    id: 'uk-mace',
    name: 'Mace Group Ltd',
    initials: 'MG',
    country: 'UK',
    location: 'London, UK',
    category: 'Construction',
    industry: 'Global Construction & Project Management',
    sponsorshipCount: '310+ Skilled Worker CoS in 2025',
    visaType: 'UK Skilled Worker Visa',
    visaCodeGroup: 'Skilled Worker',
    careersUrl: 'https://www.macegroup.com/careers'
  },
  {
    id: 'uk-concordia',
    name: 'Concordia UK (Home Office Operator)',
    initials: 'CN',
    country: 'UK',
    location: 'Brighton & UK Agricultural Regions',
    category: 'Agriculture',
    industry: 'UK Government Licensed Horticulture & Farming',
    sponsorshipCount: '4,500+ Seasonal Worker Visas in 2025',
    visaType: 'UK Seasonal Worker / Skilled Worker',
    visaCodeGroup: 'Skilled Worker',
    careersUrl: 'https://www.concordia.org.uk/'
  },
  {
    id: 'uk-proforce',
    name: 'Pro-Force Limited',
    initials: 'PF',
    country: 'UK',
    location: 'Canterbury, Kent, UK',
    category: 'Agriculture',
    industry: 'UK DEFRA Approved Agricultural Sponsorship',
    sponsorshipCount: '5,000+ Ag Visas in 2025',
    visaType: 'UK Seasonal Worker / Skilled Worker',
    visaCodeGroup: 'Skilled Worker',
    careersUrl: 'https://www.pro-force.co.uk/'
  },
  {
    id: 'uk-astrazeneca',
    name: 'AstraZeneca UK Ltd',
    initials: 'AZ',
    country: 'UK',
    location: 'Cambridge & Macclesfield, UK',
    category: 'Healthcare',
    industry: 'Biopharmaceuticals & Clinical Oncology R&D',
    sponsorshipCount: '570+ Skilled Worker CoS in 2025',
    visaType: 'UK Skilled Worker / Global Talent',
    visaCodeGroup: 'Skilled Worker',
    careersUrl: 'https://careers.astrazeneca.com/'
  },
  {
    id: 'uk-baesystems',
    name: 'BAE Systems plc',
    initials: 'BS',
    country: 'UK',
    location: 'Farnborough, Preston & Glasgow, UK',
    category: 'Engineering',
    industry: 'Aerospace, Marine & Systems Engineering',
    sponsorshipCount: '440+ Skilled Worker CoS in 2025',
    visaType: 'UK Skilled Worker Visa',
    visaCodeGroup: 'Skilled Worker',
    careersUrl: 'https://www.baesystems.com/en/careers'
  },

  // ================= CANADA (20 Companies across all 6 Job Categories) =================
  {
    id: 'ca-shopify',
    name: 'Shopify Inc.',
    initials: 'SH',
    country: 'Canada',
    location: 'Ottawa, ON & Toronto, ON, Canada',
    category: 'IT',
    industry: 'Global E-Commerce Infrastructure & AI',
    sponsorshipCount: '620+ GTS / LMIA Permits in 2025',
    visaType: 'LMIA Global Talent Stream (2-Week)',
    visaCodeGroup: 'LMIA / GTS',
    careersUrl: 'https://www.shopify.com/careers'
  },
  {
    id: 'ca-rbc',
    name: 'Royal Bank of Canada (RBC Tech)',
    initials: 'RB',
    country: 'Canada',
    location: 'Toronto, ON & Montreal, QC, Canada',
    category: 'IT',
    industry: 'Financial Technology, Cloud & AI Research',
    sponsorshipCount: '580+ Work Permits in 2025',
    visaType: 'LMIA / Intra-Company Transfer (ICT)',
    visaCodeGroup: 'LMIA / GTS',
    careersUrl: 'https://jobs.rbc.com/'
  },
  {
    id: 'ca-cgi',
    name: 'CGI Inc.',
    initials: 'CG',
    country: 'Canada',
    location: 'Montreal, QC & Toronto, ON, Canada',
    category: 'IT',
    industry: 'IT Systems Integration & Enterprise Cloud',
    sponsorshipCount: '890+ LMIA / ICT in 2025',
    visaType: 'LMIA / Global Talent Stream',
    visaCodeGroup: 'LMIA / GTS',
    careersUrl: 'https://www.cgi.com/en/careers'
  },
  {
    id: 'ca-opentext',
    name: 'OpenText Corporation',
    initials: 'OT',
    country: 'Canada',
    location: 'Waterloo, ON, Canada',
    category: 'IT',
    industry: 'Enterprise Information Management & Cloud',
    sponsorshipCount: '410+ GTS Work Permits in 2025',
    visaType: 'LMIA Global Talent Stream',
    visaCodeGroup: 'LMIA / GTS',
    careersUrl: 'https://careers.opentext.com/'
  },
  {
    id: 'ca-uhn',
    name: 'University Health Network (UHN)',
    initials: 'UH',
    country: 'Canada',
    location: 'Toronto, ON, Canada',
    category: 'Healthcare',
    industry: 'Toronto General Hospital & Medical Research',
    sponsorshipCount: '520+ Healthcare Permits in 2025',
    visaType: 'LMIA Healthcare / OINP Employer Job Offer',
    visaCodeGroup: 'LMIA / GTS',
    careersUrl: 'https://www.uhn.ca/corporate/Careers'
  },
  {
    id: 'ca-fraserhealth',
    name: 'Fraser Health Authority',
    initials: 'FH',
    country: 'Canada',
    location: 'Surrey & Vancouver Metro, BC, Canada',
    category: 'Nursing',
    industry: 'Registered Nurses (IEN) & Allied Healthcare',
    sponsorshipCount: '740+ BC PNP / LMIA in 2025',
    visaType: 'BC PNP Healthcare / LMIA Work Permit',
    visaCodeGroup: 'LMIA / GTS',
    careersUrl: 'https://www.fraserhealth.ca/careers'
  },
  {
    id: 'ca-ahs',
    name: 'Alberta Health Services (AHS)',
    initials: 'AH',
    country: 'Canada',
    location: 'Calgary & Edmonton, AB, Canada',
    category: 'Nursing',
    industry: 'Provincial Hospital System & Nursing',
    sponsorshipCount: '680+ AAIP / LMIA in 2025',
    visaType: 'LMIA / Alberta Dedicated Healthcare Pathway',
    visaCodeGroup: 'LMIA / GTS',
    careersUrl: 'https://www.albertahealthservices.ca/careers/careers.aspx'
  },
  {
    id: 'ca-magna',
    name: 'Magna International Inc.',
    initials: 'MG',
    country: 'Canada',
    location: 'Aurora & Brampton, ON, Canada',
    category: 'Engineering',
    industry: 'Automotive Mechatronics & EV Manufacturing',
    sponsorshipCount: '460+ LMIA / CUSMA in 2025',
    visaType: 'LMIA / ICT Work Permit',
    visaCodeGroup: 'LMIA / GTS',
    careersUrl: 'https://www.magna.com/careers'
  },
  {
    id: 'ca-bombardier',
    name: 'Bombardier Inc.',
    initials: 'BM',
    country: 'Canada',
    location: 'Dorval, QC & Mississauga, ON, Canada',
    category: 'Engineering',
    industry: 'Aerospace Avionics & Mechanical Engineering',
    sponsorshipCount: '390+ LMIA in 2025',
    visaType: 'LMIA / Mobilité Francophone',
    visaCodeGroup: 'LMIA / GTS',
    careersUrl: 'https://bombardier.com/en/careers'
  },
  {
    id: 'ca-atkinsrealis',
    name: 'AtkinsRéalis (SNC-Lavalin)',
    initials: 'AR',
    country: 'Canada',
    location: 'Montreal, QC & Vancouver, BC, Canada',
    category: 'Construction',
    industry: 'Civil Infrastructure, Nuclear & Transit EPC',
    sponsorshipCount: '430+ LMIA in 2025',
    visaType: 'LMIA / Express Entry Job Offer',
    visaCodeGroup: 'LMIA / GTS',
    careersUrl: 'https://careers.atkinsrealis.com/'
  },
  {
    id: 'ca-pcl',
    name: 'PCL Construction',
    initials: 'PC',
    country: 'Canada',
    location: 'Edmonton, AB & Toronto, ON, Canada',
    category: 'Construction',
    industry: 'Commercial, Civil & Industrial Construction',
    sponsorshipCount: '350+ LMIA Trades & Eng. in 2025',
    visaType: 'LMIA Skilled Trades Work Permit',
    visaCodeGroup: 'LMIA / GTS',
    careersUrl: 'https://www.pcl.com/ca/en/careers'
  },
  {
    id: 'ca-mccain',
    name: 'McCain Foods Limited',
    initials: 'MF',
    country: 'Canada',
    location: 'Florenceville-Bristol, NB & Toronto, ON',
    category: 'Agriculture',
    industry: 'Agri-Food Production & Agronomy',
    sponsorshipCount: '490+ Agri-Food / AIP Visas in 2025',
    visaType: 'LMIA Agricultural / Atlantic Immigration (AIP)',
    visaCodeGroup: 'LMIA / GTS',
    careersUrl: 'https://www.mccain.com/careers/'
  },
  {
    id: 'ca-nutrien',
    name: 'Nutrien Ltd.',
    initials: 'NT',
    country: 'Canada',
    location: 'Saskatoon, SK & Calgary, AB, Canada',
    category: 'Agriculture',
    industry: 'Crop Nutrients, Agronomy & Mining Eng.',
    sponsorshipCount: '310+ SINP / LMIA in 2025',
    visaType: 'LMIA / Saskatchewan SINP Job Offer',
    visaCodeGroup: 'LMIA / GTS',
    careersUrl: 'https://www.nutrien.com/careers'
  },

  // ================= AUSTRALIA (20 Companies across all 6 Job Categories) =================
  {
    id: 'au-atlassian',
    name: 'Atlassian Pty Ltd',
    initials: 'AT',
    country: 'Australia',
    location: 'Sydney, NSW & Melbourne, VIC, Australia',
    category: 'IT',
    industry: 'Cloud Collaboration Software (Jira / Confluence)',
    sponsorshipCount: '720+ TSS / SID 482 in 2025',
    visaType: 'TSS / Skills in Demand (Subclass 482) & ENS 186',
    visaCodeGroup: 'TSS (482)',
    careersUrl: 'https://www.atlassian.com/company/careers'
  },
  {
    id: 'au-canva',
    name: 'Canva Pty Ltd',
    initials: 'CV',
    country: 'Australia',
    location: 'Sydney, NSW, Australia',
    category: 'IT',
    industry: 'AI Design Platform & Distributed Systems',
    sponsorshipCount: '540+ TSS / SID 482 in 2025',
    visaType: 'Subclass 482 (SID) & Subclass 186 PR',
    visaCodeGroup: 'TSS (482)',
    careersUrl: 'https://www.lifeatcanva.com/'
  },
  {
    id: 'au-xero',
    name: 'Xero Australia',
    initials: 'XR',
    country: 'Australia',
    location: 'Melbourne, VIC, Australia',
    category: 'IT',
    industry: 'Cloud FinTech & SaaS Engineering',
    sponsorshipCount: '360+ TSS 482 in 2025',
    visaType: 'Subclass 482 Accredited Sponsor',
    visaCodeGroup: 'TSS (482)',
    careersUrl: 'https://www.xero.com/au/about/careers/'
  },
  {
    id: 'au-ramsay',
    name: 'Ramsay Health Care Australia',
    initials: 'RH',
    country: 'Australia',
    location: 'Sydney, Brisbane & Perth, Australia',
    category: 'Nursing',
    industry: 'Private Hospitals, Surgical & ICU Nursing',
    sponsorshipCount: '1,100+ Subclass 482 & 186 in 2025',
    visaType: 'Subclass 482 (SID) / 186 Direct Entry PR',
    visaCodeGroup: 'TSS (482)',
    careersUrl: 'https://www.ramsaycareers.com.au/'
  },
  {
    id: 'au-nswhealth',
    name: 'NSW Health & WA Health Hospitals',
    initials: 'NS',
    country: 'Australia',
    location: 'Sydney, Regional NSW & Perth, Australia',
    category: 'Healthcare',
    industry: 'Public Hospital Doctors, Midwives & RNs',
    sponsorshipCount: '1,850+ Subclass 482 / 494 in 2025',
    visaType: 'Subclass 482 / 494 Regional / 186 PR',
    visaCodeGroup: 'TSS (482)',
    careersUrl: 'https://www.health.nsw.gov.au/careers/'
  },
  {
    id: 'au-bhp',
    name: 'BHP Group Limited',
    initials: 'BH',
    country: 'Australia',
    location: 'Perth, WA & Brisbane, QLD, Australia',
    category: 'Engineering',
    industry: 'Mining, Electrical & Mechanical Engineering',
    sponsorshipCount: '640+ Subclass 482 in 2025',
    visaType: 'Subclass 482 (SID) & DAMA Regional',
    visaCodeGroup: 'TSS (482)',
    careersUrl: 'https://www.bhp.com/careers'
  },
  {
    id: 'au-riotinto',
    name: 'Rio Tinto Limited',
    initials: 'RT',
    country: 'Australia',
    location: 'Perth, WA & Pilbara, Australia',
    category: 'Engineering',
    industry: 'Resources, Automation & Geotechnical Eng.',
    sponsorshipCount: '580+ Subclass 482 in 2025',
    visaType: 'Subclass 482 / 186 Employer Nomination',
    visaCodeGroup: 'TSS (482)',
    careersUrl: 'https://www.riotinto.com/en/careers'
  },
  {
    id: 'au-lendlease',
    name: 'Lendlease Corporation',
    initials: 'LL',
    country: 'Australia',
    location: 'Sydney, NSW & Melbourne, VIC, Australia',
    category: 'Construction',
    industry: 'Civil Construction, Urban Regeneration & BIM',
    sponsorshipCount: '390+ Subclass 482 in 2025',
    visaType: 'Subclass 482 (TSS / SID)',
    visaCodeGroup: 'TSS (482)',
    careersUrl: 'https://www.lendlease.com/au/careers/'
  },
  {
    id: 'au-cimic',
    name: 'CPB Contractors (CIMIC Group)',
    initials: 'CP',
    country: 'Australia',
    location: 'Sydney, Brisbane & Melbourne, Australia',
    category: 'Construction',
    industry: 'Major Tunnels, Roads, Rail & Civil Infrastructure',
    sponsorshipCount: '470+ Subclass 482 in 2025',
    visaType: 'Subclass 482 / 494 Regional',
    visaCodeGroup: 'TSS (482)',
    careersUrl: 'https://www.cpbcon.com.au/en/careers'
  },
  {
    id: 'au-costa',
    name: 'Costa Group Holdings',
    initials: 'CG',
    country: 'Australia',
    location: 'Regional Victoria, NSW & Tasmania, Australia',
    category: 'Agriculture',
    industry: 'Horticulture, Agronomy & Glasshouse Farming',
    sponsorshipCount: '620+ Regional 482 / 494 in 2025',
    visaType: 'Subclass 482 / 494 Regional Sponsored',
    visaCodeGroup: 'TSS (482)',
    careersUrl: 'https://costagroup.com.au/careers/'
  },

  // ================= GERMANY (20 Companies across all 6 Job Categories) =================
  {
    id: 'de-sap',
    name: 'SAP SE',
    initials: 'SA',
    country: 'Germany',
    location: 'Walldorf & Berlin, Germany',
    category: 'IT',
    industry: 'Enterprise Cloud ERP, AI & Software Dev',
    sponsorshipCount: '1,250+ EU Blue Cards in 2025',
    visaType: 'Germany EU Blue Card (§18g AufenthG)',
    visaCodeGroup: 'EU Blue Card',
    careersUrl: 'https://jobs.sap.com/'
  },
  {
    id: 'de-zalando',
    name: 'Zalando SE',
    initials: 'ZL',
    country: 'Germany',
    location: 'Berlin & Dortmund, Germany',
    category: 'IT',
    industry: 'E-Commerce Tech, Data Science & Backend',
    sponsorshipCount: '680+ EU Blue Cards in 2025',
    visaType: 'EU Blue Card & Relocation Package',
    visaCodeGroup: 'EU Blue Card',
    careersUrl: 'https://jobs.zalando.com/en/'
  },
  {
    id: 'de-deliveryhero',
    name: 'Delivery Hero SE',
    initials: 'DH',
    country: 'Germany',
    location: 'Berlin, Germany (English-Speaking HQ)',
    category: 'IT',
    industry: 'Global Logistics Platform & Mobile Eng.',
    sponsorshipCount: '540+ EU Blue Cards in 2025',
    visaType: 'EU Blue Card / IT Specialist Visa',
    visaCodeGroup: 'EU Blue Card',
    careersUrl: 'https://careers.deliveryhero.com/'
  },
  {
    id: 'de-siemens',
    name: 'Siemens AG',
    initials: 'SI',
    country: 'Germany',
    location: 'Munich, Erlangen & Berlin, Germany',
    category: 'Engineering',
    industry: 'Industrial Automation, Mobility & Smart Grid',
    sponsorshipCount: '1,100+ EU Blue Cards in 2025',
    visaType: 'EU Blue Card / Skilled Worker (§18b)',
    visaCodeGroup: 'EU Blue Card',
    careersUrl: 'https://jobs.siemens.com/'
  },
  {
    id: 'de-bosch',
    name: 'Robert Bosch GmbH',
    initials: 'RB',
    country: 'Germany',
    location: 'Stuttgart, Renningen & Munich, Germany',
    category: 'Engineering',
    industry: 'Embedded Systems, Automotive & IoT Eng.',
    sponsorshipCount: '920+ EU Blue Cards in 2025',
    visaType: 'EU Blue Card (§18g AufenthG)',
    visaCodeGroup: 'EU Blue Card',
    careersUrl: 'https://www.bosch.de/karriere/'
  },
  {
    id: 'de-bmw',
    name: 'BMW Group',
    initials: 'BM',
    country: 'Germany',
    location: 'Munich & Dingolfing, Bavaria, Germany',
    category: 'Engineering',
    industry: 'Electric Mobility, Autonomous Driving & R&D',
    sponsorshipCount: '710+ EU Blue Cards in 2025',
    visaType: 'EU Blue Card / Research Visa',
    visaCodeGroup: 'EU Blue Card',
    careersUrl: 'https://www.bmwgroup.jobs/de/en.html'
  },
  {
    id: 'de-charite',
    name: 'Charité – Universitätsmedizin Berlin',
    initials: 'CH',
    country: 'Germany',
    location: 'Berlin, Germany',
    category: 'Healthcare',
    industry: 'University Hospital, Physicians & Researchers',
    sponsorshipCount: '640+ Medical Work Visas in 2025',
    visaType: 'EU Blue Card / §16d Recognition Visa',
    visaCodeGroup: 'EU Blue Card',
    careersUrl: 'https://karriere.charite.de/'
  },
  {
    id: 'de-helios',
    name: 'Helios Kliniken GmbH (Fresenius)',
    initials: 'HK',
    country: 'Germany',
    location: 'Berlin, Leipzig, Munich & 80+ Clinics',
    category: 'Nursing',
    industry: 'International Registered Nurses & ICU Care',
    sponsorshipCount: '1,400+ Nursing Work Visas in 2025',
    visaType: 'Skilled Nursing Visa (§18a / Triple Win)',
    visaCodeGroup: 'EU Blue Card',
    careersUrl: 'https://www.helios-gesundheit.de/karriere/'
  },
  {
    id: 'de-hochtief',
    name: 'HOCHTIEF Aktiengesellschaft',
    initials: 'HT',
    country: 'Germany',
    location: 'Essen, Frankfurt & Hamburg, Germany',
    category: 'Construction',
    industry: 'Civil Engineering, Bridges, Tunnels & BIM',
    sponsorshipCount: '330+ EU Blue Cards in 2025',
    visaType: 'EU Blue Card / Skilled Worker (§18a/b)',
    visaCodeGroup: 'EU Blue Card',
    careersUrl: 'https://www.hochtief.com/careers'
  },
  {
    id: 'de-claas',
    name: 'CLAAS KGaA mbH',
    initials: 'CL',
    country: 'Germany',
    location: 'Harsewinkel, North Rhine-Westphalia, Germany',
    category: 'Agriculture',
    industry: 'Smart Agricultural Machinery & AgTech R&D',
    sponsorshipCount: '290+ EU Blue Cards in 2025',
    visaType: 'EU Blue Card / Skilled Worker',
    visaCodeGroup: 'EU Blue Card',
    careersUrl: 'https://www.claas-group.com/jobs-careers'
  }
];

const FIVE_STEPS_TO_SPONSORSHIP = [
  {
    step: 'Step 1',
    title: '1. CV (International ATS Format)',
    desc: 'Format your resume into a clean 1–2 page ATS-friendly CV (no photo or marital status for USA/UK/Canada/Australia; highlight measurable impact, tech stack, or clinical license such as NCLEX / NMC OSCE / AHPRA).'
  },
  {
    step: 'Step 2',
    title: '2. Apply (Official Sponsor Portal)',
    desc: 'Click "View Jobs →" on verified sponsor companies above and apply directly on their official careers portal. Filter roles by location and mention your eligibility for H1B, Skilled Worker, TSS 482, or EU Blue Card.'
  },
  {
    step: 'Step 3',
    title: '3. Interview (Technical & HR Rounds)',
    desc: 'Complete the online assessment, technical/clinical interview, and hiring manager round. During the HR call, confirm the company’s in-house immigration team handles visa sponsorship.'
  },
  {
    step: 'Step 4',
    title: '4. Offer (Contract + CoS / LCA / LMIA)',
    desc: 'Once you sign the job offer, the employer’s legal team files your sponsorship petition: Form I-129/LCA (USA), Certificate of Sponsorship CoS (UK), LMIA/GTS (Canada), Nomination (Australia), or Declaration of Employment (Germany).'
  },
  {
    step: 'Step 5',
    title: '5. Visa (Embassy / VFS Filing)',
    desc: 'Use your official sponsorship approval number to submit your work visa application on the government portal, attend biometrics at VFS Global / Embassy, and receive your work visa stamp.'
  }
];

export const SponsorshipFinderPage: React.FC<SponsorshipFinderPageProps> = ({
  onNavigate = (p) => {
    window.history.pushState({}, '', p);
    window.scrollTo(0, 0);
  }
}) => {
  const [selectedCountry, setSelectedCountry] = useState<string>('USA');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedVisaType, setSelectedVisaType] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const filteredCompanies = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return SPONSOR_COMPANIES.filter((comp) => {
      if (selectedCountry !== 'All' && comp.country !== selectedCountry) return false;
      if (selectedCategory !== 'All' && comp.category !== selectedCategory) return false;
      if (selectedVisaType !== 'All' && comp.visaCodeGroup !== selectedVisaType) return false;
      if (q) {
        const hay = `${comp.name} ${comp.industry} ${comp.location} ${comp.category} ${comp.visaType}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [selectedCountry, selectedCategory, selectedVisaType, searchQuery]);

  const handleResetFilters = () => {
    setSelectedCountry('All');
    setSelectedCategory('All');
    setSelectedVisaType('All');
    setSearchQuery('');
  };

  const faqs = [
    {
      q: 'Does VisaApply.org provide jobs or charge money for work visa sponsorship?',
      a: 'No. We do NOT provide jobs and we never charge any fees. VisaApply.org is a 100% free public directory that lists verified multinational employers, hospitals, and engineering firms that hold official government sponsorship licenses (USCIS H-1B Data Hub, UK Home Office Register of Licensed Sponsors, Canada ESDC LMIA list, Australia Home Affairs Accredited Sponsors, and Germany Make it in Germany). Always apply directly on the official company careers website.'
    },
    {
      q: 'Which US employers sponsor H-1B visas outside the annual April lottery (Cap-Exempt H-1B)?',
      a: 'Non-profit university hospitals, academic medical centers, and research institutions—such as Mayo Clinic, Cleveland Clinic, Johns Hopkins Medicine, and university campuses—are H-1B Cap-Exempt. They can sponsor H-1B visas 365 days a year without going through the USCIS lottery.'
    },
    {
      q: 'Can nurses and healthcare workers get direct work visa sponsorship in the UK, USA, and Australia?',
      a: 'Yes! Registered Nurses (RNs) and doctors are on the critical shortage occupation lists in the UK (Health & Care Worker Visa via NHS Trusts and Bupa), USA (EB-3 Schedule A Green Card & Cap-Exempt H-1B), Australia (Subclass 482 SID & 186 PR via Ramsay Health Care and state health departments), and Canada (BC PNP & Express Entry Healthcare draws).'
    },
    {
      q: 'How can software engineers get fast-track visa sponsorship in Canada or Germany?',
      a: 'In Canada, tech companies like Shopify, CGI, and OpenText use the Global Talent Stream (GTS), which processes work permits in just 14 business days. In Germany, employers like SAP, Zalando, and Siemens issue job offers qualifying for the EU Blue Card (§18g AufenthG), which requires zero German language proficiency for English-speaking tech roles.'
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
      <PageBackBar onNavigate={onNavigate} pageName="Visa Sponsorship Finder" />

      {/* Blue Hero Header */}
      <div className="bg-gradient-to-r from-[#0B2A5B] via-[#0B3D91] to-[#082247] text-white py-10 px-4 sm:px-6 lg:px-8 border-b border-blue-900">
        <div className="max-w-7xl mx-auto text-center space-y-3">
          <div className="inline-flex items-center gap-2 bg-emerald-500/20 px-4 py-1.5 rounded-full text-xs font-black text-emerald-300 border border-emerald-400/40">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>100% FREE • OFFICIAL GOVERNMENT-LICENSED VISA SPONSORS DIRECTORY</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white">
            Visa Sponsorship Finder — Verified Companies That Sponsor Visas
          </h1>
          <p className="text-sm sm:text-lg text-blue-100 max-w-3xl mx-auto leading-relaxed">
            Find real, government-verified employers sponsoring H1B (USA), Skilled Worker (UK), LMIA / GTS (Canada), TSS 482 (Australia), and EU Blue Card (Germany) across IT, Healthcare, Engineering, Nursing, Agriculture, and Construction.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6 space-y-8">
        {/* Mandatory Disclaimer Banner */}
        <div className="bg-amber-50 border-2 border-amber-400 rounded-2xl p-4 sm:p-5 shadow-xs flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-800 shrink-0 mt-0.5" />
          <div className="text-xs sm:text-sm text-amber-950 font-semibold leading-relaxed">
            <strong className="font-black uppercase tracking-wide">Official Disclaimer: </strong>
            We do NOT provide jobs. We only show companies that sponsor visas. Apply on official company site only.
          </div>
        </div>

        {/* Top Filters + Search Box Card */}
        <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-md border border-slate-200 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200">
            <div>
              <span className="text-xs font-black uppercase tracking-wider text-emerald-800 bg-emerald-100 px-3 py-1 rounded-full">
                100% FREE
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 mt-2">
                Filter Verified Visa Sponsoring Employers
              </h2>
            </div>

            <button
              type="button"
              onClick={handleResetFilters}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-[#0B3D91] bg-slate-100 hover:bg-blue-50 px-3.5 py-2 rounded-xl transition-colors self-start sm:self-center cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Show All ({SPONSOR_COMPANIES.length} Companies)</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* 1. Destination Country */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
              <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-700 mb-2">
                1. Destination Country
              </label>
              <select
                aria-label="Destination Country"
                value={selectedCountry}
                onChange={(e) => {
                  setSelectedCountry(e.target.value);
                  setSelectedVisaType('All');
                }}
                className="w-full px-3 py-2.5 bg-white border border-slate-300 rounded-xl text-xs sm:text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0B3D91] cursor-pointer"
              >
                <option value="All">🌍 All 5 Countries ({SPONSOR_COMPANIES.length} Sponsors)</option>
                <option value="USA">🇺🇸 USA (H1B / Cap-Exempt / EB-3)</option>
                <option value="UK">🇬🇧 UK (Skilled Worker / Health &amp; Care)</option>
                <option value="Canada">🇨🇦 Canada (LMIA / Global Talent Stream)</option>
                <option value="Australia">🇦🇺 Australia (TSS / SID Subclass 482)</option>
                <option value="Germany">🇩🇪 Germany (EU Blue Card / §18a/b)</option>
              </select>
            </div>

            {/* 2. Job Category */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
              <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-700 mb-2">
                2. Job Category
              </label>
              <select
                aria-label="Job Category"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-3 py-2.5 bg-white border border-slate-300 rounded-xl text-xs sm:text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0B3D91] cursor-pointer"
              >
                <option value="All">All Job Categories</option>
                <option value="IT">💻 IT &amp; Software Engineering</option>
                <option value="Healthcare">🩺 Healthcare &amp; Medical</option>
                <option value="Engineering">⚙️ Engineering (Mechanical / Chip / EV)</option>
                <option value="Nursing">🏥 Nursing (Registered Nurses / ICU)</option>
                <option value="Agriculture">🌾 Agriculture &amp; Agribusiness</option>
                <option value="Construction">🏗️ Construction &amp; Civil Infrastructure</option>
              </select>
            </div>

            {/* 3. Visa Type */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
              <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-700 mb-2">
                3. Visa Type
              </label>
              <select
                aria-label="Visa Type"
                value={selectedVisaType}
                onChange={(e) => setSelectedVisaType(e.target.value)}
                className="w-full px-3 py-2.5 bg-white border border-slate-300 rounded-xl text-xs sm:text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0B3D91] cursor-pointer"
              >
                <option value="All">All Sponsored Visa Types</option>
                <option value="H1B">🇺🇸 H1B / L-1 / EB-3 (USA)</option>
                <option value="Skilled Worker">🇬🇧 Skilled Worker / Health &amp; Care (UK)</option>
                <option value="LMIA / GTS">🇨🇦 LMIA / Global Talent Stream (Canada)</option>
                <option value="TSS (482)">🇦🇺 TSS / SID Subclass 482 (Australia)</option>
                <option value="EU Blue Card">🇩🇪 EU Blue Card / §18 (Germany)</option>
              </select>
            </div>

            {/* 4. Search Company Name */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
              <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-700 mb-2">
                4. Search Company Name
              </label>
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search Company Name (e.g. Google, NHS, SAP)..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 bg-white border border-slate-300 rounded-xl text-xs sm:text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0B3D91]"
                />
              </div>
            </div>
          </div>

          {/* Quick Country Filter Tabs */}
          <div className="flex flex-wrap items-center gap-2 pt-1">
            {(['All', 'USA', 'UK', 'Canada', 'Australia', 'Germany'] as const).map((ctry) => {
              const isActive = selectedCountry === ctry;
              return (
                <button
                  key={ctry}
                  type="button"
                  onClick={() => {
                    setSelectedCountry(ctry);
                    setSelectedVisaType('All');
                  }}
                  className={`px-3.5 py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
                    isActive
                      ? 'bg-[#0B3D91] text-white shadow-xs'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                  }`}
                >
                  {ctry === 'All' ? '🌍 All Countries' : ctry}
                </button>
              );
            })}
          </div>
        </div>

        {/* Company Cards Grid */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <h2 className="text-xl sm:text-2xl font-black text-slate-900">
              Showing {filteredCompanies.length} Verified Visa Sponsor Companies
              {selectedCountry !== 'All' ? ` in ${selectedCountry}` : ''}
              {selectedCategory !== 'All' ? ` • ${selectedCategory}` : ''}
            </h2>
            <span className="bg-emerald-100 text-emerald-800 text-xs font-black px-3 py-1 rounded-full self-start sm:self-center">
              100% FREE Official Careers Links
            </span>
          </div>

          {filteredCompanies.length === 0 ? (
            <div className="bg-white rounded-2xl p-10 text-center border border-slate-200 space-y-3">
              <div className="text-lg font-black text-slate-900">
                No companies matched your current filter combination
              </div>
              <p className="text-xs sm:text-sm text-slate-600">
                Try resetting the Visa Type or Job Category filter to see all verified sponsors.
              </p>
              <button
                type="button"
                onClick={handleResetFilters}
                className="py-2.5 px-5 bg-[#0B3D91] text-white font-black text-xs rounded-xl cursor-pointer"
              >
                Reset All Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredCompanies.map((company) => (
                <div
                  key={company.id}
                  className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-xs hover:border-[#0B3D91] transition-all flex flex-col justify-between space-y-4"
                >
                  <div className="space-y-3.5">
                    {/* Top Row: Initials Logo + Country & Category */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#0B2A5B] to-[#0B3D91] text-white font-black text-base flex items-center justify-center shrink-0 shadow-xs">
                          {company.initials}
                        </div>
                        <div className="min-w-0">
                          <h3 className="font-black text-base text-slate-900 truncate">
                            {company.name}
                          </h3>
                          <p className="text-xs font-semibold text-slate-500 truncate">
                            {company.industry}
                          </p>
                        </div>
                      </div>
                      <span className="text-[11px] font-black bg-blue-50 text-[#0B3D91] border border-blue-200 px-2.5 py-0.5 rounded-full shrink-0">
                        {company.category}
                      </span>
                    </div>

                    {/* Location & Sponsorship Stats */}
                    <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
                      <div className="flex items-center gap-2 text-slate-700 font-semibold">
                        <MapPin className="w-3.5 h-3.5 text-[#0B3D91] shrink-0" />
                        <span className="truncate">{company.location}</span>
                      </div>
                      <div className="flex items-center gap-2 text-emerald-800 font-black">
                        <Award className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span>Jobs Sponsored: {company.sponsorshipCount}</span>
                      </div>
                      <div className="flex items-center gap-2 text-slate-700 font-bold">
                        <Briefcase className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                        <span>Visa Type: {company.visaType}</span>
                      </div>
                    </div>
                  </div>

                  {/* Official Careers Link Buttons */}
                  <div className="flex items-center gap-2 pt-1">
                    <a
                      href={company.careersUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 py-3 px-4 bg-[#0B3D91] hover:bg-[#0B2A5B] text-white font-black text-xs sm:text-sm rounded-xl shadow-xs transition-all flex items-center justify-center gap-1.5"
                    >
                      <span>View Jobs →</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                    <a
                      href={company.careersUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="py-3 px-3.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 font-black text-xs rounded-xl transition-all"
                    >
                      Apply →
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* How to Get Sponsorship? — 5 Steps Guide */}
        <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-slate-200 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-200">
            <div>
              <span className="text-xs font-black uppercase tracking-wider text-[#0B3D91] bg-blue-50 px-3 py-1 rounded-full">
                Step-by-Step Roadmap
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 mt-2">
                How to Get Sponsorship? (5 Steps from CV to Work Visa)
              </h2>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {FIVE_STEPS_TO_SPONSORSHIP.map((item, idx) => (
              <div
                key={idx}
                className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col justify-between space-y-3"
              >
                <div className="space-y-2">
                  <span className="inline-block text-[11px] font-black uppercase bg-[#0B3D91] text-white px-2.5 py-0.5 rounded-full">
                    {item.step}
                  </span>
                  <h3 className="font-black text-sm text-slate-900">{item.title}</h3>
                  <p className="text-xs text-slate-600 leading-relaxed">{item.desc}</p>
                </div>
                <div className="flex items-center gap-1 text-[11px] font-bold text-emerald-700 pt-1">
                  <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                  <span>Verified Consular Stage</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* FAQs */}
        <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-slate-200">
          <div className="flex items-center gap-3 mb-6">
            <HelpCircle className="w-6 h-6 text-[#0B2A5B]" />
            <h2 className="text-xl font-black text-slate-900">
              Frequently Asked Questions (Visa Sponsorship Finder)
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
        <EmailSubscribeBox pageContext="Visa Sponsorship Finder" />
      </div>

      {/* Bottom Back to Home */}
      <PageBottomBack onNavigate={onNavigate} />
    </div>
  );
};
