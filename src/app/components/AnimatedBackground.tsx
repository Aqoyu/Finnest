import { useTheme } from "../context/ThemeContext";

export function AnimatedBackground() {
  const { isDark } = useTheme();

  if (isDark) {
    return (
      <div className="fixed inset-0 -z-10 overflow-hidden" style={{ background: "#050507" }}>
        <div
          className="animate-orb-drift absolute"
          style={{
            top: "-15%", left: "-10%",
            width: "55vw", height: "55vw",
            background: "radial-gradient(circle at 40% 40%, rgba(109,40,217,0.22) 0%, rgba(109,40,217,0.08) 45%, transparent 70%)",
            borderRadius: "50%",
          }}
        />
        <div
          className="animate-orb-drift-2 absolute"
          style={{
            bottom: "-20%", right: "-15%",
            width: "60vw", height: "60vw",
            background: "radial-gradient(circle at 60% 60%, rgba(79,70,229,0.18) 0%, rgba(79,70,229,0.06) 45%, transparent 70%)",
            borderRadius: "50%",
          }}
        />
        <div
          className="animate-orb-drift absolute"
          style={{
            top: "38%", left: "25%",
            width: "32vw", height: "32vw",
            background: "radial-gradient(circle, rgba(139,92,246,0.07) 0%, transparent 70%)",
            borderRadius: "50%",
            animationDelay: "6s",
          }}
        />
        <div
          style={{
            position: "absolute", inset: 0,
            backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.014) 1px, transparent 1px)",
            backgroundSize: "36px 36px",
          }}
        />
      </div>
    );
  }

  return (
    <div className="fixed inset-0 -z-10 overflow-hidden" style={{ background: "#F7F7FB" }}>
      <div
        className="animate-orb-drift absolute"
        style={{
          top: "-20%", left: "-10%",
          width: "60vw", height: "60vw",
          background: "radial-gradient(circle at 40% 40%, rgba(124,58,237,0.08) 0%, rgba(124,58,237,0.03) 50%, transparent 70%)",
          borderRadius: "50%",
        }}
      />
      <div
        className="animate-orb-drift-2 absolute"
        style={{
          bottom: "-20%", right: "-15%",
          width: "55vw", height: "55vw",
          background: "radial-gradient(circle at 60% 60%, rgba(91,33,182,0.07) 0%, rgba(91,33,182,0.02) 50%, transparent 70%)",
          borderRadius: "50%",
        }}
      />
    </div>
  );
}
