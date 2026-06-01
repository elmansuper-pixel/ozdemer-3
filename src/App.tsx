import { useState } from "react";
import {
  Sidebar,
  TopBar,
  Toast,
  INIT_PRODUCTS,
  INIT_STAFF,
  INIT_SUPPLIERS,
  OR,
  toDay,
} from "./shared";

// Sales
import {
  PageAllSales,
  PageKassaSmeny,
  PageKassaOps,
  ModalSale,
  ModalKassaOp,
} from "./Sales";

// Inventory
import {
  PageCatalog,
  PagePostupleniya,
  PageRevision,
  PageTransfer,
  PageRepricing,
  PageSpisanie,
  PageSuppliers,
} from "./Inventory";

// Customers
import {
  PageClients,
  PageGroups,
  PageLoyalty,
} from "./Customers";

// Debts
import { PageDebts } from "./Debts";

// Roles
import { PageStaff, PageRoles } from "./Roles";

// Settings
import {
  PageProfile,
  PageGeneral,
  PageSubscription,
  PageKassaSettings,
  PageRefs,
  PageNotifications,
  PageIntegrations,
} from "./Settings";

// ─── Types ───────────────────────────────────────────────────────────────────

export type Sale = {
  id: number;
  rcpId: string;
  date: string;
  time: string;
  type: "продажа" | "возврат" | "repayment";
  productId: number;
  pName: string;
  art: string;
  qty: number;
  price: number;
  total: number;
  cost: number;
  profit: number;
  pay: string;
  pt: "retail" | "opt";
  discount: number;
  clientId: string;
  note: string;
};

export type Product = {
  id: number;
  art: string;
  name: string;
  cat: string;
  qty: number;
  retail: number;
  opt: number;
  cost: number;
  barcode: string;
};

export type Client = {
  id: number;
  name: string;
  phone: string;
  email: string;
  gender: string;
  birthday: string;
  comment: string;
  debt: number;
  repaid: number;
  group: string;
  sum: number;
  lastBuy: string | null;
  createdAt: number;
  created: string;
};

export type KassaOp = {
  tp: "in" | "out";
  sum: number;
  stat: string;
  date: string;
  cashier: string;
};

export type StaffMember = {
  id: number;
  name: string;
  phone: string;
  email: string;
  role: string;
  store: string;
  status: "active" | "blocked" | "archive";
  created: string;
};

export type Supplier = {
  id: number;
  name: string;
  phone: string;
  email?: string;
  balance: number;
  orders: number;
  goods: number;
  comment?: string;
};

// ─── Placeholder for unbuilt pages ───────────────────────────────────────────

function PageInDev({ title, bread, desc }: { title: string; bread: string; desc: string }) {
  return (
    <div>
      <div style={{ padding: "12px 14px 8px", background: "#fff", borderBottom: "1px solid #eee" }}>
        <div style={{ fontSize: 11, color: "#aaa", marginBottom: 3 }}>{bread}</div>
        <div style={{ fontWeight: 800, fontSize: 20 }}>{title}</div>
      </div>
      <div style={{ padding: "12px 14px" }}>
        <div style={{
          background: "#fff", borderRadius: 10, boxShadow: "0 1px 4px rgba(0,0,0,.08)",
          padding: "24px 20px",
        }}>
          <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 6 }}>Страница в разработке</div>
          <div style={{ fontSize: 13, color: "#888", marginBottom: 16 }}>{desc}</div>
          <div style={{ color: OR, fontSize: 13, cursor: "pointer" }}>← Вернуться в настройки</div>
        </div>
      </div>
    </div>
  );
}

// ─── Page registry ────────────────────────────────────────────────────────────

type AppState = {
  products:  Product[];
  sales:     Sale[];
  clients:   Client[];
  kassaOps:  KassaOp[];
  staff:     StaffMember[];
  suppliers: Supplier[];
};

// ─── APP ──────────────────────────────────────────────────────────────────────

export default function App() {
  // ── Navigation ──
  const [sideOpen, setSideOpen] = useState(false);
  const [page, setPage]         = useState("all-sales");

  // ── Global state ──
  const [products,  setProducts]  = useState<Product[]>(INIT_PRODUCTS);
  const [sales,     setSales]     = useState<Sale[]>([]);
  const [clients,   setClients]   = useState<Client[]>([]);
  const [kassaOps,  setKassaOps]  = useState<KassaOp[]>([]);
  const [staff,     setStaff]     = useState<StaffMember[]>(INIT_STAFF);
  const [suppliers, setSuppliers] = useState<Supplier[]>(INIT_SUPPLIERS);

  // ── Modal flags ──
  const [showSale,     setShowSale]     = useState(false);
  const [showKassaOp,  setShowKassaOp]  = useState(false);

  // ── Toast ──
  const [toast, setToast] = useState<string | null>(null);
  function msg(m: string) {
    setToast(m);
    setTimeout(() => setToast(null), 2600);
  }

  // ── Sale handler ──
  function handleSale(s: Sale) {
    setSales(prev => [s, ...prev]);
    setProducts(prev =>
      prev.map(p =>
        p.id === s.productId
          ? { ...p, qty: Math.max(0, p.qty - s.qty) }
          : p
      )
    );
    // Update client total if attached
    if (s.clientId) {
      setClients(prev =>
        prev.map(c =>
          String(c.id) === s.clientId
            ? { ...c, sum: c.sum + s.total, lastBuy: s.date }
            : c
        )
      );
    }
    msg("✅ Продажа оформлена!");
    setShowSale(false);
  }

  // ── Navigate ──
  function nav(p: string) {
    setPage(p);
    setSideOpen(false);
  }

  // ── Page map ──
  function renderPage() {
    switch (page) {

      // ── Sales ──
      case "all-sales":
        return <PageAllSales sales={sales} onNewSale={() => setShowSale(true)} />;
      case "kassa-smeny":
        return <PageKassaSmeny sales={sales} />;
      case "kassa-ops":
        return <PageKassaOps kassaOps={kassaOps} onAdd={() => setShowKassaOp(true)} />;

      // ── Inventory ──
      case "catalog":
        return <PageCatalog products={products} setProducts={setProducts} />;
      case "postupleniya":
        return <PagePostupleniya />;
      case "revision":
        return <PageRevision />;
      case "transfer":
        return <PageTransfer />;
      case "repricing":
        return <PageRepricing />;
      case "spisanie":
        return <PageSpisanie />;
      case "suppliers":
        return <PageSuppliers suppliers={suppliers} setSuppliers={setSuppliers} />;

      // ── Customers ──
      case "clients":
        return <PageClients clients={clients} setClients={setClients} />;
      case "groups":
        return <PageGroups clients={clients} />;
      case "loyalty":
        return <PageLoyalty />;
      case "debts":
        return (
          <PageDebts
            clients={clients}
            sales={sales}
            setClients={setClients}
          />
        );

      // ── Staff & Roles ──
      case "staff":
        return <PageStaff staff={staff} setStaff={setStaff} />;
      case "roles":
        return <PageRoles staff={staff} />;

      // ── Settings ──
      case "profile":
        return <PageProfile />;
      case "general":
        return <PageGeneral />;
      case "subscription":
        return <PageSubscription />;
      case "kassacfg":
        return <PageKassaSettings />;
      case "refs":
        return <PageRefs />;
      case "notifications":
        return (
          <PageInDev
            title="Уведомления"
            bread="Главная › Настройки › Уведомления"
            desc="Раздел «Уведомления» будет доступен в ближайших обновлениях. Здесь вы сможете настроить способы получения уведомлений (email, SMS, push)."
          />
        );
      case "integrations":
        return (
          <PageInDev
            title="Интеграции"
            bread="Главная › Настройки › Интеграции"
            desc="Раздел «Интеграции» будет доступен в ближайших обновлениях. Здесь вы сможете подключать учётные системы, платёжные сервисы и другие приложения."
          />
        );

      default:
        return (
          <PageInDev
            title="Страница"
            bread="Главная"
            desc="Этот раздел находится в разработке."
          />
        );
    }
  }

  // ── Render ──
  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#f4f4f6",
        fontFamily: "system-ui, -apple-system, sans-serif",
        color: "#1a1a1a",
      }}
    >
      {/* Sidebar */}
      <Sidebar
        page={page}
        setPage={nav}
        open={sideOpen}
        setOpen={setSideOpen}
      />

      {/* Top bar */}
      <TopBar
        onMenu={() => setSideOpen(true)}
        onSale={() => setShowSale(true)}
      />

      {/* Main content */}
      <div style={{ paddingBottom: 40 }}>
        {renderPage()}
      </div>

      {/* Global modals */}
      {showSale && (
        <ModalSale
          products={products}
          clients={clients}
          onClose={() => setShowSale(false)}
          onSave={handleSale}
        />
      )}

      {showKassaOp && (
        <ModalKassaOp
          onClose={() => setShowKassaOp(false)}
          onSave={op => {
            setKassaOps(prev => [op, ...prev]);
            msg("✅ Операция добавлена!");
          }}
        />
      )}

      {/* Toast */}
      <Toast msg={toast} />
    </div>
  );
}
