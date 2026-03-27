import { useState } from "react";
import { Users, Plus, Edit2, Trash2, User, Lock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "./ui/dialog";
import { Avatar, AvatarFallback } from "./ui/avatar";
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
  "#0891b2", "#06b6d4", "#22d3ee", "#10b981",
  "#3b82f6", "#6366f1", "#8b5cf6", "#ec4899",
  "#f59e0b", "#ef4444", "#14b8a6", "#84cc16",
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

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-bold bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent">
          {t.familyManagement.title}
        </h2>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button
              onClick={() => { setEditingMember(null); setMemberName(""); setSelectedColor(COLORS[0]); setMemberPin(""); }}
              className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 shadow-md"
            >
              <Plus className="mr-2 h-4 w-4" />
              {t.familyManagement.add}
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-white/95 backdrop-blur-xl">
            <DialogHeader>
              <DialogTitle className="text-cyan-700">
                {editingMember ? t.familyManagement.editMember : t.familyManagement.addMember}
              </DialogTitle>
              <DialogDescription>
                {editingMember ? t.familyManagement.editMemberDesc : t.familyManagement.addMemberDesc}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="member-name">{t.familyManagement.name}</Label>
                <Input
                  id="member-name"
                  placeholder={t.familyManagement.namePlaceholder}
                  value={memberName}
                  onChange={(e) => setMemberName(e.target.value)}
                  className="bg-white"
                />
              </div>

              <div className="space-y-2">
                <Label>{t.familyManagement.color}</Label>
                <div className="grid grid-cols-6 gap-2">
                  {COLORS.map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setSelectedColor(color)}
                      className={`h-10 w-10 rounded-full transition-all shadow-sm ${
                        selectedColor === color ? "ring-2 ring-offset-2 ring-cyan-500 scale-110" : ""
                      }`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="member-pin">{t.familyManagement.pin}</Label>
                <Input
                  id="member-pin"
                  type="text"
                  inputMode="numeric"
                  maxLength={4}
                  placeholder={t.familyManagement.pinPlaceholder}
                  value={memberPin}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, ""); // Only digits
                    setMemberPin(value);
                  }}
                  className="bg-white"
                />
                <p className="text-xs text-muted-foreground">{t.familyManagement.pinOptional}</p>
              </div>

              <Button
                onClick={handleSaveMember}
                className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600"
              >
                {editingMember ? t.familyManagement.update : t.familyManagement.add}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {members.length === 0 ? (
        <Card className="bg-white/70 backdrop-blur-lg border-cyan-200/50 shadow-md">
          <CardContent className="pt-6">
            <div className="text-center text-muted-foreground py-8">
              <Users className="h-12 w-12 mx-auto mb-4 opacity-50 text-cyan-500" />
              <p className="text-gray-700">{t.familyManagement.noMembers}</p>
              <p className="text-sm mt-2">{t.familyManagement.noMembersHint}</p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-3">
          {members.map((member) => (
            <Card key={member.id} className="bg-white/70 backdrop-blur-lg border-cyan-200/50 shadow-md hover:shadow-lg transition-shadow">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar className="ring-2 ring-white shadow-md">
                      <AvatarFallback style={{ backgroundColor: member.color }}>
                        <User className="h-5 w-5 text-white" />
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-gray-800">{member.name}</p>
                        {member.pin && (
                          <Lock className="h-3.5 w-3.5 text-cyan-600" />
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="ghost" size="icon" onClick={() => handleEditMember(member)} className="hover:bg-cyan-50">
                      <Edit2 className="h-4 w-4 text-cyan-600" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDeleteMember(member.id)} className="hover:bg-red-50">
                      <Trash2 className="h-4 w-4 text-red-600" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}