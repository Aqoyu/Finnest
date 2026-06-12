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
    <div className="fixed inset-0 flex items-center justify-center z-50 overflow-hidden" style={{ background: "#050507" }}>
      {/* Background orbs */}
      <div style={{
        position: "absolute", top: "-20%", left: "-10%", width: "60vw", height: "60vw",
        background: "radial-gradient(circle, rgba(109,40,217,0.25) 0%, transparent 65%)", borderRadius: "50%",
      }} />
      <div style={{
        position: "absolute", bottom: "-20%", right: "-10%", width: "55vw", height: "55vw",
        background: "radial-gradient(circle, rgba(79,70,229,0.18) 0%, transparent 65%)", borderRadius: "50%",
      }} />

      <div className="flex flex-col items-center gap-8 relative z-10">
        <img src={logoImage} alt="FIN-NEST" className="w-20 h-20 object-contain" />

        <div className="flex flex-col items-center gap-5 text-center">
          <div>
            <h1 className="text-2xl font-bold" style={{ color: "#FAFAFA", fontFamily: "'Plus Jakarta Sans', sans-serif", letterSpacing: "-0.03em" }}>
              {t.appName}
            </h1>
            <p className="text-sm mt-1.5" style={{ color: "rgba(255,255,255,0.35)" }}>{t.appSubtitle}</p>
          </div>

          <div className="flex flex-col items-center gap-2.5 w-40">
            <div className="w-full h-0.5 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.08)" }}>
              <div
                className="h-full rounded-full transition-all duration-300 ease-out"
                style={{ width: `${Math.min(progress, 100)}%`, background: "linear-gradient(90deg, #7C3AED, #A78BFA)", boxShadow: "0 0 8px rgba(139,92,246,0.6)" }}
              />
            </div>
            <span className="text-[11px] font-medium" style={{ color: "rgba(255,255,255,0.3)" }}>{t.loading}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
