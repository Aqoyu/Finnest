import { useState } from "react";
import { Users, Plus, Edit2, Trash2, Lock } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "./ui/dialog";
import { useLanguage } from "../context/LanguageContext";
import { toast } from "sonner";

export interface FamilyMember {
  id: string;
  name: string;
  color: string;
  pin?: string;
}

interface FamilyMemberManagementProps {
  members: FamilyMember[];
  onUpdateMembers: (members: FamilyMember[]) => void;
}

const COLORS = [
  "#8B5CF6", "#7C3AED", "#6D28D9", "#A78BFA",
  "#3B82F6", "#6366F1", "#EC4899", "#10B981",
  "#F59E0B", "#EF4444", "#06B6D4", "#14B8A6",
];

export function FamilyMemberManagement({ members, onUpdateMembers }: FamilyMemberManagementProps) {
  const { t } = useLanguage();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [memberName, setMemberName] = useState("");
  const [selectedColor, setSelectedColor] = useState(COLORS[0]);
  const [memberPin, setMemberPin] = useState("");
  const [editingMember, setEditingMember] = useState<FamilyMember | null>(null);

  const handleSaveMember = () => {
    if (!memberName.trim()) {
      toast.error(t.familyManagement.enterName);
      return;
    }

    // Validate PIN if provided
    if (memberPin && !/^\d{4}$/.test(memberPin)) {
      toast.error(t.familyManagement.pinInvalid);
      return;
    }

    if (editingMember) {
      const updatedMembers = members.map((m) =>
        m.id === editingMember.id
          ? { ...m, name: memberName.trim(), color: selectedColor, pin: memberPin || undefined }
          : m
      );
      onUpdateMembers(updatedMembers);
      toast.success(t.familyManagement.memberUpdated);
    } else {
      const newMember: FamilyMember = {
        id: Date.now().toString(),
        name: memberName.trim(),
        color: selectedColor,
        pin: memberPin || undefined,
      };
      onUpdateMembers([...members, newMember]);
      toast.success(t.familyManagement.memberAdded);
    }

    setIsDialogOpen(false);
    setMemberName("");
    setSelectedColor(COLORS[0]);
    setMemberPin("");
    setEditingMember(null);
  };

  const handleEditMember = (member: FamilyMember) => {
    setEditingMember(member);
    setMemberName(member.name);
    setSelectedColor(member.color);
    setMemberPin(member.pin || "");
    setIsDialogOpen(true);
  };

  const handleDeleteMember = (id: string) => {
    if (members.length <= 1) {
      toast.error(t.familyManagement.atLeastOne);
      return;
    }
    onUpdateMembers(members.filter((m) => m.id !== id));
    toast.success(t.familyManagement.memberDeleted);
  };

  const inp: React.CSSProperties = {
    background: "var(--input-bg)", border: "1px solid var(--input-border)",
    color: "var(--text-strong)", borderRadius: "10px",
    width: "100%", padding: "10px 12px", fontSize: "14px", outline: "none",
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-base font-bold" style={{ color: "var(--text-strong)", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
          {t.familyManagement.title}
        </h2>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <button
              onClick={() => { setEditingMember(null); setMemberName(""); setSelectedColor(COLORS[0]); setMemberPin(""); }}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all"
              style={{ background: "var(--brand)", color: "#fff" }}
            >
              <Plus className="h-4 w-4" />
              {t.familyManagement.add}
            </button>
          </DialogTrigger>
          <DialogContent style={{ background: "var(--card)", border: "1px solid var(--card-border)" }}>
            <DialogHeader>
              <DialogTitle style={{ color: "var(--text-strong)" }}>
                {editingMember ? t.familyManagement.editMember : t.familyManagement.addMember}
              </DialogTitle>
              <DialogDescription style={{ color: "var(--text-subtle)" }}>
                {editingMember ? t.familyManagement.editMemberDesc : t.familyManagement.addMemberDesc}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-2">
              <div className="space-y-1.5">
                <label className="text-xs font-medium" style={{ color: "var(--text-subtle)" }}>{t.familyManagement.name}</label>
                <input style={inp} placeholder={t.familyManagement.namePlaceholder} value={memberName} onChange={e => setMemberName(e.target.value)} />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium" style={{ color: "var(--text-subtle)" }}>{t.familyManagement.color}</label>
                <div className="grid grid-cols-6 gap-2">
                  {COLORS.map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setSelectedColor(color)}
                      className="h-9 w-9 rounded-full transition-all"
                      style={{
                        backgroundColor: color,
                        outline: selectedColor === color ? `3px solid ${color}` : "none",
                        outlineOffset: "2px",
                        transform: selectedColor === color ? "scale(1.15)" : "scale(1)",
                      }}
                    />
                  ))}
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium" style={{ color: "var(--text-subtle)" }}>{t.familyManagement.pin}</label>
                <input
                  style={inp}
                  type="text"
                  inputMode="numeric"
                  maxLength={4}
                  placeholder={t.familyManagement.pinPlaceholder}
                  value={memberPin}
                  onChange={e => setMemberPin(e.target.value.replace(/\D/g, ""))}
                />
                <p className="text-xs" style={{ color: "var(--text-dim)" }}>{t.familyManagement.pinOptional}</p>
              </div>

              <button
                onClick={handleSaveMember}
                className="w-full py-3 rounded-xl text-sm font-semibold transition-all"
                style={{ background: "var(--brand)", color: "#fff" }}
              >
                {editingMember ? t.familyManagement.update : t.familyManagement.add}
              </button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Empty state */}
      {members.length === 0 ? (
        <div className="flex flex-col items-center py-12 rounded-2xl" style={{ background: "var(--card)", border: "1px solid var(--card-border)" }}>
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-3" style={{ background: "var(--brand-10)" }}>
            <Users className="h-6 w-6" style={{ color: "var(--brand)" }} />
          </div>
          <p className="text-sm font-medium" style={{ color: "var(--text-strong)" }}>{t.familyManagement.noMembers}</p>
          <p className="text-xs mt-1" style={{ color: "var(--text-subtle)" }}>{t.familyManagement.noMembersHint}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {members.map((member) => (
            <div key={member.id} className="flex items-center justify-between p-4 rounded-2xl" style={{ background: "var(--card)", border: "1px solid var(--card-border)" }}>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold shrink-0" style={{ backgroundColor: member.color }}>
                  {member.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-sm" style={{ color: "var(--text-strong)" }}>{member.name}</p>
                    {member.pin && <Lock className="h-3 w-3" style={{ color: "var(--brand)" }} />}
                  </div>
                </div>
              </div>
              <div className="flex gap-1">
                <button
                  onClick={() => handleEditMember(member)}
                  className="w-8 h-8 rounded-xl flex items-center justify-center transition-all"
                  style={{ color: "var(--text-subtle)" }}
                  onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.color = "var(--brand)"; (e.currentTarget as HTMLButtonElement).style.background = "var(--brand-10)"; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.color = "var(--text-subtle)"; (e.currentTarget as HTMLButtonElement).style.background = "transparent"; }}
                >
                  <Edit2 className="h-3.5 w-3.5" />
                </button>
                <button
                  onClick={() => handleDeleteMember(member.id)}
                  className="w-8 h-8 rounded-xl flex items-center justify-center transition-all"
                  style={{ color: "var(--text-subtle)" }}
                  onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.color = "#EF4444"; (e.currentTarget as HTMLButtonElement).style.background = "rgba(239,68,68,0.08)"; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.color = "var(--text-subtle)"; (e.currentTarget as HTMLButtonElement).style.background = "transparent"; }}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}