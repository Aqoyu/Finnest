import { useState } from "react";
import { Trash2, Filter, Search, History, AlertTriangle, X, User, ChevronDown } from "lucide-react";
import { format } from "date-fns";
import { ru } from "date-fns/locale";
import { useLanguage } from "../context/LanguageContext";
import { catEmoji } from "../utils/categoryEmoji";
import { toast } from "sonner";

interface Transaction {
  id: string; type: "income" | "expense"; amount: number;
  category: string; description: string; date: string; memberId: string;
}
interface FamilyMember { id: string; name: string; color: string; }

interface TransactionListProps {
  transactions: Transaction[];
  members: FamilyMember[];
  onDeleteTransaction: (id: string) => void;
  onClearHistory?: () => void;
  onClearAll?: () => void;
  selectedMemberId: string | null;
}

type ConfirmAction = "history" | "all" | null;

const card: React.CSSProperties = {
  background: "var(--card)",
  border: "1px solid var(--card-border)",
  borderRadius: "14px",
};

function dateGroupKey(dateStr: string): string {
  const d = new Date(dateStr);
  const today     = new Date();
  const yesterday = new Date(today); yesterday.setDate(yesterday.getDate() - 1);
  if (d.toDateString() === today.toDateString())     return "Сегодня";
  if (d.toDateString() === yesterday.toDateString()) return "Вчера";
  return format(d, "d MMMM yyyy", { locale: ru });
}

export function TransactionList({
  transactions, members, onDeleteTransaction, onClearHistory, onClearAll, selectedMemberId,
}: TransactionListProps) {
  const { t, translateCategory } = useLanguage();
  const [filterType, setFilterType] = useState<"all" | "income" | "expense">("all");
  const [sortBy,     setSortBy]     = useState<"date" | "amount">("date");
  const [search,     setSearch]     = useState("");
  const [confirm,    setConfirm]    = useState<ConfirmAction>(null);

  const filtered = transactions
    .filter(tx => {
      if (selectedMemberId && tx.memberId !== selectedMemberId) return false;
      if (filterType !== "all" && tx.type !== filterType) return false;
      if (search.trim()) {
        const q = search.trim().toLowerCase();
        return tx.description.toLowerCase().includes(q) || translateCategory(tx.category).toLowerCase().includes(q);
      }
      return true;
    })
    .sort((a, b) => sortBy === "date"
      ? new Date(b.date).getTime() - new Date(a.date).getTime()
      : b.amount - a.amount
    );

  const groups: { key: string; items: Transaction[] }[] = [];
  if (sortBy === "date") {
    filtered.forEach(tx => {
      const key = dateGroupKey(tx.date);
      const g   = groups.find(g => g.key === key);
      if (g) g.items.push(tx); else groups.push({ key, items: [tx] });
    });
  } else {
    groups.push({ key: "", items: filtered });
  }

  const handleDelete = (id: string) => { onDeleteTransaction(id); toast.success(t.transactionList.deleted); };

  const handleConfirm = () => {
    if (confirm === "history") { onClearHistory?.(); toast.success("История очищена"); }
    if (confirm === "all")     { onClearAll?.();    toast.success("Все данные удалены"); }
    setConfirm(null);
  };

  const getMember = (id: string) => members.find(m => m.id === id);

  const totalIncome   = filtered.filter(tx => tx.type === "income").reduce((s, tx) => s + tx.amount, 0);
  const totalExpenses = filtered.filter(tx => tx.type === "expense").reduce((s, tx) => s + tx.amount, 0);

  return (
    <div className="space-y-3">
      {/* Confirm dialog */}
      {confirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div className="absolute inset-0 backdrop-blur-sm" style={{ background: "var(--confirm-overlay)" }} onClick={() => setConfirm(null)} />
          <div className="relative w-full max-w-xs rounded-2xl overflow-hidden" style={{ background: "var(--confirm-bg)", border: "1px solid var(--confirm-border)", boxShadow: "var(--shadow-lg)" }}>
            <div className="px-5 py-4 flex items-center gap-3" style={{ background: "rgba(239,68,68,0.08)", borderBottom: "1px solid rgba(239,68,68,0.15)" }}>
              <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ background: "rgba(239,68,68,0.15)" }}>
                <AlertTriangle className="h-4 w-4" style={{ color: "#ef4444" }} />
              </div>
              <p className="font-semibold text-sm" style={{ color: "var(--text-strong)", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                {confirm === "history" ? "Очистить историю" : "Очистить все данные"}
              </p>
            </div>
            <p className="px-5 py-4 text-sm leading-relaxed" style={{ color: "var(--text-subtle)" }}>
              {confirm === "history"
                ? "Все транзакции будут удалены. Бюджеты и члены семьи останутся."
                : "Транзакции, бюджеты и банки будут удалены безвозвратно."}
            </p>
            <div className="px-5 pb-5 flex gap-2.5">
              <button onClick={() => setConfirm(null)}
                className="flex-1 py-2.5 rounded-xl text-sm font-medium transition-colors"
                style={{ border: "1px solid var(--card-border)", color: "var(--text-subtle)" }}>Отмена</button>
              <button onClick={handleConfirm}
                className="flex-1 py-2.5 rounded-xl text-white text-sm font-bold transition-all"
                style={{ background: "#ef4444" }}>Удалить</button>
            </div>
          </div>
        </div>
      )}

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 pointer-events-none" style={{ color: "var(--text-subtle)" }} />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Поиск по названию или категории..."
          className="w-full pl-9 pr-9 py-2.5 rounded-xl text-sm outline-none transition-all"
          style={{ background: "var(--card)", border: "1px solid var(--card-border)", color: "var(--text-strong)" }}
          onFocus={e => { e.target.style.borderColor = "var(--input-focus-border)"; }}
          onBlur={e => { e.target.style.borderColor = "var(--card-border)"; }}
        />
        {search && (
          <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 transition-colors" style={{ color: "var(--text-subtle)" }}>
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="p-4 space-y-3" style={card}>
        <div className="flex items-center gap-2 mb-1">
          <Filter className="h-3.5 w-3.5" style={{ color: "var(--brand)" }} />
          <span className="text-sm font-semibold" style={{ color: "var(--text-strong)", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{t.transactionList.filters}</span>
        </div>

        <div className="grid grid-cols-2 gap-2">
          {/* Type filter */}
          <div className="space-y-1">
            <label className="text-[10px] uppercase tracking-wide font-medium" style={{ color: "var(--text-subtle)" }}>{t.transactionList.type}</label>
            <div className="relative">
              <select value={filterType} onChange={e => setFilterType(e.target.value as any)}
                className="w-full pl-3 pr-7 py-2 rounded-xl text-xs outline-none appearance-none transition-all"
                style={{ background: "var(--input-bg)", border: "1px solid var(--input-border)", color: "var(--text-strong)" }}>
                <option value="all">{t.transactionList.all}</option>
                <option value="income">{t.transactionList.incomes}</option>
                <option value="expense">{t.transactionList.expenses}</option>
              </select>
              <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-3 w-3 pointer-events-none" style={{ color: "var(--text-subtle)" }} />
            </div>
          </div>

          {/* Sort */}
          <div className="space-y-1">
            <label className="text-[10px] uppercase tracking-wide font-medium" style={{ color: "var(--text-subtle)" }}>{t.transactionList.sort}</label>
            <div className="relative">
              <select value={sortBy} onChange={e => setSortBy(e.target.value as any)}
                className="w-full pl-3 pr-7 py-2 rounded-xl text-xs outline-none appearance-none transition-all"
                style={{ background: "var(--input-bg)", border: "1px solid var(--input-border)", color: "var(--text-strong)" }}>
                <option value="date">{t.transactionList.date}</option>
                <option value="amount">{t.transactionList.amount}</option>
              </select>
              <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-3 w-3 pointer-events-none" style={{ color: "var(--text-subtle)" }} />
            </div>
          </div>
        </div>

        {/* Clear buttons */}
        <div className="grid grid-cols-2 gap-2">
          <button onClick={() => setConfirm("history")}
            className="flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-medium transition-all"
            style={{ background: "rgba(245,158,11,0.08)", border: "1px solid rgba(245,158,11,0.15)", color: "#f59e0b" }}>
            <History className="h-3.5 w-3.5" /> Очистить историю
          </button>
          <button onClick={() => setConfirm("all")}
            className="flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-medium transition-all"
            style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.15)", color: "#ef4444" }}>
            <Trash2 className="h-3.5 w-3.5" /> Все данные
          </button>
        </div>
      </div>

      {/* Summary bar */}
      {filtered.length > 0 && (
        <div className="flex items-center justify-between px-3 py-2 rounded-xl text-xs" style={{ background: "var(--surface)", border: "1px solid var(--card-border)" }}>
          <span style={{ color: "var(--text-subtle)" }}>
            {filtered.length} операц{filtered.length === 1 ? "ия" : filtered.length < 5 ? "ии" : "ий"}{search ? " найдено" : ""}
          </span>
          <div className="flex gap-3">
            {totalIncome > 0 && <span className="font-semibold" style={{ color: "#10b981" }}>+₸{totalIncome.toLocaleString("ru-KZ", { maximumFractionDigits: 0 })}</span>}
            {totalExpenses > 0 && <span className="font-semibold" style={{ color: "#ef4444" }}>−₸{totalExpenses.toLocaleString("ru-KZ", { maximumFractionDigits: 0 })}</span>}
          </div>
        </div>
      )}

      {/* Transactions */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center py-12 rounded-2xl" style={{ background: "var(--card)", border: "1px solid var(--card-border)" }}>
          <Search className="h-10 w-10 mb-3 opacity-30" style={{ color: "var(--brand)" }} />
          <p className="text-sm font-medium" style={{ color: "var(--text-strong)" }}>{t.transactionList.notFound}</p>
          {search && <p className="text-xs mt-1" style={{ color: "var(--text-subtle)" }}>Попробуйте другой запрос</p>}
        </div>
      ) : (
        <div className="space-y-4">
          {groups.map(({ key, items }) => (
            <div key={key}>
              {key && (
                <div className="flex items-center gap-2 mb-2 px-1">
                  <span className="text-xs font-semibold" style={{ color: "var(--text-subtle)" }}>{key}</span>
                  <div className="flex-1 h-px" style={{ background: "var(--divider)" }} />
                  <span className="text-[10px]" style={{ color: "var(--text-dim)" }}>{items.length}</span>
                </div>
              )}
              <div className="space-y-2">
                {items.map(tx => {
                  const member = getMember(tx.memberId);
                  return (
                    <div key={tx.id} className="px-3 py-3 transition-all" style={{ background: "var(--card)", border: "1px solid var(--card-border)", borderRadius: "12px" }}
                      onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.borderColor = "var(--tx-hover-border)"; }}
                      onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.borderColor = "var(--card-border)"; }}>
                      <div className="flex items-center gap-2.5">
                        {/* Emoji icon */}
                        <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 text-base"
                          style={{ background: tx.type === "income" ? "rgba(16,185,129,0.1)" : "rgba(239,68,68,0.08)" }}>
                          {catEmoji(tx.category)}
                        </div>

                        {/* Details */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <p className="text-sm font-medium truncate flex-1 min-w-0" style={{ color: "var(--text-strong)" }}>{tx.description}</p>
                            <p className="font-bold text-sm shrink-0" style={{ color: tx.type === "income" ? "#10b981" : "#ef4444" }}>
                              {tx.type === "income" ? "+" : "−"}₸{tx.amount.toLocaleString("ru-KZ", { maximumFractionDigits: 0 })}
                            </p>
                          </div>
                          <div className="flex items-center justify-between mt-0.5">
                            <span className="text-[10px]" style={{ color: "var(--text-subtle)" }}>{translateCategory(tx.category)}</span>
                            <div className="flex items-center gap-1.5">
                              {member && (
                                <div className="w-4 h-4 rounded-full flex items-center justify-center" style={{ backgroundColor: member.color }}>
                                  <User className="h-2.5 w-2.5 text-white" />
                                </div>
                              )}
                              <span className="text-[10px]" style={{ color: "var(--text-dim)" }}>
                                {format(new Date(tx.date), "HH:mm", { locale: ru })}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Delete */}
                        <button onClick={() => handleDelete(tx.id)}
                          className="w-7 h-7 flex items-center justify-center rounded-lg shrink-0 transition-all"
                          style={{ color: "var(--text-dim)" }}
                          onMouseEnter={e => { const b = e.currentTarget as HTMLButtonElement; b.style.color = "#ef4444"; b.style.background = "rgba(239,68,68,0.1)"; }}
                          onMouseLeave={e => { const b = e.currentTarget as HTMLButtonElement; b.style.color = "var(--text-dim)"; b.style.background = "transparent"; }}>
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
