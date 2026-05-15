import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { Eye, EyeOff, Mail, Lock, AlertCircle } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";
import { LanguageSwitcher } from "../components/LanguageSwitcher";
import { AnimatedBackground } from "../components/AnimatedBackground";
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

  const focusIn  = (e: React.FocusEvent<HTMLInputElement>) => { e.target.style.borderColor = "var(--input-focus-border)"; e.target.style.boxShadow = "var(--brand-focus)"; };
  const focusOut = (e: React.FocusEvent<HTMLInputElement>) => { e.target.style.borderColor = "var(--input-border)";       e.target.style.boxShadow = "none"; };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      <AnimatedBackground />

      <div className="absolute top-4 right-4 z-20">
        <LanguageSwitcher variant="dark" />
      </div>

      <div className="w-full max-w-sm relative z-10">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4"
            style={{ background: "var(--surface)", border: "1px solid var(--brand-20)", boxShadow: "0 0 30px var(--brand-10)" }}>
            <img src={logoImage} alt="FIN-NEST" className="h-10 w-10 object-contain" />
          </div>
          <h1 className="text-3xl font-bold" style={{ color: "var(--text-strong)", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            {t.appName}
          </h1>
          <p className="text-sm mt-1.5" style={{ color: "var(--text-subtle)" }}>{t.appSubtitle}</p>
        </div>

        {/* Card */}
        <div className="rounded-2xl p-6"
          style={{ background: "var(--card)", backdropFilter: "var(--card-blur)", border: "1px solid var(--card-border)", boxShadow: "var(--shadow-lg)" }}>
          <h2 className="text-lg font-semibold mb-1" style={{ color: "var(--text-strong)", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            {t.auth.welcome}
          </h2>
          <p className="text-sm mb-6" style={{ color: "var(--text-subtle)" }}>{t.auth.signInSubtitle}</p>

          {error && (
            <div className="flex items-center gap-2 rounded-xl px-3 py-2.5 mb-4 text-sm"
              style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)", color: "#ef4444" }}>
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-medium" style={{ color: "var(--text-subtle)" }}>{t.auth.email}</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4" style={{ color: "var(--text-subtle)" }} />
                <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                  placeholder={t.auth.emailPlaceholder} required
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl text-sm outline-none transition-all"
                  style={{ background: "var(--input-bg)", border: "1px solid var(--input-border)", color: "var(--text-strong)" }}
                  onFocus={focusIn} onBlur={focusOut} />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium" style={{ color: "var(--text-subtle)" }}>{t.auth.password}</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4" style={{ color: "var(--text-subtle)" }} />
                <input type={showPassword ? "text" : "password"} value={password} onChange={e => setPassword(e.target.value)}
                  placeholder={t.auth.passwordPlaceholder} required
                  className="w-full pl-9 pr-10 py-2.5 rounded-xl text-sm outline-none transition-all"
                  style={{ background: "var(--input-bg)", border: "1px solid var(--input-border)", color: "var(--text-strong)" }}
                  onFocus={focusIn} onBlur={focusOut} />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 transition-colors" style={{ color: "var(--text-subtle)" }}>
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div className="text-right">
              <Link to="/forgot-password" className="text-xs transition-colors" style={{ color: "var(--brand)" }}>
                {t.auth.forgotPassword}
              </Link>
            </div>

            <button type="submit" disabled={loading}
              className="w-full py-3 rounded-xl font-semibold text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ background: "var(--brand-grad)", color: "var(--primary-foreground)", boxShadow: "0 4px 20px var(--brand-20)" }}>
              {loading ? t.auth.signingIn : t.auth.signIn}
            </button>
          </form>

          <p className="text-center text-sm mt-5" style={{ color: "var(--text-subtle)" }}>
            {t.auth.noAccount}{" "}
            <Link to="/register" className="font-medium transition-colors" style={{ color: "var(--brand)" }}>
              {t.auth.register}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
