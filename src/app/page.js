import Link from 'next/link';
import { getSheetsData } from '@/lib/sheets';
import PublicClient from './PublicClient';

// Force real-time fetch on every request
export const dynamic = 'force-dynamic';

export default async function Home() {
  const { transactions, members } = await getSheetsData();

  return (
    <div>
      <div className="flex-between" style={{ marginBottom: '2rem' }}>
        <div>
          <h1>กองทุนรวม (Fund Dashboard)</h1>
          <p>ระบบตรวจสอบสถานะการโอนเงินกองทุน (อัปเดตเรียลไทม์)</p>
        </div>
        <Link href="/admin" className="btn-primary" style={{ textDecoration: 'none' }}>
          🔒 เข้าสู่ระบบแอดมิน
        </Link>
      </div>

      <PublicClient transactions={transactions} members={members} />
    </div>
  );
}
