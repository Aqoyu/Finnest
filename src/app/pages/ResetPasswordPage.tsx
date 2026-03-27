import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { Eye, EyeOff, Lock, AlertCircle, CheckCircle2 } from "lucide-react";
import { getSupabase } from "../lib/supabaseClient";
import { useLanguage } from "../context/LanguageContext";
import { LanguageSwitcher } from "../components/LanguageSwitcher";
import logoImage from "figma:asset/dcd0af41caa7c6f5a83d31ce1f1e04ad05e2a042.png";

export function ResetPasswordPage() {
  const navigate = useNavigate();
  const { t } = useLanguage();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const supabase = getSupabase();
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") setReady(true);
    });
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) setReady(true);
    });
    return () => subscription.unsubscribe();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password.length < 6) { setError(t.auth.minPasswordLength); return; }
    if (password !== confirmPassword) { setError(t.auth.passwordsDoNotMatch); return; }

    setLoading(true);
    const supabase = getSupabase();
    const { error } = await supabase.auth.updateUser({ password });

    if (error) {
      console.log(`Update password error: ${error.message}`);
      setError(t.auth.resetPasswordError);
      setLoading(false);
      return;
    }

    setSuccess(true);
    setLoading(false);
    setTimeout(() => navigate("/app"), 2000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-blue-50 to-teal-50 flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute top-[-80px] left-[-80px] w-64 h-64 rounded-full bg-gradient-to-br from-cyan-300/30 to-blue-300/30 blur-3xl pointer-events-none" />
      <div className="absolute bottom-[-80px] right-[-80px] w-72 h-72 rounded-full bg-gradient-to-br from-teal-300/30 to-cyan-300/30 blur-3xl pointer-events-none" />

      <div className="absolute top-4 right-4 z-20">
        <LanguageSwitcher variant="dark" />
      </div>

      <div className="w-full max-w-sm relative z-10">
        <div className="flex flex-col items-center mb-8">
          <div className="p-3 rounded-2xl bg-white/60 backdrop-blur-sm shadow-lg border border-white/50 mb-4">
            <img src={logoImage} alt="FIN-NEST" className="h-14 w-14" />
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-600 via-blue-600 to-teal-600 bg-clip-text text-transparent">
            {t.appName}
          </h1>
          <p className="text-sm text-gray-500 mt-1 font-normal">{t.appSubtitle}</p>
        </div>

        <div className="bg-white/70 backdrop-blur-xl rounded-3xl shadow-xl border border-white/60 p-6">
          {success ? (
            <div className="text-center py-2">
              <div className="flex justify-center mb-4">
                <div className="p-3 rounded-full bg-green-50 border border-green-100">
                  <CheckCircle2 className="h-8 w-8 text-green-500" />
                </div>
              </div>
              <h2 className="text-lg font-semibold text-gray-800 mb-2">{t.auth.passwordUpdatedTitle}</h2>
              <p className="text-sm text-gray-500 font-normal">{t.auth.passwordUpdatedSubtitle}</p>
            </div>
          ) : (
            <>
              <div className="mb-5">
                <h2 className="text-xl font-semibold text-gray-800 mb-1">{t.auth.newPasswordTitle}</h2>
                <p className="text-sm text-gray-500 font-normal">{t.auth.newPasswordSubtitle}</p>
              </div>

              {!ready && (
                <div className="flex items-center gap-2 bg-yellow-50 border border-yellow-200 text-yellow-700 rounded-xl px-3 py-2.5 mb-4 text-sm">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>{t.auth.checkingLink}</span>
                </div>
              )}

              {error && (
                <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-600 rounded-xl px-3 py-2.5 mb-4 text-sm">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-gray-700">{t.auth.newPasswordTitle}</label>
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

                <button type="submit" disabled={loading || !ready}
                  className="w-full py-2.5 rounded-xl font-semibold text-white bg-gradient-to-r from-cyan-500 via-blue-500 to-teal-500 shadow-md hover:shadow-lg hover:opacity-95 transition-all disabled:opacity-60 disabled:cursor-not-allowed text-sm">
                  {loading ? t.auth.saving : t.auth.savePassword}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
