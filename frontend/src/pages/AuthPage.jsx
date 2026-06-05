import { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { C, toast } from '../components/UI';

export default function AuthPage() {
  const [mode,    setMode]    = useState('login');
  const [form,    setForm]    = useState({ name:'', email:'', password:'' });
  const [loading, setLoading] = useState(false);
  const { login, register } = useAuth();

  const set = k => e => setForm(p=>({...p,[k]:e.target.value}));

  const submit = async () => {
    if (!form.email||!form.password) return toast('Fill all fields','error');
    setLoading(true);
    try {
      if (mode==='login') await login(form.email, form.password);
      else await register(form.name, form.email, form.password);
    } catch(e) { toast(e?.response?.data?.message||'Something went wrong','error'); }
    finally { setLoading(false); }
  };

  const inp = (label,key,type='text',ph='')=>(
    <div style={{ marginBottom:14 }}>
      <div style={{ fontSize:12, color:C.muted, marginBottom:5, fontWeight:500 }}>{label}</div>
      <input type={type} placeholder={ph} value={form[key]} onChange={set(key)}
        onKeyDown={e=>e.key==='Enter'&&submit()}
        style={{ width:'100%', padding:'12px 14px', background:'rgba(255,255,255,0.07)', border:`1px solid ${C.border}`, borderRadius:11, color:C.text, fontSize:14, outline:'none', fontFamily:'Outfit,sans-serif', boxSizing:'border-box' }}/>
    </div>
  );

  return (
    <div style={{ minHeight:'100vh', background:C.bg, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', padding:24, backgroundImage:'radial-gradient(ellipse at 50% 0%,rgba(124,58,237,0.22) 0%,transparent 65%)' }}>
      {/* Logo */}
      <div style={{ marginBottom:36, textAlign:'center' }}>
        <div style={{ width:70, height:70, borderRadius:24, background:'linear-gradient(135deg,#7c3aed,#a78bfa)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:34, margin:'0 auto 14px', boxShadow:'0 20px 60px rgba(124,58,237,0.4)' }}>🌿</div>
        <div style={{ fontSize:30, fontWeight:800, color:C.text, letterSpacing:'-1px' }}>LifeUp</div>
        <div style={{ fontSize:13, color:C.muted, marginTop:5 }}>Your personal growth companion</div>
      </div>

      {/* Card */}
      <div style={{ width:'100%', maxWidth:380, background:'rgba(255,255,255,0.04)', border:`1px solid ${C.border}`, borderRadius:22, padding:26 }}>
        {/* Tabs */}
        <div style={{ display:'flex', gap:5, marginBottom:22, background:'rgba(255,255,255,0.05)', borderRadius:11, padding:3 }}>
          {['login','register'].map(m=>(
            <button key={m} onClick={()=>setMode(m)} style={{
              flex:1, padding:'10px', borderRadius:9, border:'none',
              background:mode===m?'linear-gradient(135deg,#7c3aed,#a78bfa)':'none',
              color:mode===m?'#fff':C.muted, fontSize:14, fontWeight:600,
              cursor:'pointer', fontFamily:'Outfit,sans-serif', transition:'all .2s',
            }}>{m==='login'?'Sign In':'Sign Up'}</button>
          ))}
        </div>

        {mode==='register' && inp('Your name','name','text','Your name')}
        {inp('Email','email','email','you@email.com')}
        {inp('Password','password','password','••••••••')}

        <button onClick={submit} disabled={loading} style={{
          width:'100%', padding:'13px', borderRadius:12, border:'none',
          background:loading?'rgba(124,58,237,0.5)':'linear-gradient(135deg,#7c3aed,#a78bfa)',
          color:'#fff', fontSize:15, fontWeight:700, cursor:loading?'not-allowed':'pointer',
          fontFamily:'Outfit,sans-serif', marginTop:4,
        }}>{loading?'...':(mode==='login'?'Sign In →':'Create Account →')}</button>
      </div>
    </div>
  );
}
