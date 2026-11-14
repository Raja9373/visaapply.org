import { useEffect, useState } from 'react';
import type * as FullVisaDbMod from '../data/fullVisaDatabase';
import type * as AnyToAnyMatrixMod from '../data/anyToAnyMatrix';
import type * as CanadaVisasMod from '../data/canadaVisas';
import type * as UkRegionalJobsMod from '../data/ukRegionalJobs';
import type * as JpToInMod from '../data/jpToInDetailed';

export interface HeavyVisaBundle {
  fullDb: typeof FullVisaDbMod;
  matrix: typeof AnyToAnyMatrixMod;
  canada: typeof CanadaVisasMod;
  ukRegional: typeof UkRegionalJobsMod;
  jpToIn: typeof JpToInMod;
}

let cachedBundle: HeavyVisaBundle | null = null;
let inflightPromise: Promise<HeavyVisaBundle> | null = null;

export function getCachedHeavyVisaBundle(): HeavyVisaBundle | null {
  return cachedBundle;
}

export async function loadHeavyVisaBundle(): Promise<HeavyVisaBundle> {
  if (cachedBundle) return cachedBundle;
  if (inflightPromise) return inflightPromise;

  inflightPromise = Promise.all([
    import('../data/fullVisaDatabase'),
    import('../data/anyToAnyMatrix'),
    import('../data/canadaVisas'),
    import('../data/ukRegionalJobs'),
    import('../data/jpToInDetailed'),
  ]).then(([fullDb, matrix, canada, ukRegional, jpToIn]) => {
    try {
      fullDb.initializeFullVisaDatabase();
    } catch {
      // Safe fallback if already initialized
    }
    cachedBundle = { fullDb, matrix, canada, ukRegional, jpToIn };
    return cachedBundle;
  });

  return inflightPromise;
}

export function useHeavyVisaBundle(enabled = true): HeavyVisaBundle | null {
  const [bundle, setBundle] = useState<HeavyVisaBundle | null>(() => cachedBundle);

  useEffect(() => {
    if (!enabled) return;
    if (cachedBundle) {
      setBundle(cachedBundle);
      return;
    }
    let cancelled = false;
    void loadHeavyVisaBundle().then((loaded) => {
      if (!cancelled) setBundle(loaded);
    });
    return () => {
      cancelled = true;
    };
  }, [enabled]);

  return bundle;
}
