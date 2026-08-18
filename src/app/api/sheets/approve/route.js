import { NextResponse } from 'next/server';
import { google } from 'googleapis';

function getAuth() {
  const creds = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_CREDENTIALS);
  return new google.auth.GoogleAuth({
    credentials: { client_email: creds.client_email, private_key: creds.private_key },
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
}

// PUT /api/sheets/approve
// Body: { rowIndex, action, memberId, memberName, amount, coveredPeriods }
// action: 'approve' | 'reject'
export async function PUT(request) {
  try {
    const body = await request.json();
    const { rowIndex, action, memberId, memberName, amount, coveredPeriods } = body;

    const auth = getAuth();
    const sheets = google.sheets({ version: 'v4', auth });
    const spreadsheetId = process.env.GOOGLE_SHEET_ID;

    // rowIndex is 1-based data row (row 2 = first data row)
    // Sheet row = rowIndex + 1 (header is row 1)
    const sheetRow = rowIndex + 1;

    if (action === 'approve') {
      // Update: Matched_Member_ID(J), Matched_Member_Name(K), Amount(I), Covered_Periods(N), Need_Check(Q), Reason(R)
      const updates = [
        { range: `ชีต1!I${sheetRow}`, values: [[amount]] },
        { range: `ชีต1!J${sheetRow}`, values: [[memberId]] },
        { range: `ชีต1!K${sheetRow}`, values: [[memberName]] },
        { range: `ชีต1!N${sheetRow}`, values: [[coveredPeriods]] },
        { range: `ชีต1!Q${sheetRow}`, values: [['FALSE']] },
        { range: `ชีต1!R${sheetRow}`, values: [['ตรวจสอบและอนุมัติโดยแอดมิน']] },
      ];

      await sheets.spreadsheets.values.batchUpdate({
        spreadsheetId,
        requestBody: {
          valueInputOption: 'USER_ENTERED',
          data: updates,
        },
      });

    } else if (action === 'reject') {
      // Mark as REJECTED: ReadyToReply(C) = REJECTED, Need_Check(Q) = FALSE
      const updates = [
        { range: `ชีต1!C${sheetRow}`, values: [['REJECTED']] },
        { range: `ชีต1!Q${sheetRow}`, values: [['FALSE']] },
        { range: `ชีต1!R${sheetRow}`, values: [['ปฏิเสธโดยแอดมิน']] },
      ];

      await sheets.spreadsheets.values.batchUpdate({
        spreadsheetId,
        requestBody: {
          valueInputOption: 'USER_ENTERED',
          data: updates,
        },
      });
    }

    return NextResponse.json({ success: true, action, sheetRow });
  } catch (error) {
    console.error('Approve API error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
