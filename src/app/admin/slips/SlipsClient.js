'use client';
import { useState } from 'react';

export default function SlipsClient({ pendingSlips, members }) {
  const [selectedSlip, setSelectedSlip] = useState(pendingSlips[0] || null);
  const [editData, setEditData] = useState({});
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);
  const [processed, setProcessed] = useState(new Set());

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const selectSlip = (slip) => {
    setSelectedSlip(slip);
    setEditData({
      memberId: slip.Matched_Member_ID || '',
      memberName: slip.Matched_Member_Name || '',
      amount: slip.Amount || '',
      coveredPeriods: slip.Covered_Periods || '',
    });
  };

  const handleApprove = async () => {
    if (!selectedSlip) return;
    setLoading(true);
    try {
      const res = await fetch('/api/sheets/approve', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rowIndex: selectedSlip.id, // id = row index from getSheetsData
          action: 'approve',
          memberId: editData.memberId,
          memberName: editData.memberName,
          amount: editData.amount,
          coveredPeriods: editData.coveredPeriods,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setProcessed(prev => new Set([...prev, selectedSlip.id]));
        const remaining = pendingSlips.filter(s => !processed.has(s.id) && s.id !== selectedSlip.id);
        setSelectedSlip(remaining[0] || null);
        showToast('✅ อนุมัติเรียบร้อยแล้ว!', 'success');
      } else {
        showToast('❌ เกิดข้อผิดพลาด: ' + data.error, 'error');
      }
    } catch (err) {
      showToast('❌ เกิดข้อผิดพลาด', 'error');
    }
    setLoading(false);
  };

  const handleReject = async () => {
    if (!selectedSlip) return;
    if (!confirm('ยืนยันการปฏิเสธสลิปนี้?')) return;
    setLoading(true);
    try {
      const res = await fetch('/api/sheets/approve', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rowIndex: selectedSlip.id,
          action: 'reject',
        }),
      });
      const data = await res.json();
      if (data.success) {
        setProcessed(prev => new Set([...prev, selectedSlip.id]));
        const remaining = pendingSlips.filter(s => !processed.has(s.id) && s.id !== selectedSlip.id);
        setSelectedSlip(remaining[0] || null);
        showToast('🗑️ ปฏิเสธสลิปแล้ว', 'warning');
      }
    } catch {
      showToast('❌ เกิดข้อผิดพลาด', 'error');
    }
    setLoading(false);
  };

  const activeSlips = pendingSlips.filter(s => !processed.has(s.id));

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: '1.5rem', alignItems: 'start' }}>

      {/* Toast */}
      {toast && (
        <div style={{
          position: 'fixed', top: '1.5rem', right: '1.5rem', zIndex: 999,
          background: toast.type === 'success' ? 'rgba(16,185,129,0.9)' : toast.type === 'error' ? 'rgba(239,68,68,0.9)' : 'rgba(245,158,11,0.9)',
          color: '#fff', padding: '12px 20px', borderRadius: '10px',
          fontWeight: '600', boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
          animation: 'fadeIn 0.2s ease',
        }}>
          {toast.msg}
        </div>
      )}

      {/* Left: Slip List */}
      <div className="glass-panel" style={{ padding: '16px' }}>
        <h3 style={{ marginBottom: '1rem', fontSize: '1rem' }}>
          รอตรวจสอบ <span style={{ color: 'var(--accent-orange)' }}>({activeSlips.length})</span>
        </h3>
        {activeSlips.length === 0 ? (
          <p style={{ textAlign: 'center', padding: '2rem 0' }}>✅ ไม่มีรายการค้าง</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {activeSlips.map(slip => (
              <div
                key={slip.id}
                onClick={() => selectSlip(slip)}
                className="glass-card"
                style={{
                  cursor: 'pointer',
                  borderColor: selectedSlip?.id === slip.id ? 'var(--accent-orange)' : 'rgba(255,255,255,0.05)',
                  borderWidth: '1px',
                  padding: '12px',
                }}
              >
                <div style={{ fontWeight: '600', fontSize: '0.9rem', marginBottom: '4px' }}>
                  {slip.Sender_Name || 'ไม่ระบุชื่อ'}
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                  ฿{slip.Amount} · {slip.Transfer_Date || '-'}
                </div>
                <div style={{ fontSize: '0.75rem', marginTop: '4px' }}>
                  <span className="badge badge-warning" style={{ fontSize: '0.7rem' }}>
                    {slip.Reason_To_Check?.substring(0, 30) || 'ต้องตรวจสอบ'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Right: Detail Panel */}
      {selectedSlip ? (
        <div className="glass-panel">
          <h3 style={{ marginBottom: '1.5rem' }}>รายละเอียดสลิป #{selectedSlip.id}</h3>

          {/* Slip Image */}
          {selectedSlip.Slip_Image && (
            <div style={{ marginBottom: '1.5rem' }}>
              <a href={selectedSlip.Slip_Image} target="_blank" rel="noopener noreferrer">
                <button className="btn-primary" style={{ width: '100%', background: 'rgba(59,130,246,0.2)', boxShadow: 'none' }}>
                  🖼️ เปิดดูรูปสลิป (Google Drive)
                </button>
              </a>
            </div>
          )}

          {/* Raw Info */}
          <div className="glass-card" style={{ marginBottom: '1.5rem', padding: '12px' }}>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: '1.8' }}>
              <div>📛 <strong>ชื่อในสลิป:</strong> {selectedSlip.Sender_Name || '-'}</div>
              <div>💰 <strong>ยอดโอน:</strong> ฿{selectedSlip.Amount}</div>
              <div>📅 <strong>วันที่:</strong> {selectedSlip.Transfer_Date} {selectedSlip.Transfer_Time}</div>
              <div>📋 <strong>งวด (เดิม):</strong> {selectedSlip.Covered_Periods || '-'}</div>
              <div>⚠️ <strong>สาเหตุ:</strong> <span style={{ color: 'var(--accent-orange)' }}>{selectedSlip.Reason_To_Check || '-'}</span></div>
            </div>
          </div>

          {/* Edit Fields */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '1.5rem' }}>
            <div>
              <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '6px', display: 'block' }}>
                👤 สมาชิก (เลือกจากรายชื่อ)
              </label>
              <select
                className="input-field"
                style={{ marginBottom: 0 }}
                value={editData.memberId || ''}
                onChange={(e) => {
                  const m = members.find(m => m.Member_ID === e.target.value);
                  setEditData(d => ({ ...d, memberId: e.target.value, memberName: m?.Member_Name || '' }));
                }}
              >
                <option value="">-- เลือกสมาชิก --</option>
                {members.map(m => (
                  <option key={m.Member_ID} value={m.Member_ID}>
                    {m.Member_ID} - {m.Member_Name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '6px', display: 'block' }}>
                💰 จำนวนเงิน (บาท)
              </label>
              <input
                type="number"
                className="input-field"
                style={{ marginBottom: 0 }}
                value={editData.amount}
                onChange={(e) => setEditData(d => ({ ...d, amount: e.target.value }))}
              />
            </div>

            <div>
              <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '6px', display: 'block' }}>
                📋 งวดที่ชำระ (เช่น 2026-07 หรือ 2026-07, 2026-08)
              </label>
              <input
                type="text"
                className="input-field"
                style={{ marginBottom: 0 }}
                value={editData.coveredPeriods}
                onChange={(e) => setEditData(d => ({ ...d, coveredPeriods: e.target.value }))}
                placeholder="2026-07"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', gap: '12px' }}>
            <button
              className="btn-success"
              style={{ flex: 1, padding: '14px' }}
              onClick={handleApprove}
              disabled={loading || !editData.memberId}
            >
              {loading ? 'กำลังบันทึก...' : '✅ Approve'}
            </button>
            <button
              onClick={handleReject}
              disabled={loading}
              style={{
                flex: '0 0 auto', padding: '14px 20px',
                background: 'rgba(239,68,68,0.15)',
                border: '1px solid rgba(239,68,68,0.3)',
                color: 'var(--accent-red)', borderRadius: '6px',
                fontWeight: '600', cursor: 'pointer', transition: 'opacity 0.2s',
              }}
            >
              🗑️ Reject
            </button>
          </div>
        </div>
      ) : (
        <div className="glass-panel" style={{ textAlign: 'center', padding: '4rem 2rem' }}>
          <p style={{ fontSize: '1.2rem' }}>✅ ไม่มีรายการรอตรวจสอบ</p>
          <p style={{ marginTop: '0.5rem' }}>ระบบปกติทุกอย่าง</p>
        </div>
      )}
    </div>
  );
}
