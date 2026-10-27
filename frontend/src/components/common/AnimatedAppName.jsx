import { useState, useEffect, useRef, memo } from 'react';

const BASE_WORD = 'membrain';
const MAX_ACTIVE_CAPS = 3;

/**
 * AnimatedLetter manages a smooth 1-second fade-out and 1-second fade-in
 * whenever its target case (lowercase vs uppercase) changes.
 */
const AnimatedLetter = memo(function AnimatedLetter({ char, isTargetCapital }) {
  const [displayedIsUpper, setDisplayedIsUpper] = useState(isTargetCapital);
  const [opacity, setOpacity] = useState(1);
  const isMountedRef = useRef(true);
  const swapTimerRef = useRef(null);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      if (swapTimerRef.current) clearTimeout(swapTimerRef.current);
    };
  }, []);

  useEffect(() => {
    // If target already matches what is displayed, no transition needed
    if (isTargetCapital === displayedIsUpper) return;

    // 1. Smoothly fade out the current glyph to 0 over 1000ms
    setOpacity(0);

    if (swapTimerRef.current) clearTimeout(swapTimerRef.current);

    // 2. Once fully faded out at 1000ms, swap glyph and fade in back to 1 over 1000ms
    swapTimerRef.current = setTimeout(() => {
      if (!isMountedRef.current) return;
      setDisplayedIsUpper(isTargetCapital);

      // Double requestAnimationFrame ensures browser registers the swapped character at opacity 0 before animating to 1
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          if (!isMountedRef.current) return;
          setOpacity(1);
        });
      });
    }, 1000);
  }, [isTargetCapital]);

  const displayedChar = displayedIsUpper ? char.toUpperCase() : char.toLowerCase();

  return (
    <span
      style={{ opacity }}
      className={`inline-block transition-opacity duration-1000 ease-in-out will-change-[opacity] select-none ${
        displayedIsUpper
          ? 'text-white font-medium drop-shadow-[0_0_8px_rgba(255,255,255,0.25)]'
          : 'text-[#E3E3E3]'
      }`}
    >
      {displayedChar}
    </span>
  );
});

export default function AnimatedAppName({ className = '' }) {
  const [capitalIndices, setCapitalIndices] = useState(() => new Set());
  const busyIndicesRef = useRef(new Set());
  const activeTimersRef = useRef(new Map());
  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;
    let spawnTimeoutId = null;

    // Helper: Turn letter back to lowercase after its stay duration, and release when settled
    const scheduleLetterDecay = (index, duration) => {
      // Clear any prior decay timers for this index
      if (activeTimersRef.current.has(index)) {
        const existing = activeTimersRef.current.get(index);
        existing.forEach((tId) => clearTimeout(tId));
      }

      const timers = [];

      // Timer 1: Trigger decay back to lowercase after stay duration
      const decayTimerId = setTimeout(() => {
        if (!isMountedRef.current) return;
        setCapitalIndices((prev) => {
          const next = new Set(prev);
          next.delete(index);
          return next;
        });
      }, duration);
      timers.push(decayTimerId);

      // Timer 2: Release index from busy pool once 1s fade-out + 1s fade-in has finished
      const releaseTimerId = setTimeout(() => {
        if (!isMountedRef.current) return;
        busyIndicesRef.current.delete(index);
        activeTimersRef.current.delete(index);
      }, duration + 2200);
      timers.push(releaseTimerId);

      activeTimersRef.current.set(index, timers);
    };

    // Main loop: randomly picks 1 or 2 letters to capitalize with independent lifespans
    const runSpawnCycle = () => {
      const busy = busyIndicesRef.current;
      const activeCount = busy.size;

      // If we haven't reached the cap, select 1 or 2 inactive letters to ignite
      if (activeCount < MAX_ACTIVE_CAPS) {
        const inactive = [];
        for (let i = 0; i < BASE_WORD.length; i++) {
          if (!busy.has(i)) {
            inactive.push(i);
          }
        }

        if (inactive.length > 0) {
          // Decide whether to capitalize 1 or 2 letters
          const countToIgnite = Math.min(
            inactive.length,
            Math.random() > 0.5 && activeCount <= 1 ? 2 : 1
          );

          // Shuffle available inactive letters
          const shuffled = [...inactive].sort(() => Math.random() - 0.5);
          const chosen = shuffled.slice(0, countToIgnite);

          chosen.forEach((idx) => {
            busyIndicesRef.current.add(idx);
            // Stay time: stays capitalized for 3.4s - 4.8s before reverting
            const lifespan = 3400 + Math.random() * 1400;
            scheduleLetterDecay(idx, lifespan);
          });

          setCapitalIndices((prev) => {
            const next = new Set(prev);
            chosen.forEach((idx) => next.add(idx));
            return next;
          });
        }
      }

      // Changes occur no faster than every 3 seconds (3.0s - 4.5s interval)
      const nextSpawnDelay = 3000 + Math.random() * 1500;
      spawnTimeoutId = setTimeout(() => {
        if (isMountedRef.current) {
          runSpawnCycle();
        }
      }, nextSpawnDelay);
    };

    // Initial trigger after mount
    spawnTimeoutId = setTimeout(runSpawnCycle, 1500);

    return () => {
      isMountedRef.current = false;
      if (spawnTimeoutId) clearTimeout(spawnTimeoutId);
      activeTimersRef.current.forEach((timerList) => {
        timerList.forEach((tId) => clearTimeout(tId));
      });
      activeTimersRef.current.clear();
      busyIndicesRef.current.clear();
    };
  }, []);

  return (
    <span className={`inline-flex items-center select-none ${className}`}>
      {BASE_WORD.split('').map((char, index) => (
        <AnimatedLetter
          key={index}
          char={char}
          isTargetCapital={capitalIndices.has(index)}
        />
      ))}
    </span>
  );
}
