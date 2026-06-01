import { useState } from "react";
import type { ReactNode, CSSProperties } from "react";

// ─── Colors ───────────────────────────────────────────────────────────────────
export const OR  = "#E8531D";
export const OL  = "#fff3ee";
export const OM  = "#fde8de";

// ─── Helpers ──────────────────────────────────────────────────────────────────
export const fmt = (n: number): string =>
  new Intl.NumberFormat("ru-RU", { maximumFractionDigits: 0 }).format(n || 0);

export const toDay = (): string => {
  const d = new Date();
  return `${String(d.getDate()).padStart(2,"0")}.${String(d.getMonth()+1).padStart(2,"0")}.${d.getFullYear()}`;
};

export const toTime = (): string => {
  const d = new Date();
  return `${String(d.getHours()).padStart(2,"0")}:${String(d.getMinutes()).padStart(2,"0")}:${String(d.getSeconds()).padStart(2,"0")}`;
};

export const rcpId = (): string =>
  `#RCP-${new Date().getFullYear()}-${Math.random().toString(36).slice(2,8).toUpperCase()}`;

// ─── Products (price list, cost = retail − 25 000) ───────────────────────────
export const INIT_PRODUCTS = [
  {id:1,  art:"10001", name:"TESTA MEST 15KL",      cat:"TESTA MEST",   qty:40, retail:170000, opt:160000, cost:145000, barcode:"2002501487241"},
  {id:2,  art:"10002", name:"TESTA MEST 25KL",       cat:"TESTA MEST",   qty:40, retail:190000, opt:180000, cost:165000, barcode:"2002601487242"},
  {id:3,  art:"10003", name:"TESTA MEST 50KL",       cat:"TESTA MEST",   qty:10, retail:210000, opt:200000, cost:185000, barcode:"2002701487243"},
  {id:4,  art:"10004", name:"ozdemer JY-G22",         cat:"ozdemer",      qty:1,  retail:85000,  opt:80000,  cost:60000,  barcode:""},
  {id:5,  art:"10005", name:"ozdemer YCT-22",         cat:"ozdemer",      qty:1,  retail:120000, opt:110000, cost:95000,  barcode:""},
  {id:6,  art:"10006", name:"ozdemer JY-12",          cat:"ozdemer",      qty:10, retail:140000, opt:130000, cost:115000, barcode:""},
  {id:7,  art:"10007", name:"ozdemer Ozd-12Tank",     cat:"ozdemer",      qty:20, retail:190000, opt:180000, cost:165000, barcode:""},
  {id:8,  art:"10008", name:"ozdemer Ozd-22Tank",     cat:"ozdemer",      qty:30, retail:210000, opt:200000, cost:185000, barcode:""},
  {id:9,  art:"10009", name:"ozdemer Ozd-32Tank",     cat:"ozdemer",      qty:20, retail:230000, opt:220000, cost:205000, barcode:""},
  {id:10, art:"10010", name:"ozdemer QL-22",          cat:"ozdemer",      qty:30, retail:260000, opt:250000, cost:235000, barcode:""},
  {id:11, art:"10011", name:"ozdemer QL-32",          cat:"ozdemer",      qty:30, retail:270000, opt:260000, cost:245000, barcode:""},
  {id:12, art:"10012", name:"sliser YCT-22",          cat:"sliser",       qty:15, retail:140000, opt:130000, cost:115000, barcode:""},
  {id:13, art:"10013", name:"sliser HD-85",           cat:"sliser",       qty:25, retail:85000,  opt:80000,  cost:60000,  barcode:""},
  {id:14, art:"10014", name:"sliser JR-D",            cat:"sliser",       qty:25, retail:140000, opt:130000, cost:115000, barcode:""},
  {id:15, art:"10015", name:"sliser JY-PS22",         cat:"sliser",       qty:1,  retail:350000, opt:340000, cost:325000, barcode:""},
  {id:16, art:"10016", name:"sliser YC-20",           cat:"sliser",       qty:10, retail:120000, opt:110000, cost:95000,  barcode:""},
  {id:17, art:"10017", name:"SHPRET KLBSA 3L",        cat:"SHPRET KLBSA", qty:15, retail:80000,  opt:75000,  cost:55000,  barcode:""},
  {id:18, art:"10018", name:"CHUPER HD-180",          cat:"CHUPER",       qty:10, retail:75000,  opt:70000,  cost:50000,  barcode:""},
  {id:19, art:"10019", name:"CHUPER HD-230",          cat:"CHUPER",       qty:20, retail:85000,  opt:80000,  cost:60000,  barcode:""},
  {id:20, art:"10020", name:"CHUPER HD-280",          cat:"CHUPER",       qty:10, retail:90000,  opt:85000,  cost:65000,  barcode:""},
  {id:21, art:"10021", name:"TESTA RSKTKA HD-300",    cat:"TESTA RSKTKA", qty:20, retail:145000, opt:140000, cost:120000, barcode:""},
  {id:22, art:"10022", name:"TESTA RSKTKA HD-300L",   cat:"TESTA RSKTKA", qty:15, retail:170000, opt:160000, cost:145000, barcode:""},
  {id:23, art:"10023", name:"FRITUR 12L",             cat:"FRITUR",       qty:40, retail:70000,  opt:60000,  cost:45000,  barcode:""},
  {id:24, art:"10024", name:"FRITUR 40L",             cat:"FRITUR",       qty:15, retail:160000, opt:150000, cost:135000, barcode:""},
  {id:25, art:"10025", name:"FRITUR 50L",             cat:"FRITUR",       qty:5,  retail:210000, opt:200000, cost:185000, barcode:""},
  {id:26, art:"10026", name:"FRITUR 60L",             cat:"FRITUR",       qty:5,  retail:230000, opt:220000, cost:205000, barcode:""},
  {id:27, art:"10027", name:"TITAN PRO 6KW 220V",     cat:"TITAN PRO",    qty:20, retail:95000,  opt:90000,  cost:70000,  barcode:""},
  {id:28, art:"10028", name:"TITAN PRO 12KW 380V",    cat:"TITAN PRO",    qty:15, retail:140000, opt:130000, cost:115000, barcode:""},
];

export const INIT_STAFF = [
  {id:1, name:"кассир кассир",  phone:"+7 (701) 111-11-11", role:"Кассир",   store:"Главный магазин", status:"active"  as const, created: "01.06.2026"},
  {id:2, name:"Test Owner",     phone:"+77001000001",        role:"Владелец", store:"Главный магазин", status:"active"  as const, created: "01.06.2026"},
];

export const INIT_SUPPLIERS = [
  {id:1, name:"Nike", phone:"", email:"", balance:0, orders:0, goods:0, comment:""},
];

export const INIT_CATEGORIES: string[] = [
  "TESTA MEST","ozdemer","sliser","SHPRET KLBSA",
  "CHUPER","TESTA RSKTKA","FRITUR","TITAN PRO",
];

export const MONTH_DATA = [
  {m:"Февраль", s:36641500,  p:31605645, q:420,  cash:12000000, visa:5000000,  kaspiG:8000000,  kaspiR:3000000,  debt:2000000, inc:0, exp:0, with_:0, supply:520,  supplySum:45000000, reduce:80,  reduceSum:3200000  },
  {m:"Март",    s:49913500,  p:22546035, q:680,  cash:15000000, visa:7000000,  kaspiG:12000000, kaspiR:5000000,  debt:1000000, inc:0, exp:0, with_:0, supply:610,  supplySum:55000000, reduce:120, reduceSum:5600000  },
  {m:"Апрель",  s:81679500,  p:38125750, q:1238, cash:15000000, visa:0,        kaspiG:0,        kaspiR:0,        debt:0,       inc:0, exp:0, with_:0, supply:425,  supplySum:18634620, reduce:373, reduceSum:16827400 },
  {m:"Май",     s:111189000, p:53481985, q:2140, cash:30000000, visa:15000000, kaspiG:20000000, kaspiR:10000000, debt:5000000, inc:0, exp:0, with_:0, supply:4272, supplySum:69364890, reduce:458, reduceSum:17288760 },
  {m:"Июнь",    s:0,         p:0,        q:0,    cash:0,        visa:0,        kaspiG:0,        kaspiR:0,        debt:0,       inc:0, exp:0, with_:0, supply:0,    supplySum:0,        reduce:0,   reduceSum:0        },
];

export const INVENTORY_DATA = [
  {id:5, name:"Инвентаризация 2026.05.29 13:01", store:"Главный магазин", qty:18.6, plus:0, minus:18.6, zero:0, diff:17910, status:"Частично"},
  {id:4, name:"Инвентаризация 2026.05.28 18:39", store:"Главный магазин", qty:8.8,  plus:1, minus:0,   zero:0, diff:0,     status:"Частично"},
  {id:3, name:"Инвентаризация 2026.05.28 18:38", store:"Главный магазин", qty:18.6, plus:1, minus:18.6,zero:0, diff:17910, status:"Полностью"},
  {id:2, name:"Инвентаризация 2026.05.28 18:33", store:"Филиал Центр",    qty:5.1,  plus:0, minus:5.1, zero:0, diff:3825,  status:"Частично"},
  {id:1, name:"Трансфер 2026.05.23 20:06",        store:"Филиал Центр",   qty:1.7,  plus:0, minus:0,   zero:0, diff:0,     status:"Трансфер"},
];

export const TRANSFER_DATA = [
  {id:"1000002", name:"Трансфер 2026.05.29 14:19", from:"Главный магазин", to:"Филиал Центр", qtyOut:1.5, qtyIn:0,   status:"В ожидании"},
  {id:"1000001", name:"Трансфер 2026.05.23 20:06", from:"Главный магазин", to:"Филиал Центр", qtyOut:1.7, qtyIn:1.7, status:"Завершён"},
];

export const REPRICING_DATA = [
  {id:"ЦЕН-0002", date:"31.05.2026 20:17", name:"Быстрая переоценка: товар 3",             store:"Store #3", type:"Фиксированная", qty:1, status:"Проведён"},
  {id:"ЦЕН-0001", date:"29.05.2026 17:26", name:"Быстрая переоценка: Вариативный товар 3", store:"Store #3", type:"Фиксированная", qty:1, status:"Проведён"},
];

export const WRITEOFF_DATA = [
  {id:"СПИС-0001", date:"29.05.2026 14:17", name:"Списание 2026.05.29 14:17", store:"Store #3", qty:1, sum:1200, type:"Дефект", status:"Проведён"},
];

// ─── Navigation menu ──────────────────────────────────────────────────────────
export const MENU = [
  {k:"sales",  l:"Продажи",    ico:"🛒", sub:[
    {k:"all-sales",   l:"Все продажи"},
    {k:"kassa-smeny", l:"Кассовые смены"},
    {k:"kassa-ops",   l:"Кассовые операции"},
  ]},
  {k:"wh",     l:"Склад",      ico:"🏭", sub:[
    {k:"catalog",      l:"Список товаров"},
    {k:"postupleniya", l:"Закупки"},
    {k:"revision",     l:"Ревизия"},
    {k:"transfer",     l:"Перемещения"},
    {k:"repricing",    l:"Редактор цен"},
    {k:"spisanie",     l:"Списания"},
    {k:"suppliers",    l:"Поставщики"},
  ]},
  {k:"buy",    l:"Покупатели", ico:"👥", sub:[
    {k:"clients",  l:"Все клиенты"},
    {k:"groups",   l:"Группы и теги"},
    {k:"loyalty",  l:"Программа лояльности"},
    {k:"debts",    l:"Долги клиентов"},
  ]},
  {k:"mgmt",   l:"Управление", ico:"⚙️", sub:[
    {k:"staff",  l:"Персонал"},
    {k:"roles",  l:"Права доступа"},
  ]},
  {k:"cfg",    l:"Настройки",  ico:"🔧", sub:[
    {k:"profile",      l:"Профиль"},
    {k:"general",      l:"Общие настройки"},
    {k:"subscription", l:"Подписка и оплата"},
    {k:"kassacfg",     l:"Касса и продажи"},
    {k:"refs",         l:"Справочники"},
    {k:"notifications",l:"Уведомления"},
    {k:"integrations", l:"Интеграции"},
  ]},
];

// ─── Style constants ──────────────────────────────────────────────────────────
export const Sc = {
  card: { background:"#fff", borderRadius:10, boxShadow:"0 1px 4px rgba(0,0,0,.08)", padding:"14px 16px", marginBottom:12 } as CSSProperties,
  th:   { padding:"10px 12px", fontSize:12, color:"#888", fontWeight:600, textAlign:"left" as const, borderBottom:"1px solid #eee", whiteSpace:"nowrap" as const } as CSSProperties,
  td:   { padding:"10px 12px", fontSize:13, borderBottom:"1px solid #f4f4f6", verticalAlign:"middle" as const } as CSSProperties,
  inp:  { width:"100%", border:"1px solid #e0e0e0", borderRadius:7, padding:"9px 12px", fontSize:14, outline:"none", background:"#fff", boxSizing:"border-box" as const } as CSSProperties,
  lbl:  { display:"block", fontSize:12, color:"#888", marginBottom:4, fontWeight:500 } as CSSProperties,
  lnk:  { color:OR, fontWeight:600, cursor:"pointer" } as CSSProperties,
  page: { minHeight:"100vh", background:"#f4f4f6", fontFamily:"system-ui,-apple-system,sans-serif", color:"#1a1a1a" } as CSSProperties,
};

export const mkBtn = (v: "p"|"s"|"g" = "p", ex: CSSProperties = {}): CSSProperties => ({
  padding:    v === "sm" ? "5px 12px" : "9px 18px",
  borderRadius: 7,
  border:     "none",
  cursor:     "pointer",
  fontWeight: 600,
  fontSize:   13,
  background: v === "p" ? OR : v === "g" ? "transparent" : "#f0f0f0",
  color:      v === "p" ? "#fff" : v === "g" ? OR : "#444",
  display:    "inline-flex",
  alignItems: "center",
  gap:        5,
  ...ex,
});

export const mkBadge = (c: "gr"|"or"|"rd"|"bl" = "gr"): CSSProperties => ({
  display:    "inline-block",
  padding:    "2px 8px",
  borderRadius: 50,
  fontSize:   11,
  fontWeight: 700,
  background: c==="gr" ? "#e6f9ee" : c==="or" ? "#fff3e6" : c==="rd" ? "#fee" : "#e8f0fe",
  color:      c==="gr" ? "#1a8a3a" : c==="or" ? "#c76b00" : c==="rd" ? "#c0392b" : "#1a56db",
});

// ─── Toggle ───────────────────────────────────────────────────────────────────
export function Toggle({ on, onChange }: { on: boolean; onChange: (v: boolean) => void }) {
  return (
    <div
      onClick={() => onChange(!on)}
      style={{
        width:36, height:20, borderRadius:10,
        background: on ? OR : "#ddd",
        position:"relative", cursor:"pointer", flexShrink:0,
        transition:"background .2s",
      }}
    >
      <div style={{
        position:"absolute", top:2,
        left: on ? 18 : 2,
        width:16, height:16,
        borderRadius:50, background:"#fff",
        transition:"left .2s",
        boxShadow:"0 1px 3px rgba(0,0,0,.2)",
      }}/>
    </div>
  );
}

// ─── Modal ────────────────────────────────────────────────────────────────────
export function Modal({
  title,
  onClose,
  width = 480,
  children,
}: {
  title:    ReactNode;
  onClose:  () => void;
  width?:   number;
  children: ReactNode;
}) {
  return (
    <div
      onClick={e => e.target === e.currentTarget && onClose()}
      style={{
        position:"fixed", inset:0, background:"rgba(0,0,0,.45)", zIndex:300,
        display:"flex", alignItems:"center", justifyContent:"center", padding:14,
      }}
    >
      <div style={{
        background:"#fff", borderRadius:12, width:"100%", maxWidth:width,
        maxHeight:"92vh", overflowY:"auto",
        boxShadow:"0 8px 32px rgba(0,0,0,.2)",
      }}>
        <div style={{
          display:"flex", justifyContent:"space-between", alignItems:"center",
          padding:"15px 20px", borderBottom:"1px solid #eee",
          position:"sticky", top:0, background:"#fff", zIndex:1,
        }}>
          <span style={{ fontWeight:700, fontSize:16 }}>{title}</span>
          <button
            onClick={onClose}
            style={{
              background:"none", border:"none", fontSize:22,
              cursor:"pointer", color:"#aaa", lineHeight:1, padding:"0 4px",
            }}
          >
            ✕
          </button>
        </div>
        <div style={{ padding:20 }}>{children}</div>
      </div>
    </div>
  );
}

// ─── PageHead ─────────────────────────────────────────────────────────────────
export function PageHead({
  title,
  bread,
  sub,
  right,
}: {
  title:  ReactNode;
  bread?: string;
  sub?:   string;
  right?: ReactNode;
}) {
  return (
    <div style={{ padding:"12px 14px 8px", background:"#fff", borderBottom:"1px solid #eee" }}>
      {bread && (
        <div style={{ fontSize:11, color:"#aaa", marginBottom:3 }}>
          {bread.split("›").map((p, i, arr) => (
            <span key={i}>
              <span style={{ color: i < arr.length - 1 ? "#888" : "#aaa", cursor: i < arr.length - 1 ? "pointer" : "default" }}>
                {p.trim()}
              </span>
              {i < arr.length - 1 && <span style={{ margin:"0 4px", color:"#ddd" }}>›</span>}
            </span>
          ))}
        </div>
      )}
      <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", gap:12 }}>
        <div>
          <div style={{ fontWeight:800, fontSize:20, lineHeight:1.2 }}>{title}</div>
          {sub && <div style={{ fontSize:12, color:"#888", marginTop:3 }}>{sub}</div>}
        </div>
        {right && (
          <div style={{ display:"flex", gap:8, alignItems:"center", flexShrink:0 }}>
            {right}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── StatCard ─────────────────────────────────────────────────────────────────
export function StatCard({
  label,
  value,
  sub,
  ico,
  color,
}: {
  label:  string;
  value:  ReactNode;
  sub?:   string;
  ico?:   string;
  color?: string;
}) {
  return (
    <div style={{ ...Sc.card, flex:1, minWidth:0, marginBottom:0 }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
        <div style={{ fontSize:12, color:"#888", lineHeight:1.3 }}>{label}</div>
        {ico && <span style={{ color:OR, fontSize:15 }}>{ico}</span>}
      </div>
      <div style={{ fontSize:21, fontWeight:800, marginTop:6, color: color || "#111", lineHeight:1 }}>
        {value}
      </div>
      {sub && <div style={{ fontSize:11, color:"#aaa", marginTop:4 }}>{sub}</div>}
    </div>
  );
}

// ─── Grid2 ────────────────────────────────────────────────────────────────────
export function Grid2({ children, style = {} }: { children: ReactNode; style?: CSSProperties }) {
  return (
    <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginBottom:14, ...style }}>
      {children}
    </div>
  );
}

// ─── SearchBar ────────────────────────────────────────────────────────────────
export function SearchBar({
  value,
  onChange,
  placeholder = "Поиск...",
}: {
  value:       string;
  onChange:    (v: string) => void;
  placeholder?: string;
}) {
  return (
    <div style={{ position:"relative", flex:1 }}>
      <span style={{
        position:"absolute", left:10, top:"50%",
        transform:"translateY(-50%)", color:"#ccc", fontSize:13, pointerEvents:"none",
      }}>
        🔍
      </span>
      <input
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        style={{ ...Sc.inp, paddingLeft:32 }}
      />
    </div>
  );
}

// ─── Tabs ─────────────────────────────────────────────────────────────────────
export function Tabs({
  tabs,
  active,
  onChange,
}: {
  tabs:     { k: string; l: string }[];
  active:   string;
  onChange: (k: string) => void;
}) {
  return (
    <div style={{ display:"flex", gap:0, borderBottom:"1px solid #eee", marginBottom:14, overflowX:"auto" }}>
      {tabs.map(t => (
        <button
          key={t.k}
          onClick={() => onChange(t.k)}
          style={{
            padding:"9px 16px", border:"none", background:"transparent",
            cursor:"pointer", fontSize:13, fontWeight:600, whiteSpace:"nowrap",
            color: active === t.k ? OR : "#777",
            borderBottom: `2px solid ${active === t.k ? OR : "transparent"}`,
            transition:"color .15s",
          }}
        >
          {t.l}
        </button>
      ))}
    </div>
  );
}

// ─── DateFilter ───────────────────────────────────────────────────────────────
export function DateFilter({
  active,
  onChange,
}: {
  active:   string;
  onChange: (v: string) => void;
}) {
  const opts = ["Сегодня","Вчера","Эта неделя","Этот месяц","Прошлый месяц"];
  return (
    <div style={{ display:"flex", gap:6, flexWrap:"wrap", marginBottom:14 }}>
      {opts.map(o => (
        <button
          key={o}
          onClick={() => onChange(o)}
          style={{
            padding:"5px 12px", borderRadius:6, cursor:"pointer",
            fontSize:12, fontWeight:600,
            border: `1px solid ${active === o ? OR : "#e0e0e0"}`,
            background: active === o ? OL : "#fff",
            color: active === o ? OR : "#666",
          }}
        >
          {o}
        </button>
      ))}
    </div>
  );
}

// ─── EmptyState ───────────────────────────────────────────────────────────────
export function EmptyState({
  icon = "📋",
  title,
  sub,
  action,
}: {
  icon?:   string;
  title:   string;
  sub?:    string;
  action?: ReactNode;
}) {
  return (
    <div style={{ textAlign:"center", padding:"50px 20px", color:"#bbb" }}>
      <div style={{ fontSize:36, marginBottom:12 }}>{icon}</div>
      <div style={{ fontWeight:700, fontSize:15, color:"#888", marginBottom:6 }}>{title}</div>
      {sub    && <div style={{ fontSize:13, marginBottom:16 }}>{sub}</div>}
      {action && <div>{action}</div>}
    </div>
  );
}

// ─── Pagination ───────────────────────────────────────────────────────────────
export function Pagination({
  page,
  total,
  perPage,
  onChange,
}: {
  page:     number;
  total:    number;
  perPage:  number;
  onChange: (p: number) => void;
}) {
  const pages = Math.max(1, Math.ceil(total / perPage));
  return (
    <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"10px 0", fontSize:12, color:"#aaa" }}>
      <div style={{ display:"flex", gap:4, alignItems:"center" }}>
        <button
          onClick={() => onChange(Math.max(1, page - 1))}
          style={{ background:"none", border:"1px solid #e0e0e0", borderRadius:6, width:28, height:28, cursor:"pointer", fontSize:13 }}
        >
          ‹
        </button>
        {Array.from({ length: Math.min(pages, 5) }, (_, i) => i + 1).map(p => (
          <button
            key={p}
            onClick={() => onChange(p)}
            style={{
              width:28, height:28, borderRadius:6, cursor:"pointer",
              fontSize:12, fontWeight:600,
              border: `1px solid ${page === p ? OR : "#e0e0e0"}`,
              background: page === p ? OR : "#fff",
              color: page === p ? "#fff" : "#555",
            }}
          >
            {p}
          </button>
        ))}
        <button
          onClick={() => onChange(Math.min(pages, page + 1))}
          style={{ background:"none", border:"1px solid #e0e0e0", borderRadius:6, width:28, height:28, cursor:"pointer", fontSize:13 }}
        >
          ›
        </button>
      </div>
      <span>
        Показано {Math.min(perPage, total)} из {total}
      </span>
    </div>
  );
}

// ─── Toast ────────────────────────────────────────────────────────────────────
export function Toast({ msg }: { msg: string | null }) {
  if (!msg) return null;
  return (
    <div style={{
      position:"fixed", bottom:24, left:"50%", transform:"translateX(-50%)",
      background:"#1a1a1a", color:"#fff", padding:"10px 22px", borderRadius:50,
      fontSize:13, fontWeight:600, zIndex:500,
      boxShadow:"0 4px 16px rgba(0,0,0,.25)", whiteSpace:"nowrap",
    }}>
      {msg}
    </div>
  );
}

// ─── Sidebar ──────────────────────────────────────────────────────────────────
export function Sidebar({
  page,
  setPage,
  open,
  setOpen,
}: {
  page:    string;
  setPage: (p: string) => void;
  open:    boolean;
  setOpen: (v: boolean) => void;
}) {
  const [exp, setExp] = useState(["sales", "wh"]);
  const tog = (k: string) =>
    setExp(e => e.includes(k) ? e.filter(x => x !== k) : [...e, k]);

  return (
    <>
      {open && (
        <div
          onClick={() => setOpen(false)}
          style={{ position:"fixed", inset:0, background:"rgba(0,0,0,.35)", zIndex:98 }}
        />
      )}
      <div style={{
        position:"fixed", top:0, left: open ? 0 : -240, width:230, height:"100vh",
        background:"#fff", zIndex:99, transition:"left .25s",
        boxShadow: open ? "4px 0 24px rgba(0,0,0,.12)" : "none",
        overflowY:"auto", display:"flex", flexDirection:"column",
      }}>
        {/* Logo */}
        <div style={{
          padding:"16px 16px 12px",
          display:"flex", alignItems:"center", gap:10,
          borderBottom:"1px solid #f0f0f0",
        }}>
          <div style={{
            width:36, height:36, borderRadius:9, background:OR,
            display:"flex", alignItems:"center", justifyContent:"center",
            color:"#fff", fontWeight:900, fontSize:17,
          }}>
            O
          </div>
          <div>
            <div style={{ fontWeight:800, fontSize:17, lineHeight:1 }}>OZD</div>
            <div style={{ fontSize:10, color:"#aaa" }}>wiki24.shop</div>
          </div>
          <button
            onClick={() => setOpen(false)}
            style={{ marginLeft:"auto", background:"none", border:"none", fontSize:20, cursor:"pointer", color:"#ccc" }}
          >
            ✕
          </button>
        </div>

        {/* Nav */}
        <div style={{ flex:1, padding:"6px 0", overflowY:"auto" }}>
          {MENU.map(m => (
            <div key={m.k}>
              <div
                onClick={() => tog(m.k)}
                style={{
                  display:"flex", alignItems:"center", gap:10,
                  padding:"11px 16px", cursor:"pointer",
                  background: exp.includes(m.k) ? OL : "transparent",
                  borderLeft: `3px solid ${exp.includes(m.k) ? OR : "transparent"}`,
                }}
              >
                <span style={{ fontSize:16 }}>{m.ico}</span>
                <span style={{ fontWeight:700, fontSize:13, color: exp.includes(m.k) ? OR : "#444" }}>
                  {m.l}
                </span>
                <span style={{ marginLeft:"auto", fontSize:10, color:"#bbb" }}>
                  {exp.includes(m.k) ? "▲" : "▼"}
                </span>
              </div>
              {exp.includes(m.k) && m.sub.map(s => (
                <div
                  key={s.k}
                  onClick={() => { setPage(s.k); setOpen(false); }}
                  style={{
                    padding:"8px 16px 8px 44px", fontSize:13, cursor:"pointer",
                    color:      page === s.k ? OR : "#555",
                    fontWeight: page === s.k ? 600 : 400,
                    background: page === s.k ? OL : "transparent",
                    borderLeft: `3px solid ${page === s.k ? OR : "transparent"}`,
                    transition: "background .12s",
                  }}
                >
                  {s.l}
                </div>
              ))}
            </div>
          ))}
        </div>

        <div style={{ padding:"12px 16px", borderTop:"1px solid #f0f0f0", fontSize:11, color:"#ccc" }}>
          OZD v2.0 · {toDay()}
        </div>
      </div>
    </>
  );
}

// ─── TopBar ───────────────────────────────────────────────────────────────────
export function TopBar({
  onMenu,
  onSale,
}: {
  onMenu:  () => void;
  onSale:  () => void;
}) {
  return (
    <div style={{
      background:"#fff", borderBottom:"1px solid #eee", padding:"10px 14px",
      position:"sticky", top:0, zIndex:90,
      display:"flex", alignItems:"center", gap:10,
    }}>
      <button
        onClick={onMenu}
        style={{ background:"none", border:"none", fontSize:22, cursor:"pointer", color:"#555", padding:0 }}
      >
        ☰
      </button>
      <div style={{
        width:30, height:30, borderRadius:8, background:OR,
        display:"flex", alignItems:"center", justifyContent:"center",
        color:"#fff", fontWeight:900, fontSize:14,
      }}>
        O
      </div>
      <div>
        <div style={{ fontWeight:800, fontSize:15, lineHeight:1 }}>OZD</div>
        <div style={{ fontSize:10, color:"#aaa" }}>wiki24.shop</div>
      </div>
      <div style={{ flex:1 }} />
      <span style={{ fontSize:11, color:"#bbb" }}>{toDay()}</span>
      <button onClick={onSale} style={mkBtn("p", { fontSize:12, padding:"7px 14px" })}>
        + Продажа
      </button>
    </div>
  );
}
