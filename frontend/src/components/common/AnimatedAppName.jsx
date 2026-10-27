import { useState, useEffect, useRef } from 'react';

const BASE_WORD = 'membrain';
const MAX_ACTIVE_CAPS = 3;

export default function AnimatedAppName({ className = '' }) {
  const [activeIndices, setActiveIndices] = useState(() => new Set());
  const activeTimersRef = useRef(new Map());
  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;
    let spawnTimeoutId = null;

    // Helper: Turn a specific letter back to lowercase after its lifespan
    const scheduleLetterDecay = (index, duration) => {
      // Clear any prior timer for this letter
      if (activeTimersRef.current.has(index)) {
        clearTimeout(activeTimersRef.current.get(index));
      }

      const timerId = setTimeout(() => {
        if (!isMountedRef.current) return;
        activeTimersRef.current.delete(index);
        setActiveIndices((prev) => {
          const next = new Set(prev);
          next.delete(index);
          return next;
        });
      }, duration);

      activeTimersRef.current.set(index, timerId);
    };

    // Main loop: randomly picks 1 or 2 letters to capitalize with independent lifespans
    const runSpawnCycle = () => {
      setActiveIndices((currentActive) => {
        const activeCount = currentActive.size;

        // If we haven't reached the cap, select 1 or 2 inactive letters to ignite
        if (activeCount < MAX_ACTIVE_CAPS) {
          const inactive = [];
          for (let i = 0; i < BASE_WORD.length; i++) {
            if (!currentActive.has(i)) {
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

            const nextActive = new Set(currentActive);
            chosen.forEach((idx) => {
              nextActive.add(idx);
              // Doubled stay time: stays capitalized for 3.4s - 4.8s before reverting
              const lifespan = 3400 + Math.random() * 1400;
              scheduleLetterDecay(idx, lifespan);
            });

            return nextActive;
          }
        }

        return currentActive;
      });

      // Change in not less than 3 seconds (3.0s - 4.5s interval between changes)
      const nextSpawnDelay = 3000 + Math.random() * 1500;
      spawnTimeoutId = setTimeout(() => {
        if (isMountedRef.current) {
          runSpawnCycle();
        }
      }, nextSpawnDelay);
    };

    // Initial trigger after mount (at least 1.5s)
    spawnTimeoutId = setTimeout(runSpawnCycle, 1500);

    return () => {
      isMountedRef.current = false;
      if (spawnTimeoutId) clearTimeout(spawnTimeoutId);
      activeTimersRef.current.forEach((tId) => clearTimeout(tId));
      activeTimersRef.current.clear();
    };
  }, []);

  return (
    <span className={`inline-flex items-center select-none ${className}`}>
      {BASE_WORD.split('').map((char, index) => {
        const isCapital = activeIndices.has(index);
        const displayedChar = isCapital ? char.toUpperCase() : char.toLowerCase();

        return (
          <span
            key={index}
            className={`transition-all duration-500 inline-block ${isCapital ? 'text-white font-medium drop-shadow-[0_0_8px_rgba(255,255,255,0.2)]' : 'text-[#E3E3E3]'
              }`}
          >
            {displayedChar}
          </span>
        );
      })}
    </span>
  );
}
