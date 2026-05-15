import { useState, useRef, useCallback, useEffect } from "react";
import Papa from "papaparse";
import {
  Upload, FileText, X, Check, AlertCircle, ChevronDown, ChevronUp,
  Sparkles, TrendingDown, TrendingUp, RefreshCw, Zap, ShieldCheck,
} from "lucide-react";
import { Button } from "./ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { useLanguage } from "../context/LanguageContext";
import { toast } from "sonner";
import type { FamilyMember } from "./FamilyMemberManagement";

// ─── Types ────────────────────────────────────────────────────────────────────

interface ParsedTransaction {
  id: string; date: string; description: string;
  amount: number; type: "income" | "expense"; category: string; selected: boolean;
}
interface Transaction {
  id: string; type: "income" | "expense"; amount: number;
  category: string; description: string; date: string; memberId: string;
}
interface AIInsight { icon: string; text: string; color: "cyan"|"amber"|"green"|"red"|"purple"; }
interface Subscription { name: string; amount: number; }
interface Analysis {
  income: number; expenses: number; savings: number; savingsRate: number;
  topCategory: string; subscriptions: Subscription[]; insights: AIInsight[];
}
interface StatementImportProps {
  members: FamilyMember[];
  activeUserId: string;
  onImport: (transactions: Transaction[]) => void;
  onClose: () => void;
}

// ─── PDF text extraction (pdfjs v4 — no Math.sumPrecise, stable cdnjs) ────────

async function extractTextFromPDF(file: File): Promise<string> {
  const pdfjs = await import("pdfjs-dist");
  // pdfjs v4 is on cdnjs — guaranteed stable URL
  pdfjs.GlobalWorkerOptions.workerSrc =
    `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.mjs`;

  const pdf = await pdfjs.getDocument({ data: await file.arrayBuffer() }).promise;
  const lines: string[] = [];
  for (let p = 1; p <= pdf.numPages; p++) {
    const content = await (await pdf.getPage(p)).getTextContent();
    let lastY: number | null = null, cur = "";
    for (const item of content.items) {
      if ("str" in item) {
        const y = Math.round((item as { transform: number[] }).transform[5]);
        if (lastY !== null && Math.abs(y - lastY) > 3) {
          if (cur.trim()) lines.push(cur.trim()); cur = "";
        }
        cur += item.str + " "; lastY = y;
      }
    }
    if (cur.trim()) lines.push(cur.trim());
  }
  return lines.join("\n");
}

// ─── CSV extraction ───────────────────────────────────────────────────────────

async function extractTextFromCSV(file: File): Promise<string> {
  return new Promise((resolve) => {
    Papa.parse(file, {
      complete: (r) => resolve((r.data as string[][]).map(row => row.join("\t")).join("\n")),
      skipEmptyLines: true,
    });
  });
}

// ─── Category keywords ────────────────────────────────────────────────────────

const CATEGORIES: Record<string, string[]> = {
  "Продукты":            ["magnum","маgnum","small","смол","апорт","metro","метро","зеленый","green","супермаркет","продукт","grocery","bazaar","базар","жаңа","дүкен","market","маркет","глобус"],
  "Рестораны":           ["kfc","макдо","burger","бургер","pizza","пицца","sushi","суши","cafe","кафе","coffee","кофе","starbucks","restaurant","ресторан","столов","delivery","доставк","doner","шаурм","grill"],
  "Транспорт":           ["indrive","инdrive","uber","bolt","яндекс такси","yandex taxi","такси","qazaq oil","гелиос","helios","petrol","бензин","азс","заправк","bus","автобус","air astana","авиа","train","поезд","parking","парковк","транспорт"],
  "Здоровье":            ["аптека","apteka","pharmacy","клиник","больниц","hospital","доктор","doctor","dentist","стоматол","оптик","лаборатор","медицин"],
  "Коммунальные услуги": ["kcell","activ","beeline","tele2","алтел","altel","интернет","internet","коммунальн","электр","газ","вода","жкх","телеком"],
  "Развлечения":         ["netflix","spotify","apple","steam","google play","кино","cinema","theater","театр","concert","концерт","боулинг","bowling","karaoke","tiktok","youtube","подписк","figma","adobe","notion"],
  "Образование":         ["udemy","coursera","stepik","skillbox","курс","course","школ","school","универ","university","обучен","book","книг","учеб"],
  "Покупки":             ["wildberries","ozon","озон","lamoda","aliexpress","kaspi shop","sulpak","технодом","alser","mechta","меchta","clothes","одежд","shoes","обувь","electronics","техник","мебель"],
  "Зарплата":            ["зарплат","salary","оклад","аванс","выплат","начислен","жалақы"],
  "Другой доход":        ["возврат","refund","cashback","кэшбэк","пополнен","deposit","внесен"],
};

const SUB_KW = ["netflix","spotify","apple","google play","figma","adobe","notion","youtube","tele2","kcell","beeline","алтел","activ","подписк"];

function detectCategory(desc: string, type: "income"|"expense"): string {
  const low = desc.toLowerCase();
  for (const [cat, kws] of Object.entries(CATEGORIES)) {
    if (kws.some(kw => low.includes(kw))) {
      if (type === "income"  && (cat === "Зарплата" || cat === "Другой доход")) return cat;
      if (type === "expense" && cat !== "Зарплата" && cat !== "Другой доход") return cat;
    }
  }
  return type === "income" ? "Другой доход" : "Другие расходы";
}

// ─── Transaction parser ───────────────────────────────────────────────────────

const DATE_RE   = /\b(\d{2}[.\/-]\d{2}[.\/-]\d{2,4})\b/;
// Matches amounts with decimal part: "2 500,00" / "-1234.50" / "+ 50 000,00"
const AMOUNT_RE = /([+-]?\s*\d[\d ]*[.,]\d{2})\b/g;
// Fallback: whole-number amounts with currency symbol
const AMOUNT_KW = /(\d[\d ]*\d)\s*(?:тг|₸|KZT)\b/g;

function parseAmt(s: string): number {
  // Remove spaces (thousand-sep), normalise decimal comma → dot
  return parseFloat(s.replace(/\s/g, "").replace(",", "."));
}

function toISO(raw: string): string {
  const p = raw.split(/[.\/-]/);
  if (p.length === 3) {
    let [d, m, y] = p;
    if (y.length === 2) y = "20" + y;
    return `${y}-${m.padStart(2,"0")}-${d.padStart(2,"0")}`;
  }
  return new Date().toISOString().split("T")[0];
}

function parseTransactions(text: string): ParsedTransaction[] {
  const lines = text.split("\n");
  const results: ParsedTransaction[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const dateM = line.match(DATE_RE);
    if (!dateM) continue;

    // Strip the date from the line so "15.05" isn't mistaken for an amount
    const lineNoDate = line.replace(DATE_RE, "");

    // Search only the current line first; fall back to next line if no amount found
    let ms = [...lineNoDate.matchAll(AMOUNT_RE)];
    if (!ms.length) {
      const nextNoDate = (lines[i + 1] ?? "").replace(DATE_RE, "");
      ms = [...(lineNoDate + " " + nextNoDate).matchAll(AMOUNT_RE)];
    }

    // Fallback: whole-number amounts with currency marker
    if (!ms.length) {
      const kwMs = [...lineNoDate.matchAll(AMOUNT_KW)];
      if (kwMs.length) ms = kwMs as RegExpMatchArray[];
    }
    if (!ms.length) continue;

    // Pick the first signed amount (explicit +/-), otherwise first amount ≥ 10
    let amount = 0, rawAmt = "";
    const signed = ms.find(m => /^[+-]/.test(m[1].replace(/\s/g,"")));
    const candidate = signed ?? ms.find(m => Math.abs(parseAmt(m[1])) >= 10);
    if (candidate) { rawAmt = candidate[1]; amount = Math.abs(parseAmt(rawAmt)); }
    if (!amount) continue;

    // Determine type: explicit '-' sign → expense; explicit '+' → income; heuristic otherwise
    const cleanSign = rawAmt.replace(/\s/g, "");
    let type: "income"|"expense";
    if (cleanSign.startsWith("-")) type = "expense";
    else if (cleanSign.startsWith("+")) type = "income";
    else {
      // Heuristic: check for income keywords in line
      const lo = line.toLowerCase();
      type = /зачислен|поступл|salary|зарплат|аванс|возврат|refund|cashback|кэшбэк/i.test(lo)
        ? "income" : "expense";
    }

    // Clean description: remove date, all matched amounts, extra whitespace
    let desc = line;
    for (const m of ms) desc = desc.replace(m[1], "");
    desc = desc.replace(DATE_RE, "").replace(/\b\d[\d ]*[.,]\d{2}\b/g, "")
      .replace(/[₸тгKZT]+/g, "").replace(/\s{2,}/g, " ").trim();
    if (desc.length < 3) desc = lines[i + 1]?.trim() || "Операция";

    results.push({
      id: `t_${Date.now()}_${i}_${Math.random().toString(36).slice(2)}`,
      date: toISO(dateM[1]),
      description: desc.slice(0, 100),
      amount, type,
      category: detectCategory(desc, type),
      selected: true,
    });
  }
  return results.slice(0, 300);
}

// ─── Local analytics ──────────────────────────────────────────────────────────

function generateAnalysis(txs: ParsedTransaction[]): Analysis {
  const income   = txs.filter(t => t.type==="income").reduce((s,t)=>s+t.amount,0);
  const expenses = txs.filter(t => t.type==="expense").reduce((s,t)=>s+t.amount,0);
  const savings  = income - expenses;
  const savingsRate = income>0 ? Math.round(savings/income*100) : 0;

  const cats: Record<string,number> = {};
  txs.filter(t=>t.type==="expense").forEach(t=>{cats[t.category]=(cats[t.category]||0)+t.amount;});
  const sorted = Object.entries(cats).sort((a,b)=>b[1]-a[1]);
  const topCategory = sorted[0]?.[0] ?? "";

  const seen = new Set<string>();
  const subscriptions: Subscription[] = [];
  txs.filter(t=>t.type==="expense"&&SUB_KW.some(kw=>t.description.toLowerCase().includes(kw))).forEach(t=>{
    const k = t.description.toLowerCase().slice(0,20);
    if (!seen.has(k)){seen.add(k);subscriptions.push({name:t.description.slice(0,30),amount:t.amount});}
  });

  const insights: AIInsight[] = [];
  if (savingsRate>=20) insights.push({icon:"🏆",text:`Отлично! Норма сбережений ${savingsRate}%`,color:"green"});
  else if (savingsRate>0) insights.push({icon:"💡",text:`Сбережения ${savingsRate}%. Рекомендуем стремиться к 20%`,color:"amber"});
  else if (savings<0) insights.push({icon:"⚠️",text:`Расходы превышают доходы на ${Math.abs(savings).toLocaleString("ru-KZ")} ₸`,color:"red"});

  if (topCategory&&sorted[0]&&expenses>0)
    insights.push({icon:"📊",text:`«${topCategory}» — ${Math.round(sorted[0][1]/expenses*100)}% расходов`,color:"cyan"});
  if (subscriptions.length)
    insights.push({icon:"🔄",text:`${subscriptions.length} подписок на ${subscriptions.reduce((s,x)=>s+x.amount,0).toLocaleString("ru-KZ")} ₸`,color:"purple"});
  const daily = expenses>0?Math.round(expenses/30):0;
  if (daily) insights.push({icon:"📅",text:`Средний дневной расход: ${daily.toLocaleString("ru-KZ")} ₸`,color:"cyan"});
  if (sorted[1]) insights.push({icon:"🔍",text:`«${sorted[1][0]}» — ${sorted[1][1].toLocaleString("ru-KZ")} ₸`,color:"amber"});

  return {income,expenses,savings,savingsRate,topCategory,subscriptions,insights};
}

// ─── UI helpers ───────────────────────────────────────────────────────────────

const STEPS = ["Читаем файл...","Извлекаем текст...","Распознаём транзакции...","Категоризируем...","Готово!"];
const IC = {
  cyan:   {bg:"bg-cyan-50",  border:"border-cyan-200",  text:"text-cyan-700"},
  amber:  {bg:"bg-amber-50", border:"border-amber-200", text:"text-amber-700"},
  green:  {bg:"bg-green-50", border:"border-green-200", text:"text-green-700"},
  red:    {bg:"bg-red-50",   border:"border-red-200",   text:"text-red-700"},
  purple: {bg:"bg-purple-50",border:"border-purple-200",text:"text-purple-700"},
};

// ─── Component ────────────────────────────────────────────────────────────────

export function StatementImport({members, activeUserId, onImport, onClose}: StatementImportProps) {
  const {translateCategory} = useLanguage();
  const fileRef = useRef<HTMLInputElement>(null);

  const [step,   setStep]   = useState<"upload"|"analyzing"|"results">("upload");
  const [aiStep, setAiStep] = useState(0);
  const [error,  setError]  = useState<string|null>(null);
  const [parsed, setParsed] = useState<ParsedTransaction[]>([]);
  const [analysis, setAnalysis] = useState<Analysis|null>(null);
  const [memberId, setMemberId] = useState(activeUserId);
  const [dragOver, setDragOver] = useState(false);
  const [showTxs,  setShowTxs]  = useState(false);
  const [showAll,  setShowAll]  = useState(false);

  useEffect(() => {
    if (step !== "analyzing") return;
    setAiStep(0);
    const iv = setInterval(() => setAiStep(p => p < STEPS.length-1 ? p+1 : p), 700);
    return () => clearInterval(iv);
  }, [step]);

  const processFile = useCallback(async (file: File) => {
    const name = file.name.toLowerCase();
    const isPDF = name.endsWith(".pdf"), isCSV = name.endsWith(".csv");
    if (!isPDF && !isCSV) { setError("Поддерживаются форматы: PDF, CSV"); return; }
    if (file.size > 10 * 1024 * 1024) { setError("Файл слишком большой. Максимум 10 МБ."); return; }
    setError(null);
    setStep("analyzing");
    try {
      const text = isPDF ? await extractTextFromPDF(file) : await extractTextFromCSV(file);
      const txs  = parseTransactions(text);
      if (!txs.length) {
        setStep("upload");
        setError("Транзакции не найдены. Убедитесь, что файл содержит банковскую выписку с датами и суммами.");
        return;
      }
      setParsed(txs);
      setAnalysis(generateAnalysis(txs));
      setStep("results");
    } catch(e: unknown) {
      setStep("upload");
      setError(`Ошибка чтения файла: ${e instanceof Error ? e.message : String(e)}`);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault(); setDragOver(false);
    const f = e.dataTransfer.files[0]; if (f) processFile(f);
  }, [processFile]);

  const toggle     = (id: string) => setParsed(p=>p.map(t=>t.id===id?{...t,selected:!t.selected}:t));
  const toggleAll  = (v: boolean) => setParsed(p=>p.map(t=>({...t,selected:v})));
  const changeCat  = (id: string, cat: string) => setParsed(p=>p.map(t=>t.id===id?{...t,category:cat}:t));
  const changeType = (id: string, type: "income"|"expense") => setParsed(p=>p.map(t=>t.id===id?{...t,type,category:detectCategory(t.description,type)}:t));

  const handleImport = () => {
    const sel = parsed.filter(t=>t.selected);
    if (!sel.length){toast.error("Выберите хотя бы одну транзакцию");return;}
    onImport(sel.map(t=>({
      id: Date.now().toString()+Math.random().toString(36).slice(2),
      type:t.type, amount:t.amount, category:t.category,
      description:t.description, date:new Date(t.date).toISOString(),
      memberId,
    })));
    toast.success(`Импортировано ${sel.length} транзакций`);
    onClose();
  };

  const selCount   = parsed.filter(t=>t.selected).length;
  const INCOME_C   = ["Зарплата","Фриланс","Инвестиции","Подарок","Другой доход"];
  const EXPENSE_C  = ["Продукты","Транспорт","Коммунальные услуги","Развлечения","Здоровье","Образование","Покупки","Рестораны","Другие расходы"];

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={step!=="analyzing"?onClose:undefined}/>

      <div className="relative w-full max-w-md mx-3 mb-3 sm:mb-0 max-h-[92vh] flex flex-col rounded-3xl shadow-2xl overflow-hidden bg-white border border-cyan-100">

        {/* Header */}
        <div className="bg-gradient-to-r from-cyan-500 via-blue-500 to-teal-500 px-5 py-4 shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center">
                <Sparkles className="h-4 w-4 text-white"/>
              </div>
              <div>
                <p className="text-white font-bold text-sm leading-none">Импорт выписки</p>
                <p className="text-white/70 text-[10px] mt-0.5 leading-none">
                  {step==="upload"    && "PDF или CSV · работает офлайн"}
                  {step==="analyzing" && "Анализируем файл..."}
                  {step==="results"   && `Найдено ${parsed.length} · выбрано ${selCount}`}
                </p>
              </div>
            </div>
            {step!=="analyzing" && (
              <button onClick={onClose} className="w-7 h-7 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center">
                <X className="h-3.5 w-3.5 text-white"/>
              </button>
            )}
          </div>
          <div className="flex gap-1.5 mt-3">
            {(["upload","analyzing","results"] as const).map((s,i)=>(
              <div key={s} className={`h-1 rounded-full transition-all duration-500 ${
                step===s?"w-6 bg-white":["upload","analyzing","results"].indexOf(step)>i?"w-3 bg-white/60":"w-3 bg-white/25"
              }`}/>
            ))}
          </div>
        </div>

        {/* ── Upload ── */}
        {step==="upload" && (
          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            <div
              className={`border-2 border-dashed rounded-2xl p-7 text-center cursor-pointer transition-all duration-200 ${
                dragOver?"border-cyan-400 bg-cyan-50 scale-[1.01]":"border-cyan-200 hover:border-cyan-400 hover:bg-cyan-50/40"
              }`}
              onDragOver={e=>{e.preventDefault();setDragOver(true);}}
              onDragLeave={()=>setDragOver(false)}
              onDrop={handleDrop}
              onClick={()=>fileRef.current?.click()}
            >
              <input ref={fileRef} type="file" accept=".pdf,.csv" className="hidden"
                onChange={e=>{const f=e.target.files?.[0];if(f)processFile(f);}}/>
              <div className="flex flex-col items-center gap-3">
                <div className="relative">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-100 to-blue-100 flex items-center justify-center">
                    <Upload className="h-7 w-7 text-cyan-600"/>
                  </div>
                  <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center">
                    <Zap className="h-2.5 w-2.5 text-white"/>
                  </div>
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-800">Перетащите выписку сюда</p>
                  <p className="text-xs text-gray-400 mt-0.5">или нажмите для выбора</p>
                </div>
                <div className="flex gap-2">
                  {[{ext:"PDF",c:"bg-red-100 text-red-600"},{ext:"CSV",c:"bg-green-100 text-green-600"}].map(({ext,c})=>(
                    <span key={ext} className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${c}`}>{ext}</span>
                  ))}
                </div>
              </div>
            </div>

            {error && (
              <div className="flex items-start gap-2 bg-red-50 border border-red-200 rounded-xl p-3">
                <AlertCircle className="h-4 w-4 text-red-500 mt-0.5 shrink-0"/>
                <p className="text-xs text-red-600">{error}</p>
              </div>
            )}

            <div className="rounded-2xl border border-cyan-100 bg-cyan-50/50 p-3.5">
              <p className="text-xs font-bold text-cyan-700 mb-2 flex items-center gap-1.5">
                <ShieldCheck className="h-3.5 w-3.5"/> Поддерживаемые банки
              </p>
              <div className="grid grid-cols-2 gap-1.5">
                {["Kaspi Bank","Halyk Bank","Forte Bank","Jusan Bank","BCC","Народный Банк"].map(b=>(
                  <div key={b} className="flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-gradient-to-br from-cyan-400 to-blue-400 shrink-0"/>
                    <span className="text-[11px] text-gray-600">{b}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border border-gray-100 bg-gray-50/80 p-3.5 flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-gray-400 to-gray-600 flex items-center justify-center shrink-0">
                <FileText className="h-4 w-4 text-white"/>
              </div>
              <div>
                <p className="text-xs font-bold text-gray-700">Работает офлайн</p>
                <p className="text-[10px] text-gray-500 mt-0.5">Никаких API ключей. Данные обрабатываются локально.</p>
              </div>
            </div>
          </div>
        )}

        {/* ── Analyzing ── */}
        {step==="analyzing" && (
          <div className="flex-1 flex flex-col items-center justify-center p-8 gap-6">
            <div className="relative">
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-cyan-400 via-blue-500 to-teal-400 animate-pulse shadow-lg shadow-cyan-300/50"/>
              <div className="absolute inset-0 flex items-center justify-center">
                <Sparkles className="h-9 w-9 text-white"/>
              </div>
              <div className="absolute -inset-3 rounded-full border-2 border-cyan-300/40 animate-ping"/>
            </div>
            <div className="text-center">
              <p className="text-base font-bold text-gray-800">Читаем выписку</p>
              <p className="text-xs text-gray-400 mt-1">Несколько секунд...</p>
            </div>
            <div className="w-full space-y-2.5">
              {STEPS.map((s,i)=>(
                <div key={i} className={`flex items-center gap-3 transition-all ${i>aiStep?"opacity-20":"opacity-100"}`}>
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${
                    i<aiStep?"bg-gradient-to-br from-cyan-500 to-blue-500":
                    i===aiStep?"bg-gradient-to-br from-cyan-400 to-blue-400 animate-pulse":"bg-gray-200"
                  }`}>
                    {i<aiStep?<Check className="h-3 w-3 text-white"/>:i===aiStep?<div className="w-2 h-2 rounded-full bg-white"/>:null}
                  </div>
                  <span className={`text-xs ${i<=aiStep?"text-gray-700 font-medium":"text-gray-400"}`}>{s}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Results ── */}
        {step==="results" && analysis && (
          <div className="flex-1 overflow-y-auto">
            <div className="px-4 pt-4 grid grid-cols-2 gap-2.5">
              {[
                {label:"Доходы", value:analysis.income,   Icon:TrendingUp,   g:"from-green-400 to-teal-500", t:"text-green-600"},
                {label:"Расходы",value:analysis.expenses, Icon:TrendingDown, g:"from-red-400 to-pink-500",   t:"text-red-600"},
              ].map(({label,value,Icon,g,t})=>(
                <div key={label} className="rounded-2xl border border-gray-100 bg-white p-3 shadow-sm">
                  <div className={`w-7 h-7 rounded-xl bg-gradient-to-br ${g} flex items-center justify-center mb-2`}>
                    <Icon className="h-3.5 w-3.5 text-white"/>
                  </div>
                  <p className="text-[10px] text-gray-400 font-medium">{label}</p>
                  <p className={`text-sm font-bold ${t} mt-0.5`}>{value.toLocaleString("ru-KZ")} ₸</p>
                </div>
              ))}
            </div>

            <div className="px-4 mt-2.5">
              <div className={`rounded-2xl p-3.5 flex items-center justify-between ${
                analysis.savings>=0?"bg-gradient-to-r from-cyan-50 to-blue-50 border border-cyan-200"
                                   :"bg-gradient-to-r from-red-50 to-pink-50 border border-red-200"}`}>
                <div>
                  <p className="text-[10px] text-gray-500 font-medium">Итог</p>
                  <p className={`text-base font-bold ${analysis.savings>=0?"text-cyan-700":"text-red-600"}`}>
                    {analysis.savings>=0?"+":""}{analysis.savings.toLocaleString("ru-KZ")} ₸
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] text-gray-500 font-medium">Норма сбережений</p>
                  <p className={`text-base font-bold ${analysis.savingsRate>=10?"text-green-600":"text-amber-600"}`}>
                    {analysis.savingsRate}%
                  </p>
                </div>
              </div>
            </div>

            {analysis.subscriptions.length>0 && (
              <div className="px-4 mt-3">
                <p className="text-xs font-bold text-gray-600 mb-2 flex items-center gap-1.5">
                  <RefreshCw className="h-3 w-3 text-purple-500"/> Подписки
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {analysis.subscriptions.map(s=>(
                    <span key={s.name} className="text-[11px] bg-purple-50 border border-purple-200 text-purple-700 px-2 py-0.5 rounded-lg font-medium">
                      {s.name} · {s.amount.toLocaleString("ru-KZ")} ₸
                    </span>
                  ))}
                </div>
              </div>
            )}

            {analysis.insights.length>0 && (
              <div className="px-4 mt-3 space-y-2">
                <p className="text-xs font-bold text-gray-600 flex items-center gap-1.5">
                  <Sparkles className="h-3 w-3 text-cyan-500"/> Аналитика
                </p>
                {analysis.insights.map((ins,i)=>{
                  const c=IC[ins.color];
                  return(
                    <div key={i} className={`rounded-xl border ${c.bg} ${c.border} p-2.5 flex items-start gap-2`}>
                      <span className="text-base leading-none mt-0.5">{ins.icon}</span>
                      <p className={`text-xs ${c.text} font-medium leading-snug`}>{ins.text}</p>
                    </div>
                  );
                })}
              </div>
            )}

            <div className="px-4 mt-3 space-y-1.5">
              <label className="text-xs font-bold text-gray-600">Импортировать для</label>
              <Select value={memberId} onValueChange={setMemberId}>
                <SelectTrigger className="h-9 text-sm rounded-xl border-cyan-200"><SelectValue/></SelectTrigger>
                <SelectContent>
                  {members.map(m=>(
                    <SelectItem key={m.id} value={m.id}>
                      <span className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full inline-block shrink-0" style={{backgroundColor:m.color}}/>
                        {m.name}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="px-4 mt-3 mb-2">
              <div role="button" tabIndex={0}
                onClick={()=>setShowTxs(!showTxs)}
                onKeyDown={e=>e.key==="Enter"&&setShowTxs(!showTxs)}
                className="w-full flex items-center justify-between py-2.5 px-3.5 rounded-xl border border-gray-200 hover:border-cyan-300 hover:bg-cyan-50/40 transition-colors cursor-pointer">
                <span className="text-xs font-bold text-gray-600">Транзакции ({selCount}/{parsed.length} выбрано)</span>
                <div className="flex items-center gap-2">
                  <button onClick={e=>{e.stopPropagation();toggleAll(true);}} className="text-[10px] text-cyan-600 hover:underline">все</button>
                  <button onClick={e=>{e.stopPropagation();toggleAll(false);}} className="text-[10px] text-gray-400 hover:underline">сброс</button>
                  {showTxs?<ChevronUp className="h-3.5 w-3.5 text-gray-400"/>:<ChevronDown className="h-3.5 w-3.5 text-gray-400"/>}
                </div>
              </div>

              {showTxs && (
                <div className="mt-2 space-y-1.5">
                  {(showAll?parsed:parsed.slice(0,8)).map(tx=>(
                    <div key={tx.id} className={`rounded-xl border p-2.5 transition-all ${tx.selected?"border-cyan-200 bg-cyan-50/30":"border-gray-100 bg-gray-50 opacity-40"}`}>
                      <div className="flex items-start gap-2">
                        <button onClick={()=>toggle(tx.id)}
                          className={`mt-0.5 w-4 h-4 rounded-md border-2 flex items-center justify-center shrink-0 ${tx.selected?"bg-cyan-500 border-cyan-500":"border-gray-300"}`}>
                          {tx.selected&&<Check className="h-2.5 w-2.5 text-white"/>}
                        </button>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-1">
                            <span className="text-[10px] text-gray-400">{tx.date}</span>
                            <button onClick={()=>changeType(tx.id,tx.type==="expense"?"income":"expense")}
                              className={`text-[10px] px-1.5 py-0.5 rounded-md font-bold ${tx.type==="expense"?"bg-red-100 text-red-600":"bg-green-100 text-green-600"}`}>
                              {tx.type==="expense"?"−":"+"}{tx.amount.toLocaleString("ru-KZ")} ₸
                            </button>
                          </div>
                          <p className="text-xs text-gray-700 mt-0.5 truncate">{tx.description}</p>
                          <Select value={tx.category} onValueChange={v=>changeCat(tx.id,v)}>
                            <SelectTrigger className="h-6 text-[10px] mt-1 border-0 bg-white/80 px-1.5 rounded-lg"><SelectValue/></SelectTrigger>
                            <SelectContent>
                              {(tx.type==="income"?INCOME_C:EXPENSE_C).map(cat=>(
                                <SelectItem key={cat} value={cat} className="text-xs">{translateCategory(cat)}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>
                  ))}
                  {parsed.length>8&&(
                    <button onClick={()=>setShowAll(!showAll)} className="w-full flex items-center justify-center gap-1 text-xs text-cyan-600 py-1.5">
                      {showAll?<><ChevronUp className="h-3 w-3"/>Свернуть</>:<><ChevronDown className="h-3 w-3"/>Ещё {parsed.length-8}</>}
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {step==="results" && (
          <div className="p-4 border-t border-gray-100 shrink-0 flex gap-2.5 bg-white">
            <Button variant="outline" size="sm" className="flex-none px-4 rounded-xl border-gray-200 text-gray-600"
              onClick={()=>{setStep("upload");setParsed([]);setAnalysis(null);setShowTxs(false);}}>
              <FileText className="h-3.5 w-3.5 mr-1.5"/> Другой файл
            </Button>
            <Button size="sm" disabled={selCount===0} onClick={handleImport}
              className="flex-1 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white rounded-xl font-bold shadow-md shadow-cyan-200">
              Импортировать {selCount>0?`(${selCount})`:""}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
