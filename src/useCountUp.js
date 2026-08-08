import { useEffect, useState, useRef } from "react";

// Lightweight animated counter -- counts up from 0 to `target` over
// `duration` ms using requestAnimationFrame. No extra dependency needed.
export function useCountUp(target, duration = 900) {
  const [value, setValue] = useState(0);
  const startRef = useRef(null);

  useEffect(() => {
    startRef.current = null;
    let frame;

    function step(timestamp) {
      if (startRef.current === null) startRef.current = timestamp;
      const elapsed = timestamp - startRef.current;
      const progress = Math.min(elapsed / duration, 1);
      setValue(Math.round(progress * target));
      if (progress < 1) frame = requestAnimationFrame(step);
    }

    frame = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frame);
  }, [target, duration]);

  return value;
}
