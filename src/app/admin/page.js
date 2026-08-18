'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminLogin() {
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pin }),
      });
      const data = await res.json();
      if (data.success) {
        sessionStorage.setItem('admin_auth', 'true');
        router.push('/admin/slips');
      } else {
        setError('รหัส PIN ไม่ถูกต้อง กรุณาลองใหม่');
        setPin('');
      }
    } catch {
      setError('เกิดข้อผิดพลาด กรุณาลองใหม่');
    }
    setLoading(false);
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    }}>
      <div className="glass-panel" style={{ width: '100%', maxWidth: '400px', textAlign: 'center' }}>
        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🔐</div>
        <h2 style={{ marginBottom: '0.5rem' }}>Admin Login</h2>
        <p style={{ marginBottom: '2rem' }}>กรุณาใส่รหัส PIN เพื่อเข้าสู่ระบบ</p>

        <form onSubmit={handleLogin}>
          <input
            type="password"
            inputMode="numeric"
            maxLength={8}
            placeholder="กรอก PIN..."
            value={pin}
            onChange={(e) => setPin(e.target.value)}
            className="input-field"
            style={{ textAlign: 'center', fontSize: '1.5rem', letterSpacing: '0.5rem' }}
            autoFocus
          />
          {error && (
            <p style={{ color: 'var(--accent-red)', marginBottom: '1rem', fontSize: '0.9rem' }}>
              {error}
            </p>
          )}
          <button
            type="submit"
            className="btn-primary"
            style={{ width: '100%', marginBottom: '1rem' }}
            disabled={loading || pin.length < 4}
          >
            {loading ? 'กำลังตรวจสอบ...' : '🔓 เข้าสู่ระบบ'}
          </button>
        </form>
        
        <button
          onClick={() => router.push('/')}
          className="btn-primary"
          style={{ width: '100%', marginTop: '0.5rem' }}
        >
          ← กลับหน้าหลัก
        </button>
      </div>
    </div>
  );
}
