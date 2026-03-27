import { useState, useRef, useEffect } from "react";
import { Globe } from "lucide-react";
import { useLanguage, LANGUAGES, Lang } from "../context/LanguageContext";

interface LanguageSwitcherProps {
  /** Use "light" on dark/gradient backgrounds, "dark" on white cards */
  variant?: "light" | "dark";
}

export function LanguageSwitcher({ variant = "dark" }: LanguageSwitcherProps) {
  const { lang, setLang } = useLanguage();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const current = LANGUAGES.find((l) => l.code === lang)!;

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const isLight = variant === "light";

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((o) => !o)}
        className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
          isLight
            ? "bg-white/20 hover:bg-white/30 text-white backdrop-blur-sm border border-white/30"
            : "bg-gray-100 hover:bg-gray-200 text-gray-700 border border-gray-200"
        }`}
        title="Change language"
      >
        <Globe className="h-3.5 w-3.5 opacity-80" />
        <span>{current.flag}</span>
        <span>{current.label}</span>
      </button>

      {open && (
        <div className="absolute left-0 top-full mt-1.5 z-50 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden min-w-[110px]">
          {LANGUAGES.map((l) => (
            <button
              key={l.code}
              onClick={() => {
                setLang(l.code as Lang);
                setOpen(false);
              }}
              className={`w-full flex items-center gap-2 px-3 py-2 text-sm transition-colors ${
                lang === l.code
                  ? "bg-gradient-to-r from-cyan-50 to-blue-50 text-cyan-700 font-semibold"
                  : "text-gray-700 hover:bg-gray-50"
              }`}
            >
              <span className="text-base">{l.flag}</span>
              <span className="font-medium">{l.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}