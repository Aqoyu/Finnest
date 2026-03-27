import { useLanguage } from "../context/LanguageContext";
import logoImage from "figma:asset/dcd0af41caa7c6f5a83d31ce1f1e04ad05e2a042.png";
import { useState, useEffect } from "react";

export function Preloader() {
  const { t } = useLanguage();
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 95) return prev;
        return prev + Math.random() * 15;
      });
    }, 200);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-cyan-50 via-blue-50 to-teal-50 flex items-center justify-center z-50 overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-br from-cyan-400/20 to-blue-500/20 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob" />
        <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-gradient-to-br from-teal-400/20 to-cyan-500/20 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-2000" />
        <div className="absolute bottom-1/4 left-1/3 w-96 h-96 bg-gradient-to-br from-blue-400/20 to-indigo-500/20 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-4000" />
      </div>

      {/* Main loader content */}
      <div className="relative z-10 flex flex-col items-center gap-8">
        {/* Logo container with animated rings */}
        <div className="relative">
          {/* Outer animated rings */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-32 h-32 rounded-full border-4 border-cyan-500/30 animate-ping-slow" />
          </div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-28 h-28 rounded-full border-4 border-blue-500/30 animate-ping-slower animation-delay-1000" />
          </div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-24 h-24 rounded-full border-4 border-teal-500/30 animate-ping-slowest animation-delay-2000" />
          </div>

          {/* Logo with glow effect */}
          <div className="relative w-24 h-24 rounded-2xl bg-white shadow-2xl p-4 animate-float-gentle">
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-cyan-500/20 to-blue-500/20 blur-xl" />
            <img 
              src={logoImage} 
              alt="FIN-NEST" 
              className="relative w-full h-full object-contain animate-pulse-gentle" 
            />
          </div>
        </div>

        {/* Loading text */}
        <div className="flex flex-col items-center gap-3">
          <h2 className="text-2xl font-bold bg-gradient-to-r from-cyan-600 via-blue-600 to-teal-600 bg-clip-text text-transparent">
            {t.appName}
          </h2>
          
          {/* Animated loading text */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600 font-medium">{t.loading}</span>
            <div className="flex gap-1">
              <div className="w-1.5 h-1.5 bg-cyan-500 rounded-full animate-bounce" />
              <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce animation-delay-200" />
              <div className="w-1.5 h-1.5 bg-teal-500 rounded-full animate-bounce animation-delay-400" />
            </div>
          </div>

          {/* Progress bar */}
          <div className="w-48 h-1 bg-gray-200 rounded-full overflow-hidden relative">
            <div 
              className="h-full bg-gradient-to-r from-cyan-500 via-blue-500 to-teal-500 transition-all duration-300 ease-out rounded-full" 
              style={{ width: `${Math.min(progress, 100)}%` }} 
            />
          </div>
        </div>

        {/* Floating particles */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-cyan-400 rounded-full animate-float-particle" />
          <div className="absolute top-1/3 right-1/4 w-1.5 h-1.5 bg-blue-400 rounded-full animate-float-particle animation-delay-1000" />
          <div className="absolute bottom-1/3 left-1/3 w-2 h-2 bg-teal-400 rounded-full animate-float-particle animation-delay-2000" />
          <div className="absolute top-2/3 right-1/3 w-1 h-1 bg-cyan-500 rounded-full animate-float-particle animation-delay-3000" />
        </div>
      </div>
    </div>
  );
}