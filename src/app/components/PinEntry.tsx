import { useState, useEffect, useRef } from "react";
import { Lock, X } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "./ui/card";
import { Button } from "./ui/button";
import { useLanguage } from "../context/LanguageContext";
import { toast } from "sonner";
import logoImage from "figma:asset/dcd0af41caa7c6f5a83d31ce1f1e04ad05e2a042.png";

interface PinEntryProps {
  memberName: string;
  memberColor: string;
  correctPin: string;
  onSuccess: () => void;
  onCancel: () => void;
}

export function PinEntry({ memberName, memberColor, correctPin, onSuccess, onCancel }: PinEntryProps) {
  const { t } = useLanguage();
  const [pin, setPin] = useState<string[]>(["", "", "", ""]);
  const [error, setError] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    // Auto-focus first input on mount
    inputRefs.current[0]?.focus();
  }, []);

  const handleInputChange = (index: number, value: string) => {
    // Only allow digits
    if (!/^\d*$/.test(value)) return;

    const newPin = [...pin];
    newPin[index] = value.slice(-1); // Only take last character
    setPin(newPin);
    setError(false);

    // Auto-focus next input
    if (value && index < 3) {
      inputRefs.current[index + 1]?.focus();
    }

    // Check PIN when all 4 digits entered
    if (index === 3 && value) {
      const enteredPin = [...newPin.slice(0, 3), value].join("");
      if (enteredPin === correctPin) {
        onSuccess();
      } else {
        setError(true);
        toast.error(t.profileSelector.wrongPin);
        setTimeout(() => {
          setPin(["", "", "", ""]);
          setError(false);
          inputRefs.current[0]?.focus();
        }, 1000);
      }
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !pin[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").trim();
    if (/^\d{4}$/.test(pastedData)) {
      const newPin = pastedData.split("");
      setPin(newPin);
      inputRefs.current[3]?.focus();
      
      // Check PIN
      if (pastedData === correctPin) {
        onSuccess();
      } else {
        setError(true);
        toast.error(t.profileSelector.wrongPin);
        setTimeout(() => {
          setPin(["", "", "", ""]);
          setError(false);
          inputRefs.current[0]?.focus();
        }, 1000);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-blue-50 to-teal-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-white/80 backdrop-blur-xl border-cyan-200/50 shadow-2xl">
        <CardHeader className="text-center space-y-3">
          <div className="flex justify-center mb-2">
            <img src={logoImage} alt="FIN-NEST" className="h-16 w-16" />
          </div>
          <div className="flex items-center justify-center gap-3">
            <div
              className="w-14 h-14 rounded-full flex items-center justify-center text-white font-semibold shadow-md text-xl"
              style={{ backgroundColor: memberColor }}
            >
              {memberName.charAt(0).toUpperCase()}
            </div>
          </div>
          <CardTitle className="text-2xl font-bold bg-gradient-to-r from-cyan-600 via-blue-600 to-teal-600 bg-clip-text text-transparent">
            {t.profileSelector.enterPinFor}
          </CardTitle>
          <CardDescription className="text-gray-600 text-lg font-medium">
            {memberName}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex justify-center gap-3">
            {pin.map((digit, index) => (
              <input
                key={index}
                ref={(el) => (inputRefs.current[index] = el)}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleInputChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                onPaste={handlePaste}
                className={`w-14 h-14 text-center text-2xl font-bold rounded-xl border-2 transition-all duration-200 ${
                  error
                    ? "border-red-500 bg-red-50 text-red-600"
                    : digit
                    ? "border-cyan-500 bg-gradient-to-br from-cyan-50 to-blue-50 text-cyan-700"
                    : "border-gray-300 bg-white text-gray-800 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-200"
                }`}
                style={{
                  outline: "none",
                }}
              />
            ))}
          </div>

          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <Lock className="h-4 w-4" />
            <span>{t.profileSelector.pinRequired}</span>
          </div>

          <Button
            onClick={onCancel}
            variant="outline"
            className="w-full border-gray-300 hover:bg-gray-50"
          >
            <X className="h-4 w-4 mr-2" />
            {t.auth.backToLogin}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
