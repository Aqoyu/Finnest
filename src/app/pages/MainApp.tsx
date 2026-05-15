import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { Home, Plus, List, PiggyBank, Users, LogOut, Sun, Moon } from "lucide-react";
import { useTheme } from "../context/ThemeContext";
import { Dashboard } from "../components/Dashboard";
import { AddTransaction } from "../components/AddTransaction";
import { TransactionList } from "../components/TransactionList";
import { BudgetManagement } from "../components/BudgetManagement";
import { FamilyMemberManagement, type FamilyMember } from "../components/FamilyMemberManagement";
import { MemberSelector } from "../components/MemberSelector";
import { ProfileSelector } from "../components/ProfileSelector";
import { StatementImport } from "../components/StatementImport";
import { LanguageSwitcher } from "../components/LanguageSwitcher";
import { SettingsMenu } from "../components/SettingsMenu";
import { toast } from "sonner";
import { AnimatedBackground } from "../components/AnimatedBackground";
import { Preloader } from "../components/Preloader";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";
import logoImage from "figma:asset/dcd0af41caa7c6f5a83d31ce1f1e04ad05e2a042.png";

export interface SavingsGoal {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  color: string;
  deadline?: string;
}

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

export interface Loan {
  id: string;
  type: "credit" | "installment";
  description: string;
  totalAmount: number;
  remainingAmount: number;
  monthlyPayment: number;
}

export interface Bank {
  id: string;
  name: string;
  cardNumber: string;
  balance: number;
  loans: Loan[];
  memberId: string;
}

type Tab = "dashboard" | "add" | "transactions" | "budgets" | "members";

const NAV_ITEMS: { tab: Tab; Icon: typeof Home; key: keyof ReturnType<typeof useLanguage>["t"]["nav"] }[] = [
  { tab: "dashboard",    Icon: Home,      key: "home" },
  { tab: "add",          Icon: Plus,      key: "add" },
  { tab: "transactions", Icon: List,      key: "history" },
  { tab: "budgets",      Icon: PiggyBank, key: "budgets" },
  { tab: "members",      Icon: Users,     key: "family" },
];

export function MainApp() {
  const navigate = useNavigate();
  const { session, loading, signOut } = useAuth();
  const { t } = useLanguage();
  const { isDark, toggleTheme } = useTheme();

  const [activeTab, setActiveTab] = useState<Tab>("dashboard");
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [banks, setBanks] = useState<Bank[]>([]);
  const [members, setMembers] = useState<FamilyMember[]>([]);
  const [goals, setGoals] = useState<SavingsGoal[]>([]);
  const [selectedMemberId, setSelectedMemberId] = useState<string | null>(null);
  const [activeUserId, setActiveUserId] = useState<string | null>(null);
  const [dataLoaded, setDataLoaded] = useState(false);
  const [minLoadingTime, setMinLoadingTime] = useState(true);
  const [showImport, setShowImport] = useState(false);

  const userId = session?.user?.id;
  const prefix = userId ? `familyFinances_${userId}_` : null;

  useEffect(() => {
    if (!loading && !session) navigate("/login");
  }, [session, loading, navigate]);

  useEffect(() => {
    const timer = setTimeout(() => setMinLoadingTime(false), 2000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!prefix) return;
    setTransactions([]); setBudgets([]); setBanks([]); setGoals([]);
    setMembers([]); setActiveUserId(null); setSelectedMemberId(null); setDataLoaded(false);

    const savedTransactions = localStorage.getItem(`${prefix}transactions`);
    const savedBudgets = localStorage.getItem(`${prefix}budgets`);
    const savedBanks = localStorage.getItem(`${prefix}banks`);
    const savedGoals = localStorage.getItem(`${prefix}goals`);
    const savedMembers = localStorage.getItem(`${prefix}members`);
    const savedActiveUserId = localStorage.getItem(`${prefix}activeUserId`);

    if (savedTransactions) setTransactions(JSON.parse(savedTransactions));
    if (savedBudgets) setBudgets(JSON.parse(savedBudgets));
    if (savedBanks) setBanks(JSON.parse(savedBanks));
    if (savedGoals) setGoals(JSON.parse(savedGoals));
    if (savedMembers) {
      const loaded = JSON.parse(savedMembers);
      setMembers(loaded);
      if (savedActiveUserId && loaded.find((m: FamilyMember) => m.id === savedActiveUserId)) {
        setActiveUserId(savedActiveUserId);
      }
    } else {
      setMembers([{ id: Date.now().toString(), name: "Вы", color: "#E8A020" }]);
    }
    setDataLoaded(true);
  }, [prefix]);

  useEffect(() => { if (dataLoaded && prefix) localStorage.setItem(`${prefix}transactions`, JSON.stringify(transactions)); }, [transactions, dataLoaded, prefix]);
  useEffect(() => { if (dataLoaded && prefix) localStorage.setItem(`${prefix}budgets`, JSON.stringify(budgets)); }, [budgets, dataLoaded, prefix]);
  useEffect(() => { if (dataLoaded && prefix) localStorage.setItem(`${prefix}banks`, JSON.stringify(banks)); }, [banks, dataLoaded, prefix]);
  useEffect(() => { if (dataLoaded && prefix) localStorage.setItem(`${prefix}goals`, JSON.stringify(goals)); }, [goals, dataLoaded, prefix]);
  useEffect(() => { if (dataLoaded && prefix) localStorage.setItem(`${prefix}members`, JSON.stringify(members)); }, [members, dataLoaded, prefix]);

  const handleAddTransaction = (transaction: Transaction) => {
    setTransactions([transaction, ...transactions]);
    setActiveTab("dashboard");
  };

  const handleImportTransactions = (imported: Transaction[]) => {
    setTransactions((prev) => [...imported, ...prev]);
  };

  const handleDeleteTransaction = (id: string) => {
    setTransactions(transactions.filter((t) => t.id !== id));
  };

  const handleUpdateMembers = (newMembers: FamilyMember[]) => {
    setMembers(newMembers);
    if (selectedMemberId && !newMembers.find((m) => m.id === selectedMemberId)) setSelectedMemberId(null);
    if (activeUserId && !newMembers.find((m) => m.id === activeUserId)) {
      setActiveUserId(null);
      if (prefix) localStorage.removeItem(`${prefix}activeUserId`);
    }
  };

  const handleSelectProfile = (memberId: string) => {
    setActiveUserId(memberId);
    if (prefix) localStorage.setItem(`${prefix}activeUserId`, memberId);
  };

  const handleClearHistory = () => setTransactions([]);

  const handleClearAll = () => {
    setTransactions([]); setBudgets([]); setBanks([]);
  };

  const handleExportCSV = () => {
    if (!transactions.length) { toast.error("Нет транзакций для экспорта"); return; }
    const headers = ["Дата", "Тип", "Сумма", "Категория", "Описание", "Участник"];
    const rows = transactions.map(tx => {
      const member = members.find(m => m.id === tx.memberId);
      return [
        new Date(tx.date).toLocaleDateString("ru-KZ"),
        tx.type === "income" ? "Доход" : "Расход",
        tx.amount.toString(), tx.category, tx.description, member?.name ?? "",
      ];
    });
    const csv = [headers, ...rows].map(r => r.map(c => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `fin-nest-${new Date().toISOString().split("T")[0]}.csv`; a.click();
    URL.revokeObjectURL(url);
    toast.success(`Экспортировано ${transactions.length} транзакций`);
  };

  const handleSignOut = async () => { await signOut(); navigate("/login"); };

  if (loading || minLoadingTime) return <Preloader />;
  if (!session) return null;

  if (!activeUserId && members.length > 0 && dataLoaded) {
    return <ProfileSelector members={members} onSelectProfile={handleSelectProfile} />;
  }

  const activeUser = members.find((m) => m.id === activeUserId);

  return (
    <div className="min-h-screen relative animate-fadeIn">
      <AnimatedBackground />

      {/* Header */}
      <header className="sticky top-0 z-30" style={{ background: "var(--header-bg)", backdropFilter: "blur(20px)", borderBottom: "1px solid var(--divider)" }}>
        <div className="max-w-md mx-auto px-3 py-2.5">
          <div className="flex items-center justify-between mb-2">
            <LanguageSwitcher variant="dark" />

            <div className="flex items-center gap-2">
              <img src={logoImage} alt="FIN-NEST" className="h-8 w-8 object-contain" />
              <h1 className="text-base font-bold" style={{ color: "var(--text-strong)", fontFamily: "'Plus Jakarta Sans', sans-serif", letterSpacing: "-0.02em" }}>
                {t.appName}
              </h1>
            </div>

            <div className="flex items-center gap-1">
              {activeUser && (
                <button
                  onClick={() => { setActiveUserId(null); if (prefix) localStorage.removeItem(`${prefix}activeUserId`); }}
                  className="w-7 h-7 flex items-center justify-center rounded-full text-white transition-all hover:ring-2"
                  style={{ backgroundColor: activeUser.color }}
                  title={t.profileSelector.switchProfile}
                >
                  <span className="text-xs font-bold">{activeUser.name.charAt(0).toUpperCase()}</span>
                </button>
              )}
              <button
                onClick={toggleTheme}
                className="w-7 h-7 flex items-center justify-center rounded-xl transition-all"
                style={{ color: "var(--text-subtle)" }}
                onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.color = "var(--brand)"; }}
                onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.color = "var(--text-subtle)"; }}
                title={isDark ? "Light mode" : "Dark mode"}
              >
                {isDark ? <Sun className="h-3.5 w-3.5" /> : <Moon className="h-3.5 w-3.5" />}
              </button>
              <SettingsMenu onExport={handleExportCSV} />
              <button
                onClick={handleSignOut}
                className="w-7 h-7 flex items-center justify-center rounded-xl transition-colors"
                style={{ color: "var(--text-subtle)" }}
                onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.color = "#ef4444"; }}
                onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.color = "var(--text-subtle)"; }}
                title={t.logout}
              >
                <LogOut className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>

          {(activeTab === "dashboard" || activeTab === "transactions" || activeTab === "budgets") && members.length > 0 && (
            <MemberSelector
              members={members}
              selectedMemberId={selectedMemberId}
              onSelectMember={setSelectedMemberId}
              showAllOption={true}
            />
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-md mx-auto px-3 py-4 pb-24">
        {activeTab === "dashboard" && (
          <Dashboard transactions={transactions} members={members} selectedMemberId={selectedMemberId} goals={goals} onUpdateGoals={setGoals} budgets={budgets} />
        )}
        {activeTab === "add" && (
          <div className="space-y-3">
            <AddTransaction onAddTransaction={handleAddTransaction} members={members} activeUserId={activeUserId!} />
            <button
              onClick={() => setShowImport(true)}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl text-sm font-medium transition-all"
              style={{ border: "1.5px dashed var(--brand-25)", color: "var(--brand)", background: "var(--brand-5)" }}
              onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = "var(--brand)"; }}
              onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = "var(--brand-25)"; }}
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
              </svg>
              Загрузить выписку из банка
            </button>
          </div>
        )}
        {activeTab === "transactions" && (
          <TransactionList
            transactions={transactions}
            members={members}
            onDeleteTransaction={handleDeleteTransaction}
            onClearHistory={handleClearHistory}
            onClearAll={handleClearAll}
            selectedMemberId={selectedMemberId}
          />
        )}
        {activeTab === "budgets" && (
          <BudgetManagement
            transactions={transactions}
            budgets={budgets}
            onUpdateBudgets={setBudgets}
            banks={banks}
            onUpdateBanks={setBanks}
            members={members}
            selectedMemberId={selectedMemberId}
          />
        )}
        {activeTab === "members" && (
          <FamilyMemberManagement members={members} onUpdateMembers={handleUpdateMembers} />
        )}
      </main>

      {showImport && activeUserId && (
        <StatementImport
          members={members}
          activeUserId={activeUserId}
          onImport={handleImportTransactions}
          onClose={() => setShowImport(false)}
        />
      )}

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 z-30 safe-area-bottom" style={{ background: "var(--nav-bg)", backdropFilter: "blur(20px)", borderTop: "1px solid var(--divider)" }}>
        <div className="max-w-md mx-auto grid grid-cols-5">
          {NAV_ITEMS.map(({ tab, Icon, key }) => {
            const active = activeTab === tab;
            const isAdd = tab === "add";
            return (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className="flex flex-col items-center justify-center py-2 px-1 transition-all relative"
              >
                {isAdd ? (
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center transition-all mb-0.5"
                    style={{
                      background: active ? "var(--brand-grad)" : "var(--brand-15)",
                      boxShadow: active ? "0 4px 16px var(--brand-20)" : "none",
                    }}>
                    <Icon className="h-4 w-4" style={{ color: active ? "var(--primary-foreground)" : "var(--brand)" }} />
                  </div>
                ) : (
                  <div className="flex flex-col items-center">
                    <div className="w-8 h-8 flex items-center justify-center rounded-xl transition-all"
                      style={{ background: active ? "var(--brand-15)" : "transparent" }}>
                      <Icon className="h-4 w-4 transition-colors" style={{ color: active ? "var(--brand)" : "var(--text-subtle)" }} />
                    </div>
                    {active && <div className="w-1 h-1 rounded-full mt-0.5" style={{ backgroundColor: "var(--brand)" }} />}
                  </div>
                )}
                {!isAdd && (
                  <span className="text-[9px] font-medium leading-none mt-0.5 transition-colors"
                    style={{ color: active ? "var(--brand)" : "var(--text-subtle)" }}>
                    {t.nav[key]}
                  </span>
                )}
                {isAdd && (
                  <span className="text-[9px] font-medium leading-none mt-0.5" style={{ color: active ? "var(--brand)" : "var(--text-subtle)" }}>
                    {t.nav[key]}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
