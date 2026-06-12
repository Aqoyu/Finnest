import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { Eye, EyeOff, Mail, Lock, AlertCircle } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";
import { LanguageSwitcher } from "../components/LanguageSwitcher";
import logoImage from "figma:asset/dcd0af41caa7c6f5a83d31ce1f1e04ad05e2a042.png";

export function LoginPage() {
  const navigate = useNavigate();
  const { signIn } = useAuth();
  const { t } = useLanguage();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const { error } = await signIn(email, password);
    if (error) { setError(t.auth.invalidCredentials); setLoading(false); return; }
    navigate("/app");
  };

  const focusIn  = (e: React.FocusEvent<HTMLInputElement>) => {
    e.target.style.borderColor = "rgba(139,92,246,0.5)";
    e.target.style.boxShadow = "0 0 0 3px rgba(139,92,246,0.15)";
    e.target.style.background = "rgba(255,255,255,0.08)";
  };
  const focusOut = (e: React.FocusEvent<HTMLInputElement>) => {
    e.target.style.borderColor = "rgba(255,255,255,0.08)";
    e.target.style.boxShadow = "none";
    e.target.style.background = "rgba(255,255,255,0.06)";
  };

  return (
    <div className="min-h-screen flex relative overflow-hidden" style={{ background: "#050507" }}>
      {/* Left decorative panel — desktop only */}
      <div
        className="hidden md:flex flex-col justify-between w-5/12 p-12 relative overflow-hidden"
        style={{
          background: "linear-gradient(145deg, #2E1065 0%, #1A0B3D 40%, #0A1535 100%)",
          borderRight: "1px solid rgba(255,255,255,0.06)",
        }}
      >
        <div style={{ position: "absolute", top: "-20%", right: "-10%", width: "70%", height: "70%", background: "radial-gradient(circle, rgba(139,92,246,0.4) 0%, transparent 65%)", borderRadius: "50%", pointerEvents: "none" }} />
        <div style={{ position: "absolute", bottom: "-10%", left: "-10%", width: "60%", height: "60%", background: "radial-gradient(circle, rgba(79,70,229,0.25) 0%, transparent 65%)", borderRadius: "50%", pointerEvents: "none" }} />

        <div className="relative">
          <div className="flex items-center gap-3 mb-16">
            <img src={logoImage} alt="FIN-NEST" className="h-10 w-10 object-contain" />
            <span className="text-white font-bold text-lg" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{t.appName}</span>
          </div>
          <h2 className="text-3xl font-bold text-white mb-4 leading-tight" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{t.appSubtitle}</h2>
          <p className="text-sm leading-relaxed" style={{ color: "rgba(255,255,255,0.45)" }}>
            Управляйте финансами семьи, ставьте цели и отслеживайте бюджеты в одном приложении.
          </p>
        </div>

        <div className="relative space-y-2.5">
          {[
            { label: "Баланс", value: "₸ 1 240 000", color: "#A78BFA" },
            { label: "Расходы", value: "₸ 320 500", color: "#F87171" },
            { label: "Цели", value: "3 активных", color: "#34D399" },
          ].map((item, i) => (
            <div
              key={i}
              className="flex items-center justify-between px-4 py-3 rounded-2xl"
              style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.07)", transform: `translateX(${i * 14}px)` }}
            >
              <span className="text-xs" style={{ color: "rgba(255,255,255,0.4)" }}>{item.label}</span>
              <span className="text-sm font-bold" style={{ color: item.color }}>{item.value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Right panel — form */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 relative">
        {/* Mobile orb */}
        <div className="md:hidden absolute inset-0 overflow-hidden pointer-events-none">
          <div style={{ position: "absolute", top: "-30%", right: "-20%", width: "80vw", height: "80vw", background: "radial-gradient(circle, rgba(109,40,217,0.2) 0%, transparent 65%)", borderRadius: "50%" }} />
        </div>

        <div className="absolute top-4 right-4 z-20">
          <LanguageSwitcher variant="dark" />
        </div>

        <div className="w-full max-w-sm relative z-10">
          {/* Mobile logo */}
          <div className="md:hidden flex flex-col items-center mb-10">
            <img src={logoImage} alt="FIN-NEST" className="h-14 w-14 object-contain mb-4" />
            <h1 className="text-2xl font-bold" style={{ color: "#FAFAFA", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{t.appName}</h1>
            <p className="text-xs mt-1" style={{ color: "rgba(255,255,255,0.35)" }}>{t.appSubtitle}</p>
          </div>

          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-1" style={{ color: "#FAFAFA", fontFamily: "'Plus Jakarta Sans', sans-serif", letterSpacing: "-0.025em" }}>
              {t.auth.welcome}
            </h2>
            <p className="text-sm" style={{ color: "rgba(255,255,255,0.4)" }}>{t.auth.signInSubtitle}</p>
          </div>

          {error && (
            <div className="flex items-center gap-2 rounded-2xl px-4 py-3 mb-5 text-sm" style={{ background: "rgba(248,113,113,0.1)", border: "1px solid rgba(248,113,113,0.2)", color: "#F87171" }}>
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-widest" style={{ color: "rgba(255,255,255,0.3)" }}>{t.auth.email}</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4" style={{ color: "rgba(255,255,255,0.25)" }} />
                <input
                  type="email" value={email} onChange={e => setEmail(e.target.value)}
                  placeholder={t.auth.emailPlaceholder} required
                  className="w-full pl-11 pr-4 py-3.5 rounded-2xl text-sm outline-none transition-all"
                  style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.08)", color: "#FAFAFA" }}
                  onFocus={focusIn} onBlur={focusOut}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-widest" style={{ color: "rgba(255,255,255,0.3)" }}>{t.auth.password}</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4" style={{ color: "rgba(255,255,255,0.25)" }} />
                <input
                  type={showPassword ? "text" : "password"} value={password} onChange={e => setPassword(e.target.value)}
                  placeholder={t.auth.passwordPlaceholder} required
                  className="w-full pl-11 pr-12 py-3.5 rounded-2xl text-sm outline-none transition-all"
                  style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.08)", color: "#FAFAFA" }}
                  onFocus={focusIn} onBlur={focusOut}
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2" style={{ color: "rgba(255,255,255,0.3)" }}>
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div className="text-right">
              <Link to="/forgot-password" className="text-xs font-medium" style={{ color: "#A78BFA" }}>{t.auth.forgotPassword}</Link>
            </div>

            <button
              type="submit" disabled={loading}
              className="w-full py-4 rounded-2xl font-bold text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ background: "linear-gradient(135deg, #7C3AED 0%, #5B21B6 100%)", color: "#FFFFFF", boxShadow: "0 4px 20px rgba(124,58,237,0.4)" }}
            >
              {loading ? t.auth.signingIn : t.auth.signIn}
            </button>
          </form>

          <p className="text-center text-sm mt-6" style={{ color: "rgba(255,255,255,0.3)" }}>
            {t.auth.noAccount}{" "}
            <Link to="/register" className="font-semibold" style={{ color: "#A78BFA" }}>{t.auth.register}</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
