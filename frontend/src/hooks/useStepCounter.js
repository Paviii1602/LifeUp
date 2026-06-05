// Automatic step counter using device accelerometer
// Works in Chrome on Android when installed as PWA

import { useState, useEffect, useRef, useCallback } from 'react';

const STEP_THRESHOLD = 12;     // acceleration magnitude to count as a step
const STEP_DELAY_MS  = 250;    // min ms between steps (prevents double-count)
const STORAGE_KEY    = 'lifeup_steps';

function todayKey() {
  return new Date().toISOString().slice(0, 10); // "2025-06-04"
}

function loadToday() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return 0;
    const { date, count } = JSON.parse(raw);
    return date === todayKey() ? count : 0;
  } catch { return 0; }
}

function saveToday(count) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ date: todayKey(), count }));
}

export function useStepCounter() {
  const [steps,     setSteps]     = useState(loadToday);
  const [supported, setSupported] = useState(false);
  const [active,    setActive]    = useState(false);
  const [error,     setError]     = useState(null);

  const lastStepTime = useRef(0);
  const lastMag      = useRef(0);
  const stepsRef     = useRef(steps);
  stepsRef.current   = steps;

  // Detect accelerometer support
  useEffect(() => {
    const ok = typeof DeviceMotionEvent !== 'undefined' ||
               typeof Accelerometer    !== 'undefined';
    setSupported(ok);
  }, []);

  const handleMotion = useCallback((e) => {
    const acc = e.accelerationIncludingGravity || e.acceleration;
    if (!acc) return;
    const { x = 0, y = 0, z = 0 } = acc;
    const mag  = Math.sqrt(x*x + y*y + z*z);
    const now  = Date.now();
    const diff = Math.abs(mag - lastMag.current);
    lastMag.current = mag;

    if (diff > STEP_THRESHOLD && now - lastStepTime.current > STEP_DELAY_MS) {
      lastStepTime.current = now;
      setSteps(prev => {
        const next = prev + 1;
        saveToday(next);
        return next;
      });
    }
  }, []);

  const start = useCallback(async () => {
    setError(null);
    try {
      // iOS 13+ requires permission
      if (typeof DeviceMotionEvent?.requestPermission === 'function') {
        const perm = await DeviceMotionEvent.requestPermission();
        if (perm !== 'granted') { setError('Permission denied'); return; }
      }
      window.addEventListener('devicemotion', handleMotion, { passive: true });
      setActive(true);
    } catch(e) {
      setError(e.message || 'Could not access accelerometer');
    }
  }, [handleMotion]);

  const stop = useCallback(() => {
    window.removeEventListener('devicemotion', handleMotion);
    setActive(false);
  }, [handleMotion]);

  // Auto-start on mount
  useEffect(() => {
    if (supported) start();
    return () => stop();
  }, [supported]); // eslint-disable-line

  const reset = useCallback(() => {
    setSteps(0); saveToday(0);
  }, []);

  return { steps, supported, active, error, start, stop, reset };
}
