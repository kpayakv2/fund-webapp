import { google } from 'googleapis';

export async function getSheetsData() {
  const creds = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_CREDENTIALS);
  const auth = new google.auth.GoogleAuth({
    credentials: {
      client_email: creds.client_email,
      private_key: creds.private_key,
    },
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });

  const sheets = google.sheets({ version: 'v4', auth });
  const spreadsheetId = process.env.GOOGLE_SHEET_ID;

  // Fetch E (Slip_Image) to R (Reason_To_Check)
  const transResponse = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: 'ชีต1!E:R', 
  });

  // Fetch Whitelist
  const membersResponse = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: 'Whitelist!A:F', 
  });

  const transRows = transResponse.data.values || [];
  const membersRows = membersResponse.data.values || [];

  let transactions = [];
  if (transRows.length > 0) {
    const headers = transRows[0];
    transactions = transRows.slice(1).map((row, index) => {
      let obj = { id: index + 1 };
      headers.forEach((header, i) => {
        obj[header] = row[i] || '';
      });
      return obj;
    });
    transactions.reverse(); // Newest first
  }

  let members = [];
  if (membersRows.length > 0) {
    const headers = membersRows[0];
    members = membersRows.slice(1).map((row) => {
      let obj = {};
      headers.forEach((header, i) => {
        obj[header] = row[i] || '';
      });
      return obj;
    });
  }

  return { transactions, members };
}
