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
        return prev + Math.random() * 12;
      });
    }, 200);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 overflow-hidden"
      style={{ background: "var(--background)" }}>

      {/* Ambient glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full opacity-[0.08] animate-blob"
          style={{ background: `radial-gradient(circle, var(--brand) 0%, transparent 65%)` }} />
        <div className="absolute inset-0 opacity-[0.02]" style={{
          backgroundImage: `linear-gradient(rgba(128,128,128,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(128,128,128,0.5) 1px, transparent 1px)`,
          backgroundSize: "60px 60px"
        }} />
      </div>

      <div className="relative z-10 flex flex-col items-center gap-10">
        <div className="relative">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-36 h-36 rounded-full animate-ping-slow" style={{ border: "1px solid var(--brand-15)" }} />
          </div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-28 h-28 rounded-full animate-ping-slower animation-delay-1000" style={{ border: "1px solid var(--brand-10)" }} />
          </div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-20 h-20 rounded-full animate-ping-slowest animation-delay-2000" style={{ border: "1px solid var(--brand-5)" }} />
          </div>
          <div className="relative w-20 h-20 rounded-2xl flex items-center justify-center animate-float-gentle"
            style={{ background: "var(--surface)", border: "1px solid var(--brand-20)", boxShadow: "0 0 40px var(--brand-10)" }}>
            <img src={logoImage} alt="FIN-NEST" className="w-12 h-12 object-contain animate-pulse-gentle" />
          </div>
        </div>

        <div className="flex flex-col items-center gap-4">
          <div className="text-center">
            <h1 className="text-2xl font-bold" style={{ color: "var(--text-strong)", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
              {t.appName}
            </h1>
            <p className="text-sm mt-1" style={{ color: "var(--text-subtle)" }}>{t.appSubtitle}</p>
          </div>

          <div className="flex flex-col items-center gap-2.5">
            <div className="w-48 h-0.5 rounded-full overflow-hidden" style={{ background: "var(--brand-10)" }}>
              <div className="h-full rounded-full transition-all duration-300 ease-out"
                style={{ width: `${Math.min(progress, 100)}%`, background: "var(--brand-grad)" }} />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs" style={{ color: "var(--text-subtle)" }}>{t.loading}</span>
              <div className="flex gap-1">
                {[0, 1, 2].map(i => (
                  <div key={i} className="w-1 h-1 rounded-full animate-bounce"
                    style={{ backgroundColor: "var(--brand)", animationDelay: `${i * 0.15}s` }} />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
