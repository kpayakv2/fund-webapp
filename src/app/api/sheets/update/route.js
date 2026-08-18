import { NextResponse } from 'next/server';
import { google } from 'googleapis';

export async function POST(request) {
  try {
    // Basic PIN check for security
    const body = await request.json();
    const { pin, rowNumber, senderName, amount, reasonToCheck, needCheck } = body;
    
    if (pin !== process.env.ADMIN_PIN) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

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

    // We need to update specific cells in the row.
    // Row 1 is headers. So array index 1 corresponds to Row 2.
    // The exact row in sheets is rowNumber + 1 (since id starts from 1 based on slice)
    // Actually, id is index + 1 (from slice(1)), so id 1 = row 2 in sheet.
    const exactRow = rowNumber + 1; 

    // We will update G (Sender_Name), I (Amount), Q (Need_Check), R (Reason_To_Check)
    // It's easier to just update the range G:R for that row, but we don't want to overwrite other columns.
    
    // Update Sender_Name (G)
    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: `ชีต1!G${exactRow}`,
      valueInputOption: 'USER_ENTERED',
      requestBody: { values: [[senderName]] },
    });

    // Update Amount (I)
    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: `ชีต1!I${exactRow}`,
      valueInputOption: 'USER_ENTERED',
      requestBody: { values: [[amount]] },
    });

    // Update Need_Check (Q) and Reason (R)
    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: `ชีต1!Q${exactRow}:R${exactRow}`,
      valueInputOption: 'USER_ENTERED',
      requestBody: { values: [[needCheck ? 'TRUE' : 'FALSE', reasonToCheck || '']] },
    });

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error('Error updating sheet:', error);
    return NextResponse.json({ error: 'Failed to update data' }, { status: 500 });
  }
}
