import { useEffect, useState, useCallback, useRef } from 'react';
import { Card, C, ProgressBar, Spinner, toast } from '../components/UI';
import api from '../lib/api';

const COLORS = ['#7c3aed','#22c55e','#f59e0b','#3b82f6','#f43f5e','#14b8a6','#f472b6'];
const ICONS  = ['🎯','💰','🏃','📚','🌱','💼','🏠','✈️','💪','🧠','❤️','⭐'];
const CATS   = ['personal','health','wealth','career','relationship','growth'];
const EMPTY  = { title:'', category:'personal', color:'#7c3aed', icon:'🎯', target_date:'', progress:0 };

// Fully isolated form — owns its own state, never re-mounts unless key changes
function GoalForm({ initial, onSave, onCancel }) {
  const [title,      setTitle]      = useState(initial.title || '');
  const [category,   setCategory]   = useState(initial.category || 'personal');
  const [color,      setColor]      = useState(initial.color || '#7c3aed');
  const [icon,       setIcon]       = useState(initial.icon || '🎯');
  const [targetDate, setTargetDate] = useState(initial.target_date || '');
  const [progress,   setProgress]   = useState(initial.progress || 0);
  const [saving,     setSaving]     = useState(false);
  const inputRef = useRef(null);

  useEffect(() => { inputRef.current?.focus(); }, []);

  const submit = async () => {
    if (!title.trim()) { toast('Enter a goal title','error'); return; }
    setSaving(true);
    try { await onSave({ title, category, color, icon, target_date:targetDate, progress }); }
    catch(e) { toast(e?.response?.data?.message||'Failed to save','error'); setSaving(false); }
  };

  const btnStyle = (active, col) => ({
    width:34, height:34, borderRadius:8, fontSize:17, cursor:'pointer',
    border:`1.5px solid ${active ? col||C.accent : 'rgba(255,255,255,0.1)'}`,
    background: active ? `${col||C.accent}30` : 'transparent',
    transition:'all .15s',
  });

  return (
    <Card style={{ marginBottom:16, border:`1.5px solid rgba(124,58,237,0.5)` }}>
      <div style={{ fontSize:15, fontWeight:700, color:C.text, marginBottom:14 }}>
        {initial.id ? '✏️ Edit Goal' : '✨ New Goal'}
      </div>

      {/* TITLE — native uncontrolled-style trick: ref + defaultValue avoids re-render cursor jump */}
      <div style={{ marginBottom:12 }}>
        <div style={{ fontSize:12, color:C.muted, marginBottom:5, fontWeight:500 }}>Goal title</div>
        <input
          ref={inputRef}
          value={title}
          onChange={e => setTitle(e.target.value)}
          onKeyDown={e => { if(e.key==='Enter') submit(); }}
          placeholder="e.g. Lose 10 kg, Save ₹1 lakh..."
          style={{
            width:'100%', padding:'11px 14px', boxSizing:'border-box',
            background:'rgba(255,255,255,0.07)', border:`1px solid rgba(124,58,237,0.4)`,
            borderRadius:11, color:C.text, fontSize:14, outline:'none',
            fontFamily:'Outfit,sans-serif',
          }}
        />
      </div>

      {/* Category + Date */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, marginBottom:12 }}>
        <div>
          <div style={{ fontSize:12, color:C.muted, marginBottom:5 }}>Category</div>
          <select value={category} onChange={e=>setCategory(e.target.value)} style={{
            width:'100%', padding:'10px 12px', background:'rgba(255,255,255,0.06)',
            border:`1px solid ${C.border}`, borderRadius:10, color:C.text,
            fontSize:13, fontFamily:'Outfit,sans-serif', outline:'none', boxSizing:'border-box',
          }}>
            {CATS.map(c=><option key={c} value={c} style={{ background:'#1a1035' }}>{c}</option>)}
          </select>
        </div>
        <div>
          <div style={{ fontSize:12, color:C.muted, marginBottom:5 }}>Target date</div>
          <input type="date" value={targetDate} onChange={e=>setTargetDate(e.target.value)} style={{
            width:'100%', padding:'10px 12px', background:'rgba(255,255,255,0.06)',
            border:`1px solid ${C.border}`, borderRadius:10, color:C.text,
            fontSize:13, fontFamily:'Outfit,sans-serif', outline:'none',
            boxSizing:'border-box', colorScheme:'dark',
          }}/>
        </div>
      </div>

      {/* Icon */}
      <div style={{ marginBottom:12 }}>
        <div style={{ fontSize:12, color:C.muted, marginBottom:6 }}>Icon</div>
        <div style={{ display:'flex', gap:6, flexWrap:'wrap' }}>
          {ICONS.map(ic=>(
            <button key={ic} onClick={()=>setIcon(ic)} style={btnStyle(icon===ic)}>{ic}</button>
          ))}
        </div>
      </div>

      {/* Color */}
      <div style={{ marginBottom:14 }}>
        <div style={{ fontSize:12, color:C.muted, marginBottom:6 }}>Color</div>
        <div style={{ display:'flex', gap:8 }}>
          {COLORS.map(cl=>(
            <button key={cl} onClick={()=>setColor(cl)} style={{
              width:26, height:26, borderRadius:'50%', background:cl, border:'none', cursor:'pointer',
              outline: color===cl ? `3px solid ${cl}` : 'none', outlineOffset:2,
            }}/>
          ))}
        </div>
      </div>

      {/* Progress slider (edit only) */}
      {initial.id && (
        <div style={{ marginBottom:14 }}>
          <div style={{ display:'flex', justifyContent:'space-between', fontSize:12, color:C.muted, marginBottom:5 }}>
            <span>Progress</span><span style={{ color:C.accent2, fontWeight:600 }}>{progress}%</span>
          </div>
          <input type="range" min="0" max="100" value={progress} onChange={e=>setProgress(+e.target.value)}
            style={{ width:'100%', accentColor:C.accent }}/>
        </div>
      )}

      <div style={{ display:'flex', gap:8 }}>
        <button onClick={submit} disabled={saving} style={{
          flex:1, padding:'12px', borderRadius:11, border:'none',
          background: saving?'rgba(124,58,237,0.4)':'linear-gradient(135deg,#7c3aed,#a78bfa)',
          color:'#fff', fontSize:14, fontWeight:600, cursor:saving?'not-allowed':'pointer',
          fontFamily:'Outfit,sans-serif',
        }}>{saving ? 'Saving...' : initial.id ? 'Update Goal' : 'Add Goal 🎯'}</button>
        <button onClick={onCancel} style={{
          flex:1, padding:'12px', borderRadius:11,
          border:'1px solid rgba(124,58,237,0.3)', background:'rgba(124,58,237,0.08)',
          color:'#a78bfa', fontSize:14, fontWeight:600, cursor:'pointer',
          fontFamily:'Outfit,sans-serif',
        }}>Cancel</button>
      </div>
    </Card>
  );
}

export default function GoalsPage() {
  const [goals,    setGoals]    = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [formMode, setFormMode] = useState(null); // null | 'add' | goal-object
  const [tab,      setTab]      = useState('active');

  const fetchGoals = useCallback(()=>{
    setLoading(true);
    api.get('/goals').then(r=>setGoals(r.data.data||[])).catch(()=>setGoals([])).finally(()=>setLoading(false));
  },[]);

  useEffect(()=>{ fetchGoals(); },[fetchGoals]);

  const handleSave = async (data) => {
    if (formMode?.id) {
      await api.put(`/goals/${formMode.id}`, data);
      toast('Goal updated! ✏️');
    } else {
      await api.post('/goals', data);
      toast('Goal added! 🎯');
    }
    setFormMode(null);
    fetchGoals();
  };

  const updateProgress = async (id, progress) => {
    try {
      await api.put(`/goals/${id}`, { progress });
      setGoals(p=>p.map(g=>g.id===id?{...g,progress}:g));
    } catch { toast('Failed to update','error'); }
  };

  const completeGoal = async (id) => {
    try {
      await api.put(`/goals/${id}`, { completed:true });
      toast('🎉 Goal completed! +50 XP');
      fetchGoals();
    } catch { toast('Failed','error'); }
  };

  const deleteGoal = async (id) => {
    if (!window.confirm('Delete this goal?')) return;
    try { await api.delete(`/goals/${id}`); fetchGoals(); toast('Deleted'); }
    catch { toast('Failed','error'); }
  };

  const active = goals.filter(g=>!g.completed);
  const done   = goals.filter(g=>g.completed);
  const shown  = tab==='active' ? active : done;

  return (
    <div style={{ flex:1, overflowY:'auto', paddingBottom:10 }}>
      <div style={{ padding:'20px 18px' }}>

        {/* Header */}
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:18 }}>
          <div>
            <h1 style={{ fontSize:22, fontWeight:800, color:C.text, margin:'0 0 3px', letterSpacing:'-0.5px' }}>🎯 Goals</h1>
            <p style={{ fontSize:13, color:C.muted, margin:0 }}>Dream big, act daily</p>
          </div>
          {!formMode && (
            <button onClick={()=>setFormMode(EMPTY)} style={{
              padding:'9px 16px', borderRadius:11, border:'none',
              background:'linear-gradient(135deg,#7c3aed,#a78bfa)',
              color:'#fff', fontSize:13, fontWeight:600, cursor:'pointer',
              fontFamily:'Outfit,sans-serif',
            }}>+ Add</button>
          )}
        </div>

        {/* Summary cards */}
        <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:10, marginBottom:16 }}>
          {[
            {label:'Active',       val:active.length,    color:'#7c3aed'},
            {label:'Completed',    val:done.length,      color:'#22c55e'},
            {label:'Avg Progress', val:`${active.length?Math.round(active.reduce((s,g)=>s+g.progress,0)/active.length):0}%`, color:'#f59e0b'},
          ].map(s=>(
            <Card key={s.label} style={{ padding:'13px', textAlign:'center' }}>
              <div style={{ fontSize:22, fontWeight:800, color:s.color }}>{s.val}</div>
              <div style={{ fontSize:10, color:C.muted, marginTop:2 }}>{s.label}</div>
            </Card>
          ))}
        </div>

        {/* Form — key ensures full remount on mode change, preventing stale state */}
        {formMode && (
          <GoalForm
            key={formMode?.id || 'new'}
            initial={formMode}
            onSave={handleSave}
            onCancel={()=>setFormMode(null)}
          />
        )}

        {/* Tabs */}
        <div style={{ display:'flex', gap:6, marginBottom:14, background:'rgba(255,255,255,0.04)', borderRadius:12, padding:4 }}>
          {[['active',`Active (${active.length})`],['completed',`Completed (${done.length})`]].map(([t,l])=>(
            <button key={t} onClick={()=>setTab(t)} style={{
              flex:1, padding:'9px', borderRadius:9, border:'none',
              background: tab===t ? 'linear-gradient(135deg,#7c3aed,#a78bfa)' : 'none',
              color: tab===t ? '#fff' : C.muted,
              fontSize:13, fontWeight:600, cursor:'pointer', fontFamily:'Outfit,sans-serif',
            }}>{l}</button>
          ))}
        </div>

        {/* Goal list */}
        {loading ? <Spinner/> : shown.map(g=>(
          <Card key={g.id} style={{ marginBottom:12 }}>
            <div style={{ display:'flex', alignItems:'flex-start', gap:12 }}>
              <div style={{
                width:42, height:42, borderRadius:13,
                background:`${g.color||'#7c3aed'}25`,
                border:`1.5px solid ${g.color||'#7c3aed'}40`,
                display:'flex', alignItems:'center', justifyContent:'center', fontSize:22, flexShrink:0,
              }}>{g.icon}</div>
              <div style={{ flex:1, minWidth:0 }}>
                <div style={{ fontSize:14, fontWeight:700, color:g.completed?C.muted:C.text, textDecoration:g.completed?'line-through':'none', marginBottom:3 }}>{g.title}</div>
                <div style={{ display:'flex', gap:7, alignItems:'center', marginBottom:8, flexWrap:'wrap' }}>
                  <span style={{ fontSize:10, background:`${g.color||'#7c3aed'}20`, color:g.color||'#7c3aed', borderRadius:6, padding:'2px 7px', textTransform:'capitalize' }}>{g.category}</span>
                  {g.target_date && <span style={{ fontSize:10, color:C.muted }}>📅 {g.target_date}</span>}
                </div>
                <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom: g.completed?0:8 }}>
                  <div style={{ flex:1 }}><ProgressBar pct={g.progress} color={g.color||C.accent}/></div>
                  <span style={{ fontSize:12, fontWeight:700, color:g.color||C.accent, minWidth:32 }}>{g.progress}%</span>
                </div>
                {!g.completed && (
                  <input type="range" min="0" max="100" value={g.progress}
                    onChange={e=>updateProgress(g.id,+e.target.value)}
                    style={{ width:'100%', accentColor:g.color||C.accent, marginBottom:10 }}/>
                )}
                {!g.completed && (
                  <div style={{ display:'flex', gap:6, flexWrap:'wrap' }}>
                    <button onClick={()=>setFormMode(g)} style={{ padding:'6px 12px', borderRadius:9, border:'1px solid rgba(124,58,237,0.3)', background:'rgba(124,58,237,0.1)', color:'#a78bfa', fontSize:11, fontWeight:600, cursor:'pointer', fontFamily:'Outfit,sans-serif' }}>✏️ Edit</button>
                    <button onClick={()=>completeGoal(g.id)} style={{ padding:'6px 12px', borderRadius:9, border:'1px solid rgba(34,197,94,0.3)', background:'rgba(34,197,94,0.1)', color:'#22c55e', fontSize:11, fontWeight:600, cursor:'pointer', fontFamily:'Outfit,sans-serif' }}>✓ Done</button>
                    <button onClick={()=>deleteGoal(g.id)} style={{ padding:'6px 12px', borderRadius:9, border:'1px solid rgba(244,63,94,0.3)', background:'rgba(244,63,94,0.1)', color:'#f43f5e', fontSize:11, fontWeight:600, cursor:'pointer', fontFamily:'Outfit,sans-serif' }}>🗑 Delete</button>
                  </div>
                )}
              </div>
            </div>
          </Card>
        ))}

        {!loading && !shown.length && (
          <div style={{ textAlign:'center', padding:'40px 20px', color:C.muted }}>
            <div style={{ fontSize:48, marginBottom:14 }}>🎯</div>
            <div style={{ fontSize:16, marginBottom:6, color:C.text }}>{tab==='active'?'No active goals':'No completed goals yet'}</div>
            <div style={{ fontSize:13 }}>{tab==='active'?'Tap + Add to create your first goal':'Complete a goal to see it here'}</div>
          </div>
        )}
      </div>
    </div>
  );
}
