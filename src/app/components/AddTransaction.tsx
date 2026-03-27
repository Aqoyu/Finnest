import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { MemberSelector, type FamilyMember } from "./MemberSelector";
import { useLanguage } from "../context/LanguageContext";
import { toast } from "sonner";

interface Transaction {
  id: string;
  type: "income" | "expense";
  amount: number;
  category: string;
  description: string;
  date: string;
  memberId: string;
}

interface AddTransactionProps {
  onAddTransaction: (transaction: Transaction) => void;
  members: FamilyMember[];
  activeUserId: string;
}

// Keys stored in localStorage (always Russian — stable across language switches)
const INCOME_CATEGORY_KEYS = ["Зарплата", "Фриланс", "Инвестиции", "Подарок", "Другой доход"];
const EXPENSE_CATEGORY_KEYS = [
  "Продукты", "Транспорт", "Коммунальные услуги", "Развлечения",
  "Здоровье", "Образование", "Покупки", "Рестораны", "Другие расходы",
];

export function AddTransaction({ onAddTransaction, members, activeUserId }: AddTransactionProps) {
  const { t, translateCategory } = useLanguage();

  const [type, setType] = useState<"income" | "expense">("expense");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");

  const activeUser = members.find((m) => m.id === activeUserId);
  const categoryKeys = type === "income" ? INCOME_CATEGORY_KEYS : EXPENSE_CATEGORY_KEYS;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!amount || !category || !description) {
      toast.error(t.addTransaction.fillAllFields);
      return;
    }
    const amountNum = parseFloat(amount);
    if (isNaN(amountNum) || amountNum <= 0) {
      toast.error(t.addTransaction.invalidAmount);
      return;
    }

    const transaction: Transaction = {
      id: Date.now().toString(),
      type,
      amount: amountNum,
      category, // store as Russian key
      description,
      date: new Date().toISOString(),
      memberId: activeUserId,
    };

    onAddTransaction(transaction);
    setAmount("");
    setCategory("");
    setDescription("");
    toast.success(type === "income" ? t.addTransaction.incomeAdded : t.addTransaction.expenseAdded);
  };

  if (members.length === 0) {
    return (
      <div>
        <Card className="bg-white/70 backdrop-blur-lg border-cyan-200/50 shadow-md">
          <CardContent className="pt-6">
            <div className="text-center text-muted-foreground py-8">
              <Plus className="h-12 w-12 mx-auto mb-4 opacity-50 text-cyan-500" />
              <p className="text-gray-700">{t.addTransaction.noMembersTitle}</p>
              <p className="text-sm mt-2">{t.addTransaction.noMembersHint}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div>
      <Card className="bg-white/70 backdrop-blur-lg border-cyan-200/50 shadow-md">
        <CardHeader>
          <CardTitle className="text-cyan-700">{t.addTransaction.title}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Current User Display */}
            {activeUser && (
              <div className="space-y-2">
                <Label>{t.addTransaction.familyMember}</Label>
                <div className="flex items-center gap-3 p-3 rounded-xl border-2 border-cyan-200 bg-gradient-to-r from-cyan-50 to-blue-50">
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold shadow-md"
                    style={{ backgroundColor: activeUser.color }}
                  >
                    {activeUser.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800">{activeUser.name}</p>
                    <p className="text-xs text-muted-foreground">{t.profileSelector.currentProfile}</p>
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label>{t.addTransaction.type}</Label>
              <div className="grid grid-cols-2 gap-2">
                <Button
                  type="button"
                  variant={type === "expense" ? "default" : "outline"}
                  onClick={() => { setType("expense"); setCategory(""); }}
                  className={`w-full transition-colors duration-200 ${
                    type === "expense"
                      ? "bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 shadow-md"
                      : "border-gray-300 hover:border-red-400 hover:text-red-600 hover:bg-red-50"
                  }`}
                >
                  {t.addTransaction.expense}
                </Button>
                <Button
                  type="button"
                  variant={type === "income" ? "default" : "outline"}
                  onClick={() => { setType("income"); setCategory(""); }}
                  className={`w-full transition-colors duration-200 ${
                    type === "income"
                      ? "bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 shadow-md"
                      : "border-gray-300 hover:border-green-400 hover:text-green-600 hover:bg-green-50"
                  }`}
                >
                  {t.addTransaction.income}
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="amount">{t.addTransaction.amount}</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">₸</span>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="pl-7 bg-white"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">{t.addTransaction.category}</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger className="bg-white">
                  <SelectValue placeholder={t.addTransaction.selectCategory} />
                </SelectTrigger>
                <SelectContent>
                  {categoryKeys.map((key) => (
                    <SelectItem key={key} value={key}>
                      {translateCategory(key)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">{t.addTransaction.description}</Label>
              <Input
                id="description"
                placeholder={t.addTransaction.descriptionPlaceholder}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="bg-white"
              />
            </div>

            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-cyan-500 via-blue-500 to-teal-500 hover:from-cyan-600 hover:via-blue-600 hover:to-teal-600 shadow-md"
            >
              <Plus className="mr-2 h-4 w-4" />
              {t.addTransaction.addButton}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}