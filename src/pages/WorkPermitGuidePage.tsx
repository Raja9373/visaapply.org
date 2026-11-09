import React, { useState, useMemo } from 'react';
import {
  Briefcase,
  ShieldAlert,
  CheckCircle2,
  Clock,
  DollarSign,
  ArrowRight,
  Sparkles,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  Globe,
  ExternalLink,
  AlertTriangle
} from 'lucide-react';
import { EmailSubscribeBox } from '../components/EmailSubscribeBox';
import { PageBackBar, PageBottomBack } from '../components/PageBackBar';

interface WorkPermitGuidePageProps {
  onNavigate?: (path: string) => void;
}

type HiringCountry =
  | 'UAE'
  | 'Qatar'
  | 'Saudi Arabia'
  | 'Germany'
  | 'Poland'
  | 'Portugal'
  | 'Canada'
  | 'Australia';

type JobRoleCategory = 'IT' | 'Nurse' | 'Driver' | 'Construction' | 'Agriculture';

interface WorkPermitDetail {
  visaType: string;
  salaryRange: string;
  processingTime: string;
  sponsorshipNeeded: string;
  keyRequirements: string[];
  officialPortalUrl: string;
}

const TOP_HIRING_REGIONS = [
  {
    region: 'Gulf Countries (Zero Income Tax)',
    countries: '🇦🇪 UAE (Dubai) • 🇶🇦 Qatar • 🇸🇦 Saudi Arabia',
    badge: 'Fastest Processing (7–21 Days)',
    desc: 'High demand in IT, Nursing, Heavy Truck/Bus Driving, Civil Construction, and Hospitality with 100% tax-free salaries and employer-funded work residency.'
  },
  {
    region: 'Europe (Schengen Work Permits)',
    countries: '🇩🇪 Germany • 🇵🇱 Poland • 🇵🇹 Portugal',
    badge: 'EU Blue Card & National Type D',
    desc: 'Severe labor shortages across Germany (Opportunity Card & EU Blue Card), Poland (Voivodeship Work Permit), and Portugal (Job Seeker & D1/D3 Visas).'
  },
  {
    region: 'Canada (PR-Linked Work Pathways)',
    countries: '🇨🇦 Ontario • British Columbia • Alberta',
    badge: 'LMIA, GTS & PNP Healthcare',
    desc: 'Direct pathways to Canadian Permanent Residency via the 2-week Global Talent Stream (IT), Healthcare PNP draws (Nurses), and Agri-Food / Trucking permits.'
  },
  {
    region: 'Australia (Skills in Demand 482)',
    countries: '🇦🇺 Sydney • Melbourne • Perth • Regional',
    badge: 'Subclass 482 SID & 186 PR',
    desc: 'High minimum salary floor (AUD $73,150+ TSMIT) with priority processing for Registered Nurses, Software Engineers, Civil Trades, and Regional Agriculture.'
  }
];

function getWorkPermitDetails(country: HiringCountry, job: JobRoleCategory): WorkPermitDetail {
  const matrix: Record<HiringCountry, Record<JobRoleCategory, WorkPermitDetail>> = {
    UAE: {
      IT: {
        visaType: 'UAE Employment Visa / Green Visa (5-Year Self-Sponsored)',
        salaryRange: 'AED 15,000 – AED 32,000/mo (~₹3.4L – ₹7.3L/mo Tax-Free)',
        processingTime: '7–14 Working Days',
        sponsorshipNeeded: 'Yes (Employer MoHRE Work Permit — Or No for Green/Freelance Visa)',
        keyRequirements: [
          'Attested Bachelor’s Degree in Computer Science / Engineering',
          'Signed MoHRE Employment Offer Letter from UAE Mainland or Freezone Company',
          'Medical Fitness Test & Emirates ID Biometrics upon arrival'
        ],
        officialPortalUrl: 'https://icp.gov.ae/'
      },
      Nurse: {
        visaType: 'UAE Healthcare Employment Visa (DHA / DOH / MOH)',
        salaryRange: 'AED 8,500 – AED 16,000/mo (~₹1.9L – ₹3.6L/mo Tax-Free)',
        processingTime: '10–20 Working Days',
        sponsorshipNeeded: 'Yes (Hospital / Clinic Employer Sponsorship)',
        keyRequirements: [
          'B.Sc Nursing / GNM + DataFlow Primary Source Verification',
          'DHA (Dubai), DOH (Abu Dhabi), or MOH Prometric Exam Pass',
          'Valid Home Country Nursing Council License'
        ],
        officialPortalUrl: 'https://www.dha.gov.ae/'
      },
      Driver: {
        visaType: 'UAE Standard Work Permit (RTA Light / Heavy Commercial)',
        salaryRange: 'AED 4,000 – AED 7,500/mo (~₹90,000 – ₹1.7L/mo + Overtime)',
        processingTime: '10–15 Working Days',
        sponsorshipNeeded: 'Yes (Logistics / Transport Company Sponsor)',
        keyRequirements: [
          'Valid Passport & Home Country Driving License',
          'UAE RTA Heavy Truck / Bus or Limousine Driving Test Clearance',
          'Police Clearance Certificate (PCC) & Medical Fitness'
        ],
        officialPortalUrl: 'https://www.mohre.gov.ae/'
      },
      Construction: {
        visaType: 'UAE MoHRE Skilled Construction / Engineer Work Visa',
        salaryRange: 'AED 3,500 – AED 18,000/mo (~₹80,000 – ₹4.1L/mo by role)',
        processingTime: '10–15 Working Days',
        sponsorshipNeeded: 'Yes (100% Employer Paid Under UAE Labor Law)',
        keyRequirements: [
          'Trade Skill Certificate or Civil/MEP Engineering Degree (Attested)',
          'Official MoHRE Offer Letter with Standardized Contract',
          'GAMCA / Approved Medical Examination'
        ],
        officialPortalUrl: 'https://www.mohre.gov.ae/'
      },
      Agriculture: {
        visaType: 'UAE AgTech & Greenhouse Employment Visa',
        salaryRange: 'AED 3,200 – AED 9,500/mo (~₹73,000 – ₹2.15L/mo)',
        processingTime: '10–15 Working Days',
        sponsorshipNeeded: 'Yes (Employer Sponsored)',
        keyRequirements: [
          'Valid Passport (6+ Months Validity)',
          'Employer Work Quota Approval from MoHRE',
          'Medical Fitness & Biometrics'
        ],
        officialPortalUrl: 'https://www.mohre.gov.ae/'
      }
    },
    Qatar: {
      IT: {
        visaType: 'Qatar Work Residence Permit (RP)',
        salaryRange: 'QAR 14,000 – QAR 28,000/mo (~₹3.2L – ₹6.4L/mo Tax-Free)',
        processingTime: '14–21 Working Days',
        sponsorshipNeeded: 'Yes (Qatar Employer Block Visa / QID Sponsor)',
        keyRequirements: [
          'MOFA Attested University Degree & Police Clearance Certificate',
          'Qatar Visa Center (QVC) Biometrics & Medical in Home Country',
          'Signed Employment Contract registered with Ministry of Labour'
        ],
        officialPortalUrl: 'https://portal.moi.gov.qa/'
      },
      Nurse: {
        visaType: 'Qatar DHP Licensed Healthcare Work Visa',
        salaryRange: 'QAR 9,000 – QAR 15,500/mo (~₹2.05L – ₹3.5L/mo Tax-Free)',
        processingTime: '15–25 Working Days',
        sponsorshipNeeded: 'Yes (Hamad Medical Corp / Private Hospital Sponsor)',
        keyRequirements: [
          'QCHP / DHP Prometric Exam & DataFlow Verification',
          'B.Sc Nursing with 2+ Years Clinical Experience',
          'QVC Medical & Biometrics Clearance'
        ],
        officialPortalUrl: 'https://www.moph.gov.qa/'
      },
      Driver: {
        visaType: 'Qatar Heavy / Light Driver Work Visa',
        salaryRange: 'QAR 3,800 – QAR 6,800/mo (~₹86,000 – ₹1.55L/mo)',
        processingTime: '14–21 Working Days',
        sponsorshipNeeded: 'Yes (Transport / Logistics Company Sponsor)',
        keyRequirements: [
          'Valid Heavy/Light Driving License (GCC license holders get direct test)',
          'QVC Biometrics & Medical Check',
          'Clean Police Clearance Certificate'
        ],
        officialPortalUrl: 'https://portal.moi.gov.qa/'
      },
      Construction: {
        visaType: 'Qatar EPC & Infrastructure Work Permit',
        salaryRange: 'QAR 3,500 – QAR 16,500/mo (~₹80,000 – ₹3.75L/mo)',
        processingTime: '14–21 Working Days',
        sponsorshipNeeded: 'Yes (Employer Pays 100% of Visa & Flight)',
        keyRequirements: [
          'Trade Test Certificate or UPDA/MMUP Engineering Certification',
          'QVC Medical & Contract Signing prior to travel',
          'Valid Passport & PCC'
        ],
        officialPortalUrl: 'https://portal.moi.gov.qa/'
      },
      Agriculture: {
        visaType: 'Qatar Agricultural & Landscaping Work Visa',
        salaryRange: 'QAR 3,000 – QAR 8,000/mo (~₹68,000 – ₹1.8L/mo)',
        processingTime: '14–21 Working Days',
        sponsorshipNeeded: 'Yes (Employer Sponsored)',
        keyRequirements: [
          'QVC Biometrics & Medical Fitness',
          'Ministry of Labour Approved Employment Contract',
          'Valid Passport'
        ],
        officialPortalUrl: 'https://portal.moi.gov.qa/'
      }
    },
    'Saudi Arabia': {
      IT: {
        visaType: 'Saudi Iqama Work Visa / Premium Residency (Qiwa)',
        salaryRange: 'SAR 16,000 – SAR 35,000/mo (~₹3.5L – ₹7.8L/mo Tax-Free)',
        processingTime: '14–21 Working Days',
        sponsorshipNeeded: 'Yes (Qiwa Verified Employer Sponsorship)',
        keyRequirements: [
          'Saudi Culture & Embassy Attested Degree + SCE/Saudi Council Registration',
          'GAMCA / Wafid Medical Examination & VFS Tasheer Biometrics',
          'Digital Contract Verification on Qiwa / Enjaz Platform'
        ],
        officialPortalUrl: 'https://qiwa.sa/'
      },
      Nurse: {
        visaType: 'Saudi SCFHS Healthcare Work Visa',
        salaryRange: 'SAR 8,500 – SAR 16,000/mo (~₹1.9L – ₹3.55L/mo Tax-Free)',
        processingTime: '15–25 Working Days',
        sponsorshipNeeded: 'Yes (MOH Saudi Arabia / Private Hospital Sponsor)',
        keyRequirements: [
          'Saudi Commission for Health Specialties (SCFHS) Prometric Pass',
          'Mumaris Plus DataFlow Verification & B.Sc Nursing',
          'Wafid Medical & VFS Tasheer Stamping'
        ],
        officialPortalUrl: 'https://scfhs.org.sa/'
      },
      Driver: {
        visaType: 'Saudi Commercial Heavy / Fleet Driver Work Visa',
        salaryRange: 'SAR 3,500 – SAR 6,500/mo (~₹78,000 – ₹1.45L/mo + Trip Bonus)',
        processingTime: '15–21 Working Days',
        sponsorshipNeeded: 'Yes (Company Sponsorship — Avoid Individual Azad Visas)',
        keyRequirements: [
          'Valid Heavy Commercial Driving License',
          'Wafid Medical Fitness & Police Clearance Certificate',
          'VFS Tasheer Biometrics'
        ],
        officialPortalUrl: 'https://qiwa.sa/'
      },
      Construction: {
        visaType: 'Saudi Mega-Projects (NEOM / Red Sea) Work Visa',
        salaryRange: 'SAR 4,000 – SAR 22,000/mo (~₹90,000 – ₹4.9L/mo)',
        processingTime: '14–21 Working Days',
        sponsorshipNeeded: 'Yes (Employer Sponsored)',
        keyRequirements: [
          'Saudi Council of Engineers (SCE) Registration for Engineers / SVP Trade Test for Technicians',
          'Wafid Medical & Attested Certificates',
          'Verified Qiwa Employment Contract'
        ],
        officialPortalUrl: 'https://qiwa.sa/'
      },
      Agriculture: {
        visaType: 'Saudi Agribusiness & Food Security Work Visa',
        salaryRange: 'SAR 3,200 – SAR 9,000/mo (~₹71,000 – ₹2.0L/mo)',
        processingTime: '15–21 Working Days',
        sponsorshipNeeded: 'Yes (Employer Sponsored)',
        keyRequirements: [
          'SVP Skill Verification (if applicable) & Wafid Medical',
          'Police Clearance Certificate',
          'VFS Tasheer Biometrics'
        ],
        officialPortalUrl: 'https://qiwa.sa/'
      }
    },
    Germany: {
      IT: {
        visaType: 'Germany EU Blue Card (§18g) / Opportunity Card (Chancenkarte)',
        salaryRange: '€55,000 – €92,000/year (~₹4.1L – ₹6.9L/mo)',
        processingTime: '15–30 Working Days',
        sponsorshipNeeded: 'Yes for EU Blue Card (Job Offer) / No for Opportunity Card (Points-Based)',
        keyRequirements: [
          'Minimum Gross Salary of €41,041.80/yr (Shortage IT Role) or 3 Years IT Experience',
          'Anabin H+ Recognized Degree (or IT Specialist Track without degree)',
          'Zero German Language required for English-speaking EU Blue Card IT roles'
        ],
        officialPortalUrl: 'https://www.make-it-in-germany.com/en/'
      },
      Nurse: {
        visaType: 'Germany Skilled Healthcare Worker Visa (§18a / Triple Win)',
        salaryRange: '€36,000 – €48,000/year (~₹2.7L – ₹3.6L/mo)',
        processingTime: '20–35 Working Days',
        sponsorshipNeeded: 'Yes (German Hospital / Care Home Job Offer)',
        keyRequirements: [
          'B.Sc Nursing / GNM + Professional Recognition (Anerkennung)',
          'German Language B1 / B2 Certificate (Goethe / Telc / ÖSD)',
          'Signed Hospital Employment Contract (e.g. Charité / Helios)'
        ],
        officialPortalUrl: 'https://www.make-it-in-germany.com/en/'
      },
      Driver: {
        visaType: 'Germany Professional EU Driver Visa (§24a BeschV)',
        salaryRange: '€32,000 – €42,000/year (~₹2.4L – ₹3.15L/mo)',
        processingTime: '25–40 Working Days',
        sponsorshipNeeded: 'Yes (German Logistics / Bus Employer Offer)',
        keyRequirements: [
          'Heavy Truck (CE) or Bus (DE) License + EU Code 95 Qualification Plan',
          'Basic German A2/B1 recommended for qualification modules',
          'Federal Employment Agency (BA) Pre-Approval'
        ],
        officialPortalUrl: 'https://www.make-it-in-germany.com/en/'
      },
      Construction: {
        visaType: 'Germany Skilled Trades / Civil Engineer Visa (§18a / §18b)',
        salaryRange: '€42,000 – €68,000/year (~₹3.15L – ₹5.1L/mo)',
        processingTime: '20–35 Working Days',
        sponsorshipNeeded: 'Yes (Job Offer) or No (via Opportunity Card to find job in Germany)',
        keyRequirements: [
          'Recognized Vocational Diploma (IHK FOSA) or Civil Engineering Degree',
          'Signed German Employment Contract',
          'Health Insurance & Accommodation Proof'
        ],
        officialPortalUrl: 'https://www.make-it-in-germany.com/en/'
      },
      Agriculture: {
        visaType: 'Germany Agronomy & Agricultural Specialist Visa',
        salaryRange: '€30,000 – €46,000/year (~₹2.25L – ₹3.45L/mo)',
        processingTime: '20–35 Working Days',
        sponsorshipNeeded: 'Yes (Employer Contract + BA Approval)',
        keyRequirements: [
          'Vocational Agriculture / Agronomy Qualification',
          'Signed Employment Contract meeting German Minimum Wage Rules',
          'Embassy / VFS National Type D Application'
        ],
        officialPortalUrl: 'https://www.make-it-in-germany.com/en/'
      }
    },
    Poland: {
      IT: {
        visaType: 'Poland EU Blue Card / National Type D Work Visa',
        salaryRange: 'PLN 14,000 – PLN 26,000/mo (~₹2.9L – ₹5.4L/mo)',
        processingTime: '15–30 Working Days',
        sponsorshipNeeded: 'Yes (Voivodeship Work Permit Type A from Polish Employer)',
        keyRequirements: [
          'University Degree or 5+ Years Software Engineering Experience',
          'Original Voivodeship Work Permit (Zezwolenie na pracę) issued in Poland',
          'VFS Global National Type D Visa Appointment'
        ],
        officialPortalUrl: 'https://www.gov.pl/web/udsc-en'
      },
      Nurse: {
        visaType: 'Poland Healthcare National Work Visa (Type D)',
        salaryRange: 'PLN 7,500 – PLN 12,000/mo (~₹1.55L – ₹2.5L/mo)',
        processingTime: '20–35 Working Days',
        sponsorshipNeeded: 'Yes (Hospital Work Permit)',
        keyRequirements: [
          'Ministry of Health Conditional Right to Practice Approval',
          'Nursing Degree & 3+ Years Clinical Experience',
          'Employer Work Permit & Accommodation Proof'
        ],
        officialPortalUrl: 'https://www.gov.pl/web/udsc-en'
      },
      Driver: {
        visaType: 'Poland International TIR / C+E Truck Driver Work Visa',
        salaryRange: 'PLN 8,500 – PLN 13,500/mo (~₹1.75L – ₹2.8L/mo)',
        processingTime: '20–35 Working Days',
        sponsorshipNeeded: 'Yes (Polish Transport Company Work Permit + Driver Attestation)',
        keyRequirements: [
          'Heavy Commercial C+E Driving License + Code 95 Course',
          'Voivodeship Work Permit Type A',
          'Clean Criminal Record Certificate (Apostilled)'
        ],
        officialPortalUrl: 'https://www.gov.pl/web/udsc-en'
      },
      Construction: {
        visaType: 'Poland National Type D Work Visa (Voivodeship Permit)',
        salaryRange: 'PLN 6,500 – PLN 12,500/mo (~₹1.35L – ₹2.6L/mo)',
        processingTime: '20–35 Working Days',
        sponsorshipNeeded: 'Yes (Employer Voivodeship Work Permit)',
        keyRequirements: [
          'Original Work Permit issued by the regional Voivode in Poland',
          'Signed Employment Contract (Umowa o pracę) & Housing Guarantee',
          '€30,000 Travel Medical Insurance for first year'
        ],
        officialPortalUrl: 'https://www.gov.pl/web/udsc-en'
      },
      Agriculture: {
        visaType: 'Poland Seasonal (Type S) / National Type D Agricultural Visa',
        salaryRange: 'PLN 5,500 – PLN 8,500/mo (~₹1.15L – ₹1.75L/mo)',
        processingTime: '15–25 Working Days',
        sponsorshipNeeded: 'Yes (Employer Permit)',
        keyRequirements: [
          'Registered Agricultural Work Permit from County Labour Office (Powiatowy Urząd Pracy)',
          'Verified Employer Accommodation Letter',
          'Valid Passport & Police Clearance'
        ],
        officialPortalUrl: 'https://www.gov.pl/web/udsc-en'
      }
    },
    Portugal: {
      IT: {
        visaType: 'Portugal D3 Highly Qualified Tech Visa / Job Seeker Visa',
        salaryRange: '€32,000 – €65,000/year (~₹2.4L – ₹4.85L/mo)',
        processingTime: '30–45 Working Days',
        sponsorshipNeeded: 'Yes for D3 Tech Visa / No for 120-Day Portugal Job Seeker Visa',
        keyRequirements: [
          'Tech Visa Certified Company Contract (or Job Seeker Declaration of Expression of Interest)',
          'Apostilled Police Clearance Certificate',
          'NIF Tax Number & Proof of Financial Means'
        ],
        officialPortalUrl: 'https://vistos.mne.gov.pt/en/'
      },
      Nurse: {
        visaType: 'Portugal D1 Subordinate Work Visa (Healthcare)',
        salaryRange: '€22,000 – €36,000/year (~₹1.65L – ₹2.7L/mo)',
        processingTime: '35–50 Working Days',
        sponsorshipNeeded: 'Yes (Hospital / Clinic Contract)',
        keyRequirements: [
          'Ordem dos Enfermeiros Equivalence & Portuguese Language Proficiency',
          'IEFP Approved Employment Promise / Contract',
          'Apostilled PCC & VFS Submission'
        ],
        officialPortalUrl: 'https://vistos.mne.gov.pt/en/'
      },
      Driver: {
        visaType: 'Portugal D1 Commercial Transport Work Visa',
        salaryRange: '€20,000 – €32,000/year (~₹1.5L – ₹2.4L/mo)',
        processingTime: '35–50 Working Days',
        sponsorshipNeeded: 'Yes (Employer Contract)',
        keyRequirements: [
          'IMT Portugal License Exchange Eligibility + CAM (Code 95)',
          'Signed Employment Contract with Portuguese Logistics Firm',
          'Apostilled Criminal Record'
        ],
        officialPortalUrl: 'https://vistos.mne.gov.pt/en/'
      },
      Construction: {
        visaType: 'Portugal D1 Construction & Civil Trades Work Visa',
        salaryRange: '€18,000 – €34,000/year (~₹1.35L – ₹2.55L/mo)',
        processingTime: '35–50 Working Days',
        sponsorshipNeeded: 'Yes (D1 Contract) or Apply via 120-Day Job Seeker Visa',
        keyRequirements: [
          'Signed Employment Contract or Job Seeker Registration with IEFP',
          'Confirmed Accommodation in Portugal',
          'Apostilled PCC & Bank Balance Proof'
        ],
        officialPortalUrl: 'https://vistos.mne.gov.pt/en/'
      },
      Agriculture: {
        visaType: 'Portugal Seasonal (E6) / D1 Agricultural Work Visa',
        salaryRange: '€15,000 – €24,000/year (~₹1.1L – ₹1.8L/mo)',
        processingTime: '25–40 Working Days',
        sponsorshipNeeded: 'Yes (Agricultural Employer Contract)',
        keyRequirements: [
          'Registered Employment Contract in Agriculture / Livestock / Forestry',
          'Employer Housing & Health Insurance Compliance',
          'Apostilled Police Clearance Certificate'
        ],
        officialPortalUrl: 'https://vistos.mne.gov.pt/en/'
      }
    },
    Canada: {
      IT: {
        visaType: 'Canada Global Talent Stream (GTS) / Express Entry STEM',
        salaryRange: 'CAD $90,000 – $155,000/year (~₹4.6L – ₹7.9L/mo)',
        processingTime: '10–14 Working Days (GTS Fast-Track)',
        sponsorshipNeeded: 'Yes for GTS Work Permit (No for Express Entry FSW Direct PR)',
        keyRequirements: [
          'Positive Global Talent Stream LMIA from Designated Canadian Tech Employer',
          'WES ECA Degree Assessment & IELTS General (if applying for Express Entry PR)',
          'Biometrics & Police Clearance Certificate'
        ],
        officialPortalUrl: 'https://www.canada.ca/en/immigration-refugees-citizenship/services/work-canada.html'
      },
      Nurse: {
        visaType: 'Canada Healthcare PNP / Express Entry Category-Based PR & Work Permit',
        salaryRange: 'CAD $75,000 – $110,000/year (~₹3.8L – ₹5.6L/mo)',
        processingTime: '20–45 Working Days',
        sponsorshipNeeded: 'Yes for Work Permit (Or Direct PR via Express Entry Healthcare Draw)',
        keyRequirements: [
          'NNAS Credential Assessment + Provincial Nursing College Registration (CNO / BCCNM)',
          'NCLEX-RN Pass & IELTS Academic / CELBAN',
          'Health Authority Job Offer (e.g. Fraser Health, UHN, AHS)'
        ],
        officialPortalUrl: 'https://www.canada.ca/en/immigration-refugees-citizenship/services/work-canada.html'
      },
      Driver: {
        visaType: 'Canada Long-Haul Truck Driver LMIA Work Permit + PNP',
        salaryRange: 'CAD $60,000 – $85,000/year (~₹3.05L – ₹4.3L/mo)',
        processingTime: '30–60 Working Days',
        sponsorshipNeeded: 'Yes (Positive Transport LMIA from Canadian Carrier)',
        keyRequirements: [
          'Canadian Class 1 / AZ Mandatory Entry-Level Training (MELT) Compliance',
          'Positive ESDC LMIA + Signed Job Offer',
          'IELTS General CLB 4/5 & Clean Driving Abstract'
        ],
        officialPortalUrl: 'https://www.canada.ca/en/immigration-refugees-citizenship/services/work-canada.html'
      },
      Construction: {
        visaType: 'Canada Skilled Trades LMIA / Express Entry Trade Occupation Draw',
        salaryRange: 'CAD $65,000 – $105,000/year (~₹3.3L – ₹5.35L/mo)',
        processingTime: '30–45 Working Days',
        sponsorshipNeeded: 'Yes (LMIA Employer Offer or Provincial Red Seal Certification)',
        keyRequirements: [
          '2+ Years Full-Time Experience in NOC Skilled Trade or Civil Engineering',
          'Positive LMIA or Provincial Nomination (OINP / BC PNP / AAIP)',
          'IELTS General CLB 5+'
        ],
        officialPortalUrl: 'https://www.canada.ca/en/immigration-refugees-citizenship/services/work-canada.html'
      },
      Agriculture: {
        visaType: 'Canada Agricultural Stream LMIAWork Permit',
        salaryRange: 'CAD $45,000 – $68,000/year (~₹2.3L – ₹3.45L/mo)',
        processingTime: '25–45 Working Days',
        sponsorshipNeeded: 'Yes (Agricultural LMIA Employer Offer)',
        keyRequirements: [
          'Positive Agricultural LMIA from Canadian Farm / Food Processor',
          'Experience in Greenhouse, Livestock, or Crop Production',
          'IRCC Medical Exam & Biometrics'
        ],
        officialPortalUrl: 'https://www.canada.ca/en/immigration-refugees-citizenship/services/work-canada.html'
      }
    },
    Australia: {
      IT: {
        visaType: 'Australia Skills in Demand (SID Subclass 482) / Skilled Independent 189',
        salaryRange: 'AUD $110,000 – $175,000/year (~₹5.0L – ₹8.0L/mo)',
        processingTime: '7–21 Working Days (SID 482 Priority)',
        sponsorshipNeeded: 'Yes for Subclass 482/186 (No for Points-Tested Subclass 189/190 PR)',
        keyRequirements: [
          'Nomination by Accredited Australian Sponsor (e.g. Atlassian, Canva, Xero)',
          '1+ Year Relevant Experience (SID 482) & ACS Skills Assessment (for PR)',
          'IELTS 5.0–6.0+ / PTE Academic Equivalent'
        ],
        officialPortalUrl: 'https://immi.homeaffairs.gov.au/visas/working-in-australia'
      },
      Nurse: {
        visaType: 'Australia Healthcare Subclass 482 (SID) / Direct PR Subclass 186 & 189',
        salaryRange: 'AUD $85,000 – $125,000/year (~₹3.9L – ₹5.7L/mo)',
        processingTime: '7–14 Working Days (Healthcare Priority Processing)',
        sponsorshipNeeded: 'Yes for 482/186 (Or No via Subclass 189 Direct PR Invitation)',
        keyRequirements: [
          'AHPRA Registration (NCLEX-RN + OSCE) & ANMAC Skills Assessment',
          'IELTS 7.0 / OET Grade B in Nursing',
          'Hospital Sponsorship (Ramsay Health Care, NSW Health, WA Health)'
        ],
        officialPortalUrl: 'https://immi.homeaffairs.gov.au/visas/working-in-australia'
      },
      Driver: {
        visaType: 'Australia Regional DAMA (Subclass 482 / 494) Heavy Truck Driver',
        salaryRange: 'AUD $75,000 – $105,000/year (~₹3.45L – ₹4.8L/mo)',
        processingTime: '25–45 Working Days',
        sponsorshipNeeded: 'Yes (Regional Designated Area Migration Agreement DAMA Employer)',
        keyRequirements: [
          'Sponsorship under an Approved Regional DAMA (WA, SA, NT, FNQ)',
          '3+ Years Heavy Articulated Truck Driving Experience',
          'IELTS 5.0 (DAMA English Concession Applies)'
        ],
        officialPortalUrl: 'https://immi.homeaffairs.gov.au/visas/working-in-australia'
      },
      Construction: {
        visaType: 'Australia Subclass 482 (SID) / 494 Regional Construction & Civil',
        salaryRange: 'AUD $82,000 – $140,000/year (~₹3.75L – ₹6.4L/mo)',
        processingTime: '14–30 Working Days',
        sponsorshipNeeded: 'Yes (Approved Australian Construction Sponsor)',
        keyRequirements: [
          'TRA (Trades Recognition Australia) or Engineers Australia Assessment',
          'Salary above TSMIT Floor (AUD $73,150+/year)',
          'IELTS 5.0+ & Police/Medical Clearances'
        ],
        officialPortalUrl: 'https://immi.homeaffairs.gov.au/visas/working-in-australia'
      },
      Agriculture: {
        visaType: 'Australia Regional Sponsored (Subclass 494 / 482 AgTech & Farming)',
        salaryRange: 'AUD $73,150 – $98,000/year (~₹3.35L – ₹4.5L/mo)',
        processingTime: '21–35 Working Days',
        sponsorshipNeeded: 'Yes (Regional Agribusiness Employer Nomination)',
        keyRequirements: [
          'Qualification or 3+ Years Experience in Agronomy, Dairy, or Horticulture',
          'Employer Nomination in Regional Postcode (Pathway to Subclass 191 PR)',
          'Competent English (IELTS 5.0 / PTE 36)'
        ],
        officialPortalUrl: 'https://immi.homeaffairs.gov.au/visas/working-in-australia'
      }
    }
  };

  return matrix[country][job];
}

export const WorkPermitGuidePage: React.FC<WorkPermitGuidePageProps> = ({
  onNavigate = (p) => {
    window.history.pushState({}, '', p);
    window.scrollTo(0, 0);
  }
}) => {
  const [selectedCountry, setSelectedCountry] = useState<HiringCountry>('Germany');
  const [selectedJob, setSelectedJob] = useState<JobRoleCategory>('IT');
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const detail = useMemo(
    () => getWorkPermitDetails(selectedCountry, selectedJob),
    [selectedCountry, selectedJob]
  );

  const faqs = [
    {
      q: 'Should I ever pay money to an agent for an overseas work permit or job offer letter?',
      a: 'Never! In the UAE, Qatar, Saudi Arabia, UK, Canada, Australia, and Germany, it is illegal for an employer or agent to charge a worker for a job offer or sponsorship petition (such as an LMIA, CoS, or MoHRE quota). Any agent demanding ₹1 Lakh to ₹15 Lakhs for a "guaranteed work visa" is running a scam.'
    },
    {
      q: 'Which countries allow you to move abroad and look for a job without prior employer sponsorship?',
      a: 'Germany offers the Opportunity Card (Chancenkarte, valid for 12 months on a points system), Portugal offers a 120-day Job Seeker Visa, UAE offers a 60/120-day Job Exploration Entry Permit, and Canada/Australia offer direct points-tested Permanent Residency (Express Entry & Subclass 189/190).'
    },
    {
      q: 'Where can I find real companies that sponsor work visas?',
      a: 'Use our 100% Free Visa Sponsorship Finder at /sponsorship-finder to browse over 90+ government-verified employers across the USA, UK, Canada, Australia, and Germany with direct links to their official careers portals.'
    },
    {
      q: 'Which region has the fastest work visa processing time in 2026?',
      a: 'Gulf countries (UAE, Qatar, and Saudi Arabia) process employment visas in 7 to 21 working days with 0% personal income tax. For Western countries, Canada’s Global Talent Stream (10–14 days) and Australia’s Skills in Demand Subclass 482 (7–21 days) are the fastest.'
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
      <PageBackBar onNavigate={onNavigate} pageName="Work Permit Guide" />

      {/* Blue Hero Header */}
      <div className="bg-gradient-to-r from-[#0B2A5B] via-[#0B3D91] to-[#082247] text-white py-10 px-4 sm:px-6 lg:px-8 border-b border-blue-900">
        <div className="max-w-6xl mx-auto text-center space-y-3">
          <div className="inline-flex items-center gap-2 bg-emerald-500/20 px-4 py-1.5 rounded-full text-xs font-black text-emerald-300 border border-emerald-400/40">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>100% FREE • OFFICIAL 2026 GLOBAL WORK PERMIT &amp; SALARY GUIDE</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white">
            Work Permit Guide - Jobs Abroad with Visa Sponsorship
          </h1>
          <p className="text-sm sm:text-lg text-blue-100 max-w-3xl mx-auto leading-relaxed">
            Explore official work visa categories, real 2026 salary ranges, processing times, and sponsorship rules across the Gulf (UAE, Qatar, Saudi Arabia), Europe (Germany, Poland, Portugal), Canada, and Australia.
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6 space-y-8">
        {/* Top Countries Hiring Cards */}
        <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-md border border-slate-200 space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-200">
            <div>
              <span className="text-xs font-black uppercase tracking-wider text-emerald-800 bg-emerald-100 px-3 py-1 rounded-full">
                100% FREE
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 mt-2">
                Top Countries Hiring Foreign Workers in 2026
              </h2>
            </div>
            <button
              type="button"
              onClick={() => onNavigate('/sponsorship-finder')}
              className="py-2.5 px-4 bg-[#0B3D91] hover:bg-[#0B2A5B] text-white font-black text-xs rounded-xl flex items-center gap-1.5 self-start sm:self-center cursor-pointer"
            >
              <span>Open Sponsorship Finder →</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {TOP_HIRING_REGIONS.map((item, idx) => (
              <div
                key={idx}
                className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col justify-between space-y-2.5"
              >
                <div className="space-y-1.5">
                  <span className="inline-block text-[10px] font-black uppercase bg-blue-100 text-[#0B3D91] px-2.5 py-0.5 rounded-full">
                    {item.badge}
                  </span>
                  <h3 className="font-black text-sm sm:text-base text-slate-900">{item.region}</h3>
                  <div className="text-xs font-bold text-[#0B3D91]">{item.countries}</div>
                  <p className="text-xs text-slate-600 leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Interactive Work Permit Tool */}
        <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-slate-200 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200">
            <div>
              <span className="text-xs font-black uppercase tracking-wider text-[#0B3D91] bg-blue-50 px-3 py-1 rounded-full">
                Interactive Work Visa Calculator
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 mt-2">
                Select Target Country &amp; Job Category
              </h2>
            </div>
            <span className="bg-emerald-100 text-emerald-800 text-xs font-black px-3 py-1 rounded-full self-start sm:self-center">
              100% FREE
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Country Selector */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
              <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-700 mb-2">
                1. Select Hiring Country
              </label>
              <select
                aria-label="Select Hiring Country"
                value={selectedCountry}
                onChange={(e) => setSelectedCountry(e.target.value as HiringCountry)}
                className="w-full px-3.5 py-3 bg-white border border-slate-300 rounded-xl text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0B3D91] cursor-pointer"
              >
                <option value="UAE">🇦🇪 UAE (Dubai / Abu Dhabi — Gulf)</option>
                <option value="Qatar">🇶🇦 Qatar (Doha — Gulf)</option>
                <option value="Saudi Arabia">🇸🇦 Saudi Arabia (Riyadh / NEOM — Gulf)</option>
                <option value="Germany">🇩🇪 Germany (Europe — EU Blue Card &amp; Chancenkarte)</option>
                <option value="Poland">🇵🇱 Poland (Europe — Voivodeship Work Permit)</option>
                <option value="Portugal">🇵🇹 Portugal (Europe — D1/D3 &amp; Job Seeker Visa)</option>
                <option value="Canada">🇨🇦 Canada (LMIA, GTS &amp; PNP Pathways)</option>
                <option value="Australia">🇦🇺 Australia (Skills in Demand Subclass 482)</option>
              </select>
            </div>

            {/* Job Category Selector */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
              <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-700 mb-2">
                2. Select Job Category
              </label>
              <select
                aria-label="Select Job Category"
                value={selectedJob}
                onChange={(e) => setSelectedJob(e.target.value as JobRoleCategory)}
                className="w-full px-3.5 py-3 bg-white border border-slate-300 rounded-xl text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0B3D91] cursor-pointer"
              >
                <option value="IT">💻 IT &amp; Software Engineering</option>
                <option value="Nurse">🏥 Nurse &amp; Healthcare Professional</option>
                <option value="Driver">🚛 Driver (Heavy Truck / Bus / Commercial)</option>
                <option value="Construction">🏗️ Construction &amp; Civil Trades</option>
                <option value="Agriculture">🌾 Agriculture &amp; Agribusiness</option>
              </select>
            </div>
          </div>

          {/* Result Breakdown Panel */}
          <div className="p-6 rounded-2xl bg-slate-50 border-2 border-[#0B3D91] space-y-5">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-200">
              <div>
                <span className="text-xs font-black uppercase tracking-wider text-[#0B3D91] bg-blue-100 px-3 py-1 rounded-full">
                  {selectedCountry} • {selectedJob} Work Permit Profile
                </span>
                <h3 className="text-xl sm:text-2xl font-black text-slate-900 mt-2">
                  {detail.visaType}
                </h3>
              </div>

              <button
                type="button"
                onClick={() => onNavigate('/sponsorship-finder')}
                className="py-3 px-5 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs sm:text-sm rounded-xl shadow-sm transition-all flex items-center justify-center gap-2 shrink-0 cursor-pointer"
              >
                <span>Find Verified Employers in Sponsorship Finder →</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white p-4 rounded-xl border border-slate-200">
                <div className="text-xs font-extrabold uppercase text-slate-500">
                  Average Salary Range (2026)
                </div>
                <div className="text-base sm:text-lg font-black text-emerald-700 mt-1 tabular-nums">
                  {detail.salaryRange}
                </div>
              </div>

              <div className="bg-white p-4 rounded-xl border border-slate-200">
                <div className="text-xs font-extrabold uppercase text-slate-500">
                  Official Processing Time
                </div>
                <div className="text-base sm:text-lg font-black text-[#0B3D91] mt-1 tabular-nums">
                  {detail.processingTime}
                </div>
              </div>

              <div className="bg-white p-4 rounded-xl border border-slate-200">
                <div className="text-xs font-extrabold uppercase text-slate-500">
                  Sponsorship Needed?
                </div>
                <div className="text-sm sm:text-base font-black text-slate-900 mt-1">
                  {detail.sponsorshipNeeded}
                </div>
              </div>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-2">
              <div className="text-xs font-extrabold uppercase text-slate-700">
                Mandatory Eligibility &amp; Document Checklist:
              </div>
              <ul className="space-y-1.5 text-xs sm:text-sm text-slate-700">
                {detail.keyRequirements.map((req, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>{req}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
              <a
                href={detail.officialPortalUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs font-black text-[#0B3D91] hover:underline"
              >
                <span>Visit Official {selectedCountry} Government Immigration Portal</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>

              <button
                type="button"
                onClick={() => onNavigate('/sponsorship-finder')}
                className="inline-flex items-center gap-1.5 text-xs font-black text-emerald-700 hover:underline cursor-pointer"
              >
                <span>Browse Companies Sponsoring Visas (/sponsorship-finder) →</span>
              </button>
            </div>
          </div>
        </div>

        {/* Beware of Fake Agents Warning Box */}
        <div className="bg-red-50 border-2 border-red-500 rounded-2xl p-6 sm:p-8 shadow-xs space-y-4">
          <div className="flex items-start gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-red-600 text-white flex items-center justify-center shrink-0">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div className="space-y-1.5">
              <span className="inline-block text-xs font-black uppercase bg-red-200 text-red-950 px-3 py-0.5 rounded-full">
                Consumer Protection Alert
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-red-950">
                Beware of Fake Agents — Never Pay for a Job Offer!
              </h2>
              <p className="text-xs sm:text-sm text-red-900 leading-relaxed">
                Thousands of job seekers lose their life savings every year to fraudulent agencies promising "guaranteed Canada LMIA, UK Care Home, Poland Factory, or Dubai Work Visas" for ₹2 Lakhs to ₹15 Lakhs. Protect yourself by following these 4 rules:
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1 text-xs sm:text-sm">
            <div className="p-4 rounded-xl bg-white border border-red-200">
              <strong className="text-red-900 block mb-1">1. Never Pay for a Job Offer or Sponsorship</strong>
              <span className="text-slate-700">
                Legitimate employers in the USA, UK, Canada, Australia, Europe, and the Gulf pay their own government sponsorship fees. Charging candidates for a job offer is strictly illegal.
              </span>
            </div>
            <div className="p-4 rounded-xl bg-white border border-red-200">
              <strong className="text-red-900 block mb-1">2. Tourist Visas Cannot Be Used for Work</strong>
              <span className="text-slate-700">
                Never travel on a Schengen, Canada, or UK Tourist Visa when an agent promises to "convert it to a work permit after landing." Tourist-to-work conversion is prohibited.
              </span>
            </div>
            <div className="p-4 rounded-xl bg-white border border-red-200">
              <strong className="text-red-900 block mb-1">3. Verify Official Company Email Domains</strong>
              <span className="text-slate-700">
                Real multinational employers never send job offers from `@gmail.com`, `@yahoo.com`, or `@outlook.com`. Always verify the job requisition ID on the company’s official careers portal.
              </span>
            </div>
            <div className="p-4 rounded-xl bg-white border border-red-200">
              <strong className="text-red-900 block mb-1">4. Check eMigrate (MEA India) for Gulf Jobs</strong>
              <span className="text-slate-700">
                If applying through an Indian recruitment agency for Gulf / ECR countries, verify the Recruiting Agent (RA) license number on the official Government of India `emigrate.gov.in` portal.
              </span>
            </div>
          </div>
        </div>

        {/* FAQs */}
        <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-slate-200">
          <div className="flex items-center gap-3 mb-6">
            <HelpCircle className="w-6 h-6 text-[#0B2A5B]" />
            <h2 className="text-xl font-black text-slate-900">
              Frequently Asked Questions (Work Permit Guide)
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
        <EmailSubscribeBox pageContext="Work Permit Guide" />
      </div>

      {/* Bottom Back to Home */}
      <PageBottomBack onNavigate={onNavigate} />
    </div>
  );
};
