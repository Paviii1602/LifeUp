import { useState } from 'react';

export const C = {
  bg: '#0f0a1e', surface: '#1a1035', card: '#1a1035',
  border: 'rgba(109,40,217,0.22)', accent: '#7c3aed', accent2: '#a78bfa',
  green: '#22c55e', amber: '#f59e0b', rose: '#f43f5e', blue: '#3b82f6',
  teal: '#14b8a6', pink: '#f472b6',
  text: '#f0ebff', muted: '#8b7aa8',
};

export function Card({ children, style={}, onClick }) {
  return (
    <div onClick={onClick} style={{
      background:'rgba(255,255,255,0.04)', border:`1px solid ${C.border}`,
      borderRadius:18, padding:18, ...style, cursor:onClick?'pointer':undefined,
    }}>{children}</div>
  );
}

export function Btn({ children, onClick, style={}, variant='primary', disabled=false, type='button' }) {
  const v = {
    primary:{ background:'linear-gradient(135deg,#7c3aed,#a78bfa)', color:'#fff', border:'none' },
    ghost:  { background:'rgba(124,58,237,0.1)', color:'#a78bfa', border:'1px solid rgba(124,58,237,0.3)' },
    danger: { background:'rgba(244,63,94,0.1)',  color:'#f43f5e', border:'1px solid rgba(244,63,94,0.3)' },
    success:{ background:'rgba(34,197,94,0.1)',  color:'#22c55e', border:'1px solid rgba(34,197,94,0.3)' },
  };
  return (
    <button type={type} onClick={onClick} disabled={disabled} style={{
      padding:'11px 18px', borderRadius:12, fontSize:14, fontWeight:600,
      cursor:disabled?'not-allowed':'pointer', opacity:disabled?0.5:1,
      transition:'all .2s', fontFamily:'Outfit,sans-serif',
      ...v[variant], ...style,
    }}>{children}</button>
  );
}

export function Input({ label, style={}, containerStyle={}, ...props }) {
  return (
    <div style={{ marginBottom:12, ...containerStyle }}>
      {label && <div style={{ fontSize:12, color:C.muted, marginBottom:5, fontWeight:500 }}>{label}</div>}
      <input style={{
        width:'100%', padding:'11px 14px', background:'rgba(255,255,255,0.06)',
        border:`1px solid ${C.border}`, borderRadius:11, color:C.text, fontSize:14,
        outline:'none', fontFamily:'Outfit,sans-serif', boxSizing:'border-box', ...style,
      }} {...props} />
    </div>
  );
}

export function Textarea({ label, style={}, ...props }) {
  return (
    <div style={{ marginBottom:12 }}>
      {label && <div style={{ fontSize:12, color:C.muted, marginBottom:5, fontWeight:500 }}>{label}</div>}
      <textarea style={{
        width:'100%', padding:'11px 14px', background:'rgba(255,255,255,0.06)',
        border:`1px solid ${C.border}`, borderRadius:11, color:C.text, fontSize:14,
        outline:'none', resize:'vertical', minHeight:80, fontFamily:'Outfit,sans-serif',
        boxSizing:'border-box', ...style,
      }} {...props} />
    </div>
  );
}

export function SectionHead({ title, action, onAction }) {
  return (
    <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:14 }}>
      <span style={{ fontSize:15, fontWeight:700, color:C.text }}>{title}</span>
      {action && <span onClick={onAction} style={{ fontSize:12, color:C.accent2, cursor:'pointer', fontWeight:500 }}>{action}</span>}
    </div>
  );
}

export function ProgressBar({ pct, color=C.accent, height=6, style={} }) {
  return (
    <div style={{ height, background:'rgba(255,255,255,0.08)', borderRadius:99, overflow:'hidden', ...style }}>
      <div style={{ height, width:`${Math.min(100,Math.max(0,pct||0))}%`, background:color, borderRadius:99, transition:'width 1s ease' }} />
    </div>
  );
}

export function Ring({ score, size=80, stroke=7, color='#7c3aed', children }) {
  const r=(size-stroke)/2, circ=2*Math.PI*r, offset=circ*(1-(score||0)/100);
  return (
    <div style={{ position:'relative', width:size, height:size, flexShrink:0 }}>
      <svg width={size} height={size}>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth={stroke}/>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={stroke}
          strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round"
          transform={`rotate(-90 ${size/2} ${size/2})`}
          style={{ transition:'stroke-dashoffset 1.2s ease' }}/>
      </svg>
      <div style={{ position:'absolute', inset:0, display:'flex', alignItems:'center', justifyContent:'center' }}>{children}</div>
    </div>
  );
}

export function Spinner() {
  return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'center', padding:40 }}>
      <div style={{ width:32, height:32, border:'3px solid rgba(124,58,237,0.3)', borderTop:'3px solid #7c3aed', borderRadius:'50%', animation:'spin .8s linear infinite' }}/>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}

// ── Toast ─────────────────────────────────────────
let _setToast;
export function ToastContainer() {
  const [toasts, setToasts] = useState([]);
  _setToast = setToasts;
  return (
    <div style={{ position:'fixed', bottom:82, left:'50%', transform:'translateX(-50%)', zIndex:9999, display:'flex', flexDirection:'column', gap:8, alignItems:'center', pointerEvents:'none', width:'90%', maxWidth:380 }}>
      {toasts.map(t=>(
        <div key={t.id} style={{ background:t.type==='error'?'#f43f5e':'#7c3aed', color:'#fff', padding:'10px 18px', borderRadius:12, fontSize:13, fontWeight:500, boxShadow:'0 8px 24px rgba(0,0,0,0.5)', animation:'slideUp .3s ease', textAlign:'center', width:'100%' }}>{t.msg}</div>
      ))}
      <style>{`@keyframes slideUp{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}`}</style>
    </div>
  );
}
export function toast(msg, type='success') {
  const id=Date.now();
  _setToast?.(p=>[...p,{id,msg,type}]);
  setTimeout(()=>_setToast?.(p=>p.filter(t=>t.id!==id)),3000);
}

// ── Sidebar (replaces inaccessible profile icon) ──
const NAV_ITEMS = [
  { id:'dashboard', icon:'🏠', label:'Dashboard' },
  { id:'health',    icon:'🫀', label:'Health' },
  { id:'habits',    icon:'✅', label:'Habits' },
  { id:'goals',     icon:'🎯', label:'Goals' },
  { id:'mood',      icon:'😊', label:'Mood & Journal' },
  { id:'finance',   icon:'💰', label:'Finance' },
  { id:'diary',     icon:'📔', label:'Notes & Diary' },
  { id:'profile',   icon:'👤', label:'Profile' },
];

export function Sidebar({ active, onNav, onClose }) {
  const { useAuth } = require('../hooks/useAuth');
  return null; // handled inline in App.jsx via SidebarContent
}

export function SidebarContent({ active, onNav, onClose, user, logout }) {
  return (
    <div style={{ position:'fixed', top:0, left:0, width:280, height:'100%', background:'#120d2a', borderRight:`1px solid ${C.border}`, zIndex:300, display:'flex', flexDirection:'column', overflowY:'auto' }}>
      {/* Header */}
      <div style={{ padding:'24px 20px 16px', borderBottom:`1px solid ${C.border}`, display:'flex', justifyContent:'space-between', alignItems:'center' }}>
        <div style={{ display:'flex', alignItems:'center', gap:10 }}>
          <div style={{ width:36, height:36, borderRadius:12, background:'linear-gradient(135deg,#7c3aed,#a78bfa)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:20 }}>🌿</div>
          <span style={{ fontSize:20, fontWeight:800, color:C.text, letterSpacing:'-0.5px' }}>LifeUp</span>
        </div>
        <button onClick={onClose} style={{ background:'none', border:'none', color:C.muted, fontSize:22, cursor:'pointer', padding:4 }}>✕</button>
      </div>

      {/* User card */}
      <div style={{ padding:'16px 20px', borderBottom:`1px solid ${C.border}` }}>
        <div style={{ display:'flex', alignItems:'center', gap:12 }}>
          <div style={{ width:48, height:48, borderRadius:'50%', background:'linear-gradient(135deg,#7c3aed,#f472b6)', display:'flex', alignItems:'center', justifyContent:'center', color:'#fff', fontWeight:800, fontSize:20 }}>
            {user?.name?.[0]?.toUpperCase() || '?'}
          </div>
          <div>
            <div style={{ fontSize:15, fontWeight:700, color:C.text }}>{user?.name}</div>
            <div style={{ fontSize:12, color:C.accent2 }}>Level {user?.level || 1} · {user?.xp || 0} XP ⚡</div>
          </div>
        </div>
      </div>

      {/* Nav items */}
      <nav style={{ flex:1, padding:'10px 12px' }}>
        {NAV_ITEMS.map(n=>(
          <button key={n.id} onClick={()=>onNav(n.id)} style={{
            width:'100%', display:'flex', alignItems:'center', gap:12,
            padding:'11px 14px', borderRadius:12, border:'none',
            background: active===n.id ? 'rgba(124,58,237,0.18)' : 'transparent',
            color: active===n.id ? '#a78bfa' : C.muted,
            fontWeight: active===n.id ? 700 : 400,
            fontSize:14, cursor:'pointer', textAlign:'left',
            fontFamily:'Outfit,sans-serif', transition:'all .15s',
            marginBottom:2,
          }}>
            <span style={{ fontSize:18 }}>{n.icon}</span>
            {n.label}
            {active===n.id && <div style={{ marginLeft:'auto', width:6, height:6, borderRadius:'50%', background:C.accent }} />}
          </button>
        ))}
      </nav>

      {/* Logout */}
      <div style={{ padding:'14px 20px', borderTop:`1px solid ${C.border}` }}>
        <button onClick={logout} style={{
          width:'100%', padding:'11px', borderRadius:12, border:`1px solid rgba(244,63,94,0.3)`,
          background:'rgba(244,63,94,0.08)', color:'#f43f5e',
          fontSize:14, fontWeight:600, cursor:'pointer', fontFamily:'Outfit,sans-serif',
        }}>Sign Out</button>
      </div>
    </div>
  );
}

// ── Bottom Tab Bar ────────────────────────────────
export function BottomBar({ active, onNav, onMenuOpen }) {
  const tabs = [
    { id:'dashboard', icon:'🏠', label:'Home' },
    { id:'health',    icon:'🫀', label:'Health' },
    { id:'habits',    icon:'✅', label:'Habits' },
    { id:'goals',     icon:'🎯', label:'Goals' },
    { id:'more',      icon:'⚡', label:'More' },
  ];
  return (
    <nav style={{
      flexShrink:0, height:68, background:'#120d2a',
      borderTop:`1px solid ${C.border}`,
      display:'flex', alignItems:'center', justifyContent:'space-around',
      padding:'0 4px', zIndex:100,
    }}>
      {tabs.map(t=>(
        <button key={t.id} onClick={()=>onNav(t.id)} style={{
          flex:1, display:'flex', flexDirection:'column', alignItems:'center', gap:2,
          background: active===t.id ? 'rgba(124,58,237,0.15)' : 'none',
          border:'none', cursor:'pointer', padding:'8px 6px', borderRadius:12,
          transition:'all .2s',
        }}>
          <span style={{ fontSize:20 }}>{t.icon}</span>
          <span style={{ fontSize:10, color: active===t.id ? '#a78bfa' : '#8b7aa8', fontWeight: active===t.id?600:400 }}>{t.label}</span>
        </button>
      ))}
      {/* Menu/profile button */}
      <button onClick={onMenuOpen} style={{
        flex:1, display:'flex', flexDirection:'column', alignItems:'center', gap:2,
        background:'none', border:'none', cursor:'pointer', padding:'8px 6px', borderRadius:12,
      }}>
        <span style={{ fontSize:20 }}>☰</span>
        <span style={{ fontSize:10, color:'#8b7aa8' }}>Menu</span>
      </button>
    </nav>
  );
}
