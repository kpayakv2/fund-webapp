import { NextResponse } from 'next/server';

// POST /api/auth/login
// Body: { pin }
export async function POST(request) {
  const { pin } = await request.json();
  if (pin === process.env.ADMIN_PIN) {
    return NextResponse.json({ success: true });
  }
  return NextResponse.json({ success: false, error: 'รหัสไม่ถูกต้อง' }, { status: 401 });
}
