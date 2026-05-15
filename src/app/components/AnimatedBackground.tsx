import { useTheme } from "../context/ThemeContext";

export function AnimatedBackground() {
  const { isDark } = useTheme();

  if (isDark) {
    return (
      <div className="fixed inset-0 -z-10 overflow-hidden" style={{ backgroundColor: "#060B18" }}>
        <div className="absolute inset-0" style={{ background: "radial-gradient(ellipse 80% 60% at 50% -10%, rgba(232,160,32,0.08) 0%, transparent 70%)" }} />
        <div className="absolute -top-32 -right-32 w-[500px] h-[500px] rounded-full opacity-20 animate-blob"
          style={{ background: "radial-gradient(circle, rgba(232,160,32,0.25) 0%, transparent 70%)" }} />
        <div className="absolute -bottom-40 -left-20 w-[440px] h-[440px] rounded-full opacity-15 animate-blob animation-delay-3000"
          style={{ background: "radial-gradient(circle, rgba(6,182,212,0.2) 0%, transparent 70%)" }} />
        <div className="absolute inset-0 opacity-[0.025]" style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px)`,
          backgroundSize: "60px 60px"
        }} />
        <div className="absolute top-[20%] left-[15%] w-1 h-1 rounded-full opacity-40 animate-float" style={{ backgroundColor: "#E8A020" }} />
        <div className="absolute top-[45%] left-[70%] w-1.5 h-1.5 rounded-full opacity-30 animate-float animation-delay-2000" style={{ backgroundColor: "#F0B429" }} />
        <div className="absolute top-[70%] left-[30%] w-1 h-1 rounded-full opacity-25 animate-float animation-delay-4000" style={{ backgroundColor: "#E8A020" }} />
        <div className="absolute top-[30%] right-[20%] w-0.5 h-0.5 rounded-full opacity-50 animate-float animation-delay-1000" style={{ backgroundColor: "#06b6d4" }} />
        <div className="absolute top-[10%] left-[60%] w-64 h-64 rounded-full animate-spin-slow opacity-[0.04]"
          style={{ border: "1px solid rgba(232,160,32,1)" }} />
        <div className="absolute bottom-[15%] right-[5%] w-48 h-48 rounded-full animate-spin-slower opacity-[0.04]"
          style={{ border: "1px solid rgba(6,182,212,1)" }} />
        <div className="absolute bottom-0 left-0 right-0 h-32"
          style={{ background: "linear-gradient(to top, rgba(6,11,24,0.8), transparent)" }} />
      </div>
    );
  }

  return (
    <div className="fixed inset-0 -z-10 overflow-hidden" style={{ background: "linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 40%, #f0fdf4 100%)" }}>
      <div className="absolute top-0 -left-4 w-96 h-96 rounded-full mix-blend-multiply filter blur-3xl opacity-60 animate-blob"
        style={{ background: "linear-gradient(135deg, rgba(6,182,212,0.35), rgba(8,145,178,0.25))" }} />
      <div className="absolute top-0 -right-4 w-96 h-96 rounded-full mix-blend-multiply filter blur-3xl opacity-60 animate-blob animation-delay-2000"
        style={{ background: "linear-gradient(135deg, rgba(20,184,166,0.3), rgba(6,182,212,0.3))" }} />
      <div className="absolute -bottom-8 left-20 w-96 h-96 rounded-full mix-blend-multiply filter blur-3xl opacity-60 animate-blob animation-delay-4000"
        style={{ background: "linear-gradient(135deg, rgba(59,130,246,0.25), rgba(99,102,241,0.2))" }} />
      <div className="absolute inset-0 opacity-[0.03]" style={{
        backgroundImage: `linear-gradient(to right, rgb(6,182,212) 1px, transparent 1px), linear-gradient(to bottom, rgb(6,182,212) 1px, transparent 1px)`,
        backgroundSize: "4rem 4rem"
      }} />
      <div className="absolute top-1/4 left-1/4 w-64 h-64 border border-cyan-300/30 rounded-full animate-spin-slow opacity-40" />
      <div className="absolute top-1/3 right-1/4 w-48 h-48 border border-blue-300/30 rounded-full animate-spin-slower opacity-30" />
      <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-cyan-400 rounded-full animate-float opacity-50" />
      <div className="absolute top-1/2 left-1/3 w-1.5 h-1.5 bg-blue-400 rounded-full animate-float animation-delay-1000 opacity-40" />
      <div className="absolute top-2/3 right-1/4 w-2 h-2 bg-teal-400 rounded-full animate-float animation-delay-2000 opacity-50" />
      <div className="absolute inset-0 bg-gradient-to-t from-white/40 via-transparent to-transparent" />
    </div>
  );
}
