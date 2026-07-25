import React from 'react';
import { Wrench } from 'lucide-react';

interface ComicLoadingScreenProps {
  message?: string;
  subtitle?: string;
}

export const ComicLoadingScreen: React.FC<ComicLoadingScreenProps> = ({
  message = 'LOADING...',
  subtitle = 'Please Stand By',
}) => {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 sm:p-8 relative overflow-hidden">
      {/* Background — comic dots + radial glows */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: `
            radial-gradient(circle, rgba(226, 54, 54, 0.06) 1px, transparent 1px),
            radial-gradient(at 15% 20%, rgba(226, 54, 54, 0.08) 0px, transparent 50%),
            radial-gradient(at 85% 80%, rgba(255, 215, 0, 0.06) 0px, transparent 50%)
          `,
          backgroundSize: '16px 16px, auto, auto',
        }}
      />

      {/* Main Loading Panel — styled as a comic book cover panel */}
      <div className="relative glass-panel p-8 sm:p-12 rounded-2xl max-w-md w-full text-center space-y-6 animate-comic-loading-panel overflow-hidden">
        {/* Comic corner tab */}
        <div
          className="absolute top-0 right-0 w-16 h-16"
          style={{
            background: 'linear-gradient(135deg, transparent 50%, #e23636 50%)',
            borderRadius: '0 1.5rem 0 0',
          }}
        />

        {/* NEXT ISSUE flag */}
        <div className="space-y-1">
          <span
            className="inline-block text-[10px] font-black tracking-[0.2em] px-4 py-1 rounded-full"
            style={{
              color: '#ffffff',
              backgroundColor: '#e23636',
              border: '2px solid #1a1a1a',
            }}
          >
            NEXT ISSUE
          </span>
        </div>

        {/* Animated Wrench Logo */}
        <div className="flex justify-center">
          <div className="relative animate-comic-loading-logo">
            <div
              className="w-20 h-20 rounded-2xl flex items-center justify-center shadow-lg animate-comic-loading-glow"
              style={{
                background: 'linear-gradient(135deg, #e23636, #ffd700)',
                boxShadow: '0 0 30px rgba(226, 54, 54, 0.4), 0 0 60px rgba(255, 215, 0, 0.2)',
              }}
            >
              <Wrench className="w-10 h-10 text-white" />
            </div>
            {/* Rotating action ring */}
            <div
              className="absolute -inset-3 rounded-full border-2 border-dashed border-yellow-400/50 animate-comic-loading-ring"
              style={{ borderColor: '#ffd700' }}
            />
          </div>
        </div>

        {/* KEYSTONE Title */}
        <div className="space-y-1">
          <h1
            className="text-4xl sm:text-5xl font-black tracking-tight"
            style={{
              color: '#e23636',
              textShadow: '3px 3px 0 #1a1a1a, -1px -1px 0 #1a1a1a',
              letterSpacing: '0.02em',
            }}
          >
            KEYSTONE
          </h1>
          <p
            className="text-xs font-bold uppercase tracking-[0.15em]"
            style={{ color: '#555555' }}
          >
            {subtitle}
          </p>
        </div>

        {/* Comic Dots Loading Indicator */}
        <div className="flex justify-center gap-2 pt-2">
          {[0, 1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="w-3 h-3 rounded-full animate-comic-dot"
              style={{
                backgroundColor: '#e23636',
                border: '1px solid #1a1a1a',
                animationDelay: `${i * 0.15}s`,
              }}
            />
          ))}
        </div>

        {/* Loading Message */}
        <p
          className="text-sm font-bold animate-comic-loading-text"
          style={{ color: '#1a1a1a', letterSpacing: '0.1em' }}
        >
          {message}
        </p>

        {/* Bottom action lines decoration */}
        <div className="flex justify-center gap-1.5 pt-1">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="h-1 rounded-full"
              style={{
                width: `${30 + i * 20}px`,
                backgroundColor: i === 1 ? '#e23636' : '#cccccc',
                animationDelay: `${i * 0.1}s`,
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
