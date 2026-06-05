import { useEffect, useState } from 'react';
import { Card, C, Btn, Input, SectionHead, ProgressBar, Spinner, toast } from '../components/UI';
import { StepWidget } from '../components/StepCounter';
import api from '../lib/api';

export default function HealthPage() {
  const [log,     setLog]     = useState({ water_glasses:0, sleep_hours:0, calories:0, weight_kg:'', heart_rate:'', workout_mins:0 });
  const [loading, setLoading] = useState(true);
  const [saving,  setSaving]  = useState(false);
  const [history, setHistory] = useState([]);

  useEffect(() => {
    Promise.all([api.get('/health?days=1'), api.get('/health?days=7')])
      .then(([r1, r2]) => {
        if (r1.data.data?.length) {
          const d = r1.data.data[0];
          setLog({
            water_glasses: d.water_glasses || 0,
            sleep_hours:   d.sleep_hours   || 0,
            calories:      d.calories      || 0,
            weight_kg:     d.weight_kg     || '',
            heart_rate:    d.heart_rate    || '',
            workout_mins:  d.workout_mins  || 0,
          });
        }
        setHistory(r2.data.data || []);
      }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const save = async () => {
    setSaving(true);
    try {
      await api.post('/health', log);
      toast('Health data saved! 💪');
    } catch (e) {
      toast(e?.response?.data?.message || 'Save failed', 'error');
    } finally { setSaving(false); }
  };

  const upd = k => v => setLog(p => ({ ...p, [k]: v }));

  if (loading) return <Spinner />;

  return (
    <div style={{ flex: 1, overflowY: 'auto', paddingBottom: 10 }}>
      <div style={{ padding: '20px 18px 0' }}>
        <h1 style={{ fontSize: 22, fontWeight: 800, color: C.text, margin: '0 0 4px', letterSpacing: '-0.5px' }}>🫀 Health</h1>
        <p style={{ fontSize: 13, color: C.muted, margin: '0 0 18px' }}>Track your body every day</p>
      </div>

      <div style={{ padding: '0 18px' }}>
        {/* AUTO STEP COUNTER - reads phone sensor */}
        <StepWidget />

        {/* Other stat cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 10, marginBottom: 14 }}>
          {[
            { icon: '💧', label: 'Water',    key: 'water_glasses', goal: 8,    unit: 'glasses', color: '#3b82f6' },
            { icon: '🌙', label: 'Sleep',    key: 'sleep_hours',   goal: 8,    unit: 'hrs',     color: '#8b5cf6' },
            { icon: '🔥', label: 'Calories', key: 'calories',      goal: 2000, unit: 'kcal',    color: '#f59e0b' },
            { icon: '🏋️', label: 'Workout',  key: 'workout_mins',  goal: 45,   unit: 'mins',    color: '#22c55e' },
          ].map(s => (
            <Card key={s.key} style={{ padding: 14 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                <span style={{ fontSize: 20 }}>{s.icon}</span>
                <span style={{ fontSize: 14, color: s.color, fontWeight: 600 }}>
                  {Math.min(100, Math.round((+log[s.key] || 0) / s.goal * 100))}%
                </span>
              </div>
              <div style={{ fontSize: 20, fontWeight: 800, color: C.text }}>{(+log[s.key] || 0).toLocaleString()}</div>
              <div style={{ fontSize: 12, color: C.muted, marginBottom: 7 }}>{s.label} · goal {s.goal} {s.unit}</div>
              <ProgressBar pct={Math.round((+log[s.key] || 0) / s.goal * 100)} color={s.color} />
            </Card>
          ))}
        </div>

        {/* Water clicker */}
        <Card style={{ marginBottom: 14 }}>
          <SectionHead title="💧 Water Intake" />
          <div style={{ display: 'flex', gap: 7, flexWrap: 'wrap', marginBottom: 8 }}>
            {Array.from({ length: 8 }, (_, i) => (
              <button key={i}
                onClick={() => upd('water_glasses')(i < +log.water_glasses ? i : i + 1)}
                style={{
                  width: 34, height: 42, borderRadius: 8, fontSize: 18, cursor: 'pointer',
                  background: i < +log.water_glasses ? '#3b82f6' : 'rgba(255,255,255,0.06)',
                  border: `1px solid ${i < +log.water_glasses ? '#3b82f6' : C.border}`,
                }}>💧</button>
            ))}
          </div>
          <div style={{ fontSize: 13, color: C.muted }}>{log.water_glasses} of 8 glasses today</div>
        </Card>

        {/* Log form */}
        <Card style={{ marginBottom: 14 }}>
          <SectionHead title="📊 Log Other Vitals" />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10}}>
            {[
              { label: 'Sleep (hrs)',    key: 'sleep_hours',  ph: '7.5' },
              { label: 'Calories (kcal)',key: 'calories',     ph: '1800' },
              { label: 'Workout (mins)', key: 'workout_mins', ph: '45' },
              { label: 'Weight (kg)',    key: 'weight_kg',    ph: '60' },
            ].map(f => (
              <Input key={f.key} label={f.label} type="number" placeholder={f.ph}
                value={log[f.key]} onChange={e => upd(f.key)(e.target.value)} />
            ))}
          </div>
          <Btn onClick={save} disabled={saving} style={{ width: '100%' }}>
            {saving ? 'Saving...' : 'Save Health Log 💾'}
          </Btn>
        </Card>

        {/* 7-day history */}
        {history.length > 0 && (
          <Card>
            <SectionHead title="📅 Last 7 Days" />
            {history.slice(0, 7).map(h => (
              <div key={h.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '9px 0', borderBottom: `1px solid ${C.border}` }}>
                <div style={{ fontSize: 12, color: C.muted }}>{h.date}</div>
                <div style={{ display: 'flex', gap: 10 }}>
                  <span style={{ fontSize: 12, color: C.text }}>👣 {(h.steps || 0).toLocaleString()}</span>
                  <span style={{ fontSize: 12, color: C.text }}>💧 {h.water_glasses}g</span>
                  <span style={{ fontSize: 12, color: C.text }}>🌙 {h.sleep_hours}h</span>
                </div>
              </div>
            ))}
          </Card>
        )}
      </div>
    </div>
  );
}
