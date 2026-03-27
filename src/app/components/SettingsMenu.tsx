import { useState, useRef, useEffect } from "react";
import { Settings, Globe, Bell, Shield, HelpCircle, Info, Download, Upload, Trash2, X } from "lucide-react";
import { useLanguage } from "../context/LanguageContext";

interface SettingsMenuProps {
  onClose?: () => void;
}

export function SettingsMenu({ onClose }: SettingsMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const { t } = useLanguage();

  // Close menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const handleMenuItemClick = (action: string) => {
    console.log(`Settings action: ${action}`);
    // Здесь будут обработчики для разных действий
    setIsOpen(false);
    if (onClose) onClose();
  };

  return (
    <div className="relative" ref={menuRef}>
      {/* Settings Icon Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`w-8 h-8 flex items-center justify-center rounded-xl transition-all ${
          isOpen
            ? "text-cyan-600 bg-cyan-50"
            : "text-gray-400 hover:text-cyan-600 hover:bg-cyan-50"
        }`}
        title={t.settings.title}
      >
        <Settings className={`h-4 w-4 transition-transform ${isOpen ? "rotate-90" : ""}`} />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <>
          {/* Backdrop overlay for mobile */}
          <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 md:hidden" onClick={() => setIsOpen(false)} />
          
          {/* Menu */}
          <div className="absolute right-0 top-full mt-2 w-72 bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-cyan-200/50 z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
            {/* Header */}
            <div className="px-4 py-3 bg-gradient-to-r from-cyan-500/10 via-blue-500/10 to-teal-500/10 border-b border-cyan-200/50 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
                  <Settings className="h-4 w-4 text-white" />
                </div>
                <h3 className="font-semibold text-gray-800">{t.settings.title}</h3>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="w-7 h-7 flex items-center justify-center rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Menu Items */}
            <div className="py-2">
              {/* Language */}
              <button
                onClick={() => handleMenuItemClick("language")}
                className="w-full px-4 py-2.5 flex items-center gap-3 text-left hover:bg-cyan-50 transition-colors group"
              >
                <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-blue-100 to-cyan-100 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Globe className="h-4 w-4 text-cyan-600" />
                </div>
                <span className="text-sm font-medium text-gray-700 group-hover:text-cyan-600">
                  {t.settings.language}
                </span>
              </button>

              {/* Notifications */}
              <button
                onClick={() => handleMenuItemClick("notifications")}
                className="w-full px-4 py-2.5 flex items-center gap-3 text-left hover:bg-cyan-50 transition-colors group"
              >
                <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Bell className="h-4 w-4 text-purple-600" />
                </div>
                <span className="text-sm font-medium text-gray-700 group-hover:text-cyan-600">
                  {t.settings.notifications}
                </span>
              </button>

              {/* Security */}
              <button
                onClick={() => handleMenuItemClick("security")}
                className="w-full px-4 py-2.5 flex items-center gap-3 text-left hover:bg-cyan-50 transition-colors group"
              >
                <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-green-100 to-emerald-100 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Shield className="h-4 w-4 text-green-600" />
                </div>
                <span className="text-sm font-medium text-gray-700 group-hover:text-cyan-600">
                  {t.settings.security}
                </span>
              </button>

              <div className="my-2 mx-4 border-t border-gray-200" />

              {/* Export Data */}
              <button
                onClick={() => handleMenuItemClick("export")}
                className="w-full px-4 py-2.5 flex items-center gap-3 text-left hover:bg-cyan-50 transition-colors group"
              >
                <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-amber-100 to-orange-100 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Download className="h-4 w-4 text-amber-600" />
                </div>
                <span className="text-sm font-medium text-gray-700 group-hover:text-cyan-600">
                  {t.settings.export}
                </span>
              </button>

              {/* Import Data */}
              <button
                onClick={() => handleMenuItemClick("import")}
                className="w-full px-4 py-2.5 flex items-center gap-3 text-left hover:bg-cyan-50 transition-colors group"
              >
                <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-indigo-100 to-blue-100 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Upload className="h-4 w-4 text-indigo-600" />
                </div>
                <span className="text-sm font-medium text-gray-700 group-hover:text-cyan-600">
                  {t.settings.import}
                </span>
              </button>

              {/* Clear Data */}
              <button
                onClick={() => handleMenuItemClick("clearData")}
                className="w-full px-4 py-2.5 flex items-center gap-3 text-left hover:bg-red-50 transition-colors group"
              >
                <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-red-100 to-pink-100 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Trash2 className="h-4 w-4 text-red-600" />
                </div>
                <span className="text-sm font-medium text-gray-700 group-hover:text-red-600">
                  {t.settings.clearData}
                </span>
              </button>

              <div className="my-2 mx-4 border-t border-gray-200" />

              {/* Help */}
              <button
                onClick={() => handleMenuItemClick("help")}
                className="w-full px-4 py-2.5 flex items-center gap-3 text-left hover:bg-cyan-50 transition-colors group"
              >
                <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-teal-100 to-cyan-100 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <HelpCircle className="h-4 w-4 text-teal-600" />
                </div>
                <span className="text-sm font-medium text-gray-700 group-hover:text-cyan-600">
                  {t.settings.help}
                </span>
              </button>

              {/* About */}
              <button
                onClick={() => handleMenuItemClick("about")}
                className="w-full px-4 py-2.5 flex items-center gap-3 text-left hover:bg-cyan-50 transition-colors group"
              >
                <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-gray-100 to-slate-100 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Info className="h-4 w-4 text-gray-600" />
                </div>
                <span className="text-sm font-medium text-gray-700 group-hover:text-cyan-600">
                  {t.settings.about}
                </span>
              </button>
            </div>

            {/* Footer */}
            <div className="px-4 py-2 bg-gradient-to-r from-cyan-500/5 via-blue-500/5 to-teal-500/5 border-t border-cyan-200/50">
              <p className="text-xs text-gray-500 text-center">
                {t.settings.version} 1.0.0
              </p>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
