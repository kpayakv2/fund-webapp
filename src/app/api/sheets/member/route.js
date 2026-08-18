import { NextResponse } from 'next/server';
import { google } from 'googleapis';

function getAuth() {
  const creds = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_CREDENTIALS);
  return new google.auth.GoogleAuth({
    credentials: { client_email: creds.client_email, private_key: creds.private_key },
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
}

// PUT /api/sheets/member
// Body: { memberId, arrears, monthlyDue }
export async function PUT(request) {
  try {
    const body = await request.json();
    const { memberId, arrears, monthlyDue } = body;

    const auth = getAuth();
    const sheets = google.sheets({ version: 'v4', auth });
    const spreadsheetId = process.env.GOOGLE_SHEET_ID;

    // Find the row index of this member in Whitelist
    const res = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: 'Whitelist!A:A',
    });

    const rows = res.data.values || [];
    const memberRowIndex = rows.findIndex(row => row[0] === memberId);

    if (memberRowIndex === -1) {
      return NextResponse.json({ error: `Member ${memberId} not found` }, { status: 404 });
    }

    // Sheet row (1-based): +1 because findIndex is 0-based and row 1 is header
    const sheetRow = memberRowIndex + 1;

    const updates = [];
    if (arrears !== undefined) {
      updates.push({ range: `Whitelist!E${sheetRow}`, values: [[arrears]] });
    }
    if (monthlyDue !== undefined) {
      updates.push({ range: `Whitelist!F${sheetRow}`, values: [[monthlyDue]] });
    }

    if (updates.length > 0) {
      await sheets.spreadsheets.values.batchUpdate({
        spreadsheetId,
        requestBody: {
          valueInputOption: 'USER_ENTERED',
          data: updates,
        },
      });
    }

    return NextResponse.json({ success: true, memberId, sheetRow });
  } catch (error) {
    console.error('Member API error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
