import { useState } from "react";
import { DollarSign, Plus, Edit2, Trash2, CreditCard, Wallet, TrendingDown } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Progress } from "./ui/progress";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "./ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { useLanguage } from "../context/LanguageContext";
import { toast } from "sonner";
import type { Bank, Loan } from "../pages/MainApp";

interface Transaction {
  id: string;
  type: "income" | "expense";
  amount: number;
  category: string;
  description: string;
  date: string;
  memberId: string;
}

interface Budget {
  category: string;
  limit: number;
}

interface FamilyMember {
  id: string;
  name: string;
  color: string;
}

interface BudgetManagementProps {
  transactions: Transaction[];
  budgets: Budget[];
  onUpdateBudgets: (budgets: Budget[]) => void;
  banks: Bank[];
  onUpdateBanks: (banks: Bank[]) => void;
  members: FamilyMember[];
  selectedMemberId: string | null;
}

// Russian keys — stored in localStorage
const EXPENSE_CATEGORY_KEYS = [
  "Продукты", "Транспорт", "Коммунальные услуги", "Развлечения",
  "Здоровье", "Образование", "Покупки", "Рестораны", "Другие расходы",
];

export function BudgetManagement({ 
  transactions, 
  budgets, 
  onUpdateBudgets, 
  banks, 
  onUpdateBanks, 
  members,
  selectedMemberId 
}: BudgetManagementProps) {
  const { t, translateCategory } = useLanguage();
  
  // Budget state
  const [isBudgetDialogOpen, setIsBudgetDialogOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [budgetLimit, setBudgetLimit] = useState("");
  const [editingBudget, setEditingBudget] = useState<Budget | null>(null);

  // Bank state
  const [isBankDialogOpen, setIsBankDialogOpen] = useState(false);
  const [bankName, setBankName] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [cardBalance, setCardBalance] = useState("");
  const [selectedBankMemberId, setSelectedBankMemberId] = useState<string>(members[0]?.id || "");
  const [editingBank, setEditingBank] = useState<Bank | null>(null);

  // Loan state
  const [isLoanDialogOpen, setIsLoanDialogOpen] = useState(false);
  const [loanBankId, setLoanBankId] = useState("");
  const [loanType, setLoanType] = useState<"credit" | "installment">("credit");
  const [loanDescription, setLoanDescription] = useState("");
  const [loanTotal, setLoanTotal] = useState("");
  const [loanRemaining, setLoanRemaining] = useState("");
  const [loanMonthly, setLoanMonthly] = useState("");
  const [editingLoan, setEditingLoan] = useState<{bank: Bank, loan: Loan} | null>(null);

  const filteredTransactions = selectedMemberId
    ? transactions.filter((t) => t.memberId === selectedMemberId)
    : transactions;

  const expensesByCategory = filteredTransactions
    .filter((t) => t.type === "expense")
    .reduce((acc, t) => {
      acc[t.category] = (acc[t.category] || 0) + t.amount;
      return acc;
    }, {} as Record<string, number>);

  // Budget functions
  const handleSaveBudget = () => {
    if (!selectedCategory || !budgetLimit) {
      toast.error(t.budgetManagement.fillAllFields);
      return;
    }
    const limitNum = parseFloat(budgetLimit);
    if (isNaN(limitNum) || limitNum <= 0) {
      toast.error(t.budgetManagement.invalidLimit);
      return;
    }

    const existingIndex = budgets.findIndex((b) => b.category === selectedCategory);
    let newBudgets: Budget[];

    if (existingIndex !== -1) {
      newBudgets = [...budgets];
      newBudgets[existingIndex] = { category: selectedCategory, limit: limitNum };
      toast.success(t.budgetManagement.budgetUpdated);
    } else {
      newBudgets = [...budgets, { category: selectedCategory, limit: limitNum }];
      toast.success(t.budgetManagement.budgetAdded);
    }

    onUpdateBudgets(newBudgets);
    setIsBudgetDialogOpen(false);
    setSelectedCategory("");
    setBudgetLimit("");
    setEditingBudget(null);
  };

  const handleEditBudget = (budget: Budget) => {
    setEditingBudget(budget);
    setSelectedCategory(budget.category);
    setBudgetLimit(budget.limit.toString());
    setIsBudgetDialogOpen(true);
  };

  const handleDeleteBudget = (category: string) => {
    onUpdateBudgets(budgets.filter((b) => b.category !== category));
    toast.success(t.budgetManagement.budgetDeleted);
  };

  const availableCategories = EXPENSE_CATEGORY_KEYS.filter(
    (cat) => !budgets.some((b) => b.category === cat) || cat === editingBudget?.category
  );

  // Bank functions
  const handleSaveBank = () => {
    if (!bankName || !cardNumber || !cardBalance || !selectedBankMemberId) {
      toast.error(t.budgetManagement.fillAllFields);
      return;
    }
    const balanceNum = parseFloat(cardBalance);
    if (isNaN(balanceNum)) {
      toast.error(t.budgetManagement.invalidLimit);
      return;
    }

    if (editingBank) {
      const updatedBanks = banks.map((b) =>
        b.id === editingBank.id
          ? { ...b, name: bankName, cardNumber, balance: balanceNum, memberId: selectedBankMemberId }
          : b
      );
      onUpdateBanks(updatedBanks);
      toast.success(t.budgetManagement.bankUpdated);
    } else {
      const newBank: Bank = {
        id: Date.now().toString(),
        name: bankName,
        cardNumber,
        balance: balanceNum,
        loans: [],
        memberId: selectedBankMemberId,
      };
      onUpdateBanks([...banks, newBank]);
      toast.success(t.budgetManagement.bankAdded);
    }

    setIsBankDialogOpen(false);
    setBankName("");
    setCardNumber("");
    setCardBalance("");
    setSelectedBankMemberId(members[0]?.id || "");
    setEditingBank(null);
  };

  const handleEditBank = (bank: Bank) => {
    setEditingBank(bank);
    setBankName(bank.name);
    setCardNumber(bank.cardNumber);
    setCardBalance(bank.balance.toString());
    setSelectedBankMemberId(bank.memberId);
    setIsBankDialogOpen(true);
  };

  const handleDeleteBank = (id: string) => {
    onUpdateBanks(banks.filter((b) => b.id !== id));
    toast.success(t.budgetManagement.bankDeleted);
  };

  // Loan functions
  const handleSaveLoan = () => {
    if (!loanBankId || !loanDescription || !loanTotal || !loanRemaining || !loanMonthly) {
      toast.error(t.budgetManagement.fillAllFields);
      return;
    }
    const totalNum = parseFloat(loanTotal);
    const remainingNum = parseFloat(loanRemaining);
    const monthlyNum = parseFloat(loanMonthly);

    if (isNaN(totalNum) || isNaN(remainingNum) || isNaN(monthlyNum)) {
      toast.error(t.budgetManagement.invalidLimit);
      return;
    }

    if (editingLoan) {
      const updatedBanks = banks.map((b) => {
        if (b.id === editingLoan.bank.id) {
          return {
            ...b,
            loans: b.loans.map((l) =>
              l.id === editingLoan.loan.id
                ? {
                    ...l,
                    type: loanType,
                    description: loanDescription,
                    totalAmount: totalNum,
                    remainingAmount: remainingNum,
                    monthlyPayment: monthlyNum,
                  }
                : l
            ),
          };
        }
        return b;
      });
      onUpdateBanks(updatedBanks);
      toast.success(t.budgetManagement.loanUpdated);
    } else {
      const newLoan: Loan = {
        id: Date.now().toString(),
        type: loanType,
        description: loanDescription,
        totalAmount: totalNum,
        remainingAmount: remainingNum,
        monthlyPayment: monthlyNum,
      };
      const updatedBanks = banks.map((b) =>
        b.id === loanBankId ? { ...b, loans: [...b.loans, newLoan] } : b
      );
      onUpdateBanks(updatedBanks);
      toast.success(t.budgetManagement.loanAdded);
    }

    setIsLoanDialogOpen(false);
    setLoanBankId("");
    setLoanType("credit");
    setLoanDescription("");
    setLoanTotal("");
    setLoanRemaining("");
    setLoanMonthly("");
    setEditingLoan(null);
  };

  const handleEditLoan = (bank: Bank, loan: Loan) => {
    setEditingLoan({ bank, loan });
    setLoanBankId(bank.id);
    setLoanType(loan.type);
    setLoanDescription(loan.description);
    setLoanTotal(loan.totalAmount.toString());
    setLoanRemaining(loan.remainingAmount.toString());
    setLoanMonthly(loan.monthlyPayment.toString());
    setIsLoanDialogOpen(true);
  };

  const handleDeleteLoan = (bankId: string, loanId: string) => {
    const updatedBanks = banks.map((b) =>
      b.id === bankId ? { ...b, loans: b.loans.filter((l) => l.id !== loanId) } : b
    );
    onUpdateBanks(updatedBanks);
    toast.success(t.budgetManagement.loanDeleted);
  };

  const filteredBanks = selectedMemberId
    ? banks.filter((b) => b.memberId === selectedMemberId)
    : banks;

  const totalOnCards = filteredBanks.reduce((sum, b) => sum + b.balance, 0);
  const totalLoans = filteredBanks.reduce((sum, b) => 
    sum + b.loans.reduce((loanSum, l) => loanSum + l.remainingAmount, 0), 0
  );

  return (
    <div className="space-y-4">
      {/* Budgets Section */}
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-bold bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent">
          {t.budgetManagement.title}
        </h2>
        <Dialog open={isBudgetDialogOpen} onOpenChange={setIsBudgetDialogOpen}>
          <DialogTrigger asChild>
            <Button
              onClick={() => { setEditingBudget(null); setSelectedCategory(""); setBudgetLimit(""); }}
              className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 shadow-md"
            >
              <Plus className="mr-2 h-4 w-4" />
              {t.budgetManagement.add}
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-white/95 backdrop-blur-xl">
            <DialogHeader>
              <DialogTitle className="text-cyan-700">
                {editingBudget ? t.budgetManagement.editBudget : t.budgetManagement.addBudget}
              </DialogTitle>
              <DialogDescription>
                {editingBudget ? t.budgetManagement.editBudgetDesc : t.budgetManagement.addBudgetDesc}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="budget-category">{t.budgetManagement.category}</Label>
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger className="bg-white">
                    <SelectValue placeholder={t.budgetManagement.selectCategory} />
                  </SelectTrigger>
                  <SelectContent>
                    {availableCategories.map((key) => (
                      <SelectItem key={key} value={key}>
                        {translateCategory(key)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="budget-limit">{t.budgetManagement.monthlyLimit}</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">₸</span>
                  <Input
                    id="budget-limit"
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={budgetLimit}
                    onChange={(e) => setBudgetLimit(e.target.value)}
                    className="pl-7 bg-white"
                  />
                </div>
              </div>

              <Button
                onClick={handleSaveBudget}
                className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600"
              >
                {editingBudget ? t.budgetManagement.update : t.budgetManagement.add}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {budgets.length === 0 ? (
        <Card className="bg-white/70 backdrop-blur-lg border-cyan-200/50 shadow-md">
          <CardContent className="pt-6">
            <div className="text-center text-muted-foreground py-8">
              <DollarSign className="h-12 w-12 mx-auto mb-4 opacity-50 text-cyan-500" />
              <p className="text-gray-700">{t.budgetManagement.noBudgets}</p>
              <p className="text-sm mt-2">{t.budgetManagement.noBudgetsHint}</p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {budgets.map((budget) => {
            const spent = expensesByCategory[budget.category] || 0;
            const percentage = Math.min((spent / budget.limit) * 100, 100);
            const isOverBudget = spent > budget.limit;

            return (
              <Card key={budget.category} className="bg-white/70 backdrop-blur-lg border-cyan-200/50 shadow-md hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base text-cyan-700">{translateCategory(budget.category)}</CardTitle>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="icon" onClick={() => handleEditBudget(budget)} className="hover:bg-cyan-50">
                        <Edit2 className="h-4 w-4 text-cyan-600" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDeleteBudget(budget.category)} className="hover:bg-red-50">
                        <Trash2 className="h-4 w-4 text-red-600" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex justify-between text-sm font-medium">
                    <span className={isOverBudget ? "text-red-600" : "text-gray-800"}>
                      ₸{spent.toFixed(2)} {t.budgetManagement.spent}
                    </span>
                    <span className="text-muted-foreground">
                      {t.budgetManagement.of} ₸{budget.limit.toFixed(2)}
                    </span>
                  </div>
                  <Progress
                    value={percentage}
                    className={isOverBudget
                      ? "[&>div]:bg-gradient-to-r [&>div]:from-red-500 [&>div]:to-red-600"
                      : "[&>div]:bg-gradient-to-r [&>div]:from-cyan-500 [&>div]:to-blue-500"}
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>{percentage.toFixed(0)}{t.budgetManagement.used}</span>
                    {!isOverBudget && (
                      <span className="text-green-600 font-medium">
                        ₸{(budget.limit - spent).toFixed(2)} {t.budgetManagement.remaining}
                      </span>
                    )}
                    {isOverBudget && (
                      <span className="text-red-600 font-medium">
                        ₸{(spent - budget.limit).toFixed(2)} {t.budgetManagement.overBudget}
                      </span>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Banks Section */}
      <div className="flex justify-between items-center mt-6">
        <h2 className="text-lg font-bold bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent">
          {t.budgetManagement.banksTitle}
        </h2>
        <Dialog open={isBankDialogOpen} onOpenChange={setIsBankDialogOpen}>
          <DialogTrigger asChild>
            <Button
              onClick={() => { 
                setEditingBank(null); 
                setBankName(""); 
                setCardNumber(""); 
                setCardBalance(""); 
                setSelectedBankMemberId(members[0]?.id || "");
              }}
              className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 shadow-md"
            >
              <Plus className="mr-2 h-4 w-4" />
              {t.budgetManagement.addBank}
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-white/95 backdrop-blur-xl">
            <DialogHeader>
              <DialogTitle className="text-cyan-700">
                {editingBank ? t.budgetManagement.editBank : t.budgetManagement.addBank}
              </DialogTitle>
              <DialogDescription>
                {editingBank ? t.budgetManagement.editBankDesc : t.budgetManagement.addBankDesc}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="bank-member">{t.addTransaction.familyMember}</Label>
                <Select value={selectedBankMemberId} onValueChange={setSelectedBankMemberId}>
                  <SelectTrigger className="bg-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {members.map((member) => (
                      <SelectItem key={member.id} value={member.id}>
                        {member.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="bank-name">{t.budgetManagement.bankName}</Label>
                <Input
                  id="bank-name"
                  placeholder={t.budgetManagement.bankNamePlaceholder}
                  value={bankName}
                  onChange={(e) => setBankName(e.target.value)}
                  className="bg-white"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="card-number">{t.budgetManagement.cardNumber}</Label>
                <Input
                  id="card-number"
                  placeholder={t.budgetManagement.cardNumberPlaceholder}
                  value={cardNumber}
                  onChange={(e) => setCardNumber(e.target.value)}
                  className="bg-white"
                  maxLength={4}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="card-balance">{t.budgetManagement.cardBalance}</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">₸</span>
                  <Input
                    id="card-balance"
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={cardBalance}
                    onChange={(e) => setCardBalance(e.target.value)}
                    className="pl-7 bg-white"
                  />
                </div>
              </div>

              <Button
                onClick={handleSaveBank}
                className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600"
              >
                {editingBank ? t.budgetManagement.update : t.budgetManagement.add}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Total cards summary */}
      {filteredBanks.length > 0 && (
        <Card className="bg-gradient-to-br from-green-500 via-emerald-500 to-teal-500 border-none shadow-xl">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between text-white">
              <div>
                <p className="text-sm opacity-90">{t.budgetManagement.totalOnCards}</p>
                <p className="text-2xl font-bold">₸{totalOnCards.toFixed(2)}</p>
              </div>
              <Wallet className="h-10 w-10 opacity-80" />
            </div>
            {totalLoans > 0 && (
              <div className="mt-3 pt-3 border-t border-white/20">
                <div className="flex items-center justify-between text-white text-sm">
                  <span className="opacity-90">{t.budgetManagement.loans}</span>
                  <span className="font-semibold">-₸{totalLoans.toFixed(2)}</span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Banks list */}
      {filteredBanks.length === 0 ? (
        <Card className="bg-white/70 backdrop-blur-lg border-cyan-200/50 shadow-md">
          <CardContent className="pt-6">
            <div className="text-center text-muted-foreground py-8">
              <CreditCard className="h-12 w-12 mx-auto mb-4 opacity-50 text-cyan-500" />
              <p className="text-gray-700">{t.budgetManagement.noBanks}</p>
              <p className="text-sm mt-2">{t.budgetManagement.noBanksHint}</p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {filteredBanks.map((bank) => {
            const member = members.find((m) => m.id === bank.memberId);
            const totalDebt = bank.loans.reduce((sum, l) => sum + l.remainingAmount, 0);

            return (
              <Card key={bank.id} className="bg-white/70 backdrop-blur-lg border-cyan-200/50 shadow-md hover:shadow-lg transition-shadow">
                <CardContent className="pt-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <CreditCard className="h-4 w-4 text-cyan-600" />
                        <h3 className="font-semibold text-gray-800">{bank.name}</h3>
                      </div>
                      <p className="text-xs text-muted-foreground">**** {bank.cardNumber}</p>
                      {member && (
                        <p className="text-xs text-muted-foreground mt-1">
                          {member.name}
                        </p>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="icon" onClick={() => handleEditBank(bank)} className="h-8 w-8 hover:bg-cyan-50">
                        <Edit2 className="h-3.5 w-3.5 text-cyan-600" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDeleteBank(bank.id)} className="h-8 w-8 hover:bg-red-50">
                        <Trash2 className="h-3.5 w-3.5 text-red-600" />
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">{t.budgetManagement.cardBalance}</span>
                      <span className="text-lg font-bold text-green-600">₸{bank.balance.toFixed(2)}</span>
                    </div>

                    {totalDebt > 0 && (
                      <div className="flex justify-between items-center text-red-600">
                        <span className="text-sm">{t.budgetManagement.loans}</span>
                        <span className="text-sm font-semibold">-₸{totalDebt.toFixed(2)}</span>
                      </div>
                    )}
                  </div>

                  {/* Loans for this bank */}
                  {bank.loans.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-gray-200">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="text-xs font-semibold text-gray-700">{t.budgetManagement.loans}</h4>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => {
                            setLoanBankId(bank.id);
                            setEditingLoan(null);
                            setLoanType("credit");
                            setLoanDescription("");
                            setLoanTotal("");
                            setLoanRemaining("");
                            setLoanMonthly("");
                            setIsLoanDialogOpen(true);
                          }}
                          className="h-6 px-2 text-xs"
                        >
                          <Plus className="h-3 w-3 mr-1" />
                          {t.budgetManagement.addLoan}
                        </Button>
                      </div>
                      <div className="space-y-2">
                        {bank.loans.map((loan) => (
                          <div key={loan.id} className="bg-gradient-to-r from-red-50 to-orange-50 rounded-lg p-2 border border-red-200/50">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center gap-2">
                                  <TrendingDown className="h-3 w-3 text-red-600" />
                                  <span className="text-xs font-medium text-gray-800">{loan.description}</span>
                                  <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-red-100 text-red-700">
                                    {loan.type === "credit" ? t.budgetManagement.credit : t.budgetManagement.installment}
                                  </span>
                                </div>
                                <div className="mt-1 space-y-0.5 text-[10px] text-muted-foreground">
                                  <p>₸{loan.remainingAmount.toFixed(2)} {t.budgetManagement.debtRemaining}</p>
                                  <p>₸{loan.monthlyPayment.toFixed(2)} {t.budgetManagement.perMonth}</p>
                                </div>
                              </div>
                              <div className="flex gap-1">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleEditLoan(bank, loan)}
                                  className="h-6 w-6 hover:bg-orange-100"
                                >
                                  <Edit2 className="h-3 w-3 text-orange-600" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleDeleteLoan(bank.id, loan.id)}
                                  className="h-6 w-6 hover:bg-red-100"
                                >
                                  <Trash2 className="h-3 w-3 text-red-600" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {bank.loans.length === 0 && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setLoanBankId(bank.id);
                        setEditingLoan(null);
                        setLoanType("credit");
                        setLoanDescription("");
                        setLoanTotal("");
                        setLoanRemaining("");
                        setLoanMonthly("");
                        setIsLoanDialogOpen(true);
                      }}
                      className="w-full mt-3 border-dashed"
                    >
                      <Plus className="h-3.5 w-3.5 mr-2" />
                      {t.budgetManagement.addLoan}
                    </Button>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Loan Dialog */}
      <Dialog open={isLoanDialogOpen} onOpenChange={setIsLoanDialogOpen}>
        <DialogContent className="bg-white/95 backdrop-blur-xl">
          <DialogHeader>
            <DialogTitle className="text-cyan-700">
              {editingLoan ? t.budgetManagement.editLoan : t.budgetManagement.addLoan}
            </DialogTitle>
            <DialogDescription>
              {editingLoan ? t.budgetManagement.editLoanDesc : t.budgetManagement.addLoanDesc}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {!editingLoan && (
              <div className="space-y-2">
                <Label htmlFor="loan-bank">{t.budgetManagement.bankName}</Label>
                <Select value={loanBankId} onValueChange={setLoanBankId}>
                  <SelectTrigger className="bg-white">
                    <SelectValue placeholder={t.budgetManagement.selectCategory} />
                  </SelectTrigger>
                  <SelectContent>
                    {filteredBanks.map((bank) => (
                      <SelectItem key={bank.id} value={bank.id}>
                        {bank.name} (**** {bank.cardNumber})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="loan-type">{t.budgetManagement.loanType}</Label>
              <Select value={loanType} onValueChange={(v: "credit" | "installment") => setLoanType(v)}>
                <SelectTrigger className="bg-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="credit">{t.budgetManagement.credit}</SelectItem>
                  <SelectItem value="installment">{t.budgetManagement.installment}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="loan-description">{t.budgetManagement.loanDescription}</Label>
              <Input
                id="loan-description"
                placeholder={t.budgetManagement.loanDescriptionPlaceholder}
                value={loanDescription}
                onChange={(e) => setLoanDescription(e.target.value)}
                className="bg-white"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="loan-total">{t.budgetManagement.totalAmount}</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">₸</span>
                <Input
                  id="loan-total"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={loanTotal}
                  onChange={(e) => setLoanTotal(e.target.value)}
                  className="pl-7 bg-white"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="loan-remaining">{t.budgetManagement.remainingAmount}</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">₸</span>
                <Input
                  id="loan-remaining"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={loanRemaining}
                  onChange={(e) => setLoanRemaining(e.target.value)}
                  className="pl-7 bg-white"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="loan-monthly">{t.budgetManagement.monthlyPayment}</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">₸</span>
                <Input
                  id="loan-monthly"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={loanMonthly}
                  onChange={(e) => setLoanMonthly(e.target.value)}
                  className="pl-7 bg-white"
                />
              </div>
            </div>

            <Button
              onClick={handleSaveLoan}
              className="w-full bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600"
            >
              {editingLoan ? t.budgetManagement.update : t.budgetManagement.add}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
