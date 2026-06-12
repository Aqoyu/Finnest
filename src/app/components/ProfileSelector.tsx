import { useState } from "react";
import { Check, Lock } from "lucide-react";
import { PinEntry } from "./PinEntry";
import { AnimatedBackground } from "./AnimatedBackground";
import { useLanguage } from "../context/LanguageContext";
import logoImage from "figma:asset/dcd0af41caa7c6f5a83d31ce1f1e04ad05e2a042.png";

interface FamilyMember {
  id: string;
  name: string;
  color: string;
  pin?: string;
}

interface ProfileSelectorProps {
  members: FamilyMember[];
  onSelectProfile: (memberId: string) => void;
}

export function ProfileSelector({ members, onSelectProfile }: ProfileSelectorProps) {
  const { t } = useLanguage();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [showPinEntry, setShowPinEntry] = useState(false);

  const selectedMember = members.find((m) => m.id === selectedId);

  const handleContinue = () => {
    if (selectedId) {
      const member = members.find((m) => m.id === selectedId);
      if (member?.pin) {
        setShowPinEntry(true);
      } else {
        onSelectProfile(selectedId);
      }
    }
  };

  const handlePinSuccess = () => { if (selectedId) onSelectProfile(selectedId); };
  const handlePinCancel  = () => { setShowPinEntry(false); setSelectedId(null); };

  if (showPinEntry && selectedMember && selectedMember.pin) {
    return (
      <PinEntry
        memberName={selectedMember.name}
        memberColor={selectedMember.color}
        correctPin={selectedMember.pin}
        onSuccess={handlePinSuccess}
        onCancel={handlePinCancel}
      />
    );
  }

  return (
    <div className="min-h-screen relative flex items-center justify-center p-4">
      <AnimatedBackground />

      <div className="w-full max-w-sm relative z-10">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4"
            style={{ background: "var(--card)", border: "1px solid var(--card-border)", boxShadow: "var(--shadow-card)" }}>
            <img src={logoImage} alt="FIN-NEST" className="h-10 w-10 object-contain" />
          </div>
          <h1 className="text-2xl font-bold" style={{ color: "var(--text-strong)", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            {t.profileSelector.title}
          </h1>
          <p className="text-sm mt-1.5" style={{ color: "var(--text-subtle)" }}>{t.profileSelector.subtitle}</p>
        </div>

        {/* Card */}
        <div className="p-5 rounded-2xl" style={{ background: "var(--card)", border: "1px solid var(--card-border)", boxShadow: "var(--shadow-lg)" }}>
          <div className="space-y-2 mb-4">
            {members.map((member) => {
              const selected = selectedId === member.id;
              return (
                <button
                  key={member.id}
                  onClick={() => setSelectedId(member.id)}
                  className="relative w-full flex items-center gap-4 p-4 rounded-xl transition-all text-left"
                  style={selected
                    ? { background: "var(--brand-10)", border: "1px solid var(--brand-25)" }
                    : { background: "var(--surface)", border: "1px solid var(--card-border)" }
                  }
                >
                  <div className="w-11 h-11 rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0"
                    style={{ backgroundColor: member.color }}>
                    {member.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 text-left">
                    <p className="font-semibold" style={{ color: "var(--text-strong)" }}>{member.name}</p>
                  </div>
                  {selected && (
                    <div className="w-6 h-6 rounded-full flex items-center justify-center shrink-0"
                      style={{ background: "var(--brand-grad)" }}>
                      <Check className="h-3.5 w-3.5" style={{ color: "var(--primary-foreground)" }} />
                    </div>
                  )}
                  {member.pin && !selected && (
                    <Lock className="h-4 w-4 shrink-0" style={{ color: "var(--text-dim)" }} />
                  )}
                </button>
              );
            })}
          </div>

          <button
            onClick={handleContinue}
            disabled={!selectedId}
            className="w-full py-3 rounded-xl font-semibold text-sm transition-all disabled:opacity-30 disabled:cursor-not-allowed"
            style={{
              background: "var(--brand-grad)",
              color: "var(--primary-foreground)",
              
            }}
          >
            {t.profileSelector.continue}
          </button>
        </div>
      </div>
    </div>
  );
}
