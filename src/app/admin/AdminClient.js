'use client';
import { useState } from 'react';
import Link from 'next/link';

export default function AdminClient({ initialPendingSlips }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [pin, setPin] = useState('');
  const [pendingSlips, setPendingSlips] = useState(initialPendingSlips);
  const [loadingId, setLoadingId] = useState(null);

  const handleLogin = (e) => {
    e.preventDefault();
    if (pin === '1234') { // Should ideally match process.env.ADMIN_PIN via an API check, but hardcoded for demo simplicity
      setIsAuthenticated(true);
    } else {
      alert('PIN ไม่ถูกต้อง!');
    }
  };

  const handleApprove = async (slip) => {
    if (!confirm('ยืนยันการอนุมัติสลิปนี้? ข้อมูลจะถูกอัปเดตลง Google Sheets ทันที')) return;
    
    setLoadingId(slip.id);
    try {
      const res = await fetch('/api/sheets/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pin: '1234',
          rowNumber: slip.id, // This is the id we calculated in getSheetsData (index + 1)
          senderName: slip.Sender_Name,
          amount: slip.Amount,
          needCheck: false,
          reasonToCheck: 'อนุมัติเรียบร้อยโดยพยัคฆ์',
        }),
      });

      if (res.ok) {
        // Remove from list
        setPendingSlips(prev => prev.filter(s => s.id !== slip.id));
        alert('✅ อนุมัติสำเร็จ!');
      } else {
        alert('❌ เกิดข้อผิดพลาดในการอนุมัติ');
      }
    } catch (err) {
      console.error(err);
      alert('❌ เชื่อมต่อเซิร์ฟเวอร์ไม่ได้');
    } finally {
      setLoadingId(null);
    }
  };

  const handleChange = (id, field, value) => {
    setPendingSlips(prev => prev.map(s => s.id === id ? { ...s, [field]: value } : s));
  };

  if (!isAuthenticated) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <div className="glass-panel" style={{ width: '100%', maxWidth: '400px', textAlign: 'center' }}>
          <h2>🔒 เข้าสู่ระบบผู้ดูแล (Admin)</h2>
          <p style={{ marginBottom: '2rem' }}>เฉพาะ 'พยัคฆ์' เท่านั้น</p>
          <form onSubmit={handleLogin}>
            <input 
              type="password" 
              className="input-field" 
              placeholder="ใส่รหัส PIN" 
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              required
            />
            <button type="submit" className="btn-primary" style={{ width: '100%' }}>เข้าสู่ระบบ</button>
          </form>
          <div style={{ marginTop: '1rem' }}>
            <Link href="/" style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>กลับหน้าหลัก</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex-between" style={{ marginBottom: '2rem' }}>
        <div>
          <h1>แผงควบคุม (Admin Dashboard)</h1>
          <p>รายการที่รอการอนุมัติ (Pending Approval)</p>
        </div>
        <Link href="/" className="btn-primary" style={{ textDecoration: 'none' }}>
          🏠 กลับหน้าหลัก
        </Link>
      </div>

      <div className="glass-panel">
        <h2 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span className="badge badge-warning">Need Check</span> รายการรอตรวจสอบ
        </h2>
        
        {pendingSlips.length === 0 ? (
          <p>ไม่มีรายการที่ต้องตรวจสอบ 🎉</p>
        ) : (
          <div className="grid-3">
            {pendingSlips.map(slip => (
              <div key={slip.id} className="glass-card" style={{ borderColor: 'rgba(245, 158, 11, 0.4)' }}>
                <h3 style={{ fontSize: '1.1rem', color: 'var(--accent-orange)' }}>⚠️ ต้องการตรวจสอบ</h3>
                <p style={{ fontSize: '0.85rem', marginBottom: '1rem' }}>เหตุผล: {slip.Reason_To_Check}</p>
                
                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>ผู้โอน (อ่านจากสลิป)</label>
                  <input 
                    type="text" 
                    className="input-field" 
                    value={slip.Sender_Name} 
                    onChange={(e) => handleChange(slip.id, 'Sender_Name', e.target.value)}
                  />
                  
                  <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>จำนวนเงิน</label>
                  <input 
                    type="number" 
                    className="input-field" 
                    value={slip.Amount} 
                    onChange={(e) => handleChange(slip.id, 'Amount', e.target.value)}
                  />
                </div>

                <div className="flex-between">
                  {slip.Slip_Image && slip.Slip_Image !== '-' ? (
                    <a href={slip.Slip_Image} target="_blank" rel="noreferrer" style={{ color: 'var(--accent-blue)', fontSize: '0.9rem' }}>🔍 ดูรูปสลิป</a>
                  ) : (
                    <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>ไม่มีรูปสลิป</span>
                  )}
                  
                  <button 
                    className="btn-success" 
                    onClick={() => handleApprove(slip)}
                    disabled={loadingId === slip.id}
                  >
                    {loadingId === slip.id ? 'กำลังบันทึก...' : '✅ อนุมัติ (Approve)'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
