import { useState, useEffect, useRef } from 'react';
import { Card, C, Btn, Input, Textarea, SectionHead, Spinner, toast } from '../components/UI';
import api from '../lib/api';

const MOODS = [
  {val:1,emoji:'😔',label:'Low'},
  {val:2,emoji:'😕',label:'Meh'},
  {val:3,emoji:'😊',label:'Good'},
  {val:4,emoji:'😄',label:'Great'},
  {val:5,emoji:'🤩',label:'Amazing'},
];

function MoodTab() {
  const [selected, setSelected] = useState(3);
  const [energy,   setEnergy]   = useState(5);
  const [journal,  setJournal]  = useState('');
  const [tags,     setTags]     = useState('');
  const [saving,   setSaving]   = useState(false);
  const [history,  setHistory]  = useState([]);
  const [loaded,   setLoaded]   = useState(false);

  // Use a ref to track if today's entry was already loaded so we don't overwrite user edits
  const todayLoadedRef = useRef(false);

  const fetchHistory = () =>
    api.get('/mood?days=14')
      .then(r => {
        const data = r.data.data || [];
        setHistory(data);
        // Only pre-fill today's values on first load, not after a save
        if (!todayLoadedRef.current && data.length) {
          const today = new Date().toISOString().slice(0, 10);
          const todayEntry = data.find(e => e.date === today);
          if (todayEntry) {
            setSelected(todayEntry.mood);
            setEnergy(todayEntry.energy || 5);
            // Do NOT pre-fill journal/tags — let user write fresh each time
          }
          todayLoadedRef.current = true;
        }
        setLoaded(true);
      })
      .catch(() => setLoaded(true));

  useEffect(() => { fetchHistory(); }, []); // eslint-disable-line

  const save = async () => {
    if (!journal.trim()) return toast('Write something in your journal first', 'error');
    setSaving(true);
    try {
      await api.post('/mood', { mood: selected, energy, journal, tags });
      toast('Mood saved! +10 XP ⚡');
      // ✅ Clear the form fields immediately after save
      setJournal('');
      setTags('');
      // Refresh history so the saved entry appears
      todayLoadedRef.current = true; // prevent re-fill from history
      await fetchHistory();
    } catch (e) {
      toast(e?.response?.data?.message || 'Failed to save', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <Card style={{ marginBottom: 14 }}>
        <SectionHead title="How are you feeling?" />

        {/* Mood selector */}
        <div style={{ display: 'flex', justifyContent: 'space-around', marginBottom: 18 }}>
          {MOODS.map(m => (
            <button key={m.val} onClick={() => setSelected(m.val)} style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
              background: selected === m.val ? 'rgba(124,58,237,0.15)' : 'none',
              border: `1.5px solid ${selected === m.val ? C.accent : 'transparent'}`,
              borderRadius: 14, padding: '10px 6px', cursor: 'pointer',
              transition: 'all .2s', minWidth: 50,
            }}>
              <span style={{ fontSize: selected === m.val ? 32 : 26, transition: 'font-size .2s' }}>{m.emoji}</span>
              <span style={{ fontSize: 10, color: selected === m.val ? C.accent2 : C.muted, fontWeight: selected === m.val ? 600 : 400 }}>{m.label}</span>
            </button>
          ))}
        </div>

        {/* Energy slider */}
        <div style={{ marginBottom: 14 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: C.muted, marginBottom: 5 }}>
            <span>Energy level</span>
            <span style={{ color: C.accent2, fontWeight: 600 }}>{energy}/10</span>
          </div>
          <input type="range" min="1" max="10" value={energy}
            onChange={e => setEnergy(+e.target.value)}
            style={{ width: '100%', accentColor: C.accent }} />
        </div>

        {/* Journal - key forces remount after save so text truly clears */}
        <div style={{ marginBottom: 12 }}>
          <div style={{ fontSize: 12, color: C.muted, marginBottom: 5, fontWeight: 500 }}>Today's journal</div>
          <textarea
            key={`journal-${history.length}`}
            value={journal}
            onChange={e => setJournal(e.target.value)}
            placeholder="What happened today? What are you grateful for?"
            style={{
              width: '100%', padding: '11px 14px',
              background: 'rgba(255,255,255,0.06)',
              border: `1px solid ${C.border}`,
              borderRadius: 11, color: C.text, fontSize: 14,
              outline: 'none', resize: 'vertical', minHeight: 90,
              fontFamily: 'Outfit,sans-serif', boxSizing: 'border-box',
            }}
          />
        </div>

        {/* Tags */}
        <div style={{ marginBottom: 12 }}>
          <div style={{ fontSize: 12, color: C.muted, marginBottom: 5, fontWeight: 500 }}>Tags (e.g. #grateful #focused)</div>
          <input
            key={`tags-${history.length}`}
            value={tags}
            onChange={e => setTags(e.target.value)}
            placeholder="#productive #grateful"
            style={{
              width: '100%', padding: '11px 14px',
              background: 'rgba(255,255,255,0.06)',
              border: `1px solid ${C.border}`,
              borderRadius: 11, color: C.text, fontSize: 14,
              outline: 'none', fontFamily: 'Outfit,sans-serif',
              boxSizing: 'border-box',
            }}
          />
        </div>

        <Btn onClick={save} disabled={saving} style={{ width: '100%' }}>
          {saving ? 'Saving...' : 'Save Mood Entry 💾'}
        </Btn>
      </Card>

      {/* History */}
      {loaded && history.length > 0 && (
        <Card>
          <SectionHead title="Recent entries" />
          {history.slice(0, 10).map(h => (
            <div key={h.id} style={{
              display: 'flex', alignItems: 'flex-start', gap: 12,
              padding: '10px 0', borderBottom: `1px solid ${C.border}`,
            }}>
              <span style={{ fontSize: 26, flexShrink: 0 }}>
                {MOODS.find(m => m.val === h.mood)?.emoji || '😊'}
              </span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 11, color: C.muted }}>
                  {h.date} · Energy {h.energy}/10
                </div>
                {h.journal && (
                  <div style={{ fontSize: 13, color: C.text, marginTop: 2, wordBreak: 'break-word' }}>
                    {h.journal}
                  </div>
                )}
                {h.tags && (
                  <div style={{ fontSize: 11, color: C.accent2, marginTop: 3 }}>{h.tags}</div>
                )}
              </div>
            </div>
          ))}
        </Card>
      )}
    </div>
  );
}

// ─── Finance Tab ──────────────────────────────────────────────────────────────
function FinanceTab() {
  const [entries, setEntries] = useState([]);
  const [summary, setSummary] = useState({});
  const [form,    setForm]    = useState({ type: 'expense', amount: '', description: '' });
  const [loading, setLoading] = useState(true);

  const fetchFinance = () =>
    api.get('/finance?days=30')
      .then(r => {
        setEntries(r.data.data?.entries || []);
        setSummary(r.data.data?.summary || {});
      })
      .catch(() => {})
      .finally(() => setLoading(false));

  useEffect(() => { fetchFinance(); }, []);

  const add = async () => {
    if (!form.amount || isNaN(+form.amount) || +form.amount <= 0)
      return toast('Enter a valid amount', 'error');
    try {
      await api.post('/finance', { ...form, amount: +form.amount });
      setForm({ type: form.type, amount: '', description: '' });
      fetchFinance();
      toast('Saved! 💰');
    } catch (e) {
      toast(e?.response?.data?.message || 'Failed', 'error');
    }
  };

  const del = async (id) => {
    try { await api.delete(`/finance/${id}`); fetchFinance(); toast('Deleted'); }
    catch { toast('Failed', 'error'); }
  };

  return (
    <div>
      {/* Summary */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 10, marginBottom: 14 }}>
        {[
          { label: 'Income',       val: `₹${(summary.income   || 0).toLocaleString()}`, color: '#22c55e' },
          { label: 'Expenses',     val: `₹${(summary.expenses || 0).toLocaleString()}`, color: '#f43f5e' },
          { label: 'Savings',      val: `₹${(summary.savings  || 0).toLocaleString()}`, color: '#a78bfa' },
          { label: 'Savings Rate', val: `${summary.savings_rate || 0}%`,                 color: '#f59e0b' },
        ].map(s => (
          <Card key={s.label} style={{ padding: '13px', textAlign: 'center' }}>
            <div style={{ fontSize: 18, fontWeight: 800, color: s.color }}>{s.val}</div>
            <div style={{ fontSize: 10, color: C.muted }}>{s.label}</div>
          </Card>
        ))}
      </div>

      {/* Add form — just type + amount + description */}
      <Card style={{ marginBottom: 14 }}>
        <SectionHead title="Add Transaction" />
        {/* Income / Expense toggle */}
        <div style={{ display: 'flex', gap: 6, marginBottom: 14, background: 'rgba(255,255,255,0.04)', borderRadius: 10, padding: 3 }}>
          {['income', 'expense'].map(t => (
            <button key={t} onClick={() => setForm(p => ({ ...p, type: t }))} style={{
              flex: 1, padding: '9px', borderRadius: 8, border: 'none',
              background: form.type === t ? (t === 'income' ? '#22c55e' : '#f43f5e') : 'none',
              color: form.type === t ? '#fff' : C.muted,
              fontSize: 14, fontWeight: 600, cursor: 'pointer',
              fontFamily: 'Outfit,sans-serif', textTransform: 'capitalize',
              transition: 'all .2s',
            }}>{t === 'income' ? '📈 Income' : '📉 Expense'}</button>
          ))}
        </div>
        {/* Amount only — no separate category field */}
        <Input label="Amount (₹)" type="number" placeholder="Enter amount"
          value={form.amount} onChange={e => setForm(p => ({ ...p, amount: e.target.value }))} />
        <Input label="Description (optional)" placeholder="e.g. Salary, Groceries, Rent..."
          value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} />
        <Btn onClick={add} style={{ width: '100%' }}>Add Transaction</Btn>
      </Card>

      {/* List */}
      <Card>
        <SectionHead title="Recent Transactions" />
        {loading ? <Spinner /> : entries.slice(0, 25).map(e => (
          <div key={e.id} style={{
            display: 'flex', alignItems: 'center', gap: 10,
            padding: '9px 0', borderBottom: `1px solid ${C.border}`,
          }}>
            <span style={{ fontSize: 20, flexShrink: 0 }}>{e.type === 'income' ? '📈' : '📉'}</span>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 13, color: C.text, wordBreak: 'break-word' }}>
                {e.description || (e.type === 'income' ? 'Income' : 'Expense')}
              </div>
              <div style={{ fontSize: 11, color: C.muted }}>{e.date}</div>
            </div>
            <div style={{ textAlign: 'right', flexShrink: 0 }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: e.type === 'income' ? '#22c55e' : '#f43f5e' }}>
                {e.type === 'income' ? '+' : '-'}₹{(+e.amount).toLocaleString()}
              </div>
              <button onClick={() => del(e.id)} style={{
                background: 'none', border: 'none', color: C.muted,
                cursor: 'pointer', fontSize: 16, lineHeight: 1,
              }}>×</button>
            </div>
          </div>
        ))}
        {!loading && !entries.length && (
          <div style={{ color: C.muted, fontSize: 13 }}>No transactions yet. Add one above!</div>
        )}
      </Card>
    </div>
  );
}

// ─── Notes Tab ────────────────────────────────────────────────────────────────
const NTYPES  = ['diary', 'idea', 'task', 'moment', 'gratitude'];
const NCOLORS = { diary:'#7c3aed', idea:'#22c55e', task:'#f59e0b', moment:'#3b82f6', gratitude:'#f472b6' };
const NICONS  = { diary:'📔', idea:'💡', task:'✅', moment:'📸', gratitude:'🙏' };

function NotesTab() {
  const [notes,   setNotes]   = useState([]);
  const [form,    setForm]    = useState({ title: '', content: '', type: 'diary', tags: '' });
  const [loading, setLoading] = useState(true);
  const [open,    setOpen]    = useState(null);

  const fetchNotes = () =>
    api.get('/notes')
      .then(r => setNotes(r.data.data || []))
      .catch(() => {})
      .finally(() => setLoading(false));

  useEffect(() => { fetchNotes(); }, []);

  const save = async () => {
    if (!form.content.trim()) return toast('Write something first', 'error');
    try {
      await api.post('/notes', form);
      // ✅ Clear form after save
      setForm({ title: '', content: '', type: 'diary', tags: '' });
      fetchNotes();
      toast('Saved! 📝');
    } catch (e) {
      toast(e?.response?.data?.message || 'Failed', 'error');
    }
  };

  const del = async (id) => {
    if (!window.confirm('Delete this note?')) return;
    try { await api.delete(`/notes/${id}`); fetchNotes(); toast('Deleted'); }
    catch { toast('Failed', 'error'); }
  };

  return (
    <div>
      <Card style={{ marginBottom: 14 }}>
        <SectionHead title="New Entry" />
        {/* Type pills */}
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 12 }}>
          {NTYPES.map(t => (
            <button key={t} onClick={() => setForm(p => ({ ...p, type: t }))} style={{
              padding: '6px 11px', borderRadius: 8,
              border: `1px solid ${form.type === t ? NCOLORS[t] : C.border}`,
              background: form.type === t ? `${NCOLORS[t]}20` : 'transparent',
              color: form.type === t ? NCOLORS[t] : C.muted,
              fontSize: 12, cursor: 'pointer',
              fontFamily: 'Outfit,sans-serif', textTransform: 'capitalize',
            }}>{NICONS[t]} {t}</button>
          ))}
        </div>
        <Input label="Title (optional)" placeholder="Title..."
          value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} />
        <Textarea label="Content" placeholder="Write your thoughts, ideas, gratitude..."
          value={form.content} onChange={e => setForm(p => ({ ...p, content: e.target.value }))}
          style={{ minHeight: 110 }} />
        <Input label="Tags" placeholder="#grateful #productive"
          value={form.tags} onChange={e => setForm(p => ({ ...p, tags: e.target.value }))} />
        <Btn onClick={save} style={{ width: '100%' }}>Save Entry 📝</Btn>
      </Card>

      {loading ? <Spinner /> : notes.map(n => (
        <Card key={n.id}
          style={{ marginBottom: 10, borderLeft: `3px solid ${NCOLORS[n.type] || C.accent}`, padding: '13px 14px', cursor: 'pointer' }}
          onClick={() => setOpen(open === n.id ? null : n.id)}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 4, flexWrap: 'wrap' }}>
                <span style={{ fontSize: 15 }}>{NICONS[n.type] || '📝'}</span>
                <span style={{ fontSize: 13, fontWeight: 700, color: C.text }}>{n.title || n.type}</span>
                <span style={{ fontSize: 10, background: `${NCOLORS[n.type] || C.accent}20`, color: NCOLORS[n.type] || C.accent, borderRadius: 6, padding: '1px 6px', textTransform: 'capitalize' }}>{n.type}</span>
              </div>
              <div style={{
                fontSize: 12, color: open === n.id ? C.text : C.muted,
                lineHeight: 1.6, overflow: 'hidden',
                display: '-webkit-box', WebkitLineClamp: open === n.id ? 100 : 2, WebkitBoxOrient: 'vertical',
                wordBreak: 'break-word',
              }}>{n.content}</div>
              {n.tags && <div style={{ fontSize: 11, color: C.accent2, marginTop: 5 }}>{n.tags}</div>}
              <div style={{ fontSize: 10, color: C.muted, marginTop: 5 }}>{n.created_at}</div>
            </div>
            <button onClick={e => { e.stopPropagation(); del(n.id); }} style={{
              background: 'none', border: 'none', color: C.muted,
              cursor: 'pointer', fontSize: 20, padding: '0 0 0 8px', flexShrink: 0, lineHeight: 1,
            }}>×</button>
          </div>
        </Card>
      ))}

      {!loading && !notes.length && (
        <div style={{ textAlign: 'center', padding: '36px 20px', color: C.muted }}>
          <div style={{ fontSize: 44, marginBottom: 12 }}>📔</div>
          <div style={{ fontSize: 15, color: C.text }}>No notes yet</div>
          <div style={{ fontSize: 12, marginTop: 4 }}>Start writing your first entry above</div>
        </div>
      )}
    </div>
  );
}

// ─── Page shell ───────────────────────────────────────────────────────────────
const TABS = [
  { id: 'mood',    icon: '😊', label: 'Mood'    },
  { id: 'finance', icon: '💰', label: 'Finance' },
  { id: 'notes',   icon: '📔', label: 'Notes'   },
];

export default function MorePage({ defaultTab = 'mood' }) {
  const [sub, setSub] = useState(defaultTab);
  useEffect(() => { setSub(defaultTab); }, [defaultTab]);

  return (
    <div style={{ flex: 1, overflowY: 'auto', paddingBottom: 10 }}>
      <div style={{ padding: '20px 18px 0' }}>
        <h1 style={{ fontSize: 22, fontWeight: 800, color: C.text, margin: '0 0 4px', letterSpacing: '-0.5px' }}>⚡ More</h1>
        <p style={{ fontSize: 13, color: C.muted, margin: '0 0 14px' }}>Mood, Finance & Notes</p>
        <div style={{ display: 'flex', gap: 5, background: 'rgba(255,255,255,0.04)', borderRadius: 13, padding: 4, marginBottom: 18 }}>
          {TABS.map(t => (
            <button key={t.id} onClick={() => setSub(t.id)} style={{
              flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
              padding: '9px 6px', borderRadius: 10, border: 'none',
              background: sub === t.id ? 'linear-gradient(135deg,#7c3aed,#a78bfa)' : 'none',
              color: sub === t.id ? '#fff' : C.muted,
              fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'Outfit,sans-serif',
              transition: 'all .2s',
            }}>
              {t.icon} {t.label}
            </button>
          ))}
        </div>
      </div>
      <div style={{ padding: '0 18px' }}>
        {sub === 'mood'    && <MoodTab    key="mood"    />}
        {sub === 'finance' && <FinanceTab key="finance" />}
        {sub === 'notes'   && <NotesTab   key="notes"   />}
      </div>
    </div>
  );
}
