import { Wallet, TrendingUp, TrendingDown, DollarSign, User } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { FinancialChart } from "./FinancialChart";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { useLanguage } from "../context/LanguageContext";

interface Transaction {
  id: string;
  type: "income" | "expense";
  amount: number;
  category: string;
  description: string;
  date: string;
  memberId: string;
}

interface FamilyMember {
  id: string;
  name: string;
  color: string;
}

interface DashboardProps {
  transactions: Transaction[];
  members: FamilyMember[];
  selectedMemberId: string | null;
}

export function Dashboard({ transactions, members, selectedMemberId }: DashboardProps) {
  const { t, translateCategory } = useLanguage();

  const filteredTransactions = selectedMemberId
    ? transactions.filter((t) => t.memberId === selectedMemberId)
    : transactions;

  const totalIncome = filteredTransactions
    .filter((t) => t.type === "income")
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpenses = filteredTransactions
    .filter((t) => t.type === "expense")
    .reduce((sum, t) => sum + t.amount, 0);

  const balance = totalIncome - totalExpenses;

  const expensesByCategory = filteredTransactions
    .filter((t) => t.type === "expense")
    .reduce((acc, t) => {
      acc[t.category] = (acc[t.category] || 0) + t.amount;
      return acc;
    }, {} as Record<string, number>);

  const categoryData = Object.entries(expensesByCategory)
    .reduce((acc, [ruName, value]) => {
      const displayName = translateCategory(ruName);
      const existing = acc.find((item) => item.name === displayName);
      if (existing) {
        existing.value += value;
      } else {
        acc.push({ name: displayName, value });
      }
      return acc;
    }, [] as { name: string; value: number }[])
    .sort((a, b) => b.value - a.value)
    .slice(0, 5);

  const incomesByCategory = filteredTransactions
    .filter((t) => t.type === "income")
    .reduce((acc, t) => {
      acc[t.category] = (acc[t.category] || 0) + t.amount;
      return acc;
    }, {} as Record<string, number>);

  const incomeCategoryData = Object.entries(incomesByCategory)
    .reduce((acc, [ruName, value]) => {
      const displayName = translateCategory(ruName);
      const existing = acc.find((item) => item.name === displayName);
      if (existing) {
        existing.value += value;
      } else {
        acc.push({ name: displayName, value });
      }
      return acc;
    }, [] as { name: string; value: number }[])
    .sort((a, b) => b.value - a.value)
    .slice(0, 5);

  const memberStats = members.map((member) => {
    const memberTransactions = transactions.filter((t) => t.memberId === member.id);
    const income = memberTransactions.filter((t) => t.type === "income").reduce((sum, t) => sum + t.amount, 0);
    const expenses = memberTransactions.filter((t) => t.type === "expense").reduce((sum, t) => sum + t.amount, 0);
    return { member, income, expenses, balance: income - expenses };
  });

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-4">
        <Card className="bg-gradient-to-br from-cyan-500 via-blue-500 to-teal-500 border-none shadow-xl overflow-hidden relative">
          <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent pointer-events-none" />
          <CardHeader className="flex flex-row items-center justify-between pb-2 relative z-10">
            <CardTitle className="text-sm font-medium text-white/90">
              {selectedMemberId ? t.dashboard.balance : t.dashboard.totalBalance}
            </CardTitle>
            <div className="p-2 bg-white/20 backdrop-blur-sm rounded-full">
              <Wallet className="h-4 w-4 text-white" />
            </div>
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="text-2xl font-bold text-white truncate">
              ₸{Math.abs(balance).toFixed(2)}
            </div>
            <p className="text-xs text-white/80 mt-1">
              {balance >= 0 ? t.dashboard.positiveBalance : t.dashboard.negativeBalance}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Card className="bg-white/70 backdrop-blur-lg border-green-200/50 shadow-md hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-1 pt-3 px-3">
            <CardTitle className="text-xs font-medium">{t.dashboard.income}</CardTitle>
            <div className="p-1.5 bg-green-100 rounded-full">
              <TrendingUp className="h-3.5 w-3.5 text-green-600" />
            </div>
          </CardHeader>
          <CardContent className="px-3 pb-3">
            <div className="text-lg font-bold text-green-600 truncate">₸{totalIncome.toFixed(2)}</div>
            <p className="text-[10px] text-muted-foreground mt-0.5">
              {filteredTransactions.filter((t) => t.type === "income").length} {t.dashboard.transactionShort}
            </p>
          </CardContent>
        </Card>

        <Card className="bg-white/70 backdrop-blur-lg border-red-200/50 shadow-md hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-1 pt-3 px-3">
            <CardTitle className="text-xs font-medium">{t.dashboard.expenses}</CardTitle>
            <div className="p-1.5 bg-red-100 rounded-full">
              <TrendingDown className="h-3.5 w-3.5 text-red-600" />
            </div>
          </CardHeader>
          <CardContent className="px-3 pb-3">
            <div className="text-lg font-bold text-red-600 truncate">₸{totalExpenses.toFixed(2)}</div>
            <p className="text-[10px] text-muted-foreground mt-0.5">
              {filteredTransactions.filter((t) => t.type === "expense").length} {t.dashboard.transactionShort}
            </p>
          </CardContent>
        </Card>
      </div>

      {!selectedMemberId && memberStats.length > 0 && (
        <Card className="bg-white/70 backdrop-blur-lg border-cyan-200/50 shadow-md">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-cyan-700">{t.dashboard.byFamilyMembers}</CardTitle>
          </CardHeader>
          <CardContent className="px-3 pb-3">
            <div className="space-y-2">
              {memberStats.map(({ member, income, expenses, balance }) => (
                <div key={member.id} className="flex items-center gap-2 p-2 bg-gradient-to-r from-cyan-50/80 to-blue-50/80 rounded-xl border border-cyan-200/30">
                  <Avatar className="ring-2 ring-white shadow-md h-7 w-7 flex-shrink-0">
                    <AvatarFallback style={{ backgroundColor: member.color }}>
                      <User className="h-3 w-3 text-white" />
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-800 text-xs truncate">{member.name}</p>
                    <div className="flex gap-1 text-[10px]">
                      <span className="text-green-600 font-medium">+₸{income.toFixed(0)}</span>
                      <span className="text-gray-400">/</span>
                      <span className="text-red-600 font-medium">-₸{expenses.toFixed(0)}</span>
                    </div>
                  </div>
                  <div className={`font-bold text-xs flex-shrink-0 ${balance >= 0 ? "text-green-600" : "text-red-600"}`}>
                    ₸{Math.abs(balance).toFixed(0)}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {categoryData.length > 0 && (
        <Card className="bg-white/70 backdrop-blur-lg border-cyan-200/50 shadow-md">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-cyan-700">{t.dashboard.expenseCategories}</CardTitle>
          </CardHeader>
          <CardContent className="px-2 pb-3">
            <FinancialChart data={categoryData} />
          </CardContent>
        </Card>
      )}

      {incomeCategoryData.length > 0 && (
        <Card className="bg-white/70 backdrop-blur-lg border-cyan-200/50 shadow-md">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-cyan-700">{t.dashboard.incomeCategories}</CardTitle>
          </CardHeader>
          <CardContent className="px-2 pb-3">
            <FinancialChart data={incomeCategoryData} />
          </CardContent>
        </Card>
      )}

      {filteredTransactions.length === 0 && (
        <Card className="bg-white/70 backdrop-blur-lg border-cyan-200/50 shadow-md">
          <CardContent className="pt-4">
            <div className="text-center text-muted-foreground py-6">
              <DollarSign className="h-10 w-10 mx-auto mb-3 opacity-50 text-cyan-500" />
              <p className="text-sm text-gray-700">{t.dashboard.noTransactions}</p>
              <p className="text-xs mt-1">{t.dashboard.noTransactionsHint}</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}