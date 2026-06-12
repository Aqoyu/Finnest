import { useState, useEffect } from "react";
import { ChevronUp } from "lucide-react";

export function ScrollToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 300);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  if (!visible) return null;

  return (
    <button
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      className="fixed z-40 transition-all"
      style={{
        bottom: "90px",
        right: "16px",
        width: "36px",
        height: "36px",
        borderRadius: "50%",
        background: "var(--brand-grad)",
        color: "#fff",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        boxShadow: "0 4px 16px var(--brand-25), 0 0 0 1px var(--brand-15)",
        border: "none",
        cursor: "pointer",
      }}
      aria-label="Наверх"
    >
      <ChevronUp className="h-4 w-4" />
    </button>
  );
}
