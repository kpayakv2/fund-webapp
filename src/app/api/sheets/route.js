import { NextResponse } from 'next/server';
import { google } from 'googleapis';

export async function GET() {
  try {
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

    // Fetch transactions
    const transResponse = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: 'ชีต1!F:R', 
    });

    // Fetch members and arrears
    const membersResponse = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: 'Whitelist!A:E', 
    });

    const transRows = transResponse.data.values || [];
    const membersRows = membersResponse.data.values || [];

    // Parse Transactions
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
    }

    // Parse Members
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

    return NextResponse.json({ transactions, members }, { status: 200 });
  } catch (error) {
    console.error('Error fetching sheets:', error);
    return NextResponse.json({ error: 'Failed to fetch data' }, { status: 500 });
  }
}
