import { User, Users, ChevronDown } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { useLanguage } from "../context/LanguageContext";

export interface FamilyMember {
  id: string;
  name: string;
  color: string;
}

interface MemberSelectorProps {
  members: FamilyMember[];
  selectedMemberId: string | null;
  onSelectMember: (memberId: string | null) => void;
  showAllOption?: boolean;
}

export function MemberSelector({ members, selectedMemberId, onSelectMember, showAllOption = true }: MemberSelectorProps) {
  const { t } = useLanguage();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const selectedMember = members.find((m) => m.id === selectedMemberId);

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
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center gap-2 px-3 py-2 rounded-xl transition-all text-left"
        style={{ background: "var(--surface)", border: "1px solid var(--card-border)" }}
      >
        {selectedMember ? (
          <>
            <div className="w-5 h-5 rounded-full flex items-center justify-center shrink-0" style={{ backgroundColor: selectedMember.color }}>
              <User className="h-3 w-3 text-white" />
            </div>
            <span className="text-sm font-medium flex-1" style={{ color: "var(--text-strong)" }}>{selectedMember.name}</span>
          </>
        ) : (
          <>
            <div className="w-5 h-5 rounded-full flex items-center justify-center shrink-0" style={{ background: "var(--brand-15)" }}>
              <Users className="h-3 w-3" style={{ color: "var(--brand)" }} />
            </div>
            <span className="text-sm font-medium flex-1" style={{ color: "var(--text-strong)" }}>{t.allFamily}</span>
          </>
        )}
        <ChevronDown className="h-3.5 w-3.5 shrink-0 transition-transform" style={{ color: "var(--text-subtle)", transform: open ? "rotate(180deg)" : "rotate(0deg)" }} />
      </button>

      {open && (
        <div className="absolute left-0 right-0 top-full mt-1 z-50 overflow-hidden"
          style={{ background: "var(--card)", border: "1px solid var(--card-border)", borderRadius: "12px", boxShadow: "var(--shadow-lg)" }}>
          {showAllOption && (
            <button
              onClick={() => { onSelectMember(null); setOpen(false); }}
              className="w-full flex items-center gap-2.5 px-3 py-2.5 text-sm transition-colors text-left"
              style={{ color: !selectedMemberId ? "var(--brand)" : "var(--text-muted-custom)", background: !selectedMemberId ? "var(--brand-10)" : "transparent" }}
              onMouseEnter={e => { if (selectedMemberId) (e.currentTarget as HTMLButtonElement).style.background = "var(--surface)"; }}
              onMouseLeave={e => { if (selectedMemberId) (e.currentTarget as HTMLButtonElement).style.background = "transparent"; }}
            >
              <div className="w-6 h-6 rounded-full flex items-center justify-center shrink-0" style={{ background: "var(--brand-15)" }}>
                <Users className="h-3.5 w-3.5" style={{ color: "var(--brand)" }} />
              </div>
              <span className="font-medium">{t.allFamily}</span>
            </button>
          )}
          {members.map((member) => (
            <button
              key={member.id}
              onClick={() => { onSelectMember(member.id); setOpen(false); }}
              className="w-full flex items-center gap-2.5 px-3 py-2.5 text-sm transition-colors text-left"
              style={{ color: selectedMemberId === member.id ? "var(--brand)" : "var(--text-muted-custom)", background: selectedMemberId === member.id ? "var(--brand-10)" : "transparent" }}
              onMouseEnter={e => { if (selectedMemberId !== member.id) (e.currentTarget as HTMLButtonElement).style.background = "var(--surface)"; }}
              onMouseLeave={e => { if (selectedMemberId !== member.id) (e.currentTarget as HTMLButtonElement).style.background = "transparent"; }}
            >
              <div className="w-6 h-6 rounded-full flex items-center justify-center shrink-0" style={{ backgroundColor: member.color }}>
                <User className="h-3.5 w-3.5 text-white" />
              </div>
              <span className="font-medium">{member.name}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
