import { useState } from "react";
import {
  Wallet, TrendingUp, TrendingDown, Target,
  Plus, Pencil, Trash2, Check, ChevronLeft, ChevronRight,
  Eye, EyeOff, Calendar, Flame, AlertTriangle, User,
} from "lucide-react";

import { FinancialChart } from "./FinancialChart";
import { useLanguage } from "../context/LanguageContext";
import { catEmoji } from "../utils/categoryEmoji";
import type { SavingsGoal } from "../pages/MainApp";
import { format } from "date-fns";
import { ru } from "date-fns/locale";
import confetti from "canvas-confetti";

interface Transaction {
  id: string; type: "income" | "expense"; amount: number;
  category: string; description: string; date: string; memberId: string;
}
interface FamilyMember { id: string; name: string; color: string; }
interface Budget { category: string; limit: number; }

interface DashboardProps {
  transactions: Transaction[];
  members: FamilyMember[];
  selectedMemberId: string | null;
  goals: SavingsGoal[];
  onUpdateGoals: (goals: SavingsGoal[]) => void;
  budgets?: Budget[];
}

const GOAL_COLORS = ["#E8A020","#06b6d4","#8b5cf6","#10b981","#ef4444","#f97316","#3b82f6","#ec4899"];

const card: React.CSSProperties = {
  background: "var(--card)",
  border: "1px solid var(--card-border)",
  borderRadius: "14px",
};

const cardGlass: React.CSSProperties = {
  background: "var(--card)",
  border: "1px solid var(--card-border)",
  borderRadius: "14px",
  backdropFilter: "var(--card-blur)",
};

function GoalForm({ initial, onSave, onCancel }: {
  initial?: Partial<SavingsGoal>;
  onSave: (g: Omit<SavingsGoal, "id">) => void;
  onCancel: () => void;
}) {
  const [name, setName]         = useState(initial?.name ?? "");
  const [target, setTarget]     = useState(initial?.targetAmount?.toString() ?? "");
  const [current, setCurrent]   = useState(initial?.currentAmount?.toString() ?? "0");
  const [deadline, setDeadline] = useState(initial?.deadline ?? "");
  const [color, setColor]       = useState(initial?.color ?? GOAL_COLORS[0]);
  const valid = name.trim() && Number(target) > 0;

  const inp: React.CSSProperties = {
    background: "var(--goal-form-bg)", border: "1px solid var(--goal-form-border)",
    color: "var(--text-strong)", borderRadius: "10px", width: "100%",
    padding: "8px 12px", fontSize: "13px", outline: "none",
  };

  return (
    <div className="space-y-3 p-4 rounded-xl" style={{ background: "var(--goal-form-bg)", border: "1px solid var(--goal-form-border)" }}>
      <input value={name} onChange={e => setName(e.target.value)} placeholder="Название (напр. Отпуск 🏖️)" style={inp} />
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="text-[10px] block mb-1" style={{ color: "var(--text-subtle)" }}>Цель (₸)</label>
          <input type="number" value={target} onChange={e => setTarget(e.target.value)} placeholder="500 000" style={inp} />
        </div>
        <div>
          <label className="text-[10px] block mb-1" style={{ color: "var(--text-subtle)" }}>Накоплено (₸)</label>
          <input type="number" value={current} onChange={e => setCurrent(e.target.value)} placeholder="0" style={inp} />
        </div>
      </div>
      <div>
        <label className="text-[10px] block mb-1" style={{ color: "var(--text-subtle)" }}>Срок (необязательно)</label>
        <input type="date" value={deadline} onChange={e => setDeadline(e.target.value)} style={inp} />
      </div>
      <div>
        <label className="text-[10px] block mb-1.5" style={{ color: "var(--text-subtle)" }}>Цвет</label>
        <div className="flex gap-2 flex-wrap">
          {GOAL_COLORS.map(c => (
            <button key={c} onClick={() => setColor(c)}
              className="w-5 h-5 rounded-full transition-transform"
              style={{ backgroundColor: c, transform: color === c ? "scale(1.3)" : "scale(1)", outline: color === c ? `2px solid ${c}` : "none", outlineOffset: "2px" }} />
          ))}
        </div>
      </div>
      <div className="flex gap-2">
        <button onClick={onCancel}
          className="flex-1 py-2 rounded-xl text-xs font-medium transition-colors"
          style={{ border: "1px solid var(--card-border)", color: "var(--text-subtle)" }}>Отмена</button>
        <button disabled={!valid}
          onClick={() => onSave({ name: name.trim(), targetAmount: Number(target), currentAmount: Math.min(Number(current), Number(target)), deadline: deadline || undefined, color })}
          className="flex-1 py-2 rounded-xl text-xs font-bold transition-all disabled:opacity-40"
          style={{ background: "var(--brand-grad)", color: "var(--primary-foreground)" }}>
          <Check className="h-3.5 w-3.5 inline mr-1" />Сохранить
        </button>
      </div>
    </div>
  );
}

function FinancialCompass({ income, expenses, privacy }: { income: number; expenses: number; privacy: boolean }) {
  const now = new Date();
  const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  const dayOfMonth  = now.getDate();
  const daysLeft    = daysInMonth - dayOfMonth + 1;
  const monthPct    = Math.round((dayOfMonth / daysInMonth) * 100);
  const budgetPct   = income > 0 ? Math.round((expenses / income) * 100) : 0;
  const remaining   = income - expenses;
  const dailyBudget = daysLeft > 0 && remaining > 0 ? Math.round(remaining / daysLeft) : 0;
  const avgDailySpend = dayOfMonth > 0 ? Math.round(expenses / dayOfMonth) : 0;

  const ideal  = income > 0 ? income / daysInMonth : 0;
  const actual = dayOfMonth > 0 ? expenses / dayOfMonth : 0;
  const ratio  = ideal > 0 ? actual / ideal : 1;
  const status = ratio <= 0.85
    ? { color: "#10b981", label: "Отлично! В рамках бюджета", emoji: "🟢" }
    : ratio <= 1.1
    ? { color: "#f59e0b", label: "Осторожно, темп высокий",  emoji: "🟡" }
    : { color: "#ef4444", label: "Превышение бюджета!",      emoji: "🔴" };

  const R = 44; const CX = 56; const CY = 56;
  const circ       = 2 * Math.PI * R;
  const dashMonth  = (monthPct / 100) * circ;
  const dashBudget = (Math.min(budgetPct, 100) / 100) * circ;

  const fmt = (n: number) => privacy ? "••••" : n.toLocaleString("ru-KZ");

  return (
    <div className="overflow-hidden relative p-4" style={{
      background: "var(--compass-bg)",
      border: "1px solid var(--brand-15)",
      borderRadius: "14px",
      boxShadow: "0 0 40px var(--brand-5)",
    }}>
      <div className="absolute inset-0 pointer-events-none" style={{
        background: "radial-gradient(ellipse at top right, var(--brand-10) 0%, transparent 60%)"
      }} />

      <div className="relative z-10">
        <div className="flex items-start justify-between mb-3">
          <div>
            <p className="text-[9px] font-semibold uppercase tracking-widest mb-0.5" style={{ color: "var(--text-subtle)" }}>Финансовый компас</p>
            <p className="text-xs font-semibold" style={{ color: "var(--text-strong)" }}>{status.emoji} {status.label}</p>
          </div>
          <div className="flex items-center gap-1 px-2 py-1 rounded-lg" style={{ background: "var(--brand-5)" }}>
            <Calendar className="h-3 w-3" style={{ color: "var(--text-subtle)" }} />
            <span className="text-[10px]" style={{ color: "var(--text-subtle)" }}>{daysLeft} дн.</span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="relative shrink-0">
            <svg width="112" height="112" className="-rotate-90">
              <circle cx={CX} cy={CY} r={R} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="8" />
              <circle cx={CX} cy={CY} r={R} fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth="8"
                strokeDasharray={`${dashMonth} ${circ}`} strokeLinecap="round" />
              <circle cx={CX} cy={CY} r={R} fill="none" stroke={status.color} strokeWidth="8"
                strokeDasharray={`${dashBudget} ${circ}`} strokeLinecap="round"
                style={{ filter: `drop-shadow(0 0 6px ${status.color}60)` }} />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-[9px]" style={{ color: "#5A6A85" }}>потрачено</span>
              <span className="text-white font-bold text-lg leading-none">{budgetPct}%</span>
              <span className="text-[9px]" style={{ color: "#5A6A85" }}>из дохода</span>
            </div>
          </div>

          <div className="flex-1 space-y-2">
            <div className="px-3 py-2.5 rounded-xl" style={{ background: "var(--brand-10)", border: "1px solid var(--brand-15)" }}>
              <p className="text-[9px] uppercase tracking-wider mb-0.5" style={{ color: "var(--text-subtle)" }}>Можно тратить в день</p>
              <p className="font-bold text-xl leading-tight" style={{ color: "var(--brand)" }}>
                {dailyBudget > 0 ? `₸${fmt(dailyBudget)}` : income === 0 ? "Нет дохода" : "Лимит"}
              </p>
            </div>
            <div className="grid grid-cols-2 gap-1.5">
              <div className="px-2.5 py-2 rounded-xl" style={{ background: "var(--brand-5)" }}>
                <p className="text-[8px] uppercase tracking-wider" style={{ color: "var(--text-subtle)" }}>В среднем/день</p>
                <p className="font-bold text-xs mt-0.5" style={{ color: "var(--text-strong)" }}>₸{fmt(avgDailySpend)}</p>
              </div>
              <div className="px-2.5 py-2 rounded-xl" style={{ background: "var(--brand-5)" }}>
                <p className="text-[8px] uppercase tracking-wider" style={{ color: "var(--text-subtle)" }}>Остаток</p>
                <p className="font-bold text-xs mt-0.5" style={{ color: remaining >= 0 ? "#10b981" : "#ef4444" }}>
                  {remaining >= 0 ? "" : "−"}₸{fmt(Math.abs(remaining))}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-3 space-y-1">
          <div className="flex justify-between text-[9px]" style={{ color: "var(--text-dim)" }}>
            <span>Время месяца {monthPct}%</span>
            <span>Бюджет {Math.min(budgetPct, 100)}%</span>
          </div>
          <div className="h-1 rounded-full overflow-hidden relative" style={{ background: "var(--divider)" }}>
            <div className="h-full rounded-full absolute" style={{ width: `${monthPct}%`, background: "rgba(255,255,255,0.15)" }} />
            <div className="h-full rounded-full absolute transition-all" style={{ width: `${Math.min(budgetPct, 100)}%`, backgroundColor: status.color, opacity: 0.7 }} />
          </div>
        </div>
      </div>
    </div>
  );
}

function TrendBarChart({ data }: { data: { month: string; income: number; expenses: number }[] }) {
  const max = Math.max(...data.flatMap(d => [d.income, d.expenses]), 1);
  const W = 280; const H = 100; const barW = 10; const gap = 4;
  const groupW = barW * 2 + gap + 8;
  const startX = (W - groupW * data.length) / 2;

  return (
    <svg width="100%" viewBox={`0 0 ${W} ${H + 16}`} style={{ overflow: "visible" }}>
      {/* Horizontal gridlines */}
      {[0.25, 0.5, 0.75, 1].map(t => (
        <line key={t} x1={0} y1={H - t * H} x2={W} y2={H - t * H}
          stroke="rgba(255,255,255,0.04)" strokeWidth={1} />
      ))}

      {data.map((d, i) => {
        const x = startX + i * groupW;
        const ih = Math.max(2, (d.income   / max) * H);
        const eh = Math.max(2, (d.expenses / max) * H);
        return (
          <g key={`bar-${i}`}>
            {/* Income bar */}
            <rect x={x} y={H - ih} width={barW} height={ih} fill="#10b981" rx={2} opacity={0.85} />
            {/* Expense bar */}
            <rect x={x + barW + gap} y={H - eh} width={barW} height={eh} fill="#ef4444" rx={2} opacity={0.85} />
            {/* Month label */}
            <text x={x + barW + gap / 2} y={H + 13} textAnchor="middle" fontSize={9} fill="var(--text-dim)" fontFamily="Inter,sans-serif">
              {d.month}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

export function Dashboard({ transactions, members, selectedMemberId, goals, onUpdateGoals, budgets = [] }: DashboardProps) {
  const { t, translateCategory } = useLanguage();
  const [privacy,       setPrivacy]       = useState(false);
  const [monthOffset,   setMonthOffset]   = useState(0);
  const [showGoalForm,  setShowGoalForm]  = useState(false);
  const [editingGoalId, setEditingGoalId] = useState<string | null>(null);

  const now            = new Date();
  const targetDate     = new Date(now.getFullYear(), now.getMonth() + monthOffset, 1);
  const isCurrentMonth = monthOffset === 0;
  const monthLabel     = targetDate.toLocaleDateString("ru-KZ", { month: "long", year: "numeric" });
  const monthStart     = new Date(targetDate.getFullYear(), targetDate.getMonth(), 1);
  const monthEnd       = new Date(targetDate.getFullYear(), targetDate.getMonth() + 1, 0, 23, 59, 59);

  const memberFiltered = selectedMemberId
    ? transactions.filter(tx => tx.memberId === selectedMemberId)
    : transactions;

  const monthTx = memberFiltered.filter(tx => {
    const d = new Date(tx.date);
    return d >= monthStart && d <= monthEnd;
  });

  const totalIncome   = monthTx.filter(tx => tx.type === "income").reduce((s, tx) => s + tx.amount, 0);
  const totalExpenses = monthTx.filter(tx => tx.type === "expense").reduce((s, tx) => s + tx.amount, 0);
  const balance       = totalIncome - totalExpenses;

  const fmt = (n: number) => privacy ? "••••" : n.toLocaleString("ru-KZ", { maximumFractionDigits: 0 });

  const trendData = Array.from({ length: 6 }, (_, i) => {
    const d     = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
    const start = new Date(d.getFullYear(), d.getMonth(), 1);
    const end   = new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59);
    const mTx   = memberFiltered.filter(tx => { const td = new Date(tx.date); return td >= start && td <= end; });
    return {
      month:    d.toLocaleDateString("ru-KZ", { month: "short" }),
      income:   Math.round(mTx.filter(tx => tx.type === "income").reduce((s, tx) => s + tx.amount, 0)),
      expenses: Math.round(mTx.filter(tx => tx.type === "expense").reduce((s, tx) => s + tx.amount, 0)),
    };
  });
  const hasTrendData = trendData.some(d => d.income > 0 || d.expenses > 0);

  const budgetAlerts = budgets
    .map(b => {
      const spent = monthTx.filter(tx => tx.type === "expense" && tx.category === b.category)
        .reduce((s, tx) => s + tx.amount, 0);
      const pct = b.limit > 0 ? Math.round(spent / b.limit * 100) : 0;
      return { ...b, spent, pct };
    })
    .filter(b => b.pct >= 80)
    .sort((a, b) => b.pct - a.pct);

  const expCats = Object.entries(
    monthTx.filter(tx => tx.type === "expense")
      .reduce((acc, tx) => { acc[tx.category] = (acc[tx.category] || 0) + tx.amount; return acc; }, {} as Record<string, number>)
  ).reduce((acc, [k, v]) => {
    const name = translateCategory(k);
    const ex = acc.find(i => i.name === name);
    if (ex) ex.value += v; else acc.push({ name, value: v });
    return acc;
  }, [] as { name: string; value: number }[]).sort((a, b) => b.value - a.value).slice(0, 5);

  const incCats = Object.entries(
    monthTx.filter(tx => tx.type === "income")
      .reduce((acc, tx) => { acc[tx.category] = (acc[tx.category] || 0) + tx.amount; return acc; }, {} as Record<string, number>)
  ).reduce((acc, [k, v]) => {
    const name = translateCategory(k);
    const ex = acc.find(i => i.name === name);
    if (ex) ex.value += v; else acc.push({ name, value: v });
    return acc;
  }, [] as { name: string; value: number }[]).sort((a, b) => b.value - a.value).slice(0, 5);

  const memberStats = members.map(m => {
    const mt = monthTx.filter(tx => tx.memberId === m.id);
    const inc = mt.filter(tx => tx.type === "income").reduce((s, tx) => s + tx.amount, 0);
    const exp = mt.filter(tx => tx.type === "expense").reduce((s, tx) => s + tx.amount, 0);
    return { member: m, income: inc, expenses: exp, balance: inc - exp };
  });

  const recentTx = [...monthTx]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5);

  const fireConfetti = () => confetti({ particleCount: 120, spread: 80, origin: { y: 0.55 }, colors: ["#E8A020","#F0B429","#10b981","#06b6d4"] });

  const addGoal = (data: Omit<SavingsGoal, "id">) => {
    if (data.currentAmount >= data.targetAmount) fireConfetti();
    onUpdateGoals([...goals, { ...data, id: Date.now().toString() }]);
    setShowGoalForm(false);
  };
  const updateGoal = (id: string, data: Omit<SavingsGoal, "id">) => {
    const old = goals.find(g => g.id === id);
    if (old && old.currentAmount < old.targetAmount && data.currentAmount >= data.targetAmount) fireConfetti();
    onUpdateGoals(goals.map(g => g.id === id ? { ...data, id } : g));
    setEditingGoalId(null);
  };
  const deleteGoal = (id: string) => onUpdateGoals(goals.filter(g => g.id !== id));

  return (
    <div className="space-y-3">
      {/* Month navigator */}
      <div className="flex items-center justify-between px-3 py-2 rounded-2xl" style={cardGlass}>
        <button onClick={() => setMonthOffset(o => o - 1)}
          className="w-8 h-8 flex items-center justify-center rounded-xl transition-all"
          style={{ color: "var(--text-subtle)" }}
          onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.color = "var(--brand)"; }}
          onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.color = "var(--text-subtle)"; }}>
          <ChevronLeft className="h-4 w-4" />
        </button>
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold capitalize" style={{ color: "var(--text-strong)", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{monthLabel}</span>
          {!isCurrentMonth && (
            <button onClick={() => setMonthOffset(0)}
              className="text-[10px] font-medium px-2 py-0.5 rounded-lg transition-colors"
              style={{ background: "var(--brand-10)", color: "var(--brand)" }}>
              Сейчас
            </button>
          )}
        </div>
        <button onClick={() => setMonthOffset(o => Math.min(0, o + 1))} disabled={isCurrentMonth}
          className="w-8 h-8 flex items-center justify-center rounded-xl transition-all disabled:opacity-20"
          style={{ color: "var(--text-subtle)" }}
          onMouseEnter={e => { if (!isCurrentMonth) (e.currentTarget as HTMLButtonElement).style.color = "var(--brand)"; }}
          onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.color = "var(--text-subtle)"; }}>
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      {/* Financial Compass */}
      {isCurrentMonth && <FinancialCompass income={totalIncome} expenses={totalExpenses} privacy={privacy} />}

      {/* Budget alerts */}
      {isCurrentMonth && budgetAlerts.length > 0 && (
        <div className="space-y-1.5">
          {budgetAlerts.map(b => (
            <div key={b.category} className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm"
              style={{
                background: b.pct >= 100 ? "rgba(239,68,68,0.08)" : "rgba(245,158,11,0.08)",
                border: `1px solid ${b.pct >= 100 ? "rgba(239,68,68,0.2)" : "rgba(245,158,11,0.2)"}`,
              }}>
              <AlertTriangle className="h-4 w-4 shrink-0" style={{ color: b.pct >= 100 ? "#ef4444" : "#f59e0b" }} />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold" style={{ color: b.pct >= 100 ? "#f87171" : "#fbbf24" }}>
                  {catEmoji(b.category)} {translateCategory(b.category)} — {b.pct}%
                </p>
                <div className="h-1 rounded-full mt-1 overflow-hidden" style={{ background: "rgba(255,255,255,0.06)" }}>
                  <div className="h-full rounded-full" style={{ width: `${Math.min(b.pct, 100)}%`, backgroundColor: b.pct >= 100 ? "#ef4444" : "#f59e0b" }} />
                </div>
              </div>
              <span className="text-[10px] font-bold shrink-0" style={{ color: b.pct >= 100 ? "#f87171" : "#fbbf24" }}>
                {privacy ? "₸••••" : `₸${b.spent.toLocaleString("ru-KZ", { maximumFractionDigits: 0 })}`}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Balance card */}
      <div className="p-5 relative overflow-hidden" style={{
        background: "var(--balance-bg)",
        border: "1px solid var(--balance-border)",
        borderRadius: "14px",
        boxShadow: "0 8px 32px var(--brand-10)",
      }}>
        <div className="absolute inset-0 pointer-events-none" style={{
          background: "radial-gradient(ellipse at top right, var(--brand-15) 0%, transparent 60%)"
        }} />
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-[10px] uppercase tracking-widest font-medium" style={{ color: "var(--brand)" }}>
                {selectedMemberId ? t.dashboard.balance : t.dashboard.totalBalance}
              </p>
              <p className="text-xs mt-0.5" style={{ color: "var(--text-subtle)" }}>
                {balance >= 0 ? t.dashboard.positiveBalance : t.dashboard.negativeBalance}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => setPrivacy(p => !p)}
                className="w-8 h-8 flex items-center justify-center rounded-xl transition-all"
                style={{ background: "var(--brand-10)", color: "var(--brand)" }}>
                {privacy ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
              <div className="w-8 h-8 flex items-center justify-center rounded-xl" style={{ background: "var(--brand-10)" }}>
                <Wallet className="h-4 w-4" style={{ color: "var(--brand)" }} />
              </div>
            </div>
          </div>
          <div className="text-3xl font-bold" style={{ color: "var(--text-strong)", fontFamily: "'Plus Jakarta Sans', sans-serif", letterSpacing: "-0.02em" }}>
            {privacy ? "₸ ••••••" : `₸${Math.abs(balance).toLocaleString("ru-KZ", { minimumFractionDigits: 0 })}`}
          </div>
        </div>
      </div>

      {/* Income / Expense */}
      <div className="grid grid-cols-2 gap-3">
        {[
          { type: "income" as const, label: t.dashboard.income, Icon: TrendingUp, color: "#10b981", bg: "var(--income-bg)", border: "var(--income-border)", value: totalIncome },
          { type: "expense" as const, label: t.dashboard.expenses, Icon: TrendingDown, color: "#ef4444", bg: "var(--expense-bg)", border: "var(--expense-border)", value: totalExpenses },
        ].map(({ type, label, Icon, color, bg, border, value }) => (
          <div key={type} className="p-4" style={{ ...card, background: bg, borderColor: border }}>
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-medium" style={{ color: "var(--text-subtle)" }}>{label}</p>
              <div className="w-7 h-7 flex items-center justify-center rounded-lg" style={{ background: `${color}20` }}>
                <Icon className="h-3.5 w-3.5" style={{ color }} />
              </div>
            </div>
            <p className="text-base font-bold" style={{ color, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
              {privacy ? "₸••••" : `₸${fmt(value)}`}
            </p>
            <p className="text-[10px] mt-0.5" style={{ color: "var(--text-dim)" }}>
              {monthTx.filter(tx => tx.type === type).length} {t.dashboard.transactionShort}
            </p>
          </div>
        ))}
      </div>

      {/* Recent transactions */}
      {recentTx.length > 0 && (
        <div className="p-4" style={card}>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Flame className="h-4 w-4" style={{ color: "var(--brand)" }} />
              <h3 className="text-sm font-semibold" style={{ color: "var(--text-strong)", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                Последние операции
              </h3>
            </div>
            <span className="text-[10px] capitalize" style={{ color: "var(--text-subtle)" }}>{monthLabel}</span>
          </div>
          <div className="space-y-0">
            {recentTx.map(tx => (
              <div key={tx.id} className="flex items-center gap-2.5 py-2.5" style={{ borderBottom: "1px solid var(--divider)" }}>
                <span className="text-base leading-none shrink-0">{catEmoji(tx.category)}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium truncate" style={{ color: "var(--text-strong)" }}>{tx.description}</p>
                  <p className="text-[10px]" style={{ color: "var(--text-subtle)" }}>{translateCategory(tx.category)}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-xs font-bold" style={{ color: tx.type === "income" ? "#10b981" : "#ef4444" }}>
                    {tx.type === "income" ? "+" : "−"}{privacy ? "••••" : `₸${tx.amount.toLocaleString("ru-KZ", { maximumFractionDigits: 0 })}`}
                  </p>
                  <p className="text-[9px]" style={{ color: "var(--text-dim)" }}>{format(new Date(tx.date), "d MMM", { locale: ru })}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Savings goals */}
      <div className="p-4" style={card}>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Target className="h-4 w-4" style={{ color: "var(--brand)" }} />
            <h3 className="text-sm font-semibold" style={{ color: "var(--text-strong)", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
              Цели накопления
            </h3>
          </div>
          <button onClick={() => { setShowGoalForm(true); setEditingGoalId(null); }}
            className="w-7 h-7 rounded-xl flex items-center justify-center transition-all"
            style={{ background: "var(--brand-grad)" }}>
            <Plus className="h-3.5 w-3.5" style={{ color: "var(--primary-foreground)" }} />
          </button>
        </div>

        <div className="space-y-3">
          {showGoalForm && !editingGoalId && <GoalForm onSave={addGoal} onCancel={() => setShowGoalForm(false)} />}
          {goals.length === 0 && !showGoalForm && (
            <div className="text-center py-6">
              <Target className="h-8 w-8 mx-auto mb-2" style={{ color: "var(--text-dim)" }} />
              <p className="text-xs" style={{ color: "var(--text-subtle)" }}>Нет целей. Нажмите + чтобы добавить</p>
            </div>
          )}
          {goals.map(goal => {
            const pct  = Math.min(100, goal.targetAmount > 0 ? Math.round(goal.currentAmount / goal.targetAmount * 100) : 0);
            const done = pct >= 100;
            if (editingGoalId === goal.id) {
              return <GoalForm key={goal.id} initial={goal} onSave={data => updateGoal(goal.id, data)} onCancel={() => setEditingGoalId(null)} />;
            }
            const daysToGoal = goal.deadline
              ? Math.ceil((new Date(goal.deadline).getTime() - Date.now()) / 86400000)
              : null;
            const monthlyNeeded = (goal.deadline && !done)
              ? Math.ceil((goal.targetAmount - goal.currentAmount) / Math.max(1, Math.ceil(daysToGoal! / 30)))
              : null;

            return (
              <div key={goal.id} className="p-3 rounded-xl" style={{ background: "var(--surface)", border: "1px solid var(--card-border)" }}>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: goal.color }} />
                    <p className="text-sm font-semibold truncate" style={{ color: "var(--text-strong)" }}>{goal.name}</p>
                    {done && <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-lg shrink-0" style={{ background: "rgba(16,185,129,0.15)", color: "#10b981" }}>🎉 Готово!</span>}
                  </div>
                  <div className="flex gap-1 shrink-0">
                    <button onClick={() => { setEditingGoalId(goal.id); setShowGoalForm(false); }}
                      className="w-6 h-6 rounded-lg flex items-center justify-center transition-colors"
                      style={{ color: "var(--text-dim)" }}
                      onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.color = "var(--brand)"; }}
                      onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.color = "var(--text-dim)"; }}>
                      <Pencil className="h-3 w-3" />
                    </button>
                    <button onClick={() => deleteGoal(goal.id)}
                      className="w-6 h-6 rounded-lg flex items-center justify-center transition-colors"
                      style={{ color: "var(--text-dim)" }}
                      onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.color = "#ef4444"; }}
                      onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.color = "var(--text-dim)"; }}>
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </div>
                </div>

                <div className="h-1.5 rounded-full overflow-hidden mb-1" style={{ background: "var(--divider)" }}>
                  <div className="h-full rounded-full transition-all duration-500" style={{ width: `${pct}%`, backgroundColor: goal.color }} />
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[10px]" style={{ color: "var(--text-subtle)" }}>
                    {privacy ? "₸•••• из ₸••••" : `₸${goal.currentAmount.toLocaleString("ru-KZ")} из ₸${goal.targetAmount.toLocaleString("ru-KZ")}`}
                  </span>
                  <span className="text-[10px] font-bold" style={{ color: goal.color }}>{pct}%</span>
                </div>
                {(goal.deadline || monthlyNeeded) && (
                  <div className="flex gap-3 mt-1.5 flex-wrap">
                    {goal.deadline && (
                      <span className="text-[10px]" style={{ color: "var(--text-dim)" }}>
                        📅 {daysToGoal !== null && daysToGoal >= 0 ? `${daysToGoal} дн.` : "Срок прошёл"}
                      </span>
                    )}
                    {monthlyNeeded && !done && (
                      <span className="text-[10px]" style={{ color: "var(--text-dim)" }}>
                        💰 {privacy ? "₸••••/мес" : `₸${monthlyNeeded.toLocaleString("ru-KZ")}/мес`}
                      </span>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Family members */}
      {!selectedMemberId && memberStats.length > 0 && (
        <div className="p-4" style={card}>
          <h3 className="text-sm font-semibold mb-3" style={{ color: "var(--text-strong)", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            {t.dashboard.byFamilyMembers}
          </h3>
          <div className="space-y-2">
            {memberStats.map(({ member, income, expenses, balance: bal }) => (
              <div key={member.id} className="flex items-center gap-3 p-3 rounded-xl" style={{ background: "var(--surface)", border: "1px solid var(--card-border)" }}>
                <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0" style={{ backgroundColor: member.color }}>
                  <User className="h-3.5 w-3.5 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-xs truncate" style={{ color: "var(--text-strong)" }}>{member.name}</p>
                  <div className="flex gap-1 text-[10px] mt-0.5">
                    <span style={{ color: "#10b981" }}>+₸{privacy ? "••••" : fmt(income)}</span>
                    <span style={{ color: "var(--text-dim)" }}>/</span>
                    <span style={{ color: "#ef4444" }}>−₸{privacy ? "••••" : fmt(expenses)}</span>
                  </div>
                </div>
                <span className="font-bold text-xs shrink-0" style={{ color: bal >= 0 ? "#10b981" : "#ef4444" }}>
                  {privacy ? "₸••••" : `₸${fmt(Math.abs(bal))}`}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 6-month trend */}
      {hasTrendData && (
        <div className="p-4" style={card}>
          <h3 className="text-sm font-semibold mb-3" style={{ color: "var(--text-strong)", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            Тренд за 6 месяцев
          </h3>
          <TrendBarChart data={trendData} />
          <div className="flex justify-center gap-4 mt-1">
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-sm" style={{ backgroundColor: "#10b981" }} />
              <span className="text-[10px]" style={{ color: "var(--text-subtle)" }}>Доходы</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-sm" style={{ backgroundColor: "#ef4444" }} />
              <span className="text-[10px]" style={{ color: "var(--text-subtle)" }}>Расходы</span>
            </div>
          </div>
        </div>
      )}

      {/* Category charts */}
      {expCats.length > 0 && (
        <div className="p-4" style={card}>
          <h3 className="text-sm font-semibold mb-2" style={{ color: "var(--text-strong)", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            {t.dashboard.expenseCategories}
          </h3>
          <FinancialChart data={expCats} />
        </div>
      )}
      {incCats.length > 0 && (
        <div className="p-4" style={card}>
          <h3 className="text-sm font-semibold mb-2" style={{ color: "var(--text-strong)", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            {t.dashboard.incomeCategories}
          </h3>
          <FinancialChart data={incCats} />
        </div>
      )}

      {monthTx.length === 0 && (
        <div className="flex flex-col items-center py-10 px-4 rounded-2xl" style={cardGlass}>
          <div className="w-14 h-14 rounded-full flex items-center justify-center mb-4" style={{ background: "var(--brand-10)" }}>
            <Wallet className="h-7 w-7" style={{ color: "var(--brand)", opacity: 0.5 }} />
          </div>
          <p className="text-sm font-medium mb-1" style={{ color: "var(--text-strong)" }}>{t.dashboard.noTransactions}</p>
          <p className="text-xs text-center" style={{ color: "var(--text-subtle)" }}>{t.dashboard.noTransactionsHint}</p>
        </div>
      )}
    </div>
  );
}
