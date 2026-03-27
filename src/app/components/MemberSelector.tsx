import { User, Users } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Avatar, AvatarFallback } from "./ui/avatar";
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

export function MemberSelector({
  members,
  selectedMemberId,
  onSelectMember,
  showAllOption = true,
}: MemberSelectorProps) {
  const { t } = useLanguage();
  const selectedMember = members.find((m) => m.id === selectedMemberId);

  return (
    <Select
      value={selectedMemberId || "all"}
      onValueChange={(value) => onSelectMember(value === "all" ? null : value)}
    >
      <SelectTrigger className="w-full bg-white/90 backdrop-blur-sm border-cyan-200/50 hover:border-cyan-300 transition-colors">
        <div className="flex items-center gap-2">
          {selectedMember ? (
            <>
              <Avatar className="h-6 w-6 ring-1 ring-white shadow-sm">
                <AvatarFallback style={{ backgroundColor: selectedMember.color }}>
                  <User className="h-3 w-3 text-white" />
                </AvatarFallback>
              </Avatar>
              <span className="font-medium text-gray-800">{selectedMember.name}</span>
            </>
          ) : (
            <>
              <div className="p-1 bg-gradient-to-br from-cyan-100 to-blue-100 rounded-full">
                <Users className="h-4 w-4 text-cyan-600" />
              </div>
              <span className="font-medium text-gray-800">{t.allFamily}</span>
            </>
          )}
        </div>
      </SelectTrigger>
      <SelectContent className="bg-white/95 backdrop-blur-xl">
        {showAllOption && (
          <SelectItem value="all" className="hover:bg-cyan-50">
            <div className="flex items-center gap-2">
              <div className="p-1 bg-gradient-to-br from-cyan-100 to-blue-100 rounded-full">
                <Users className="h-4 w-4 text-cyan-600" />
              </div>
              <span>{t.allFamily}</span>
            </div>
          </SelectItem>
        )}
        {members.map((member) => (
          <SelectItem key={member.id} value={member.id} className="hover:bg-cyan-50">
            <div className="flex items-center gap-2">
              <Avatar className="h-6 w-6 ring-1 ring-white shadow-sm">
                <AvatarFallback style={{ backgroundColor: member.color }}>
                  <User className="h-3 w-3 text-white" />
                </AvatarFallback>
              </Avatar>
              <span>{member.name}</span>
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
