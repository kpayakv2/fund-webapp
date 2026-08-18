import { getSheetsData } from './src/lib/sheets.js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function run() {
  try {
    const data = await getSheetsData();
    console.log("Total rows:", data.length);
    if (data.length > 0) {
      console.log("First row sample:", data[0]);
    }
  } catch (e) {
    console.error(e);
  }
}
run();
