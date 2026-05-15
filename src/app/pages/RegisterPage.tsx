import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { Eye, EyeOff, Mail, Lock, User, AlertCircle, CheckCircle2 } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";
import { LanguageSwitcher } from "../components/LanguageSwitcher";
import { AnimatedBackground } from "../components/AnimatedBackground";
import { projectId, publicAnonKey } from "/utils/supabase/info";
import logoImage from "figma:asset/dcd0af41caa7c6f5a83d31ce1f1e04ad05e2a042.png";

const SERVER_URL = `https://${projectId}.supabase.co/functions/v1/make-server-6595e014`;

export function RegisterPage() {
  const navigate = useNavigate();
  const { signIn } = useAuth();
  const { t } = useLanguage();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (password.length < 6) { setError(t.auth.minPasswordLength); return; }
    if (password !== confirmPassword) { setError(t.auth.passwordsDoNotMatch); return; }
    setLoading(true);
    try {
      const res = await fetch(`${SERVER_URL}/auth/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${publicAnonKey}` },
        body: JSON.stringify({ email, password, name }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || t.auth.registrationError); setLoading(false); return; }
      const { error: signInError } = await signIn(email, password);
      if (signInError) { setError(t.auth.accountCreated); setLoading(false); navigate("/login"); return; }
      navigate("/app");
    } catch (e) {
      setError(t.auth.connectionError);
      setLoading(false);
    }
  };

  const passwordStrength = () => {
    if (!password) return null;
    if (password.length < 6)  return { level: 0, label: t.auth.passwordStrengthWeak,   color: "#ef4444" };
    if (password.length < 8)  return { level: 1, label: t.auth.passwordStrengthMedium, color: "#f59e0b" };
    if (password.length < 12) return { level: 2, label: t.auth.passwordStrengthGood,   color: "#0891b2" };
    return                           { level: 3, label: t.auth.passwordStrengthStrong,  color: "#10b981" };
  };
  const strength = passwordStrength();

  const focusIn  = (e: React.FocusEvent<HTMLInputElement>) => { e.target.style.borderColor = "var(--input-focus-border)"; e.target.style.boxShadow = "var(--brand-focus)"; };
  const focusOut = (e: React.FocusEvent<HTMLInputElement>) => { e.target.style.borderColor = "var(--input-border)";       e.target.style.boxShadow = "none"; };

  const inputStyle: React.CSSProperties = {
    background: "var(--input-bg)", border: "1px solid var(--input-border)",
    color: "var(--text-strong)", borderRadius: "10px", width: "100%",
    padding: "10px 12px", fontSize: "14px", outline: "none", transition: "all 0.15s",
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      <AnimatedBackground />

      <div className="absolute top-4 right-4 z-20">
        <LanguageSwitcher variant="dark" />
      </div>

      <div className="w-full max-w-sm relative z-10">
        <div className="flex flex-col items-center mb-7">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4"
            style={{ background: "var(--surface)", border: "1px solid var(--brand-20)", boxShadow: "0 0 30px var(--brand-10)" }}>
            <img src={logoImage} alt="FIN-NEST" className="h-9 w-9 object-contain" />
          </div>
          <h1 className="text-2xl font-bold" style={{ color: "var(--text-strong)", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            {t.appName}
          </h1>
          <p className="text-sm mt-1" style={{ color: "var(--text-subtle)" }}>{t.appSubtitle}</p>
        </div>

        <div className="rounded-2xl p-6"
          style={{ background: "var(--card)", backdropFilter: "var(--card-blur)", border: "1px solid var(--card-border)", boxShadow: "var(--shadow-lg)" }}>
          <h2 className="text-lg font-semibold mb-1" style={{ color: "var(--text-strong)", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            {t.auth.createAccount}
          </h2>
          <p className="text-sm mb-5" style={{ color: "var(--text-subtle)" }}>{t.auth.oneAccountSubtitle}</p>

          {error && (
            <div className="flex items-center gap-2 rounded-xl px-3 py-2.5 mb-4 text-sm"
              style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)", color: "#ef4444" }}>
              <AlertCircle className="h-4 w-4 shrink-0" /><span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3.5">
            {[
              { label: t.auth.familyOwnerName, icon: User, type: "text",     val: name,            set: setName,            ph: t.auth.namePlaceholder },
              { label: t.auth.email,           icon: Mail, type: "email",    val: email,           set: setEmail,           ph: t.auth.emailPlaceholder },
            ].map(({ label, icon: Icon, type, val, set, ph }) => (
              <div key={label} className="space-y-1.5">
                <label className="text-xs font-medium" style={{ color: "var(--text-subtle)" }}>{label}</label>
                <div className="relative">
                  <Icon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4" style={{ color: "var(--text-subtle)" }} />
                  <input type={type} value={val} onChange={e => set(e.target.value)} placeholder={ph}
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl text-sm outline-none transition-all"
                    style={{ background: "var(--input-bg)", border: "1px solid var(--input-border)", color: "var(--text-strong)" }}
                    onFocus={focusIn} onBlur={focusOut} />
                </div>
              </div>
            ))}

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
              {strength && (
                <div className="flex items-center gap-2 mt-1">
                  <div className="flex gap-1 flex-1">
                    {[0,1,2,3].map(i => (
                      <div key={i} className="h-1 flex-1 rounded-full transition-all"
                        style={{ backgroundColor: i <= strength.level ? strength.color : "var(--text-dim)" }} />
                    ))}
                  </div>
                  <span className="text-xs" style={{ color: "var(--text-subtle)" }}>{strength.label}</span>
                </div>
              )}
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium" style={{ color: "var(--text-subtle)" }}>{t.auth.confirmPassword}</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4" style={{ color: "var(--text-subtle)" }} />
                <input type={showConfirm ? "text" : "password"} value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)}
                  placeholder={t.auth.confirmPasswordPlaceholder} required
                  className="w-full pl-9 pr-10 py-2.5 rounded-xl text-sm outline-none transition-all"
                  style={{ background: "var(--input-bg)", border: "1px solid var(--input-border)", color: "var(--text-strong)" }}
                  onFocus={focusIn} onBlur={focusOut} />
                <button type="button" onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 transition-colors" style={{ color: "var(--text-subtle)" }}>
                  {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
                {confirmPassword && password === confirmPassword && (
                  <CheckCircle2 className="absolute right-9 top-1/2 -translate-y-1/2 h-4 w-4" style={{ color: "#10b981" }} />
                )}
              </div>
            </div>

            <button type="submit" disabled={loading}
              className="w-full py-3 rounded-xl font-semibold text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed mt-1"
              style={{ background: "var(--brand-grad)", color: "var(--primary-foreground)", boxShadow: "0 4px 20px var(--brand-20)" }}>
              {loading ? t.auth.registering : t.auth.registerButton}
            </button>
          </form>

          <p className="text-center text-sm mt-5" style={{ color: "var(--text-subtle)" }}>
            {t.auth.alreadyHaveAccount}{" "}
            <Link to="/login" className="font-medium transition-colors" style={{ color: "var(--brand)" }}>
              {t.auth.signInLink}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
