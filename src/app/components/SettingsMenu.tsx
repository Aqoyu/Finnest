import { useState, useRef, useEffect } from "react";
import { Settings, Globe, Bell, Shield, HelpCircle, Info, Download, Upload, X } from "lucide-react";
import { useLanguage } from "../context/LanguageContext";

interface SettingsMenuProps {
  onClose?: () => void;
  onExport?: () => void;
}

export function SettingsMenu({ onClose, onExport }: SettingsMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const { t } = useLanguage();

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  const close = () => { setIsOpen(false); onClose?.(); };

  const ITEMS = [
    { key: "language",      Icon: Globe,      label: t.settings.language,      color: "#06b6d4" },
    { key: "notifications", Icon: Bell,       label: t.settings.notifications, color: "#8b5cf6" },
    { key: "security",      Icon: Shield,     label: t.settings.security,      color: "#10b981" },
  ];
  const DATA_ITEMS = [
    { key: "export", Icon: Download, label: t.settings.export, color: "#E8A020", action: onExport },
    { key: "import", Icon: Upload,   label: t.settings.import, color: "#06b6d4", action: undefined },
  ];
  const HELP_ITEMS = [
    { key: "help",  Icon: HelpCircle, label: t.settings.help,  color: "#5A6A85" },
    { key: "about", Icon: Info,       label: t.settings.about, color: "#5A6A85" },
  ];

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-7 h-7 flex items-center justify-center rounded-xl transition-all"
        style={{
          color: isOpen ? "var(--brand)" : "var(--text-subtle)",
          background: isOpen ? "var(--brand-10)" : "transparent",
        }}
        title={t.settings.title}
      >
        <Settings className="h-3.5 w-3.5" style={{ transform: isOpen ? "rotate(90deg)" : "rotate(0deg)", transition: "transform 0.3s" }} />
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40 md:hidden" onClick={() => setIsOpen(false)}
            style={{ background: "var(--confirm-overlay)", backdropFilter: "blur(4px)" }} />

          <div className="absolute right-0 top-full mt-2 w-60 z-50 overflow-hidden"
            style={{ background: "var(--card)", border: "1px solid var(--card-border)", borderRadius: "16px", boxShadow: "var(--shadow-lg)" }}>

            {/* Header */}
            <div className="px-4 py-3 flex items-center justify-between" style={{ borderBottom: "1px solid var(--divider)" }}>
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-lg flex items-center justify-center" style={{ background: "var(--brand-15)" }}>
                  <Settings className="h-3 w-3" style={{ color: "var(--brand)" }} />
                </div>
                <span className="font-semibold text-sm" style={{ color: "var(--text-strong)", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{t.settings.title}</span>
              </div>
              <button onClick={() => setIsOpen(false)}
                className="w-5 h-5 flex items-center justify-center rounded-lg transition-colors"
                style={{ color: "var(--text-subtle)" }}>
                <X className="h-3.5 w-3.5" />
              </button>
            </div>

            {/* Menu items */}
            <div className="py-1.5">
              {ITEMS.map(({ key, Icon, label, color }) => (
                <button key={key} onClick={close}
                  className="w-full px-4 py-2.5 flex items-center gap-3 text-left transition-colors group"
                  style={{ color: "var(--text-muted-custom)" }}
                  onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = "var(--surface)"; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = "transparent"; }}>
                  <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0" style={{ background: `${color}18` }}>
                    <Icon className="h-3.5 w-3.5" style={{ color }} />
                  </div>
                  <span className="text-sm font-medium">{label}</span>
                </button>
              ))}

              <div className="mx-4 my-1.5" style={{ borderTop: "1px solid var(--divider)" }} />

              {DATA_ITEMS.map(({ key, Icon, label, color, action }) => (
                <button key={key} onClick={() => { action?.(); close(); }}
                  className="w-full px-4 py-2.5 flex items-center gap-3 text-left transition-colors"
                  style={{ color: "var(--text-muted-custom)" }}
                  onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = "var(--surface)"; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = "transparent"; }}>
                  <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0" style={{ background: `${color}18` }}>
                    <Icon className="h-3.5 w-3.5" style={{ color }} />
                  </div>
                  <span className="text-sm font-medium">{label}</span>
                </button>
              ))}

              <div className="mx-4 my-1.5" style={{ borderTop: "1px solid var(--divider)" }} />

              {HELP_ITEMS.map(({ key, Icon, label, color }) => (
                <button key={key} onClick={close}
                  className="w-full px-4 py-2.5 flex items-center gap-3 text-left transition-colors"
                  style={{ color: "var(--text-muted-custom)" }}
                  onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = "var(--surface)"; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = "transparent"; }}>
                  <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0" style={{ background: "var(--surface)" }}>
                    <Icon className="h-3.5 w-3.5" style={{ color }} />
                  </div>
                  <span className="text-sm font-medium">{label}</span>
                </button>
              ))}
            </div>

            <div className="px-4 py-2.5" style={{ borderTop: "1px solid var(--divider)" }}>
              <p className="text-[10px] text-center" style={{ color: "var(--text-dim)" }}>{t.settings.version} 1.0.0</p>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
