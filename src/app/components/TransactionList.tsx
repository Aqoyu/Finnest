import { useState } from "react";
import { Trash2, Filter, TrendingUp, TrendingDown, User } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { format } from "date-fns";
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

interface FamilyMember {
  id: string;
  name: string;
  color: string;
}

interface TransactionListProps {
  transactions: Transaction[];
  members: FamilyMember[];
  onDeleteTransaction: (id: string) => void;
  selectedMemberId: string | null;
}

export function TransactionList({ transactions, members, onDeleteTransaction, selectedMemberId }: TransactionListProps) {
  const { t, translateCategory } = useLanguage();
  const [filterType, setFilterType] = useState<"all" | "income" | "expense">("all");
  const [sortBy, setSortBy] = useState<"date" | "amount">("date");

  const filteredTransactions = transactions
    .filter((tx) => {
      if (selectedMemberId && tx.memberId !== selectedMemberId) return false;
      if (filterType === "all") return true;
      return tx.type === filterType;
    })
    .sort((a, b) => {
      if (sortBy === "date") return new Date(b.date).getTime() - new Date(a.date).getTime();
      return b.amount - a.amount;
    });

  const handleDelete = (id: string) => {
    onDeleteTransaction(id);
    toast.success(t.transactionList.deleted);
  };

  const getMemberById = (id: string) => members.find((m) => m.id === id);

  return (
    <div className="space-y-4">
      <Card className="bg-white/70 backdrop-blur-lg border-cyan-200/50 shadow-md">
        <CardHeader>
          <CardTitle className="text-cyan-700">{t.transactionList.filters}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">{t.transactionList.type}</label>
              <Select value={filterType} onValueChange={(value: any) => setFilterType(value)}>
                <SelectTrigger className="bg-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t.transactionList.all}</SelectItem>
                  <SelectItem value="income">{t.transactionList.incomes}</SelectItem>
                  <SelectItem value="expense">{t.transactionList.expenses}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">{t.transactionList.sort}</label>
              <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
                <SelectTrigger className="bg-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="date">{t.transactionList.date}</SelectItem>
                  <SelectItem value="amount">{t.transactionList.amount}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {filteredTransactions.length === 0 ? (
        <Card className="bg-white/70 backdrop-blur-lg border-cyan-200/50 shadow-md">
          <CardContent className="pt-6">
            <div className="text-center text-muted-foreground py-8">
              <Filter className="h-12 w-12 mx-auto mb-4 opacity-50 text-cyan-500" />
              <p className="text-gray-700">{t.transactionList.notFound}</p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {filteredTransactions.map((transaction) => {
            const member = getMemberById(transaction.memberId);
            return (
              <Card key={transaction.id} className="bg-white/70 backdrop-blur-lg border-cyan-200/50 shadow-md hover:shadow-lg transition-shadow">
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3 flex-1">
                      <div className={`p-2 rounded-full shadow-sm ${
                        transaction.type === "income"
                          ? "bg-gradient-to-br from-green-100 to-green-200 text-green-700"
                          : "bg-gradient-to-br from-red-100 to-red-200 text-red-700"
                      }`}>
                        {transaction.type === "income" ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <p className="font-medium truncate text-gray-800">{transaction.description}</p>
                          <p className={`font-bold whitespace-nowrap ${transaction.type === "income" ? "text-green-600" : "text-red-600"}`}>
                            {transaction.type === "income" ? "+" : "-"}₸{transaction.amount.toFixed(2)}
                          </p>
                        </div>
                        <p className="text-sm text-muted-foreground">{translateCategory(transaction.category)}</p>
                        {member && (
                          <div className="flex items-center gap-2 mt-2">
                            <Avatar className="h-5 w-5 ring-1 ring-white shadow-sm">
                              <AvatarFallback style={{ backgroundColor: member.color }}>
                                <User className="h-3 w-3 text-white" />
                              </AvatarFallback>
                            </Avatar>
                            <span className="text-xs text-muted-foreground">{member.name}</span>
                          </div>
                        )}
                        <p className="text-xs text-muted-foreground mt-1">
                          {format(new Date(transaction.date), t.dateAtFormat)}
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(transaction.id)}
                      className="ml-2 flex-shrink-0 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4 text-red-600" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}