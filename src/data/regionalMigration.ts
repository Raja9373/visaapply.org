export interface RegionalMigrationCategory {
  code: string;
  name: string;
  subclass: string;
  status: string;
  summary: string;
  pathways?: { code: string; name: string; description: string; isCurrent: boolean }[];
}

export const REGIONAL_MIGRATION_INFO = {
  title: "Australia Regional Migration",
  description: "Regional migration to Australia operates through 3 primary current regional visa routes (491, 494, 191), plus DAMA agreements, 485 regional graduate extensions, and 417/462 regional working holiday extensions — along with 3 closed/legacy regional visa routes (489, 887, 187).",
  officialSource: "https://immi.homeaffairs.gov.au/visas/getting-a-visa/visa-listing",
  designatedRegionalAreasSource: "https://immi.homeaffairs.gov.au/visas/working-in-australia/skill-occupation-list/regional-postcodes",
  mainCategories: [
    {
      code: "AUS-REG-01",
      name: "Skilled Regional Provisional Visa",
      subclass: "491",
      status: "Current (Primary Regional Skilled Route)",
      summary: "Points-tested 5-year provisional visa for skilled workers nominated by a State/Territory government (AUS-491-SN) or sponsored by an eligible family member living in designated regional Australia (AUS-491-FS). Leads to Subclass 191 PR after 3 years.",
      pathways: [
        {
          code: "AUS-491-SN",
          name: "Subclass 491 – State or Territory Nominated pathway",
          description: "State/Territory nominated (+15 points) — Live, work, and study in designated regional Australia for up to 5 years, with a pathway to Subclass 191 Permanent Residence.",
          isCurrent: true
        },
        {
          code: "AUS-491-FS",
          name: "Subclass 491 – Family Sponsored pathway",
          description: "Family sponsored in designated regional area (+15 points) — Sponsored by an eligible relative (parent, child/step-child, sibling, aunt/uncle, niece/nephew, grandparent, or first cousin) usually resident in a designated regional area. Same 5-year stay and pathway to Subclass 191.",
          isCurrent: true
        }
      ]
    },
    {
      code: "AUS-REG-02",
      name: "Employer Sponsored Regional Visa",
      subclass: "494",
      status: "Current (Primary Regional Employer Route)",
      summary: "5-year provisional visa enabling regional employers in designated regional areas to address identified labour shortages by sponsoring skilled overseas workers under the Employer Sponsored stream (AUS-494-ES) or Labour Agreement stream (AUS-494-LA). Leads to Subclass 191 PR after 3 years.",
      pathways: [
        {
          code: "AUS-494-ES",
          name: "Subclass 494 – Employer Sponsored stream",
          description: "Eligible regional employers sponsor skilled overseas workers in occupations on the Regional Occupation List (ROL) or Medium and Long-term Strategic Skills List (MLTSSL).",
          isCurrent: true
        },
        {
          code: "AUS-494-LA",
          name: "Subclass 494 – Labour Agreement stream",
          description: "For skilled workers nominated by regional employers who hold a formal Labour Agreement or Designated Area Migration Agreement (DAMA) with the Australian Government.",
          isCurrent: true
        }
      ]
    },
    {
      code: "AUS-REG-03",
      name: "Regional Permanent Residence Visa",
      subclass: "191",
      status: "Current (Primary Regional PR Route)",
      summary: "Permanent residency visa for individuals who have lived, worked, and studied in designated regional Australia on an eligible provisional visa (491 or 494) for at least 3 years (AUS-191-RP), or eligible Hong Kong/BNO passport holders under the Hong Kong stream (AUS-191-HK).",
      pathways: [
        {
          code: "AUS-191-RP",
          name: "Subclass 191 – Regional Provisional stream",
          description: "For holders of Subclass 491 or 494 who have held their regional provisional visa for at least 3 years, complied with regional residence/work/study conditions, and provided 3 Australian Taxation Office (ATO) Notices of Assessment.",
          isCurrent: true
        },
        {
          code: "AUS-191-HK",
          name: "Subclass 191 – Hong Kong stream",
          description: "Dedicated regional permanent residency pathway for eligible Hong Kong (HKSAR) or British National (Overseas) passport holders who lived, worked, and studied exclusively in designated regional Australia for at least 3 years on an eligible temporary graduate, skilled, or regional visa.",
          isCurrent: true
        }
      ]
    },
    {
      code: "AUS-REG-04",
      name: "Regional Graduate Pathway",
      subclass: "485 Regional Extension",
      status: "Current (Related Regional Extension)",
      summary: "Not a separate visa subclass — provides an additional 1 to 2 years of post-study work rights (Second Post-Higher Education Work stream) for international graduates who completed their degree at a regional campus and lived in a Category 2 or Category 3 designated regional area.",
      pathways: [
        {
          code: "AUS-485-2PSW",
          name: "Second Temporary Graduate (Subclass 485) – Post-Study Work stream",
          description: "Additional 1 year (Category 2 – Cities and Major Regional Centres) or 2 years (Category 3 – Regional Centres and Other Regional Areas) of post-study stay for regional graduates.",
          isCurrent: true
        },
        {
          code: "AUS-485-REG",
          name: "Regional study / graduate extension pathway",
          description: "Requires graduating from an eligible CRICOS-registered regional institution and maintaining continuous residence in a designated regional area for at least 2 years immediately before applying.",
          isCurrent: true
        }
      ]
    },
    {
      code: "AUS-REG-05",
      name: "Regional Employer Labour Agreement / DAMA",
      subclass: "482 / 494 / 186 under DAMA",
      status: "Current (Agreement Framework)",
      summary: "DAMA (Designated Area Migration Agreement) is a formal two-tier framework between the Australian Government and a Regional Designated Area Representative (DAR) — not a separate visa subclass. Endorsed regional employers sponsor workers via Subclass 482, 494, or 186 with access to broader occupation lists and age, English, or TSMIT salary concessions.",
      pathways: [
        {
          code: "AUS-DAMA-482",
          name: "Skills in Demand Visa Subclass 482 under DAMA",
          description: "DAMA agreement lets approved regional employers sponsor overseas workers under Subclass 482 with access to additional regional occupations plus age, English, and TSMIT concessions per regional agreement.",
          isCurrent: true
        },
        {
          code: "AUS-DAMA-494",
          name: "Skilled Employer Sponsored Regional Subclass 494 under DAMA",
          description: "Subclass 494 Labour Agreement stream nomination under an active regional DAMA — provides a direct 5-year regional provisional visa with concessions and pathway to Subclass 191 PR.",
          isCurrent: true
        },
        {
          code: "AUS-DAMA-186",
          name: "Employer Nomination Scheme Subclass 186 under eligible DAMA arrangements",
          description: "Permanent residency nomination under the Subclass 186 Labour Agreement stream where the regional DAMA includes a permanent residence transition pathway (often up to age 50–55 concession).",
          isCurrent: true
        }
      ]
    },
    {
      code: "AUS-REG-06",
      name: "Regional Working Holiday Pathway",
      subclass: "417 / 462 Regional Extensions",
      status: "Current (Specified Regional Work Extension)",
      summary: "Enables Working Holiday (Subclass 417) and Work and Holiday (Subclass 462) visa holders to qualify for a 2nd-year (3 months / 88 days specified regional work) or 3rd-year (6 months / 179 days specified regional work) visa extension in agriculture, hospitality, tourism, bushfire/flood recovery, or northern/regional construction.",
      pathways: [
        {
          code: "AUS-417-2Y",
          name: "Second Working Holiday Visa (Subclass 417) via specified regional work",
          description: "Complete at least 3 months (88 calendar days) of eligible specified Subclass 417 work in designated regional Australia during your first 417 visa.",
          isCurrent: true
        },
        {
          code: "AUS-417-3Y",
          name: "Third Working Holiday Visa (Subclass 417) via specified regional work",
          description: "Complete at least 6 months (179 calendar days) of eligible specified Subclass 417 work in designated regional Australia during your second 417 visa.",
          isCurrent: true
        },
        {
          code: "AUS-462-2Y",
          name: "Second Work and Holiday Visa (Subclass 462) via specified regional work",
          description: "Complete at least 3 months (88 calendar days) of eligible specified Subclass 462 work in northern or designated regional Australia during your first 462 visa.",
          isCurrent: true
        },
        {
          code: "AUS-462-3Y",
          name: "Third Work and Holiday Visa (Subclass 462) via specified regional work",
          description: "Complete at least 6 months (179 calendar days) of eligible specified Subclass 462 work in northern or designated regional Australia during your second 462 visa.",
          isCurrent: true
        }
      ]
    },
    {
      code: "AUS-REG-07",
      name: "Closed / Legacy Regional Visa Routes",
      subclass: "489, 887, 187",
      status: "Legacy (Closed / Transitional Only)",
      summary: "Historical regional subclasses replaced by the 491/494/191 framework in November 2019. Subclass 489 and Subclass 187 (RSMS) are closed to new primary entrants (except transitional 187 cases), while Subclass 887 remains open as the legacy permanent stage for existing 489/495/496/475/487 provisional holders.",
      pathways: [
        {
          code: "AUS-489-LEGACY",
          name: "Subclass 489 – Skilled Regional (Provisional) Visa (Closed)",
          description: "Closed to new applications on 16 November 2019 (replaced by Subclass 491). Existing holders transition to PR via Subclass 887.",
          isCurrent: false
        },
        {
          code: "AUS-887-LEGACY",
          name: "Subclass 887 – Skilled Regional (Permanent) Visa (Legacy PR Stage)",
          description: "Legacy permanent residence pathway exclusively for holders of provisional Subclasses 489, 495, 496, 475, or 487 who lived 2 years and worked full-time 1 year in regional Australia.",
          isCurrent: false
        },
        {
          code: "AUS-187-LEGACY",
          name: "Subclass 187 – Regional Sponsored Migration Scheme (RSMS - Closed/Transitional)",
          description: "Closed to new Direct Entry applications (replaced by Subclass 494). Open only to eligible transitional Temporary Residence Transition (TRT) cohort holders.",
          isCurrent: false
        }
      ]
    }
  ] as RegionalMigrationCategory[],
  regionalAreas: {
    category1Excluded: "Category 1 – Major Cities (EXCLUDED from Regional Migration): Sydney, Melbourne, and Brisbane are NOT designated regional areas for Subclass 491, 494, 191, or 485 regional extensions.",
    category2: "Category 2 – Cities and Major Regional Centres: Perth, Adelaide, Gold Coast, Sunshine Coast, Canberra, Newcastle, Wollongong, Geelong, and Hobart. Eligible for 491, 494, 191, +5 regional study points, and 1-year Second 485 Post-Study Work extension.",
    category3: "Category 3 – Regional Centres and Other Regional Areas: All other designated regional postcodes across NSW, VIC, QLD, WA, SA, TAS, NT, and Norfolk Island. Eligible for 491, 494, 191, priority regional processing, and 2-year Second 485 Post-Study Work extension. Exact eligibility must be verified via the official Department of Home Affairs regional postcode list."
  },
  damaRegionsList: [
    "Northern Territory DAMA (NT)",
    "Far North Queensland DAMA (FNQ)",
    "Townsville North Queensland DAMA",
    "Adelaide City Technology & Innovation Advancement / South Australia Regional DAMA",
    "Western Australia (WA) State-wide DAMA, Goldfields DAMA, Kimberley DAMA, Pilbara DAMA & South West DAMA",
    "Orana DAMA & Riverina DAMA (Regional NSW)",
    "Goulburn Valley DAMA & Great South Coast DAMA (Regional VIC)",
    "East Kimberley DAMA"
  ],
  websiteRecommendation: "Keep 491, 494, 191 as main regional visas; show DAMA, 485 regional, 417/462 regional as related pathways; show 489, 887, 187 as legacy — preserving the exact 135 Australia visa count without duplicate entries."
};
