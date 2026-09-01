import React, { useState, useEffect, useRef } from 'react';

/**
 * AnimatedCounter: High-performance, GPU-synced increasing number animation.
 * Features:
 * - requestAnimationFrame loop with smooth easeOutExpo deceleration
 * - Supports prefix (e.g., "< "), suffix (e.g., "%", "ms"), decimals
 * - Re-animates smoothly whenever the target value or timeframe changes
 */
export default function AnimatedCounter({
  value = 0,
  duration = 1200,
  prefix = '',
  suffix = '',
  decimals = 0,
  className = '',
}) {
  const target = typeof value === 'number' ? value : parseFloat(String(value).replace(/[^0-9.-]+/g, '')) || 0;
  const [displayValue, setDisplayValue] = useState(0);
  const startTimeRef = useRef(null);
  const startValueRef = useRef(0);
  const reqIdRef = useRef(null);

  useEffect(() => {
    const startVal = startValueRef.current;
    const endVal = target;
    const startTime = performance.now();

    const easeOutExpo = (t) => (t === 1 ? 1 : 1 - Math.pow(2, -10 * t));

    const updateCounter = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easedProgress = easeOutExpo(progress);

      const current = startVal + (endVal - startVal) * easedProgress;
      setDisplayValue(current);

      if (progress < 1) {
        reqIdRef.current = requestAnimationFrame(updateCounter);
      } else {
        setDisplayValue(endVal);
        startValueRef.current = endVal;
      }
    };

    reqIdRef.current = requestAnimationFrame(updateCounter);

    return () => {
      if (reqIdRef.current) cancelAnimationFrame(reqIdRef.current);
    };
  }, [target, duration]);

  const formatted = decimals > 0 ? displayValue.toFixed(decimals) : Math.round(displayValue);

  return (
    <span className={`tabular-nums ${className}`}>
      {prefix}
      {formatted}
      {suffix}
    </span>
  );
}
