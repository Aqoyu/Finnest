import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { Home, Plus, List, PiggyBank, Users, LogOut, UserCircle2 } from "lucide-react";
import { Dashboard } from "../components/Dashboard";
import { AddTransaction } from "../components/AddTransaction";
import { TransactionList } from "../components/TransactionList";
import { BudgetManagement } from "../components/BudgetManagement";
import { FamilyMemberManagement, type FamilyMember } from "../components/FamilyMemberManagement";
import { MemberSelector } from "../components/MemberSelector";
import { ProfileSelector } from "../components/ProfileSelector";
import { LanguageSwitcher } from "../components/LanguageSwitcher";
import { SettingsMenu } from "../components/SettingsMenu";
import { AnimatedBackground } from "../components/AnimatedBackground";
import { Preloader } from "../components/Preloader";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";
import logoImage from "figma:asset/dcd0af41caa7c6f5a83d31ce1f1e04ad05e2a042.png";

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

export function MainApp() {
  const navigate = useNavigate();
  const { session, loading, signOut } = useAuth();
  const { t } = useLanguage();

  const [activeTab, setActiveTab] = useState<Tab>("dashboard");
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [banks, setBanks] = useState<Bank[]>([]);
  const [members, setMembers] = useState<FamilyMember[]>([]);
  const [selectedMemberId, setSelectedMemberId] = useState<string | null>(null);
  const [activeUserId, setActiveUserId] = useState<string | null>(null);
  const [dataLoaded, setDataLoaded] = useState(false);
  const [minLoadingTime, setMinLoadingTime] = useState(true);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!loading && !session) {
      navigate("/login");
    }
  }, [session, loading, navigate]);

  // Minimum loading time (2 seconds) to show the preloader
  useEffect(() => {
    const timer = setTimeout(() => {
      setMinLoadingTime(false);
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  // Load data from localStorage on mount
  useEffect(() => {
    const savedTransactions = localStorage.getItem("familyFinances_transactions");
    const savedBudgets = localStorage.getItem("familyFinances_budgets");
    const savedBanks = localStorage.getItem("familyFinances_banks");
    const savedMembers = localStorage.getItem("familyFinances_members");
    const savedActiveUserId = localStorage.getItem("familyFinances_activeUserId");

    if (savedTransactions) {
      setTransactions(JSON.parse(savedTransactions));
    }
    if (savedBudgets) {
      setBudgets(JSON.parse(savedBudgets));
    }
    if (savedBanks) {
      setBanks(JSON.parse(savedBanks));
    }
    if (savedMembers) {
      const loadedMembers = JSON.parse(savedMembers);
      setMembers(loadedMembers);
      // Set activeUserId if saved and member exists
      if (savedActiveUserId && loadedMembers.find((m: FamilyMember) => m.id === savedActiveUserId)) {
        setActiveUserId(savedActiveUserId);
      }
    } else {
      const defaultMember: FamilyMember = {
        id: Date.now().toString(),
        name: "Вы",
        color: "#0891b2",
      };
      setMembers([defaultMember]);
    }
    setDataLoaded(true);
  }, []);

  useEffect(() => {
    if (dataLoaded) localStorage.setItem("familyFinances_transactions", JSON.stringify(transactions));
  }, [transactions, dataLoaded]);

  useEffect(() => {
    if (dataLoaded) localStorage.setItem("familyFinances_budgets", JSON.stringify(budgets));
  }, [budgets, dataLoaded]);

  useEffect(() => {
    if (dataLoaded) localStorage.setItem("familyFinances_banks", JSON.stringify(banks));
  }, [banks, dataLoaded]);

  useEffect(() => {
    if (dataLoaded) localStorage.setItem("familyFinances_members", JSON.stringify(members));
  }, [members, dataLoaded]);

  const handleAddTransaction = (transaction: Transaction) => {
    setTransactions([transaction, ...transactions]);
    setActiveTab("dashboard");
  };

  const handleDeleteTransaction = (id: string) => {
    setTransactions(transactions.filter((t) => t.id !== id));
  };

  const handleUpdateBudgets = (newBudgets: Budget[]) => {
    setBudgets(newBudgets);
  };

  const handleUpdateBanks = (newBanks: Bank[]) => {
    setBanks(newBanks);
  };

  const handleUpdateMembers = (newMembers: FamilyMember[]) => {
    setMembers(newMembers);
    if (selectedMemberId && !newMembers.find((m) => m.id === selectedMemberId)) {
      setSelectedMemberId(null);
    }
    // Check if activeUser still exists
    if (activeUserId && !newMembers.find((m) => m.id === activeUserId)) {
      setActiveUserId(null);
      localStorage.removeItem("familyFinances_activeUserId");
    }
  };

  const handleSelectProfile = (memberId: string) => {
    setActiveUserId(memberId);
    localStorage.setItem("familyFinances_activeUserId", memberId);
  };

  const handleSignOut = async () => {
    await signOut();
    navigate("/login");
  };

  if (loading || minLoadingTime) {
    return <Preloader />;
  }

  if (!session) return null;

  // Show profile selector if no active user is selected
  if (!activeUserId && members.length > 0 && dataLoaded) {
    return <ProfileSelector members={members} onSelectProfile={handleSelectProfile} />;
  }

  const activeUser = members.find((m) => m.id === activeUserId);

  return (
    <div className="min-h-screen relative animate-fadeIn">
      {/* Animated Creative Background */}
      <AnimatedBackground />
      
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-xl border-b border-cyan-200/50 sticky top-0 z-10 shadow-sm relative">
        <div className="max-w-md mx-auto px-3 py-3">
          {/* Logo, Title, Lang switcher, Logout */}
          <div className="flex items-center justify-between mb-2">
            <LanguageSwitcher variant="dark" />
            <div className="flex items-center gap-2">
              <img src={logoImage} alt="FIN-NEST" className="h-10 w-10" />
              <h1 className="text-xl font-bold bg-gradient-to-r from-cyan-600 via-blue-600 to-teal-600 bg-clip-text text-transparent">
                {t.appName}
              </h1>
            </div>
            <div className="flex items-center gap-1">
              {activeUser && (
                <button
                  onClick={() => {
                    setActiveUserId(null);
                    localStorage.removeItem("familyFinances_activeUserId");
                  }}
                  className="w-8 h-8 flex items-center justify-center rounded-full text-white hover:ring-2 hover:ring-cyan-400 transition-all shadow-md"
                  style={{ backgroundColor: activeUser.color }}
                  title={t.profileSelector.switchProfile}
                >
                  <UserCircle2 className="h-4 w-4" />
                </button>
              )}
              <SettingsMenu />
              <button
                onClick={handleSignOut}
                className="w-8 h-8 flex items-center justify-center rounded-xl text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                title={t.logout}
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          </div>
          {/* Member selector */}
          {(activeTab === "dashboard" || activeTab === "transactions" || activeTab === "budgets") &&
            members.length > 0 && (
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
      <main className="max-w-md mx-auto px-3 py-4 pb-20">
        {activeTab === "dashboard" && (
          <Dashboard transactions={transactions} members={members} selectedMemberId={selectedMemberId} />
        )}
        {activeTab === "add" && (
          <AddTransaction onAddTransaction={handleAddTransaction} members={members} activeUserId={activeUserId!} />
        )}
        {activeTab === "transactions" && (
          <TransactionList
            transactions={transactions}
            members={members}
            onDeleteTransaction={handleDeleteTransaction}
            selectedMemberId={selectedMemberId}
          />
        )}
        {activeTab === "budgets" && (
          <BudgetManagement
            transactions={transactions}
            budgets={budgets}
            onUpdateBudgets={handleUpdateBudgets}
            banks={banks}
            onUpdateBanks={handleUpdateBanks}
            members={members}
            selectedMemberId={selectedMemberId}
          />
        )}
        {activeTab === "members" && (
          <FamilyMemberManagement members={members} onUpdateMembers={handleUpdateMembers} />
        )}
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-xl border-t border-cyan-200/50 z-20 shadow-lg">
        <div className="max-w-md mx-auto grid grid-cols-5 gap-0 px-1">
          <button
            onClick={() => setActiveTab("dashboard")}
            className={`flex flex-col items-center justify-center py-1.5 px-0.5 transition-colors duration-200 ${
              activeTab === "dashboard"
                ? "text-cyan-600 bg-gradient-to-br from-cyan-100/50 to-blue-100/50"
                : "text-gray-500 hover:text-cyan-600 hover:bg-cyan-50/50"
            }`}
          >
            <Home className="h-4 w-4" />
            <span className="text-[9px] mt-0.5 font-medium leading-none">{t.nav.home}</span>
          </button>

          <button
            onClick={() => setActiveTab("add")}
            className={`flex flex-col items-center justify-center py-1.5 px-0.5 transition-colors duration-200 ${
              activeTab === "add"
                ? "text-cyan-600 bg-gradient-to-br from-cyan-100/50 to-blue-100/50"
                : "text-gray-500 hover:text-cyan-600 hover:bg-cyan-50/50"
            }`}
          >
            <div
              className={`transition-colors duration-200 ${
                activeTab === "add"
                  ? "p-1 rounded-full bg-gradient-to-br from-cyan-500 to-blue-500 shadow-md"
                  : "p-1 rounded-full border border-gray-300 hover:border-cyan-500"
              }`}
            >
              <Plus
                className={`h-3.5 w-3.5 transition-colors duration-200 ${
                  activeTab === "add" ? "text-white" : ""
                }`}
              />
            </div>
            <span className="text-[9px] mt-0.5 font-medium leading-none">{t.nav.add}</span>
          </button>

          <button
            onClick={() => setActiveTab("transactions")}
            className={`flex flex-col items-center justify-center py-1.5 px-0.5 transition-colors duration-200 ${
              activeTab === "transactions"
                ? "text-cyan-600 bg-gradient-to-br from-cyan-100/50 to-blue-100/50"
                : "text-gray-500 hover:text-cyan-600 hover:bg-cyan-50/50"
            }`}
          >
            <List className="h-4 w-4" />
            <span className="text-[9px] mt-0.5 font-medium leading-none">{t.nav.history}</span>
          </button>

          <button
            onClick={() => setActiveTab("budgets")}
            className={`flex flex-col items-center justify-center py-1.5 px-0.5 transition-colors duration-200 ${
              activeTab === "budgets"
                ? "text-cyan-600 bg-gradient-to-br from-cyan-100/50 to-blue-100/50"
                : "text-gray-500 hover:text-cyan-600 hover:bg-cyan-50/50"
            }`}
          >
            <PiggyBank className="h-4 w-4" />
            <span className="text-[9px] mt-0.5 font-medium leading-none">{t.nav.budgets}</span>
          </button>

          <button
            onClick={() => setActiveTab("members")}
            className={`flex flex-col items-center justify-center py-1.5 px-0.5 transition-colors duration-200 ${
              activeTab === "members"
                ? "text-cyan-600 bg-gradient-to-br from-cyan-100/50 to-blue-100/50"
                : "text-gray-500 hover:text-cyan-600 hover:bg-cyan-50/50"
            }`}
          >
            <Users className="h-4 w-4" />
            <span className="text-[9px] mt-0.5 font-medium leading-none">{t.nav.family}</span>
          </button>
        </div>
      </nav>
    </div>
  );
}