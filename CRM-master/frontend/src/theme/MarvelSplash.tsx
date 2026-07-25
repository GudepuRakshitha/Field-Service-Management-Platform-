import React, { useEffect, useMemo, useState } from 'react';
import { useTheme } from './ThemeContext';

const COMIC_WORDS = ['POW!', 'BAM!', 'KAPOW!', 'WHAM!', 'CRASH!', 'ZAP!', 'BOOM!', 'KRAKOOM!'];
const MARVEL_SPLASH_KEY = 'keystone_marvel_splash';

const PARTICLE_COUNT = 8;

export const MarvelSplash: React.FC = () => {
  const { theme } = useTheme();
  const [word, setWord] = useState<string | null>(null);
  const [visible, setVisible] = useState(false);

  // Memoize random particle positions so they don't change on re-render
  const particles = useMemo(() => {
    return Array.from({ length: PARTICLE_COUNT }, (_, i) => ({
      id: i,
      left: `${20 + ((i * 37 + 13) % 60)}%`,
      top: `${20 + ((i * 53 + 7) % 60)}%`,
      delay: `${i * 0.05}s`,
    }));
  }, []);

  useEffect(() => {
    if (theme === 'marvel') {
      const lastShown = sessionStorage.getItem(MARVEL_SPLASH_KEY);
      if (lastShown === 'true') return;

      sessionStorage.setItem(MARVEL_SPLASH_KEY, 'true');
      const randomWord = COMIC_WORDS[Math.floor(Math.random() * COMIC_WORDS.length)];
      setWord(randomWord);
      setVisible(true);

      const timer = setTimeout(() => setVisible(false), 1200);
      return () => clearTimeout(timer);
    } else {
      setWord(null);
      setVisible(false);
      sessionStorage.removeItem(MARVEL_SPLASH_KEY);
    }
  }, [theme]);

  if (!visible || !word) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center pointer-events-none animate-marvel-splash-overlay">
      <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" />

      <div className="relative animate-marvel-splash-word">
        <span
          className="block text-[10rem] sm:text-[14rem] font-black leading-none select-none"
          style={{
            color: '#e23636',
            textShadow:
              '4px 4px 0 #1a1a1a, -2px -2px 0 #1a1a1a, 2px -2px 0 #1a1a1a, -2px 2px 0 #1a1a1a, 0 0 40px rgba(226, 54, 54, 0.5), 0 0 80px rgba(226, 54, 54, 0.3)',
            WebkitTextStroke: '3px #1a1a1a',
            transform: 'rotate(-8deg)',
            letterSpacing: '0.08em',
          }}
        >
          {word}
        </span>

        {/* Action lines radiating outward */}
        <div className="absolute inset-0 flex items-center justify-center">
          {[0, 60, 120, 180, 240, 300].map((angle) => (
            <div
              key={angle}
              className="absolute w-2 h-16 sm:h-24 bg-gradient-to-t from-transparent via-yellow-400 to-transparent opacity-60 rounded-full"
              style={{ transform: `rotate(${angle}deg) translateY(-120px)` }}
            />
          ))}
        </div>

        {/* Star burst particles */}
        {particles.map((p) => (
          <div
            key={p.id}
            className="absolute w-3 h-3 bg-yellow-400 rounded-full animate-marvel-particle"
            style={{
              left: p.left,
              top: p.top,
              animationDelay: p.delay,
              opacity: 0,
            }}
          />
        ))}
      </div>
    </div>
  );
};
