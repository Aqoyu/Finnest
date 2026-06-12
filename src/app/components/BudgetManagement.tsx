import { useState } from "react";
import { DollarSign, Plus, Edit2, Trash2, CreditCard, Wallet, TrendingDown } from "lucide-react";
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

  const card: React.CSSProperties = { background: "var(--card)", border: "1px solid var(--card-border)", borderRadius: "18px" };
  const inp: React.CSSProperties = { background: "var(--input-bg)", border: "1px solid var(--input-border)", color: "var(--text-strong)", borderRadius: "10px", width: "100%", padding: "10px 12px", fontSize: "14px", outline: "none" };
  const lbl = { color: "var(--text-subtle)", fontSize: "12px", fontWeight: 500 } as React.CSSProperties;
  const iconBtn = (danger?: boolean): React.CSSProperties => ({ width: "32px", height: "32px", borderRadius: "10px", border: "none", background: "transparent", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: danger ? "#EF4444" : "var(--text-subtle)" });

  const openLoanDialog = (bankId: string) => { setLoanBankId(bankId); setEditingLoan(null); setLoanType("credit"); setLoanDescription(""); setLoanTotal(""); setLoanRemaining(""); setLoanMonthly(""); setIsLoanDialogOpen(true); };

  return (
    <div className="space-y-5">

      {/* ── Budgets ──────────────────────────────────────── */}
      <div className="flex justify-between items-center">
        <h2 className="text-base font-bold" style={{ color: "var(--text-strong)", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{t.budgetManagement.title}</h2>
        <Dialog open={isBudgetDialogOpen} onOpenChange={setIsBudgetDialogOpen}>
          <DialogTrigger asChild>
            <button onClick={() => { setEditingBudget(null); setSelectedCategory(""); setBudgetLimit(""); }}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold"
              style={{ background: "var(--brand)", color: "#fff" }}>
              <Plus className="h-4 w-4" />{t.budgetManagement.add}
            </button>
          </DialogTrigger>
          <DialogContent style={{ background: "var(--card)", border: "1px solid var(--card-border)" }}>
            <DialogHeader>
              <DialogTitle style={{ color: "var(--text-strong)" }}>{editingBudget ? t.budgetManagement.editBudget : t.budgetManagement.addBudget}</DialogTitle>
              <DialogDescription style={{ color: "var(--text-subtle)" }}>{editingBudget ? t.budgetManagement.editBudgetDesc : t.budgetManagement.addBudgetDesc}</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-2">
              <div className="space-y-1.5">
                <label style={lbl}>{t.budgetManagement.category}</label>
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger style={{ ...inp, display: "flex", alignItems: "center" }}><SelectValue placeholder={t.budgetManagement.selectCategory} /></SelectTrigger>
                  <SelectContent style={{ background: "var(--card)", border: "1px solid var(--card-border)" }}>
                    {availableCategories.map(key => <SelectItem key={key} value={key}>{translateCategory(key)}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <label style={lbl}>{t.budgetManagement.monthlyLimit}</label>
                <input style={inp} type="number" placeholder="0" value={budgetLimit} onChange={e => setBudgetLimit(e.target.value)} />
              </div>
              <button onClick={handleSaveBudget} className="w-full py-3 rounded-xl text-sm font-semibold" style={{ background: "var(--brand)", color: "#fff" }}>
                {editingBudget ? t.budgetManagement.update : t.budgetManagement.add}
              </button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {budgets.length === 0 ? (
        <div className="flex flex-col items-center py-12 rounded-2xl" style={card}>
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-3" style={{ background: "var(--brand-10)" }}>
            <DollarSign className="h-6 w-6" style={{ color: "var(--brand)" }} />
          </div>
          <p className="text-sm font-medium" style={{ color: "var(--text-strong)" }}>{t.budgetManagement.noBudgets}</p>
          <p className="text-xs mt-1" style={{ color: "var(--text-subtle)" }}>{t.budgetManagement.noBudgetsHint}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {budgets.map(budget => {
            const spent = expensesByCategory[budget.category] || 0;
            const pct = Math.min((spent / budget.limit) * 100, 100);
            const over = spent > budget.limit;
            return (
              <div key={budget.category} className="p-4 rounded-2xl" style={card}>
                <div className="flex items-center justify-between mb-3">
                  <p className="text-sm font-semibold" style={{ color: "var(--text-strong)" }}>{translateCategory(budget.category)}</p>
                  <div className="flex gap-1">
                    <button style={iconBtn()} onClick={() => handleEditBudget(budget)} onMouseEnter={e=>{(e.currentTarget as HTMLButtonElement).style.color="var(--brand)"}} onMouseLeave={e=>{(e.currentTarget as HTMLButtonElement).style.color="var(--text-subtle)"}}><Edit2 className="h-3.5 w-3.5"/></button>
                    <button style={iconBtn(true)} onClick={() => handleDeleteBudget(budget.category)}><Trash2 className="h-3.5 w-3.5"/></button>
                  </div>
                </div>
                <div className="h-1.5 rounded-full overflow-hidden mb-2" style={{ background: "var(--divider)" }}>
                  <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: over ? "#EF4444" : "var(--brand)" }} />
                </div>
                <div className="flex justify-between text-xs">
                  <span style={{ color: over ? "#EF4444" : "var(--text-subtle)" }}>₸{spent.toLocaleString("ru-KZ")} {t.budgetManagement.spent}</span>
                  <span style={{ color: over ? "#EF4444" : "#34D399", fontWeight: 600 }}>
                    {over ? `+₸${(spent - budget.limit).toLocaleString("ru-KZ")} ${t.budgetManagement.overBudget}` : `₸${(budget.limit - spent).toLocaleString("ru-KZ")} ${t.budgetManagement.remaining}`}
                  </span>
                </div>
                <p className="text-[10px] mt-0.5" style={{ color: "var(--text-dim)" }}>{t.budgetManagement.of} ₸{budget.limit.toLocaleString("ru-KZ")} · {pct.toFixed(0)}{t.budgetManagement.used}</p>
              </div>
            );
          })}
        </div>
      )}

      {/* ── Banks ────────────────────────────────────────── */}
      <div className="flex justify-between items-center pt-2">
        <h2 className="text-base font-bold" style={{ color: "var(--text-strong)", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{t.budgetManagement.banksTitle}</h2>
        <Dialog open={isBankDialogOpen} onOpenChange={setIsBankDialogOpen}>
          <DialogTrigger asChild>
            <button onClick={() => { setEditingBank(null); setBankName(""); setCardNumber(""); setCardBalance(""); setSelectedBankMemberId(members[0]?.id || ""); }}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold"
              style={{ background: "var(--brand)", color: "#fff" }}>
              <Plus className="h-4 w-4" />{t.budgetManagement.addBank}
            </button>
          </DialogTrigger>
          <DialogContent style={{ background: "var(--card)", border: "1px solid var(--card-border)" }}>
            <DialogHeader>
              <DialogTitle style={{ color: "var(--text-strong)" }}>{editingBank ? t.budgetManagement.editBank : t.budgetManagement.addBank}</DialogTitle>
              <DialogDescription style={{ color: "var(--text-subtle)" }}>{editingBank ? t.budgetManagement.editBankDesc : t.budgetManagement.addBankDesc}</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-2">
              <div className="space-y-1.5">
                <label style={lbl}>{t.addTransaction.familyMember}</label>
                <Select value={selectedBankMemberId} onValueChange={setSelectedBankMemberId}>
                  <SelectTrigger style={{ ...inp, display: "flex", alignItems: "center" }}><SelectValue /></SelectTrigger>
                  <SelectContent style={{ background: "var(--card)", border: "1px solid var(--card-border)" }}>
                    {members.map(m => <SelectItem key={m.id} value={m.id}>{m.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5"><label style={lbl}>{t.budgetManagement.bankName}</label><input style={inp} placeholder={t.budgetManagement.bankNamePlaceholder} value={bankName} onChange={e=>setBankName(e.target.value)} /></div>
              <div className="space-y-1.5"><label style={lbl}>{t.budgetManagement.cardNumber}</label><input style={inp} placeholder={t.budgetManagement.cardNumberPlaceholder} value={cardNumber} onChange={e=>setCardNumber(e.target.value)} maxLength={4} /></div>
              <div className="space-y-1.5"><label style={lbl}>{t.budgetManagement.cardBalance}</label><input style={inp} type="number" placeholder="0" value={cardBalance} onChange={e=>setCardBalance(e.target.value)} /></div>
              <button onClick={handleSaveBank} className="w-full py-3 rounded-xl text-sm font-semibold" style={{ background: "var(--brand)", color: "#fff" }}>
                {editingBank ? t.budgetManagement.update : t.budgetManagement.add}
              </button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {filteredBanks.length > 0 && (
        <div className="p-4 rounded-2xl" style={{ background: "var(--balance-bg)", border: "1px solid var(--balance-border)" }}>
          <div className="flex items-center justify-between text-white">
            <div>
              <p className="text-xs mb-1" style={{ color: "rgba(255,255,255,0.5)" }}>{t.budgetManagement.totalOnCards}</p>
              <p className="text-2xl font-bold">₸{totalOnCards.toLocaleString("ru-KZ")}</p>
            </div>
            <Wallet className="h-8 w-8" style={{ color: "rgba(255,255,255,0.4)" }} />
          </div>
          {totalLoans > 0 && (
            <div className="mt-3 pt-3 flex justify-between text-sm" style={{ borderTop: "1px solid rgba(255,255,255,0.1)" }}>
              <span style={{ color: "rgba(255,255,255,0.5)" }}>{t.budgetManagement.loans}</span>
              <span style={{ color: "#F87171", fontWeight: 600 }}>−₸{totalLoans.toLocaleString("ru-KZ")}</span>
            </div>
          )}
        </div>
      )}

      {filteredBanks.length === 0 ? (
        <div className="flex flex-col items-center py-12 rounded-2xl" style={card}>
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-3" style={{ background: "var(--brand-10)" }}>
            <CreditCard className="h-6 w-6" style={{ color: "var(--brand)" }} />
          </div>
          <p className="text-sm font-medium" style={{ color: "var(--text-strong)" }}>{t.budgetManagement.noBanks}</p>
          <p className="text-xs mt-1" style={{ color: "var(--text-subtle)" }}>{t.budgetManagement.noBanksHint}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredBanks.map(bank => {
            const member = members.find(m => m.id === bank.memberId);
            const totalDebt = bank.loans.reduce((s, l) => s + l.remainingAmount, 0);
            return (
              <div key={bank.id} className="p-4 rounded-2xl" style={card}>
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <CreditCard className="h-4 w-4" style={{ color: "var(--brand)" }} />
                      <p className="font-semibold text-sm" style={{ color: "var(--text-strong)" }}>{bank.name}</p>
                    </div>
                    <p className="text-xs" style={{ color: "var(--text-dim)" }}>**** {bank.cardNumber}{member ? ` · ${member.name}` : ""}</p>
                  </div>
                  <div className="flex gap-1">
                    <button style={iconBtn()} onClick={()=>handleEditBank(bank)} onMouseEnter={e=>{(e.currentTarget as HTMLButtonElement).style.color="var(--brand)"}} onMouseLeave={e=>{(e.currentTarget as HTMLButtonElement).style.color="var(--text-subtle)"}}><Edit2 className="h-3.5 w-3.5"/></button>
                    <button style={iconBtn(true)} onClick={()=>handleDeleteBank(bank.id)}><Trash2 className="h-3.5 w-3.5"/></button>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm" style={{ color: "var(--text-subtle)" }}>{t.budgetManagement.cardBalance}</span>
                  <span className="font-bold" style={{ color: "#34D399" }}>₸{bank.balance.toLocaleString("ru-KZ")}</span>
                </div>
                {totalDebt > 0 && (
                  <div className="flex justify-between items-center mt-1">
                    <span className="text-sm" style={{ color: "var(--text-subtle)" }}>{t.budgetManagement.loans}</span>
                    <span className="text-sm font-semibold" style={{ color: "#F87171" }}>−₸{totalDebt.toLocaleString("ru-KZ")}</span>
                  </div>
                )}
                {bank.loans.length > 0 && (
                  <div className="mt-3 pt-3" style={{ borderTop: "1px solid var(--divider)" }}>
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-xs font-semibold" style={{ color: "var(--text-subtle)" }}>{t.budgetManagement.loans}</p>
                      <button onClick={()=>openLoanDialog(bank.id)} className="flex items-center gap-1 text-xs px-2 py-1 rounded-lg" style={{ color: "var(--brand)", background: "var(--brand-10)" }}>
                        <Plus className="h-3 w-3"/>{t.budgetManagement.addLoan}
                      </button>
                    </div>
                    <div className="space-y-2">
                      {bank.loans.map(loan => (
                        <div key={loan.id} className="p-2.5 rounded-xl flex items-start justify-between" style={{ background: "rgba(248,113,113,0.07)", border: "1px solid rgba(248,113,113,0.15)" }}>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <TrendingDown className="h-3 w-3" style={{ color: "#F87171" }} />
                              <span className="text-xs font-medium" style={{ color: "var(--text-strong)" }}>{loan.description}</span>
                              <span className="text-[10px] px-1.5 py-0.5 rounded-lg" style={{ background: "rgba(248,113,113,0.15)", color: "#F87171" }}>
                                {loan.type === "credit" ? t.budgetManagement.credit : t.budgetManagement.installment}
                              </span>
                            </div>
                            <p className="text-[10px] mt-1" style={{ color: "var(--text-dim)" }}>₸{loan.remainingAmount.toLocaleString("ru-KZ")} {t.budgetManagement.debtRemaining} · ₸{loan.monthlyPayment.toLocaleString("ru-KZ")} {t.budgetManagement.perMonth}</p>
                          </div>
                          <div className="flex gap-1 ml-2 shrink-0">
                            <button style={iconBtn()} onClick={()=>handleEditLoan(bank,loan)} onMouseEnter={e=>{(e.currentTarget as HTMLButtonElement).style.color="var(--brand)"}} onMouseLeave={e=>{(e.currentTarget as HTMLButtonElement).style.color="var(--text-subtle)"}}><Edit2 className="h-3 w-3"/></button>
                            <button style={iconBtn(true)} onClick={()=>handleDeleteLoan(bank.id,loan.id)}><Trash2 className="h-3 w-3"/></button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {bank.loans.length === 0 && (
                  <button onClick={()=>openLoanDialog(bank.id)} className="w-full mt-3 py-2 rounded-xl text-xs font-medium flex items-center justify-center gap-2"
                    style={{ border: "1.5px dashed var(--brand-25)", color: "var(--brand)", background: "var(--brand-5)" }}>
                    <Plus className="h-3.5 w-3.5"/>{t.budgetManagement.addLoan}
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* ── Loan dialog ──────────────────────────────────── */}
      <Dialog open={isLoanDialogOpen} onOpenChange={setIsLoanDialogOpen}>
        <DialogContent style={{ background: "var(--card)", border: "1px solid var(--card-border)" }}>
          <DialogHeader>
            <DialogTitle style={{ color: "var(--text-strong)" }}>{editingLoan ? t.budgetManagement.editLoan : t.budgetManagement.addLoan}</DialogTitle>
            <DialogDescription style={{ color: "var(--text-subtle)" }}>{editingLoan ? t.budgetManagement.editLoanDesc : t.budgetManagement.addLoanDesc}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            {!editingLoan && (
              <div className="space-y-1.5">
                <label style={lbl}>{t.budgetManagement.bankName}</label>
                <Select value={loanBankId} onValueChange={setLoanBankId}>
                  <SelectTrigger style={{ ...inp, display: "flex", alignItems: "center" }}><SelectValue placeholder={t.budgetManagement.selectCategory} /></SelectTrigger>
                  <SelectContent style={{ background: "var(--card)", border: "1px solid var(--card-border)" }}>
                    {filteredBanks.map(b => <SelectItem key={b.id} value={b.id}>{b.name} (**** {b.cardNumber})</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            )}
            <div className="space-y-1.5">
              <label style={lbl}>{t.budgetManagement.loanType}</label>
              <Select value={loanType} onValueChange={(v:"credit"|"installment")=>setLoanType(v)}>
                <SelectTrigger style={{ ...inp, display: "flex", alignItems: "center" }}><SelectValue /></SelectTrigger>
                <SelectContent style={{ background: "var(--card)", border: "1px solid var(--card-border)" }}>
                  <SelectItem value="credit">{t.budgetManagement.credit}</SelectItem>
                  <SelectItem value="installment">{t.budgetManagement.installment}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5"><label style={lbl}>{t.budgetManagement.loanDescription}</label><input style={inp} placeholder={t.budgetManagement.loanDescriptionPlaceholder} value={loanDescription} onChange={e=>setLoanDescription(e.target.value)} /></div>
            <div className="space-y-1.5"><label style={lbl}>{t.budgetManagement.totalAmount}</label><input style={inp} type="number" placeholder="0" value={loanTotal} onChange={e=>setLoanTotal(e.target.value)} /></div>
            <div className="space-y-1.5"><label style={lbl}>{t.budgetManagement.remainingAmount}</label><input style={inp} type="number" placeholder="0" value={loanRemaining} onChange={e=>setLoanRemaining(e.target.value)} /></div>
            <div className="space-y-1.5"><label style={lbl}>{t.budgetManagement.monthlyPayment}</label><input style={inp} type="number" placeholder="0" value={loanMonthly} onChange={e=>setLoanMonthly(e.target.value)} /></div>
            <button onClick={handleSaveLoan} className="w-full py-3 rounded-xl text-sm font-semibold" style={{ background: "var(--brand)", color: "#fff" }}>
              {editingLoan ? t.budgetManagement.update : t.budgetManagement.add}
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
