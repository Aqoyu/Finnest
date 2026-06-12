import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router";
import { Home, Plus, List, PiggyBank, Users, LogOut, Sun, Moon, ChevronUp, ChevronDown } from "lucide-react";
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

const btnStyle = (bottom: string): React.CSSProperties => ({
  position: "fixed", right: "16px", bottom, zIndex: 40,
  width: "36px", height: "36px", borderRadius: "50%",
  background: "var(--card)", border: "1px solid var(--card-border)",
  color: "var(--brand)", cursor: "pointer",
  display: "flex", alignItems: "center", justifyContent: "center",
  boxShadow: "0 4px 14px rgba(0,0,0,0.2)",
});

function ScrollButtons() {
  const [showUp, setShowUp] = useState(false);
  const [showDown, setShowDown] = useState(false);
  const update = useCallback(() => {
    const scrolled = window.scrollY;
    const max = document.documentElement.scrollHeight - window.innerHeight;
    setShowUp(scrolled > 300);
    setShowDown(max > 100 && scrolled < max - 80);
  }, []);
  useEffect(() => {
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update, { passive: true });
    update();
    return () => { window.removeEventListener("scroll", update); window.removeEventListener("resize", update); };
  }, [update]);
  return (
    <>
      {showUp && (
        <button style={btnStyle("134px")} onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })} aria-label="Наверх">
          <ChevronUp style={{ width: "16px", height: "16px" }} />
        </button>
      )}
      {showDown && (
        <button style={btnStyle("90px")} onClick={() => window.scrollTo({ top: document.documentElement.scrollHeight, behavior: "smooth" })} aria-label="Вниз">
          <ChevronDown style={{ width: "16px", height: "16px" }} />
        </button>
      )}
    </>
  );
}

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

  /* ── shared content renderer ─────────────────────────── */
  const renderContent = () => (
    <>
      {activeTab === "dashboard" && (
        <Dashboard transactions={transactions} members={members} selectedMemberId={selectedMemberId} goals={goals} onUpdateGoals={setGoals} budgets={budgets} />
      )}
      {activeTab === "add" && (
        <div className="space-y-3 max-w-lg">
          <AddTransaction onAddTransaction={handleAddTransaction} members={members} activeUserId={activeUserId!} />
          <button
            onClick={() => setShowImport(true)}
            className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl text-sm font-medium transition-all"
            style={{ border: "1.5px dashed var(--brand-25)", color: "var(--brand)", background: "var(--brand-5)" }}
            onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = "var(--brand)"; (e.currentTarget as HTMLButtonElement).style.background = "var(--brand-10)"; }}
            onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = "var(--brand-25)"; (e.currentTarget as HTMLButtonElement).style.background = "var(--brand-5)"; }}
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
            </svg>
            Загрузить выписку из банка
          </button>
        </div>
      )}
      {activeTab === "transactions" && (
        <TransactionList transactions={transactions} members={members} onDeleteTransaction={handleDeleteTransaction} onClearHistory={handleClearHistory} onClearAll={handleClearAll} selectedMemberId={selectedMemberId} />
      )}
      {activeTab === "budgets" && (
        <BudgetManagement transactions={transactions} budgets={budgets} onUpdateBudgets={setBudgets} banks={banks} onUpdateBanks={setBanks} members={members} selectedMemberId={selectedMemberId} />
      )}
      {activeTab === "members" && (
        <FamilyMemberManagement members={members} onUpdateMembers={handleUpdateMembers} />
      )}
    </>
  );

  return (
    <div className="min-h-screen animate-fadeIn" style={{ background: "var(--background)" }}>
      <AnimatedBackground />

      {/* ═══════════════════════════════════════════════════
          DESKTOP LAYOUT  (md and above)
          Left sidebar 240px + full-width content area
      ════════════════════════════════════════════════════ */}
      <div className="hidden md:flex min-h-screen">

        {/* ── Sidebar ──────────────────────────────────── */}
        <aside className="fixed inset-y-0 left-0 z-40 w-60 flex flex-col" style={{ background: "var(--card)", borderRight: "1px solid var(--divider)" }}>

          {/* Logo */}
          <div className="flex items-center gap-3 px-5 h-16 shrink-0" style={{ borderBottom: "1px solid var(--divider)" }}>
            <img src={logoImage} alt="FIN-NEST" className="h-8 w-8 object-contain shrink-0" />
            <span className="text-sm font-bold" style={{ color: "var(--text-strong)", fontFamily: "'Plus Jakarta Sans', sans-serif", letterSpacing: "-0.02em" }}>
              {t.appName}
            </span>
          </div>

          {/* Nav */}
          <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
            {NAV_ITEMS.map(({ tab, Icon, key }) => {
              const active = activeTab === tab;
              return (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all"
                  style={{ background: active ? "var(--brand-10)" : "transparent", color: active ? "var(--brand)" : "var(--text-subtle)" }}
                  onMouseEnter={e => { if (!active) (e.currentTarget as HTMLButtonElement).style.background = "var(--surface)"; }}
                  onMouseLeave={e => { if (!active) (e.currentTarget as HTMLButtonElement).style.background = "transparent"; }}
                >
                  <Icon style={{ width: "16px", height: "16px", flexShrink: 0, color: active ? "var(--brand)" : "var(--text-subtle)" }} />
                  <span className="text-sm font-medium">{t.nav[key]}</span>
                  {active && <div className="ml-auto w-1.5 h-1.5 rounded-full" style={{ background: "var(--brand)" }} />}
                </button>
              );
            })}
          </nav>

          {/* Bottom controls */}
          <div className="p-3 space-y-2 shrink-0" style={{ borderTop: "1px solid var(--divider)" }}>
            {/* Active user chip */}
            {activeUser && (
              <button
                onClick={() => { setActiveUserId(null); if (prefix) localStorage.removeItem(`${prefix}activeUserId`); }}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl transition-all"
                style={{ background: "var(--surface)" }}
              >
                <div className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0" style={{ backgroundColor: activeUser.color }}>
                  {activeUser.name.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0 text-left">
                  <p className="text-xs font-semibold truncate" style={{ color: "var(--text-strong)" }}>{activeUser.name}</p>
                  <p className="text-[10px]" style={{ color: "var(--text-subtle)" }}>{t.profileSelector.switchProfile}</p>
                </div>
              </button>
            )}
            {/* Tool row */}
            <div className="flex items-center gap-1">
              <LanguageSwitcher variant="dark" dropUp />
              <button onClick={toggleTheme} className="flex-1 h-8 flex items-center justify-center rounded-xl transition-all" style={{ color: "var(--text-subtle)", background: "var(--surface)" }}>
                {isDark ? <Sun className="h-3.5 w-3.5" /> : <Moon className="h-3.5 w-3.5" />}
              </button>
              <SettingsMenu onExport={handleExportCSV} />
              <button onClick={handleSignOut} className="flex-1 h-8 flex items-center justify-center rounded-xl transition-all" style={{ color: "var(--text-subtle)", background: "var(--surface)" }}
                onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.color = "#EF4444"; }}
                onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.color = "var(--text-subtle)"; }}>
                <LogOut className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </aside>

        {/* ── Desktop content ────────────────────────── */}
        <div className="flex-1 flex flex-col" style={{ marginLeft: "240px" }}>
          {/* Top bar */}
          <header className="sticky top-0 z-30 h-16 flex items-center px-8 gap-4" style={{ background: "var(--header-bg)", backdropFilter: "blur(20px)", borderBottom: "1px solid var(--divider)" }}>
            <h2 className="text-base font-bold shrink-0" style={{ color: "var(--text-strong)", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
              {t.nav[NAV_ITEMS.find(n => n.tab === activeTab)!.key]}
            </h2>
            {(activeTab === "dashboard" || activeTab === "transactions" || activeTab === "budgets") && members.length > 0 && (
              <MemberSelector members={members} selectedMemberId={selectedMemberId} onSelectMember={setSelectedMemberId} showAllOption />
            )}
          </header>

          {/* Page content */}
          <main className="flex-1 px-8 py-6 overflow-y-auto">
            {renderContent()}
          </main>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════
          MOBILE LAYOUT  (below md)
          Sticky header + scrollable content + floating pill nav
      ════════════════════════════════════════════════════ */}
      <div className="flex flex-col min-h-screen md:hidden">

        {/* Mobile header */}
        <header className="sticky top-0 z-30" style={{ background: "var(--header-bg)", backdropFilter: "blur(24px)", WebkitBackdropFilter: "blur(24px)", borderBottom: "1px solid var(--divider)" }}>
          <div className="px-4 py-3">
            <div className="flex items-center justify-between">
              {/* Logo */}
              <div className="flex items-center gap-2.5">
                <img src={logoImage} alt="FIN-NEST" className="h-7 w-7 object-contain shrink-0" />
                <span className="text-sm font-bold" style={{ color: "var(--text-strong)", fontFamily: "'Plus Jakarta Sans', sans-serif", letterSpacing: "-0.025em" }}>
                  {t.appName}
                </span>
              </div>

              {/* Right actions — gap-2 so items breathe */}
              <div className="flex items-center gap-2">
                <LanguageSwitcher variant="dark" />
                {activeUser && (
                  <button
                    onClick={() => { setActiveUserId(null); if (prefix) localStorage.removeItem(`${prefix}activeUserId`); }}
                    className="w-7 h-7 flex items-center justify-center rounded-full text-white shrink-0"
                    style={{ backgroundColor: activeUser.color, outline: `2px solid ${activeUser.color}55`, outlineOffset: "2px" }}
                  >
                    <span className="text-[10px] font-bold">{activeUser.name.charAt(0).toUpperCase()}</span>
                  </button>
                )}
                <button onClick={toggleTheme} className="w-7 h-7 flex items-center justify-center rounded-xl" style={{ color: "var(--text-subtle)" }}>
                  {isDark ? <Sun className="h-3.5 w-3.5" /> : <Moon className="h-3.5 w-3.5" />}
                </button>
                <SettingsMenu onExport={handleExportCSV} />
                <button onClick={handleSignOut} className="w-7 h-7 flex items-center justify-center rounded-xl" style={{ color: "var(--text-subtle)" }}
                  onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.color = "#EF4444"; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.color = "var(--text-subtle)"; }}>
                  <LogOut className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>

            {(activeTab === "dashboard" || activeTab === "transactions" || activeTab === "budgets") && members.length > 0 && (
              <div className="mt-2.5">
                <MemberSelector members={members} selectedMemberId={selectedMemberId} onSelectMember={setSelectedMemberId} showAllOption />
              </div>
            )}
          </div>
        </header>

        {/* Mobile content */}
        <main className="flex-1 px-4 py-4 pb-32">
          {renderContent()}
        </main>

        {/* Floating pill nav */}
        <div className="fixed bottom-5 left-0 right-0 z-30 flex justify-center px-4 pointer-events-none">
          <nav
            className="pointer-events-auto"
            style={{ width: "min(calc(100vw - 32px), 416px)", background: "var(--nav-bg)", backdropFilter: "blur(24px)", WebkitBackdropFilter: "blur(24px)", borderRadius: "28px", border: "1px solid var(--card-border)", boxShadow: "var(--nav-shadow)", padding: "5px" }}
          >
            <div className="flex items-stretch">
              {NAV_ITEMS.map(({ tab, Icon, key }) => {
                const active = activeTab === tab;
                const isAdd = tab === "add";
                return (
                  <button key={tab} onClick={() => setActiveTab(tab)}
                    className="flex-1 flex flex-col items-center justify-center gap-0.5 py-2 rounded-[22px] transition-all"
                    style={{ background: active ? (isAdd ? "var(--brand-grad)" : "var(--brand-10)") : "transparent" }}>
                    <Icon style={{ width: "17px", height: "17px", color: active ? (isAdd ? "#fff" : "var(--brand)") : "var(--text-subtle)" }} />
                    <span className="text-[9px] font-medium leading-none" style={{ color: active ? (isAdd ? "#fff" : "var(--brand)") : "var(--text-subtle)" }}>
                      {t.nav[key]}
                    </span>
                  </button>
                );
              })}
            </div>
          </nav>
        </div>

        {/* Scroll to top — mobile */}
        <ScrollButtons />
      </div>

      {showImport && activeUserId && (
        <StatementImport members={members} activeUserId={activeUserId} onImport={handleImportTransactions} onClose={() => setShowImport(false)} />
      )}
    </div>
  );
}
