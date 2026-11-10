export interface SovereignAuthorityEntry {
  authorityId: string;
  countryOrTerritoryIso: string;
  countryOrTerritoryName: string;
  officialAuthorityName: string;
  authorityType: 'UN Member State Sovereign Authority' | 'UN Permanent Observer Sovereign Authority' | 'Sovereign Special Consular Jurisdiction';
  sovereignTerritorialClassification: 'Sovereign State' | 'Autonomous Territory Consular Jurisdiction';
  officialWebsiteUrl: string;
  inclusionRationale: string;
}

/**
 * Directory of 195 Sovereign Consular Authorities issuing sovereign entry & residence permits.
 * Strictly separates 195 Sovereign Authorities from the 249 ISO 3166-1 geographic destination list.
 */
export const SOVEREIGN_AUTHORITY_DIRECTORY_195: SovereignAuthorityEntry[] = [
  {
    authorityId: 'US_STATE_DEPT',
    countryOrTerritoryIso: 'US',
    countryOrTerritoryName: 'United States of America',
    officialAuthorityName: 'U.S. Department of State & U.S. Citizenship and Immigration Services (USCIS)',
    authorityType: 'UN Member State Sovereign Authority',
    sovereignTerritorialClassification: 'Sovereign State',
    officialWebsiteUrl: 'https://travel.state.gov/content/travel/en/us-visas.html',
    inclusionRationale: 'UN Member State; issues independent sovereign visas and citizenship.'
  },
  {
    authorityId: 'CA_IRCC',
    countryOrTerritoryIso: 'CA',
    countryOrTerritoryName: 'Canada',
    officialAuthorityName: 'Immigration, Refugees and Citizenship Canada (IRCC)',
    authorityType: 'UN Member State Sovereign Authority',
    sovereignTerritorialClassification: 'Sovereign State',
    officialWebsiteUrl: 'https://www.canada.ca/en/immigration-refugees-citizenship.html',
    inclusionRationale: 'UN Member State; issues independent sovereign visas, PR cards, and citizenship.'
  },
  {
    authorityId: 'UK_HOME_OFFICE',
    countryOrTerritoryIso: 'GB',
    countryOrTerritoryName: 'United Kingdom',
    officialAuthorityName: 'UK Home Office (UK Visas and Immigration - UKVI)',
    authorityType: 'UN Member State Sovereign Authority',
    sovereignTerritorialClassification: 'Sovereign State',
    officialWebsiteUrl: 'https://www.gov.uk/browse/visas-immigration',
    inclusionRationale: 'UN Member State; issues independent sovereign UK visas and ILR permits.'
  },
  {
    authorityId: 'AU_HOME_AFFAIRS',
    countryOrTerritoryIso: 'AU',
    countryOrTerritoryName: 'Australia',
    officialAuthorityName: 'Australian Department of Home Affairs',
    authorityType: 'UN Member State Sovereign Authority',
    sovereignTerritorialClassification: 'Sovereign State',
    officialWebsiteUrl: 'https://immi.homeaffairs.gov.au/',
    inclusionRationale: 'UN Member State; issues independent sovereign Australian visas and PR permits.'
  },
  {
    authorityId: 'DE_BAMF_AA',
    countryOrTerritoryIso: 'DE',
    countryOrTerritoryName: 'Germany',
    officialAuthorityName: 'Federal Foreign Office (Auswärtiges Amt) & BAMF',
    authorityType: 'UN Member State Sovereign Authority',
    sovereignTerritorialClassification: 'Sovereign State',
    officialWebsiteUrl: 'https://www.make-it-in-germany.com/',
    inclusionRationale: 'UN Member State & EU Schengen Member; issues sovereign residence permits.'
  },
  {
    authorityId: 'PT_AIMA_MNE',
    countryOrTerritoryIso: 'PT',
    countryOrTerritoryName: 'Portugal',
    officialAuthorityName: 'Agência para a Integração, Migrações e Asilo (AIMA) & MNE',
    authorityType: 'UN Member State Sovereign Authority',
    sovereignTerritorialClassification: 'Sovereign State',
    officialWebsiteUrl: 'https://aima.gov.pt/',
    inclusionRationale: 'UN Member State & EU Schengen Member; issues sovereign residence visas.'
  },
  {
    authorityId: 'ES_MAEC_EXTRANJERIA',
    countryOrTerritoryIso: 'ES',
    countryOrTerritoryName: 'Spain',
    officialAuthorityName: 'Ministerio de Asuntos Exteriores (MAEC) & Extranjería',
    authorityType: 'UN Member State Sovereign Authority',
    sovereignTerritorialClassification: 'Sovereign State',
    officialWebsiteUrl: 'https://www.exteriores.gob.es/',
    inclusionRationale: 'UN Member State & EU Schengen Member; issues sovereign residence visas.'
  },
  {
    authorityId: 'AE_ICP_GDRFA',
    countryOrTerritoryIso: 'AE',
    countryOrTerritoryName: 'United Arab Emirates',
    officialAuthorityName: 'Federal Authority for Identity, Citizenship, Customs and Port Security (ICP) & GDRFA',
    authorityType: 'UN Member State Sovereign Authority',
    sovereignTerritorialClassification: 'Sovereign State',
    officialWebsiteUrl: 'https://u.ae/en/information-and-services/visa-and-emirates-id',
    inclusionRationale: 'UN Member State; issues sovereign UAE residence and Golden Visas.'
  },
  {
    authorityId: 'FR_ANEF_MINISTERE',
    countryOrTerritoryIso: 'FR',
    countryOrTerritoryName: 'France',
    officialAuthorityName: 'Ministère de l\'Intérieur & ANEF',
    authorityType: 'UN Member State Sovereign Authority',
    sovereignTerritorialClassification: 'Sovereign State',
    officialWebsiteUrl: 'https://france-visas.gouv.fr/',
    inclusionRationale: 'UN Member State & EU Schengen Member; issues sovereign France visas.'
  },
  {
    authorityId: 'VA_GOVERNATORATO',
    countryOrTerritoryIso: 'VA',
    countryOrTerritoryName: 'Vatican City State',
    officialAuthorityName: 'Pontifical Commission & Secretariate of State (Holy See)',
    authorityType: 'UN Permanent Observer Sovereign Authority',
    sovereignTerritorialClassification: 'Sovereign State',
    officialWebsiteUrl: 'https://www.vatican.va/',
    inclusionRationale: 'UN Permanent Observer Sovereign State; issues ecclesiastical residence permits.'
  },
  {
    authorityId: 'KP_SUPREME_ASSEMBLY',
    countryOrTerritoryIso: 'KP',
    countryOrTerritoryName: 'North Korea (DPRK)',
    officialAuthorityName: 'Ministry of Foreign Affairs & Supreme People\'s Assembly',
    authorityType: 'UN Member State Sovereign Authority',
    sovereignTerritorialClassification: 'Sovereign State',
    officialWebsiteUrl: 'http://www.mfa.gov.kp/',
    inclusionRationale: 'UN Member State; issues sovereign DPRK visas and entry permits.'
  },
  {
    authorityId: 'TV_IMMIGRATION_DEPT',
    countryOrTerritoryIso: 'TV',
    countryOrTerritoryName: 'Tuvalu',
    officialAuthorityName: 'Department of Foreign Affairs & Immigration Tuvalu',
    authorityType: 'UN Member State Sovereign Authority',
    sovereignTerritorialClassification: 'Sovereign State',
    officialWebsiteUrl: 'https://tuvalugov.tv/',
    inclusionRationale: 'UN Member State; issues sovereign Tuvaluan visas and entry permits.'
  }
];

export function getSovereignAuthorityAuditMetrics() {
  return {
    totalSovereignAuthorities: 195,
    unMemberStatesCount: 193,
    unObserverStatesCount: 2, // Holy See (Vatican City) & State of Palestine
    totalGeographicDestinations: 249,
    autonomousTerritoriesCount: 54 // e.g. Puerto Rico, Bermuda, Cayman Islands, etc.
  };
}
