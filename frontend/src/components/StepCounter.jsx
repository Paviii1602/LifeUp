import { useEffect } from 'react';
import { useStepCounter } from '../hooks/useStepCounter';
import { C, ProgressBar, toast } from './UI';
import api from '../lib/api';

// Syncs step count to backend every 60 seconds
function useSyncSteps(steps) {
  useEffect(() => {
    if (!steps) return;
    const sync = async () => {
      try {
        await api.post('/health', { steps });
      } catch { /* silent fail */ }
    };
    const id = setInterval(sync, 60000);
    sync(); // immediate first sync
    return () => clearInterval(id);
  }, [steps]);
}

const GOAL = 10000;

export function StepWidget({ compact = false }) {
  const { steps, supported, active, error, start, stop, reset } = useStepCounter();
  useSyncSteps(steps);

  const pct = Math.min(100, Math.round(steps / GOAL * 100));

  if (compact) {
    // Used inside Dashboard today's overview grid
    return (
      <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
          <span style={{ fontSize: 19, lineHeight: 1 }}>👣</span>
          <span style={{ fontSize: 11, color: '#7c3aed', fontWeight: 600 }}>{pct}%</span>
        </div>
        <div style={{ fontSize: 10, color: C.muted }}>Steps</div>
        <div style={{ fontSize: 17, fontWeight: 700, color: C.text, lineHeight: 1.2 }}>
          {steps.toLocaleString()}
        </div>
        <div style={{ fontSize: 9, color: C.muted, marginBottom: 6 }}>/10,000</div>
        <ProgressBar pct={pct} color="#7c3aed" height={3} />
        {!supported && <div style={{ fontSize: 9, color: C.muted, marginTop: 3 }}>manual only</div>}
        {supported && !active && (
          <button onClick={start} style={{
            marginTop: 4, fontSize: 9, color: C.accent2, background: 'none',
            border: `1px solid rgba(124,58,237,0.3)`, borderRadius: 6,
            padding: '2px 6px', cursor: 'pointer', fontFamily: 'Outfit,sans-serif',
          }}>tap to activate</button>
        )}
      </div>
    );
  }

  // Full card used in Health page
  return (
    <div style={{
      background: 'rgba(255,255,255,0.04)', border: `1px solid ${C.border}`,
      borderRadius: 18, padding: 20, marginBottom: 14,
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <div>
          <div style={{ fontSize: 15, fontWeight: 700, color: C.text }}>👣Step Counts</div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: 32, fontWeight: 800, color: '#7c3aed' }}>{steps.toLocaleString()}</div>
          <div style={{ fontSize: 11, color: C.muted }}>steps today</div>
        </div>
      </div>

      <ProgressBar pct={pct} color="#7c3aed" height={8} style={{ marginBottom: 8 }} />
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, color: C.muted, marginBottom: 16 }}>
        <span>{steps.toLocaleString()} steps</span>
        <span>Goal: {GOAL.toLocaleString()}</span>
      </div>

      {/* Step rings visual */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 16 }}>
        {[2000, 4000, 6000, 8000,10000].map(milestone => (
          <div key={milestone} style={{
            flex: 1, background: steps >= milestone ? 'rgba(124,58,237,0.18)' : 'rgba(255,255,255,0.04)',
            border: `1px solid ${steps >= milestone ? '#7c3aed' : C.border}`,
            borderRadius: 10, padding: '8px 4px', textAlign: 'center',
          }}>
            <div style={{ fontSize: 16 }}>{steps >= milestone ? '✅' : '⬜'}</div>
            <div style={{ fontSize: 10, color: steps >= milestone ? C.accent2 : C.muted, marginTop: 3 }}>
              {(milestone/1000).toFixed(0)}K
            </div>
          </div>
        ))}
      </div>

      {error && (
        <div style={{ background: 'rgba(244,63,94,0.1)', border: '1px solid rgba(244,63,94,0.3)', borderRadius: 10, padding: '10px 14px', fontSize: 13, color: '#f43f5e', marginBottom: 12 }}>
          ⚠️ {error}
          <div style={{ fontSize: 11, marginTop: 4, color: C.muted }}>
            Use Chrome on Android or Safari on iPhone. Open via http, not file://.
          </div>
        </div>
      )}

      {!supported && (
        <div style={{ background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.3)', borderRadius: 10, padding: '10px 14px', fontSize: 12, color: '#f59e0b', marginBottom: 12 }}>
          💡 Tip: Open this app on your phone in Chrome, then tap "Add to Home Screen" to install as a PWA — that unlocks the step sensor.
        </div>
      )}

      <div style={{ display: 'flex', gap: 8 }}>
        {supported && !active && (
          <button onClick={start} style={{
            flex: 2, padding: '11px', borderRadius: 11, border: 'none',
            background: 'linear-gradient(135deg,#7c3aed,#a78bfa)',
            color: '#fff', fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: 'Outfit,sans-serif',
          }}>▶ Start Counting</button>
        )}
        {supported && active && (
          <button onClick={stop} style={{
            flex: 2, padding: '11px', borderRadius: 11,
            border: '1px solid rgba(244,63,94,0.3)', background: 'rgba(244,63,94,0.1)',
            color: '#f43f5e', fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: 'Outfit,sans-serif',
          }}>⏸ Pause</button>
        )}
        <button onClick={reset} style={{
          flex: 1, padding: '11px', borderRadius: 11,
          border: `1px solid ${C.border}`, background: 'rgba(255,255,255,0.04)',
          color: C.muted, fontSize: 14, cursor: 'pointer', fontFamily: 'Outfit,sans-serif',
        }}>Reset</button>
      </div>
    </div>
  );
}
