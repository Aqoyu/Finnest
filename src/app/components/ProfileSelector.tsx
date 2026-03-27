import { useState } from "react";
import { UserCircle2, Check, Lock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "./ui/card";
import { Button } from "./ui/button";
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

  const handlePinSuccess = () => {
    if (selectedId) {
      onSelectProfile(selectedId);
    }
  };

  const handlePinCancel = () => {
    setShowPinEntry(false);
    setSelectedId(null);
  };

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
      <Card className="w-full max-w-md bg-white/80 backdrop-blur-xl border-cyan-200/50 shadow-2xl relative z-10">
        <CardHeader className="text-center space-y-3">
          <div className="flex justify-center mb-2">
            <img src={logoImage} alt="FIN-NEST" className="h-16 w-16" />
          </div>
          <CardTitle className="text-2xl font-bold bg-gradient-to-r from-cyan-600 via-blue-600 to-teal-600 bg-clip-text text-transparent">
            {t.profileSelector.title}
          </CardTitle>
          <CardDescription className="text-gray-600">
            {t.profileSelector.subtitle}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-3">
            {members.map((member) => (
              <button
                key={member.id}
                onClick={() => setSelectedId(member.id)}
                className={`relative flex items-center gap-4 p-4 rounded-xl border-2 transition-all duration-200 ${
                  selectedId === member.id
                    ? "border-cyan-500 bg-gradient-to-r from-cyan-50 to-blue-50 shadow-md"
                    : "border-gray-200 bg-white hover:border-cyan-300 hover:shadow-sm"
                }`}
              >
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center text-white font-semibold shadow-md"
                  style={{ backgroundColor: member.color }}
                >
                  {member.name.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 text-left">
                  <p className="font-semibold text-gray-800">{member.name}</p>
                </div>
                {selectedId === member.id && (
                  <div className="w-6 h-6 rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 flex items-center justify-center">
                    <Check className="h-4 w-4 text-white" />
                  </div>
                )}
                {member.pin && (
                  <div className="absolute top-2 right-2">
                    <Lock className="h-4 w-4 text-gray-400" />
                  </div>
                )}
              </button>
            ))}
          </div>

          <Button
            onClick={handleContinue}
            disabled={!selectedId}
            className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
          >
            {t.profileSelector.continue}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}