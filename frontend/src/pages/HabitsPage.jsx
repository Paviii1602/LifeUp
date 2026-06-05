import { useEffect, useState, useCallback } from 'react';
import { Card, C, Btn, Input, SectionHead, ProgressBar, Spinner, toast } from '../components/UI';
import api from '../lib/api';

// ✅ Day labels starting Monday (index 0 = Mon, …, 6 = Sun)
const DAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

// ✅ Get today's 0-based index in the Mon-Sun week
//    JS getDay(): 0=Sun,1=Mon,...,6=Sat  → remap to Mon=0,...,Sun=6
function getTodayIdx() {
  const jsDay = new Date().getDay(); // 0=Sun
  return jsDay === 0 ? 6 : jsDay - 1; // Sun→6, Mon→0, Tue→1 ...
}

const CATS   = ['health', 'mind', 'wealth', 'other'];
const COLORS = ['#7c3aed', '#22c55e', '#f59e0b', '#3b82f6', '#f43f5e', '#14b8a6'];
const ICONS  = ['✅', '🏋️', '💧', '📚', '🧘', '💰', '🌅', '🏃', '🍎', '💊', '🎯', '🧠'];

export default function HabitsPage() {
  const [habits,  setHabits]  = useState([]);
  const [loading, setLoading] = useState(true);
  const [adding,  setAdding]  = useState(false);
  const [form,    setForm]    = useState({ name: '', icon: '✅', category: 'health', color: '#7c3aed' });

  const TODAY_IDX = getTodayIdx(); // computed once per render (stable within a session)

  const fetchHabits = useCallback(() => {
    setLoading(true);
    api.get('/habits')
      .then(r => setHabits(r.data.data || []))
      .catch(() => setHabits([]))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { fetchHabits(); }, [fetchHabits]);

  const toggle = async (id) => {
    try {
      const r = await api.post(`/habits/${id}/toggle`);
      setHabits(prev => prev.map(h =>
        h.id === id ? { ...h, done_today: r.data.data.completed } : h
      ));
      toast(r.data.data.completed ? '+5 XP earned! ⚡' : 'Habit unmarked');
    } catch { toast('Failed', 'error'); }
  };

  const addHabit = async () => {
    if (!form.name.trim()) return toast('Enter a habit name', 'error');
    try {
      await api.post('/habits', form);
      setAdding(false);
      setForm({ name: '', icon: '✅', category: 'health', color: '#7c3aed' });
      fetchHabits();
      toast('Habit added! 🎉');
    } catch (e) { toast(e?.response?.data?.message || 'Failed', 'error'); }
  };

  const delHabit = async (id) => {
    if (!window.confirm('Delete this habit?')) return;
    try { await api.delete(`/habits/${id}`); fetchHabits(); toast('Deleted'); }
    catch { toast('Failed', 'error'); }
  };

  const done  = habits.filter(h => h.done_today).length;
  const total = habits.length;

  return (
    <div style={{ flex: 1, overflowY: 'auto', paddingBottom: 10 }}>
      <div style={{ padding: '20px 18px' }}>

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 18 }}>
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 800, color: C.text, margin: '0 0 3px', letterSpacing: '-0.5px' }}>✅ Habits</h1>
            <p style={{ fontSize: 13, color: C.muted, margin: 0 }}>Small steps, every day</p>
          </div>
          <button onClick={() => setAdding(!adding)} style={{
            padding: '9px 16px', borderRadius: 11, border: 'none',
            background: 'linear-gradient(135deg,#7c3aed,#a78bfa)',
            color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'Outfit,sans-serif',
          }}>+ Add</button>
        </div>

        {/* Progress summary */}
        <Card style={{ marginBottom: 14 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <div>
              <div style={{ fontSize: 26, fontWeight: 800, color: C.text }}>
                {done}<span style={{ fontSize: 15, color: C.muted, fontWeight: 400 }}>/{total}</span>
              </div>
              <div style={{ fontSize: 12, color: C.muted }}>completed today</div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 20 }}>🔥</div>
              <div style={{ fontSize: 12, color: '#f59e0b', fontWeight: 600 }}>Streak active!</div>
            </div>
          </div>
          <ProgressBar pct={total ? Math.round(done / total * 100) : 0} color="#7c3aed" height={8} />
        </Card>

        {/* Add form */}
        {adding && (
          <Card style={{ marginBottom: 14, border: `1px solid rgba(124,58,237,0.4)` }}>
            <SectionHead title="New Habit" />
            <Input label="Habit name" placeholder="e.g. Drink 3L Water"
              value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} />
            <div style={{ marginBottom: 12 }}>
              <div style={{ fontSize: 12, color: C.muted, marginBottom: 6 }}>Icon</div>
              <div style={{ display: 'flex', gap: 7, flexWrap: 'wrap' }}>
                {ICONS.map(ic => (
                  <button key={ic} onClick={() => setForm(p => ({ ...p, icon: ic }))} style={{
                    width: 34, height: 34, borderRadius: 8, fontSize: 18, cursor: 'pointer',
                    border: `1.5px solid ${form.icon === ic ? C.accent : C.border}`,
                    background: form.icon === ic ? 'rgba(124,58,237,0.2)' : 'transparent',
                  }}>{ic}</button>
                ))}
              </div>
            </div>
            <div style={{ marginBottom: 12 }}>
              <div style={{ fontSize: 12, color: C.muted, marginBottom: 6 }}>Category</div>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {CATS.map(cat => (
                  <button key={cat} onClick={() => setForm(p => ({ ...p, category: cat }))} style={{
                    padding: '6px 12px', borderRadius: 8, cursor: 'pointer',
                    border: `1px solid ${form.category === cat ? C.accent : C.border}`,
                    background: form.category === cat ? 'rgba(124,58,237,0.15)' : 'transparent',
                    color: form.category === cat ? C.accent2 : C.muted,
                    fontSize: 12, fontFamily: 'Outfit,sans-serif', textTransform: 'capitalize',
                  }}>{cat}</button>
                ))}
              </div>
            </div>
            <div style={{ marginBottom: 14 }}>
              <div style={{ fontSize: 12, color: C.muted, marginBottom: 6 }}>Color</div>
              <div style={{ display: 'flex', gap: 8 }}>
                {COLORS.map(cl => (
                  <button key={cl} onClick={() => setForm(p => ({ ...p, color: cl }))} style={{
                    width: 26, height: 26, borderRadius: '50%', background: cl, border: 'none', cursor: 'pointer',
                    outline: form.color === cl ? `3px solid ${cl}` : 'none', outlineOffset: 2,
                  }} />
                ))}
              </div>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <Btn onClick={addHabit} style={{ flex: 1 }}>Save Habit</Btn>
              <Btn onClick={() => setAdding(false)} variant="ghost" style={{ flex: 1 }}>Cancel</Btn>
            </div>
          </Card>
        )}

        {/* Column headers */}
        {!loading && habits.length > 0 && (
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: 6, paddingRight: 4 }}>
            <div style={{ flex: 1 }} />
            <div style={{ fontSize: 10, color: C.accent2, background: 'rgba(124,58,237,0.12)', borderRadius: 99, padding: '2px 8px', marginRight: 6, whiteSpace: 'nowrap' }}>
              Streak
            </div>
            {DAY_LABELS.map((d, i) => (
              <div key={i} style={{
                width: 24, textAlign: 'center', fontSize: 10,
                color: i === TODAY_IDX ? C.accent2 : C.muted,
                fontWeight: i === TODAY_IDX ? 700 : 400,
              }}>{d.slice(0, 1)}</div>
            ))}
            <div style={{ width: 28 }} />
          </div>
        )}

        {/* Habit list */}
        {loading ? <Spinner /> : CATS.map(cat => {
          const catHabits = habits.filter(h => h.category === cat);
          if (!catHabits.length) return null;
          return (
            <div key={cat}>
              <div style={{
                fontSize: 10, color: C.muted, fontWeight: 600,
                textTransform: 'uppercase', letterSpacing: '.07em',
                marginBottom: 6, marginTop: 10,
              }}>{cat}</div>

              {catHabits.map(h => (
                <Card key={h.id} style={{ marginBottom: 8, padding: '12px 14px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>

                    {/* Toggle button — marks TODAY */}
                    <button onClick={() => toggle(h.id)} style={{
                      width: 34, height: 34, borderRadius: 10, border: 'none', cursor: 'pointer',
                      background: h.done_today ? h.color : 'rgba(255,255,255,0.06)',
                      fontSize: 17, transition: 'all .2s', flexShrink: 0,
                    }}>
                      {h.done_today ? '✅' : h.icon}
                    </button>

                    {/* Name + streak */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{
                        fontSize: 13, fontWeight: 600,
                        color: h.done_today ? C.muted : C.text,
                        textDecoration: h.done_today ? 'line-through' : 'none',
                      }}>{h.name}</div>
                      <div style={{ fontSize: 10, color: '#f59e0b' }}>🔥 {h.streak}d streak</div>
                    </div>

                    {/* 7-day history dots — ✅ TODAY_IDX correctly highlights today's column */}
                    <div style={{ display: 'flex', gap: 3, flexShrink: 0 }}>
                      {(h.week || []).map((dayDone, i) => (
                        <div key={i} style={{
                          width: 22, height: 22, borderRadius: 6,
                          background: dayDone ? h.color : 'rgba(255,255,255,0.05)',
                          // Highlight today's column with a colored border
                          border: i === TODAY_IDX
                            ? `2px solid ${h.color}`
                            : '1px solid transparent',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: 10, color: '#fff',
                          transition: 'all .15s',
                        }}>
                          {dayDone ? '✓' : ''}
                        </div>
                      ))}
                    </div>

                    {/* Delete */}
                    <button onClick={() => delHabit(h.id)} style={{
                      background: 'none', border: 'none', color: C.muted,
                      cursor: 'pointer', fontSize: 18, padding: '0 0 0 4px', flexShrink: 0, lineHeight: 1,
                    }}>×</button>
                  </div>
                </Card>
              ))}
            </div>
          );
        })}

        {!loading && !habits.length && (
          <div style={{ textAlign: 'center', padding: '40px 20px', color: C.muted }}>
            <div style={{ fontSize: 48, marginBottom: 14 }}>✅</div>
            <div style={{ fontSize: 16, color: C.text, marginBottom: 6 }}>No habits yet</div>
            <div style={{ fontSize: 13 }}>Tap + Add to create your first habit</div>
          </div>
        )}
      </div>
    </div>
  );
}
