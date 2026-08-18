import { getSheetsData } from '@/lib/sheets';
import SlipsClient from './SlipsClient';

export const dynamic = 'force-dynamic';

export default async function SlipsPage() {
  const { transactions, members } = await getSheetsData();

  // Only pending slips (Need_Check = TRUE and not REJECTED)
  const pendingSlips = transactions
    .filter(t => t.Need_Check === 'TRUE' && t.ReadyToReply !== 'REJECTED')
    .reverse(); // oldest first for review queue

  return (
    <div>
      <div className="flex-between" style={{ marginBottom: '2rem' }}>
        <div>
          <h1 style={{ marginBottom: '0.25rem' }}>🔍 ตรวจสอบสลิป</h1>
          <p>รายการที่ระบบตั้งค่าสถานะว่าต้องตรวจสอบ ({pendingSlips.length} รายการ)</p>
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <a href="/admin/members" style={{ textDecoration: 'none' }}>
            <button className="btn-primary">👥 จัดการสมาชิก</button>
          </a>
          <a href="/" style={{ textDecoration: 'none' }}>
            <button className="btn-primary">← กลับหน้าหลัก</button>
          </a>
        </div>
      </div>

      <SlipsClient pendingSlips={pendingSlips} members={members} />
    </div>
  );
}
