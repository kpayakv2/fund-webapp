'use client';
import { useState } from 'react';

export default function MembersClient({ members }) {
  const [memberList, setMemberList] = useState(members);
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({ arrears: '', monthlyDue: '' });
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);
  const [search, setSearch] = useState('');

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const startEdit = (member) => {
    setEditingId(member.Member_ID);
    setEditForm({
      arrears: member.Arrears || '0',
      monthlyDue: member.Monthly_Due || '200',
    });
  };

  const handleSave = async (memberId) => {
    setLoading(true);
    try {
      const res = await fetch('/api/sheets/member', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          memberId,
          arrears: parseFloat(editForm.arrears),
          monthlyDue: parseFloat(editForm.monthlyDue),
        }),
      });
      const data = await res.json();
      if (data.success) {
        setMemberList(prev => prev.map(m =>
          m.Member_ID === memberId
            ? { ...m, Arrears: editForm.arrears, Monthly_Due: editForm.monthlyDue }
            : m
        ));
        setEditingId(null);
        showToast('💾 บันทึกเรียบร้อยแล้ว!');
      } else {
        showToast('❌ เกิดข้อผิดพลาด: ' + data.error, 'error');
      }
    } catch {
      showToast('❌ เกิดข้อผิดพลาด', 'error');
    }
    setLoading(false);
  };

  const filtered = memberList.filter(m =>
    m.Member_Name?.toLowerCase().includes(search.toLowerCase()) ||
    m.Member_ID?.toLowerCase().includes(search.toLowerCase())
  );

  const totalArrears = memberList.reduce((s, m) => s + parseFloat(m.Arrears || 0), 0);
  const membersWithArrears = memberList.filter(m => parseFloat(m.Arrears || 0) > 0).length;

  return (
    <>
      {/* Toast */}
      {toast && (
        <div style={{
          position: 'fixed', top: '1.5rem', right: '1.5rem', zIndex: 999,
          background: toast.type === 'error' ? 'rgba(239,68,68,0.9)' : 'rgba(16,185,129,0.9)',
          color: '#fff', padding: '12px 20px', borderRadius: '10px',
          fontWeight: '600', boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
        }}>
          {toast.msg}
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid-2" style={{ marginBottom: '1.5rem' }}>
        <div className="glass-card" style={{ textAlign: 'center', padding: '1.5rem' }}>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
            ยอดหนี้รวมทั้งหมด
          </div>
          <div style={{ fontSize: '2rem', fontWeight: '800', color: totalArrears > 0 ? 'var(--accent-red)' : '#4ade80' }}>
            ฿ {totalArrears.toLocaleString()}
          </div>
        </div>
        <div className="glass-card" style={{ textAlign: 'center', padding: '1.5rem' }}>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
            สมาชิกค้างชำระ
          </div>
          <div style={{ fontSize: '2rem', fontWeight: '800', color: membersWithArrears > 0 ? 'var(--accent-orange)' : '#4ade80' }}>
            {membersWithArrears} <span style={{ fontSize: '1.2rem', color: 'var(--text-secondary)' }}>คน</span>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="glass-panel">
        <div className="flex-between" style={{ marginBottom: '1.5rem', gap: '1rem', flexWrap: 'wrap' }}>
          <h2 style={{ margin: 0 }}>รายชื่อสมาชิกทั้งหมด ({filtered.length} คน)</h2>
          <input
            type="text"
            placeholder="🔍 ค้นหาชื่อ..."
            className="input-field"
            style={{ maxWidth: '250px', marginBottom: 0 }}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', textAlign: 'left' }}>
                <th style={{ padding: '12px 8px', color: 'var(--text-secondary)', fontWeight: '600' }}>รหัส</th>
                <th style={{ padding: '12px 8px', color: 'var(--text-secondary)', fontWeight: '600' }}>ชื่อสมาชิก</th>
                <th style={{ padding: '12px 8px', color: 'var(--text-secondary)', fontWeight: '600', textAlign: 'center' }}>Monthly Due (฿)</th>
                <th style={{ padding: '12px 8px', color: 'var(--text-secondary)', fontWeight: '600', textAlign: 'center' }}>Arrears (฿)</th>
                <th style={{ padding: '12px 8px', color: 'var(--text-secondary)', fontWeight: '600', textAlign: 'center' }}>จัดการ</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(m => {
                const arrears = parseFloat(m.Arrears || 0);
                const isEditing = editingId === m.Member_ID;
                const isSpecial = parseFloat(m.Monthly_Due || 200) !== 200;

                return (
                  <tr
                    key={m.Member_ID}
                    style={{
                      borderBottom: '1px solid rgba(255,255,255,0.05)',
                      background: arrears > 0 ? 'rgba(239,68,68,0.04)' : 'transparent',
                    }}
                  >
                    <td style={{ padding: '12px 8px', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                      {m.Member_ID}
                    </td>
                    <td style={{ padding: '12px 8px', fontWeight: '500' }}>
                      {m.Member_Name}
                      {isSpecial && <span style={{ marginLeft: '6px', fontSize: '0.7rem', color: 'var(--accent-blue)' }}>🔵พิเศษ</span>}
                    </td>

                    {/* Monthly Due */}
                    <td style={{ padding: '12px 8px', textAlign: 'center' }}>
                      {isEditing ? (
                        <input
                          type="number"
                          value={editForm.monthlyDue}
                          onChange={(e) => setEditForm(f => ({ ...f, monthlyDue: e.target.value }))}
                          style={{
                            width: '80px', background: 'rgba(0,0,0,0.3)',
                            border: '1px solid var(--accent-blue)', color: '#fff',
                            padding: '6px 8px', borderRadius: '6px', textAlign: 'center',
                          }}
                        />
                      ) : (
                        <span style={{ color: isSpecial ? 'var(--accent-blue)' : '#fff' }}>
                          {m.Monthly_Due || '200'}
                        </span>
                      )}
                    </td>

                    {/* Arrears */}
                    <td style={{ padding: '12px 8px', textAlign: 'center' }}>
                      {isEditing ? (
                        <input
                          type="number"
                          value={editForm.arrears}
                          onChange={(e) => setEditForm(f => ({ ...f, arrears: e.target.value }))}
                          style={{
                            width: '90px', background: 'rgba(0,0,0,0.3)',
                            border: '1px solid var(--accent-orange)', color: '#fff',
                            padding: '6px 8px', borderRadius: '6px', textAlign: 'center',
                          }}
                        />
                      ) : (
                        <span style={{ fontWeight: '600', color: arrears > 0 ? 'var(--accent-red)' : '#4ade80' }}>
                          {arrears > 0 ? `฿ ${arrears.toLocaleString()}` : '฿ 0'}
                        </span>
                      )}
                    </td>

                    {/* Actions */}
                    <td style={{ padding: '12px 8px', textAlign: 'center' }}>
                      {isEditing ? (
                        <div style={{ display: 'flex', gap: '6px', justifyContent: 'center' }}>
                          <button
                            className="btn-success"
                            style={{ padding: '6px 14px', fontSize: '0.85rem' }}
                            onClick={() => handleSave(m.Member_ID)}
                            disabled={loading}
                          >
                            {loading ? '...' : '💾 บันทึก'}
                          </button>
                          <button
                            onClick={() => setEditingId(null)}
                            style={{
                              padding: '6px 12px', fontSize: '0.85rem',
                              background: 'rgba(255,255,255,0.08)',
                              border: '1px solid rgba(255,255,255,0.15)',
                              color: '#fff', borderRadius: '6px', cursor: 'pointer',
                            }}
                          >
                            ยกเลิก
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => startEdit(m)}
                          style={{
                            padding: '6px 14px', fontSize: '0.85rem',
                            background: 'rgba(59,130,246,0.15)',
                            border: '1px solid rgba(59,130,246,0.3)',
                            color: 'var(--accent-blue)', borderRadius: '6px', cursor: 'pointer',
                            transition: 'opacity 0.2s',
                          }}
                        >
                          ✏️ แก้ไข
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <style>{`.grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; } @media(max-width:600px){.grid-2{grid-template-columns:1fr;}}`}</style>
    </>
  );
}
