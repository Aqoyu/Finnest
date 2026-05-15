import { useState, useRef, useEffect } from "react";
import { Globe } from "lucide-react";
import { useLanguage, LANGUAGES, Lang } from "../context/LanguageContext";

interface LanguageSwitcherProps {
  variant?: "light" | "dark";
}

export function LanguageSwitcher({ variant = "dark" }: LanguageSwitcherProps) {
  const { lang, setLang } = useLanguage();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const current = LANGUAGES.find((l) => l.code === lang)!;

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-1.5 px-2 py-1.5 rounded-xl text-xs font-medium transition-all"
        style={{
          background: open ? "var(--brand-10)" : "var(--surface)",
          border: "1px solid var(--card-border)",
          color: "var(--text-muted-custom)",
        }}
        title="Change language"
      >
        <Globe className="h-3 w-3" style={{ color: "var(--text-subtle)" }} />
        <span>{current.flag}</span>
        <span className="hidden xs:inline">{current.label}</span>
      </button>

      {open && (
        <div className="absolute left-0 top-full mt-1.5 z-50 overflow-hidden min-w-[110px]"
          style={{ background: "var(--card)", border: "1px solid var(--card-border)", borderRadius: "12px", boxShadow: "var(--shadow-lg)" }}>
          {LANGUAGES.map((l) => (
            <button
              key={l.code}
              onClick={() => { setLang(l.code as Lang); setOpen(false); }}
              className="w-full flex items-center gap-2 px-3 py-2 text-sm transition-colors"
              style={{
                color: lang === l.code ? "var(--brand)" : "var(--text-muted-custom)",
                background: lang === l.code ? "var(--brand-10)" : "transparent",
                fontWeight: lang === l.code ? 600 : 400,
              }}
              onMouseEnter={e => { if (lang !== l.code) (e.currentTarget as HTMLButtonElement).style.background = "var(--surface)"; }}
              onMouseLeave={e => { if (lang !== l.code) (e.currentTarget as HTMLButtonElement).style.background = "transparent"; }}
            >
              <span className="text-base">{l.flag}</span>
              <span>{l.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
