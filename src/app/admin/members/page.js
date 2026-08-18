import { getSheetsData } from '@/lib/sheets';
import MembersClient from './MembersClient';

export const dynamic = 'force-dynamic';

export default async function MembersPage() {
  const { members } = await getSheetsData();

  return (
    <div>
      <div className="flex-between" style={{ marginBottom: '2rem' }}>
        <div>
          <h1 style={{ marginBottom: '0.25rem' }}>👥 จัดการสมาชิก</h1>
          <p>แก้ไขยอดค้างชำระ (Arrears) และค่าธรรมเนียมรายเดือน (Monthly Due)</p>
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <a href="/admin/slips" style={{ textDecoration: 'none' }}>
            <button className="btn-primary">🔍 ตรวจสอบสลิป</button>
          </a>
          <a href="/" style={{ textDecoration: 'none' }}>
            <button className="btn-primary">← กลับหน้าหลัก</button>
          </a>
        </div>
      </div>

      <MembersClient members={members} />
    </div>
  );
}
