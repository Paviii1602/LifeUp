import { useState } from 'react';
import { Card, C, Btn, Input, toast } from '../components/UI';
import { useAuth } from '../hooks/useAuth';
import api from '../lib/api';

const AVATARS = ['🌿','🦁','🐯','🦊','🐺','🦅','🌙','⭐','🔥','💎','🚀','🎯'];

export default function ProfilePage() {
  const { user, logout } = useAuth();
  const [name,     setName]     = useState(user?.name || '');
  const [avatar,   setAvatar]   = useState(user?.avatar || '🌿');
  const [password, setPassword] = useState('');
  const [saving,   setSaving]   = useState(false);

  const save = async () => {
    if (!name.trim()) return toast('Name cannot be empty','error');
    setSaving(true);
    try {
      await api.put('/auth/update', { name, avatar, ...(password ? {password} : {}) });
      toast('Profile updated! ✅');
      setPassword('');
    } catch(e) {
      toast(e?.response?.data?.message || 'Failed to update','error');
    } finally { setSaving(false); }
  };

  return (
    <div style={{ flex:1, overflowY:'auto', paddingBottom:10 }}>
      <div style={{ padding:'20px 18px' }}>
        <h1 style={{ fontSize:22, fontWeight:800, color:C.text, margin:'0 0 4px', letterSpacing:'-0.5px' }}>👤 Profile</h1>
        <p style={{ fontSize:13, color:C.muted, margin:'0 0 20px' }}>Your account settings</p>

        {/* Avatar */}
        <Card style={{ marginBottom:16, textAlign:'center' }}>
          <div style={{ fontSize:64, marginBottom:12 }}>{avatar}</div>
          <div style={{ fontSize:15, fontWeight:700, color:C.text, marginBottom:2 }}>{user?.name}</div>
          <div style={{ fontSize:12, color:C.muted, marginBottom:4 }}>{user?.email}</div>
          <div style={{ display:'flex', justifyContent:'center', gap:16 }}>
            <div style={{ textAlign:'center' }}>
              <div style={{ fontSize:18, fontWeight:800, color:C.accent }}>Lv.{user?.level||1}</div>
              <div style={{ fontSize:10, color:C.muted }}>Level</div>
            </div>
            <div style={{ textAlign:'center' }}>
              <div style={{ fontSize:18, fontWeight:800, color:'#f59e0b' }}>{user?.xp||0}</div>
              <div style={{ fontSize:10, color:C.muted }}>XP</div>
            </div>
          </div>
        </Card>

        {/* Choose avatar */}
        <Card style={{ marginBottom:16 }}>
          <div style={{ fontSize:13, fontWeight:600, color:C.text, marginBottom:12 }}>Choose Avatar</div>
          <div style={{ display:'flex', flexWrap:'wrap', gap:10 }}>
            {AVATARS.map(a=>(
              <button key={a} onClick={()=>setAvatar(a)} style={{
                width:44, height:44, borderRadius:12, fontSize:24, cursor:'pointer',
                border:`2px solid ${avatar===a?C.accent:'transparent'}`,
                background: avatar===a ? 'rgba(124,58,237,0.2)' : 'rgba(255,255,255,0.04)',
                transition:'all .15s',
              }}>{a}</button>
            ))}
          </div>
        </Card>

        {/* Edit info */}
        <Card style={{ marginBottom:16 }}>
          <div style={{ fontSize:13, fontWeight:600, color:C.text, marginBottom:14 }}>Edit Info</div>
          <Input label="Display name" value={name} onChange={e=>setName(e.target.value)} placeholder="Your name"/>
          <Input label="New password (leave blank to keep)" type="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="••••••••"/>
          <Btn onClick={save} disabled={saving} style={{ width:'100%', marginTop:4 }}>
            {saving ? 'Saving...' : 'Save Changes'}
          </Btn>
        </Card>

        {/* Stats */}
        <Card style={{ marginBottom:16 }}>
          <div style={{ fontSize:13, fontWeight:600, color:C.text, marginBottom:14 }}>Your Stats</div>
          {[
            {label:'Total XP earned',  val:`${user?.xp||0} XP`,  icon:'⚡'},
            {label:'Current level',    val:`Level ${user?.level||1}`, icon:'🏅'},
            {label:'Account email',    val:user?.email||'—',     icon:'📧'},
          ].map(s=>(
            <div key={s.label} style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'10px 0', borderBottom:`1px solid ${C.border}` }}>
              <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                <span style={{ fontSize:18 }}>{s.icon}</span>
                <span style={{ fontSize:13, color:C.muted }}>{s.label}</span>
              </div>
              <span style={{ fontSize:13, fontWeight:700, color:C.text }}>{s.val}</span>
            </div>
          ))}
        </Card>

        {/* Logout */}
        <button onClick={logout} style={{
          width:'100%', padding:'13px', borderRadius:12,
          border:'1px solid rgba(244,63,94,0.35)', background:'rgba(244,63,94,0.08)',
          color:'#f43f5e', fontSize:14, fontWeight:700, cursor:'pointer',
          fontFamily:'Outfit,sans-serif',
        }}>Sign Out</button>
      </div>
    </div>
  );
}
