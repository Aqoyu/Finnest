import { useState } from "react";
import { Plus, Zap } from "lucide-react";
import { type FamilyMember } from "./MemberSelector";
import { useLanguage } from "../context/LanguageContext";
import { catEmoji } from "../utils/categoryEmoji";
import { toast } from "sonner";

interface Transaction {
  id: string; type: "income" | "expense"; amount: number;
  category: string; description: string; date: string; memberId: string;
}
interface AddTransactionProps {
  onAddTransaction: (transaction: Transaction) => void;
  members: FamilyMember[];
  activeUserId: string;
}

const INCOME_CATEGORY_KEYS  = ["Зарплата", "Фриланс", "Инвестиции", "Подарок", "Другой доход"];
const EXPENSE_CATEGORY_KEYS = ["Продукты", "Транспорт", "Коммунальные услуги", "Развлечения", "Здоровье", "Образование", "Покупки", "Рестораны", "Другие расходы"];

const EXPENSE_PRESETS = [
  { label: "Кофе",     amount: "800",   category: "Рестораны",   description: "Кофе" },
  { label: "Обед",     amount: "2000",  category: "Рестораны",   description: "Обед" },
  { label: "Такси",    amount: "1500",  category: "Транспорт",   description: "Такси" },
  { label: "Продукты", amount: "5000",  category: "Продукты",    description: "Продукты" },
  { label: "Аптека",   amount: "3000",  category: "Здоровье",    description: "Аптека" },
  { label: "Кино",     amount: "2500",  category: "Развлечения", description: "Кино" },
];
const INCOME_PRESETS = [
  { label: "Зарплата", amount: "250000", category: "Зарплата", description: "Зарплата" },
  { label: "Фриланс",  amount: "50000",  category: "Фриланс",  description: "Фриланс" },
  { label: "Подарок",  amount: "10000",  category: "Подарок",  description: "Подарок" },
];

const todayISO = () => new Date().toISOString().split("T")[0];

const card: React.CSSProperties = {
  background: "var(--card)",
  border: "1px solid var(--card-border)",
  borderRadius: "14px",
};

const inputStyle: React.CSSProperties = {
  background: "var(--input-bg)",
  border: "1px solid var(--input-border)",
  color: "var(--text-strong)",
  borderRadius: "10px",
  width: "100%",
  padding: "10px 12px",
  fontSize: "14px",
  outline: "none",
  transition: "border-color 0.15s",
};

export function AddTransaction({ onAddTransaction, members, activeUserId }: AddTransactionProps) {
  const { t, translateCategory } = useLanguage();

  const [type,        setType]        = useState<"income" | "expense">("expense");
  const [amount,      setAmount]      = useState("");
  const [category,    setCategory]    = useState("");
  const [description, setDescription] = useState("");
  const [date,        setDate]        = useState(todayISO());

  const activeUser   = members.find(m => m.id === activeUserId);
  const categoryKeys = type === "income" ? INCOME_CATEGORY_KEYS : EXPENSE_CATEGORY_KEYS;
  const presets      = type === "income" ? INCOME_PRESETS : EXPENSE_PRESETS;

  const applyPreset = (p: typeof presets[number]) => {
    setAmount(p.amount); setCategory(p.category); setDescription(p.description);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || !category || !description) { toast.error(t.addTransaction.fillAllFields); return; }
    const amountNum = parseFloat(amount);
    if (isNaN(amountNum) || amountNum <= 0) { toast.error(t.addTransaction.invalidAmount); return; }

    onAddTransaction({
      id: Date.now().toString(),
      type, amount: amountNum, category, description,
      date: new Date(date + "T12:00:00").toISOString(),
      memberId: activeUserId,
    });

    setAmount(""); setCategory(""); setDescription(""); setDate(todayISO());
    toast.success(type === "income" ? t.addTransaction.incomeAdded : t.addTransaction.expenseAdded);
  };

  if (members.length === 0) {
    return (
      <div className="flex flex-col items-center py-10 px-4 rounded-2xl" style={card}>
        <Plus className="h-10 w-10 mb-3 opacity-30" style={{ color: "var(--brand)" }} />
        <p className="text-sm font-medium" style={{ color: "var(--text-strong)" }}>{t.addTransaction.noMembersTitle}</p>
        <p className="text-xs mt-1" style={{ color: "var(--text-subtle)" }}>{t.addTransaction.noMembersHint}</p>
      </div>
    );
  }

  const focusIn = (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) => {
    e.target.style.borderColor = "var(--input-focus-border)";
    e.target.style.boxShadow = "var(--brand-focus)";
  };
  const focusOut = (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) => {
    e.target.style.borderColor = "var(--input-border)";
    e.target.style.boxShadow = "none";
  };

  return (
    <div className="p-5 space-y-4" style={card}>
      <h2 className="text-base font-semibold" style={{ color: "var(--text-strong)", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
        {t.addTransaction.title}
      </h2>

      {/* Active user */}
      {activeUser && (
        <div className="flex items-center gap-3 p-3 rounded-xl" style={{ background: "rgba(232,160,32,0.06)", border: "1px solid rgba(232,160,32,0.12)" }}>
          <div className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0"
            style={{ backgroundColor: activeUser.color }}>
            {activeUser.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="font-semibold text-sm" style={{ color: "var(--text-strong)" }}>{activeUser.name}</p>
            <p className="text-[10px]" style={{ color: "var(--text-subtle)" }}>{t.profileSelector.currentProfile}</p>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Type toggle */}
        <div className="space-y-1.5">
          <label className="text-xs font-medium" style={{ color: "var(--text-subtle)" }}>{t.addTransaction.type}</label>
          <div className="grid grid-cols-2 gap-2">
            {(["expense", "income"] as const).map(tp => (
              <button key={tp} type="button" onClick={() => { setType(tp); setCategory(""); }}
                className="py-2.5 rounded-xl text-sm font-semibold transition-all"
                style={type === tp
                  ? tp === "expense"
                    ? { background: "rgba(239,68,68,0.15)", border: "1px solid rgba(239,68,68,0.4)", color: "#f87171" }
                    : { background: "rgba(16,185,129,0.15)", border: "1px solid rgba(16,185,129,0.4)", color: "#34d399" }
                  : { background: "var(--surface)", border: "1px solid var(--card-border)", color: "var(--text-subtle)" }
                }>
                {tp === "expense" ? t.addTransaction.expense : t.addTransaction.income}
              </button>
            ))}
          </div>
        </div>

        {/* Quick presets */}
        <div className="space-y-1.5">
          <label className="text-xs font-medium flex items-center gap-1" style={{ color: "var(--text-subtle)" }}>
            <Zap className="h-3 w-3" style={{ color: "var(--brand)" }} /> Быстрый выбор
          </label>
          <div className="flex flex-wrap gap-1.5">
            {presets.map(p => (
              <button key={p.label} type="button" onClick={() => applyPreset(p)}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-medium transition-all active:scale-95"
                style={{ background: "var(--preset-bg)", border: "1px solid var(--preset-border)", color: "var(--preset-text)" }}
                onMouseEnter={e => { const b = e.currentTarget as HTMLButtonElement; b.style.borderColor = "var(--brand-25)"; b.style.color = "var(--brand)"; }}
                onMouseLeave={e => { const b = e.currentTarget as HTMLButtonElement; b.style.borderColor = "var(--preset-border)"; b.style.color = "var(--preset-text)"; }}>
                <span>{catEmoji(p.category)}</span>
                <span>{p.label}</span>
                <span className="text-[10px]" style={{ color: "var(--text-dim)" }}>₸{Number(p.amount).toLocaleString("ru-KZ")}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Amount */}
        <div className="space-y-1.5">
          <label className="text-xs font-medium" style={{ color: "var(--text-subtle)" }}>{t.addTransaction.amount}</label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 font-semibold text-sm" style={{ color: "var(--text-subtle)" }}>₸</span>
            <input id="amount" type="number" step="1" placeholder="0" value={amount}
              onChange={e => setAmount(e.target.value)}
              className="pl-8 text-base font-bold"
              style={{ ...inputStyle }}
              onFocus={focusIn}
              onBlur={focusOut}
            />
          </div>
        </div>

        {/* Category */}
        <div className="space-y-1.5">
          <label className="text-xs font-medium" style={{ color: "var(--text-subtle)" }}>{t.addTransaction.category}</label>
          <div className="relative">
            <select value={category} onChange={e => setCategory(e.target.value)}
              className="w-full pl-3 pr-8 py-2.5 rounded-xl text-sm outline-none appearance-none"
              style={{ ...inputStyle, cursor: "pointer" }}
              onFocus={focusIn}
              onBlur={focusOut}>
              <option value="" style={{ background: "var(--input-bg)" }}>{t.addTransaction.selectCategory}</option>
              {categoryKeys.map(key => (
                <option key={key} value={key} style={{ background: "var(--input-bg)" }}>{catEmoji(key)} {translateCategory(key)}</option>
              ))}
            </select>
            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: "var(--text-subtle)" }}>▾</div>
          </div>
        </div>

        {/* Description */}
        <div className="space-y-1.5">
          <label className="text-xs font-medium" style={{ color: "var(--text-subtle)" }}>{t.addTransaction.description}</label>
          <input placeholder={t.addTransaction.descriptionPlaceholder}
            value={description} onChange={e => setDescription(e.target.value)}
            style={inputStyle}
            onFocus={focusIn}
            onBlur={focusOut}
          />
        </div>

        {/* Date */}
        <div className="space-y-1.5">
          <label className="text-xs font-medium" style={{ color: "var(--text-subtle)" }}>Дата</label>
          <input type="date" value={date} onChange={e => setDate(e.target.value)} max={todayISO()}
            style={inputStyle}
            onFocus={focusIn}
            onBlur={focusOut}
          />
        </div>

        <button type="submit"
          className="w-full py-3 rounded-xl font-semibold text-sm transition-all flex items-center justify-center gap-2"
          style={{
            background: "linear-gradient(135deg, #E8A020 0%, #F0B429 100%)",
            color: "var(--primary-foreground)",
            boxShadow: "0 4px 20px rgba(232,160,32,0.25)",
          }}>
          <Plus className="h-4 w-4" />{t.addTransaction.addButton}
        </button>
      </form>
    </div>
  );
}
