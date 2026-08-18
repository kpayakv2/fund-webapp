'use client';

import { useState, useMemo } from 'react';

export default function PublicClient({ transactions, members }) {
  const [searchTerm, setSearchTerm] = useState('');

  // 1. Compute Total Balance
  const totalBalance = transactions.reduce((sum, t) => {
    if (t.Need_Check !== 'TRUE' && t.Amount) {
      return sum + parseFloat(t.Amount);
    }
    return sum;
  }, 0);

  // 2. Latest 5 Valid Transactions
  const latestTransactions = transactions
    .filter(t => t.Need_Check !== 'TRUE' && t.Amount > 0)
    .slice(0, 5);

  // 3. Extract all unique periods (e.g., "2026-07") from valid transactions
  const allPeriods = useMemo(() => {
    const periods = new Set();
    transactions.forEach(t => {
      if (t.Need_Check !== 'TRUE' && t.Covered_Periods && t.Covered_Periods !== 'N/A') {
        periods.add(t.Covered_Periods);
      }
    });
    // Sort periods chronologically
    return Array.from(periods).sort();
  }, [transactions]);

  // 4. Map which member paid which period
  // memberMatrixData[Member_ID] = Set(['2026-07', '2026-08'])
  const memberMatrixData = useMemo(() => {
    const map = {};
    transactions.forEach(t => {
      if (t.Matched_Member_ID && t.Matched_Member_ID !== 'Unknown' && t.Need_Check !== 'TRUE') {
        if (!map[t.Matched_Member_ID]) {
          map[t.Matched_Member_ID] = new Set();
        }
        if (t.Covered_Periods && t.Covered_Periods !== 'N/A') {
          map[t.Matched_Member_ID].add(t.Covered_Periods);
        }
      }
    });
    return map;
  }, [transactions]);

  // 5. Filter Members based on search
  const filteredMembers = members.filter(m => 
    m.Member_Name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    m.Member_ID.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div>
      {/* 1. Executive Summary */}
      <div className="grid-2" style={{ marginBottom: '2rem' }}>
        <div className="glass-card" style={{ textAlign: 'center', padding: '2rem' }}>
          <h3 style={{ color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>ยอดเงินกองทุนรวม</h3>
          <h1 style={{ fontSize: '3rem', color: '#4ade80' }}>
            ฿ {totalBalance.toLocaleString('th-TH', { minimumFractionDigits: 2 })}
          </h1>
        </div>
        <div className="glass-card" style={{ textAlign: 'center', padding: '2rem' }}>
          <h3 style={{ color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>จำนวนสมาชิกทั้งหมด</h3>
          <h1 style={{ fontSize: '3rem', color: 'var(--primary)' }}>
            {members.length} <span style={{ fontSize: '1.5rem', color: 'var(--text-secondary)' }}>คน</span>
          </h1>
        </div>
      </div>

      {/* 2. Recent Transactions Timeline */}
      <div className="glass-panel" style={{ marginBottom: '2rem' }}>
        <h2 style={{ marginBottom: '1rem' }}>รายการโอนเงินล่าสุด (Recent Transfers)</h2>
        {latestTransactions.length === 0 ? (
          <p>ยังไม่มีรายการโอนเงิน</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {latestTransactions.map((t, idx) => (
              <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px', background: 'rgba(255,255,255,0.03)', borderRadius: '8px' }}>
                <div>
                  <strong style={{ color: '#fff' }}>{t.Matched_Member_Name}</strong>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{t.Transfer_Date} {t.Transfer_Time}</div>
                </div>
                <div style={{ color: '#4ade80', fontWeight: 'bold' }}>
                  +฿ {parseFloat(t.Amount).toLocaleString('th-TH', { minimumFractionDigits: 2 })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 3. Member Search & Real Monthly Matrix */}
      <div className="glass-panel" style={{ overflowX: 'auto' }}>
        <div className="flex-between" style={{ marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
          <h2>ตารางหมากรุก (Member Matrix)</h2>
          <input 
            type="text" 
            placeholder="🔍 ค้นหาชื่อสมาชิก..." 
            className="input-field"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ minWidth: '250px' }}
          />
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '800px' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                <th style={{ padding: '12px' }}>รหัส</th>
                <th style={{ padding: '12px', minWidth: '150px' }}>ชื่อสมาชิก</th>
                {allPeriods.map(period => (
                  <th key={period} style={{ padding: '12px', textAlign: 'center' }}>
                    {period}
                  </th>
                ))}
                <th style={{ padding: '12px', textAlign: 'right' }}>ยอดค้างชำระ (Arrears)</th>
              </tr>
            </thead>
            <tbody>
              {filteredMembers.map(m => {
                const arrears = parseFloat(m.Arrears || 0);
                const paidPeriods = memberMatrixData[m.Member_ID] || new Set();

                return (
                  <tr key={m.Member_ID} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    <td style={{ padding: '12px', color: 'var(--text-secondary)' }}>{m.Member_ID}</td>
                    <td style={{ padding: '12px', fontWeight: '500' }}>{m.Member_Name}</td>
                    
                    {allPeriods.map(period => {
                      const isPaid = paidPeriods.has(period);
                      return (
                        <td key={period} style={{ padding: '12px', textAlign: 'center' }}>
                          {isPaid ? (
                            <span style={{ color: '#4ade80' }}>✅</span>
                          ) : (
                            <span style={{ color: 'rgba(255,255,255,0.1)' }}>-</span>
                          )}
                        </td>
                      );
                    })}

                    <td style={{ padding: '12px', textAlign: 'right' }}>
                      {arrears > 0 ? (
                        <span style={{ color: '#f87171', fontWeight: 'bold' }}>฿ {arrears.toLocaleString()}</span>
                      ) : (
                        <span style={{ color: '#4ade80' }}>฿ 0</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {filteredMembers.length === 0 && (
            <p style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)' }}>ไม่พบชื่อสมาชิกที่ค้นหา</p>
          )}
        </div>
      </div>
    </div>
  );
}
