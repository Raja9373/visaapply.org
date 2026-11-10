import { db } from './src/db/immigrationDatabase';

import { db, saveVisaDetails } from './src/db/immigrationDatabase';

import { db } from './src/db/immigrationDatabase';
import { VERIFIED_IMMIGRATION_PROGRAMS } from './src/data/globalImmigrationHubData';

function checkDetails() {
  const row = db.prepare('SELECT * FROM visa_details').get() as any;
  console.log("Visa details row:", row);
}
checkDetails();
