'use client';

import { api } from '@/lib/api';
import React, { useState } from 'react';
import Link from 'next/link';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [debug, setDebug] = useState('');

  const handleLogin = async () => {
    setDebug('Starting login...');
    if (!email || !password) { setError('Email ve sifre gerekli'); return; }
    setIsLoading(true);
    setError('');
    try {
      setDebug('Calling API...');
      const tokens = await api.login({ email, password });
      setDebug('Got tokens, redirecting...');
      if (!tokens.accessToken) { throw new Error('Giris basarisiz'); }
      const payload = JSON.parse(atob(tokens.accessToken.split('.')[1]));
      setDebug('Role: ' + payload.role + ' - Redirecting in 2s...');
      setTimeout(() => {
        if (payload.role === 'TEACHER') { window.location.href = '/teacher/dashboard'; }
        else if (payload.role === 'STUDENT') { window.location.href = '/student/dashboard'; }
        else if (payload.role === 'ADMIN') { window.location.href = '/admin/dashboard'; } else { window.location.href = '/'; }
      }, 2000);
    } catch (err: any) { 
      setDebug('Error: ' + err.message);
      setError(err.message || 'Giris basarisiz'); 
    }
    finally { setIsLoading(false); }
  };

  return (
    <div style={{minHeight:'100vh',display:'flex'}}>
      <div style={{flex:1,display:'flex',flexDirection:'column',justifyContent:'center',padding:'48px'}}>
        <div style={{maxWidth:'400px',margin:'0 auto',width:'100%'}}>
          <h1 style={{fontSize:'32px',marginBottom:'24px'}}>Giris Yap</h1>
          {debug && <div style={{padding:'12px',background:'#efe',color:'green',borderRadius:'8px',marginBottom:'16px'}}>{debug}</div>}
          {error && <div style={{padding:'12px',background:'#fee',color:'red',borderRadius:'8px',marginBottom:'16px'}}>{error}</div>}
          <div style={{marginBottom:'16px'}}>
            <label style={{display:'block',marginBottom:'8px'}}>E-posta</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} style={{width:'100%',padding:'12px',border:'1px solid #ccc',borderRadius:'8px'}} placeholder="ornek@email.com" />
          </div>
          <div style={{marginBottom:'16px'}}>
            <label style={{display:'block',marginBottom:'8px'}}>Sifre</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} style={{width:'100%',padding:'12px',border:'1px solid #ccc',borderRadius:'8px'}} placeholder="Sifre" />
          </div>
          <button onClick={handleLogin} disabled={isLoading} style={{width:'100%',padding:'16px',background:'#1e3a8a',color:'white',border:'none',borderRadius:'8px',cursor:'pointer'}}>
            {isLoading ? 'Yukleniyor...' : 'Giris Yap'}
          </button>
          <p style={{textAlign:'center',marginTop:'24px'}}>Hesabiniz yok mu? <Link href="/register">Kayit Olun</Link></p>
        </div>
      </div>
    </div>
  );
}
