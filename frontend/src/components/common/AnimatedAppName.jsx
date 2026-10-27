import { useState, useEffect } from 'react';

const BASE_NAME = 'MemBrain';

export default function AnimatedAppName({ className = '' }) {
  const [activeCharIndex, setActiveCharIndex] = useState(null);

  useEffect(() => {
    let timeoutId = null;
    let revertTimeoutId = null;
    let isMounted = true;

    const triggerGlitch = () => {
      // Pick random interval between 3000ms and 4000ms (every 3 - 4 seconds)
      const nextDelay = 3000 + Math.random() * 1000;

      timeoutId = setTimeout(() => {
        if (!isMounted) return;

        // Choose a random letter index in the app name
        const randIndex = Math.floor(Math.random() * BASE_NAME.length);
        setActiveCharIndex(randIndex);

        // Turn back after ~900ms
        revertTimeoutId = setTimeout(() => {
          if (!isMounted) return;
          setActiveCharIndex(null);
          triggerGlitch();
        }, 900);
      }, nextDelay);
    };

    triggerGlitch();

    return () => {
      isMounted = false;
      if (timeoutId) clearTimeout(timeoutId);
      if (revertTimeoutId) clearTimeout(revertTimeoutId);
    };
  }, []);

  return (
    <span className={`inline-flex items-center select-none ${className}`}>
      {BASE_NAME.split('').map((char, index) => {
        const isActive = index === activeCharIndex;
        // If active: toggle letter case (lowercase to capital, or capital to small)
        const displayedChar = isActive
          ? char === char.toUpperCase()
            ? char.toLowerCase()
            : char.toUpperCase()
          : char;

        return (
          <span
            key={index}
            className={`transition-colors duration-200 inline-block ${isActive ? 'text-white font-medium' : ''
              }`}
          >
            {displayedChar}
          </span>
        );
      })}
    </span>
  );
}

