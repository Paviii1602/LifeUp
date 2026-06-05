import { useEffect, useState } from 'react';
import { Card, C, Ring, ProgressBar, SectionHead, Spinner } from '../components/UI';
import { StepWidget } from '../components/StepCounter';
import api from '../lib/api';
import { useAuth } from '../hooks/useAuth';

const MOOD_EMOJIS = { 1:'😔', 2:'😕', 3:'😊', 4:'😄', 5:'🤩' };
const MOOD_LABELS = { 1:'Low', 2:'Meh', 3:'Good', 4:'Great', 5:'Amazing' };

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  if (h < 21) return 'Good evening';
  return 'Good night';
}
function greetEmoji() {
  const h = new Date().getHours();
  if (h < 12) return '☀️';
  if (h < 17) return '🌤️';
  if (h < 21) return '🌆';
  return '🌙';
}

export default function Dashboard({ onNav }) {
  const { user } = useAuth();
  const [data,    setData]    = useState(null);
  const [pillars, setPillars] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([api.get('/dashboard'), api.get('/pillars')])
      .then(([d, p]) => {
        setData(d.data.data);
        setPillars(p.data.data || []);
      }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const lifeScore = pillars.length
    ? Math.round(pillars.reduce((s, p) => s + p.score, 0) / pillars.length)
    : 0;

  const today   = data?.today   || {};
  const finance = data?.finance || {};

  return (
    <div style={{ flex: 1, overflowY: 'auto', paddingBottom: 10 }}>
      {/* Header */}
      <div style={{ padding: '25px 25px 0', backgroundImage: 'radial-gradient(ellipse at 50% 0%,rgba(124,58,237,0.18) 0%,transparent 65%)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
          <div>
            <div style={{ fontSize: 13, color: C.muted }}>{greeting()},</div>
            <div style={{ fontSize: 22, fontWeight: 800, color: C.text, letterSpacing: '-0.5px' }}>{user?.name} {greetEmoji()}</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 12, color: C.accent2, marginTop: 6, marginBottom:3}}>Lv.{user?.level||1} · {user?.xp||0} XP ⚡</div>
          </div>
        </div>
      </div>

      <div style={{ padding: '10px 18px' }}>
        {loading ? <Spinner /> : <>
          {/* Today's overview */}
          <div style={{ fontSize: 11, color: C.muted, fontWeight: 600, letterSpacing: '.06em', marginBottom: 10 }}>TODAY'S OVERVIEW</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10, marginBottom: 16 }}>
            {/* Steps card - uses auto counter */}
            <Card style={{ padding: '13px 11px' }}>
              <StepWidget compact />
            </Card>

            {[
              { icon:'💧', label:'Water',    val:`${today.water||0}`,    sub:'/8 glasses', pct:Math.round((today.water||0)/8*100),    c:'#3b82f6' },
              { icon:'🌙', label:'Sleep',    val:`${today.sleep||0}h`,   sub:'/8 hrs',     pct:Math.round((today.sleep||0)/8*100),    c:'#8b5cf6' },
              { icon:'🔥', label:'Calories', val:(today.calories||0).toLocaleString(), sub:'kcal', pct:Math.round((today.calories||0)/2000*100), c:'#f59e0b' },
              { icon:'🏋️', label:'Workout',  val:`${today.workout_mins||0}m`, sub:'active', pct:Math.round((today.workout_mins||0)/45*100), c:'#22c55e' },
              { icon:'😊', label:'Mood',     val:data?.mood?MOOD_EMOJIS[data.mood.mood]:'—', sub:data?.mood?MOOD_LABELS[data.mood.mood]:'Log it', pct:data?.mood?data.mood.mood*20:0, c:'#f472b6' },
            ].map(s => (
              <Card key={s.label} style={{ padding: '13px 11px' }}>
                <div style={{ fontSize: 19, marginBottom: 4 }}>{s.icon}</div>
                <div style={{ fontSize: 12, color: C.muted }}>{s.label}</div>
                <div style={{ fontSize: 17, fontWeight: 700, color: C.text, lineHeight: 1.2 }}>{s.val}</div>
                <div style={{ fontSize: 12,  color: C.muted, marginBottom: 6 }}>{s.sub}</div>
                <ProgressBar pct={s.pct} color={s.c} height={3} />
              </Card>
            ))}
          </div>

          {/* Habits */}
          <Card style={{ marginBottom: 14 }}>
            <SectionHead title="✅ Habits Today" action="View All →" onAction={() => onNav('habits')} />
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <Ring score={data?.habits?.total ? Math.round(data.habits.done/data.habits.total*100) : 0} size={58} stroke={6} color="#22c55e">
                <span style={{ fontSize: 12, fontWeight: 700, color: C.text }}>{data?.habits?.done||0}/{data?.habits?.total||0}</span>
              </Ring>
              <div>
                <div style={{ fontSize: 15, fontWeight: 700, color: C.text }}>{data?.habits?.done||0} done today</div>
                <div style={{ fontSize: 12, color: '#f59e0b', marginTop: 3 }}>🔥 Keep your streak!</div>
              </div>
            </div>
          </Card>

          {/* Finance */}
          <Card style={{ marginBottom: 14 }}>
            <SectionHead title="💰 Finance" action="View All →" onAction={() => onNav('finance')} />
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 8 }}>
              {[
                { label:'Income',   val:`₹${(finance.income||0).toLocaleString()}`,   color:'#22c55e' },
                { label:'Expenses', val:`₹${(finance.expenses||0).toLocaleString()}`, color:'#f43f5e' },
                { label:'Savings',  val:`₹${(finance.savings||0).toLocaleString()}`,  color:'#a78bfa' },
              ].map(f => (
                <div key={f.label} style={{ background:'rgba(255,255,255,0.04)', borderRadius:10, padding:'10px 8px', textAlign:'center' }}>
                  <div style={{ fontSize:14, fontWeight:700, color:f.color }}>{f.val}</div>
                  <div style={{ fontSize:12, color:C.muted }}>{f.label}</div>
                </div>
              ))}
            </div>
          </Card>

          {/* Goals */}
          <Card style={{ marginBottom: 14 }}>
            <SectionHead title="🎯 Goals" action="View All →" onAction={() => onNav('goals')} />
            {(data?.goals||[]).slice(0,3).map(g => (
              <div key={g.id} style={{ marginBottom: 10 }}>
                <div style={{ display:'flex', justifyContent:'space-between', marginBottom:4, fontSize:13, color:C.text }}>
                  <span>{g.icon} {g.title}</span>
                  <span style={{ color:g.color||C.accent, fontWeight:700 }}>{g.progress}%</span>
                </div>
                <ProgressBar pct={g.progress} color={g.color||C.accent} />
              </div>
            ))}
            {!data?.goals?.length && <div style={{ color:C.muted, fontSize:13 }}>No goals yet 🎯</div>}
          </Card>

          {/* Quick actions */}
          <div style={{ fontSize:12, color:C.muted, fontWeight:600, letterSpacing:'.06em', marginBottom:10 }}>QUICK ACTIONS</div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:10, marginBottom:20 }}>
            {[
              {icon:'💧',label:'Log Water',   nav:'health'},
              {icon:'😊',label:'Track Mood',  nav:'mood'},
              {icon:'📔',label:'Write Diary', nav:'diary'},
              {icon:'💸',label:'Add Expense', nav:'finance'},
            ].map(q => (
              <button key={q.label} onClick={() => onNav(q.nav)} style={{
                background:'rgba(255,255,255,0.04)', border:`1px solid ${C.border}`,
                borderRadius:14, padding:'13px 6px', cursor:'pointer',
                display:'flex', flexDirection:'column', alignItems:'center', gap:5,
                fontFamily:'Outfit,sans-serif',
              }}>
                <span style={{ fontSize:22 }}>{q.icon}</span>
                <span style={{ fontSize:11, color:C.muted, textAlign:'center' }}>{q.label}</span>
              </button>
            ))}
          </div>
        </>}
      </div>
    </div>
  );
}

// Inline pillar cell with tap-to-edit score
function PillarCell({ pillar, onUpdated }) {
  const [editing, setEditing] = useState(false);
  const [val,     setVal]     = useState(pillar.score);

  const save = async () => {
    try {
      const r = await api.put(`/pillars/${pillar.id}`, { score: val });
      onUpdated(r.data.data);
      setEditing(false);
    } catch { setEditing(false); }
  };

  if (editing) return (
    <div style={{ textAlign:'center', padding:'4px 0' }}>
      <Ring score={val} size={42} stroke={4} color={pillar.color}>
        <span style={{ fontSize:13 }}>{pillar.icon}</span>
      </Ring>
      <div style={{ fontSize:9, color:C.muted, marginTop:2 }}>{pillar.label}</div>
      <input type="number" min="0" max="100" value={val}
        onChange={e => setVal(+e.target.value)}
        onBlur={save}
        onKeyDown={e => e.key==='Enter' && save()}
        autoFocus
        style={{
          width:'100%', marginTop:4, padding:'3px 4px', background:'rgba(255,255,255,0.1)',
          border:`1px solid ${pillar.color}`, borderRadius:6, color:C.text,
          fontSize:12, textAlign:'center', outline:'none', fontFamily:'Outfit,sans-serif',
        }}
      />
    </div>
  );

  return (
    <div style={{ textAlign:'center', cursor:'pointer' }} onClick={() => setEditing(true)}>
      <Ring score={pillar.score} size={42} stroke={4} color={pillar.color}>
        <span style={{ fontSize:13 }}>{pillar.icon}</span>
      </Ring>
      <div style={{ fontSize:9,  color:C.muted, marginTop:2 }}>{pillar.label}</div>
      <div style={{ fontSize:12, fontWeight:700, color:C.text }}>{pillar.score}</div>
    </div>
  );
}
