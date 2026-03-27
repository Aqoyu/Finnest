import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { Eye, EyeOff, Mail, Lock, User, AlertCircle, CheckCircle2 } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";
import { LanguageSwitcher } from "../components/LanguageSwitcher";
import { getSupabase } from "../lib/supabaseClient";
import { projectId, publicAnonKey } from "/utils/supabase/info";
import logoImage from "figma:asset/dcd0af41caa7c6f5a83d31ce1f1e04ad05e2a042.png";

const SERVER_URL = `https://${projectId}.supabase.co/functions/v1/make-server-6595e014`;

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" className="shrink-0">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
    </svg>
  );
}

export function RegisterPage() {
  const navigate = useNavigate();
  const { signIn, signInWithGoogle } = useAuth();
  const { t } = useLanguage();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
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
      if (signInError) {
        setError(t.auth.accountCreated);
        setLoading(false);
        navigate("/login");
        return;
      }
      navigate("/app");
    } catch (e) {
      console.log(`Registration error: ${e}`);
      setError(t.auth.connectionError);
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    setError(null);
    setGoogleLoading(true);
    const { error } = await signInWithGoogle();
    if (error) { setError(t.auth.googleError + error); setGoogleLoading(false); }
  };

  const passwordStrength = () => {
    if (!password) return null;
    if (password.length < 6) return { level: 0, label: t.auth.passwordStrengthWeak, color: "bg-red-400" };
    if (password.length < 8) return { level: 1, label: t.auth.passwordStrengthMedium, color: "bg-yellow-400" };
    if (password.length < 12) return { level: 2, label: t.auth.passwordStrengthGood, color: "bg-cyan-400" };
    return { level: 3, label: t.auth.passwordStrengthStrong, color: "bg-green-400" };
  };
  const strength = passwordStrength();

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-blue-50 to-teal-50 flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute top-[-80px] right-[-80px] w-64 h-64 rounded-full bg-gradient-to-br from-cyan-300/30 to-blue-300/30 blur-3xl pointer-events-none" />
      <div className="absolute bottom-[-80px] left-[-80px] w-72 h-72 rounded-full bg-gradient-to-br from-teal-300/30 to-cyan-300/30 blur-3xl pointer-events-none" />

      <div className="absolute top-4 right-4 z-20">
        <LanguageSwitcher variant="dark" />
      </div>

      <div className="w-full max-w-sm relative z-10">
        <div className="flex flex-col items-center mb-6">
          <div className="p-3 rounded-2xl bg-white/60 backdrop-blur-sm shadow-lg border border-white/50 mb-4">
            <img src={logoImage} alt="FIN-NEST" className="h-14 w-14" />
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-600 via-blue-600 to-teal-600 bg-clip-text text-transparent">
            {t.appName}
          </h1>
          <p className="text-sm text-gray-500 mt-1 font-normal">{t.appSubtitle}</p>
        </div>

        <div className="bg-white/70 backdrop-blur-xl rounded-3xl shadow-xl border border-white/60 p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-1">{t.auth.createAccount}</h2>
          <p className="text-sm text-gray-500 mb-5 font-normal">{t.auth.oneAccountSubtitle}</p>

          {error && (
            <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-600 rounded-xl px-3 py-2.5 mb-4 text-sm">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3.5">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-700">{t.auth.familyOwnerName}</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={t.auth.namePlaceholder}
                  className="w-full pl-9 pr-3 py-2.5 bg-gray-50/80 border border-gray-200 rounded-xl text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-400/50 focus:border-cyan-400 transition-colors"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-700">{t.auth.email}</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={t.auth.emailPlaceholder}
                  required
                  className="w-full pl-9 pr-3 py-2.5 bg-gray-50/80 border border-gray-200 rounded-xl text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-400/50 focus:border-cyan-400 transition-colors"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-700">{t.auth.password}</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={t.auth.passwordPlaceholder}
                  required
                  className="w-full pl-9 pr-10 py-2.5 bg-gray-50/80 border border-gray-200 rounded-xl text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-400/50 focus:border-cyan-400 transition-colors"
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors">
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {strength && (
                <div className="flex items-center gap-2 mt-1">
                  <div className="flex gap-1 flex-1">
                    {[0, 1, 2, 3].map((i) => (
                      <div key={i} className={`h-1 flex-1 rounded-full transition-colors ${i <= strength.level ? strength.color : "bg-gray-200"}`} />
                    ))}
                  </div>
                  <span className="text-xs text-gray-500 font-normal">{strength.label}</span>
                </div>
              )}
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-700">{t.auth.confirmPassword}</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type={showConfirm ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder={t.auth.confirmPasswordPlaceholder}
                  required
                  className="w-full pl-9 pr-10 py-2.5 bg-gray-50/80 border border-gray-200 rounded-xl text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-400/50 focus:border-cyan-400 transition-colors"
                />
                <button type="button" onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors">
                  {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
                {confirmPassword && password === confirmPassword && (
                  <CheckCircle2 className="absolute right-9 top-1/2 -translate-y-1/2 h-4 w-4 text-green-500" />
                )}
              </div>
            </div>

            <button type="submit" disabled={loading}
              className="w-full py-2.5 rounded-xl font-semibold text-white bg-gradient-to-r from-cyan-500 via-blue-500 to-teal-500 shadow-md hover:shadow-lg hover:opacity-95 transition-all disabled:opacity-60 disabled:cursor-not-allowed text-sm mt-1">
              {loading ? t.auth.registering : t.auth.registerButton}
            </button>
          </form>

          <div className="flex items-center gap-3 my-4">
            <div className="flex-1 h-px bg-gray-200" />
            <span className="text-xs text-gray-400 font-normal">{t.or}</span>
            <div className="flex-1 h-px bg-gray-200" />
          </div>

          <button onClick={handleGoogle} disabled={googleLoading}
            className="w-full flex items-center justify-center gap-2.5 py-2.5 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 transition-colors text-sm font-medium text-gray-700 shadow-sm disabled:opacity-60 disabled:cursor-not-allowed">
            <GoogleIcon />
            {googleLoading ? t.auth.redirecting : t.auth.registerWithGoogle}
          </button>

          <p className="text-center text-sm text-gray-500 mt-4 font-normal">
            {t.auth.alreadyHaveAccount}{" "}
            <Link to="/login" className="text-cyan-600 hover:text-cyan-700 font-medium transition-colors">
              {t.auth.signInLink}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
