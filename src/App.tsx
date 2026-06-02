// src/App.tsx
import { useState, useEffect, useCallback } from "react";
import { Sidebar, TopBar, Toast, OR } from "./shared";

import {
  apiGetClients, apiPostClient, apiPatchClient,
  apiGetProducts, apiPostProduct, apiPatchProduct, apiDeleteProduct,
  apiGetSales,   apiPostSale,
  apiGetKassaOps,apiPostKassaOp,
} from "./api";

// ... все остальные импорты страниц без изменений ...
import { PageAllSales, PageKassaSmeny, PageKassaOps, ModalSale, ModalKassaOp } from "./Sales";
import { PageCatalog, PagePostupleniya, PageRevision, PageTransfer, PageRepricing, PageSpisanie, PageSuppliers } from "./Inventory";
import { PageClients, PageGroups, PageLoyalty } from "./Customers";
import { PageDebts } from "./Debts";
import { PageStaff, PageRoles } from "./Roles";
import { PageProfile, PageGeneral, PageSubscription, PageKassaSettings, PageRefs, PageNotifications, PageIntegrations } from "./Settings";

// ── Types (без изменений) ────────────────────────────────────────────────────
export type Sale        = { id:number; rcpId:string; date:string; time:string; type:string; productId:number; pName:string; art:string; qty:number; price:number; total:number; cost:number; profit:number; pay:string; pt:string; discount:number; clientId:string; note:string; };
export type Product     = { id:number; art:string; name:string; cat:string; qty:number; retail:number; opt:number; cost:number; barcode:string; };
export type Client      = { id:number; name:string; phone:string; email:string; gender:string; birthday:string; comment:string; debt:number; repaid:number; group:string; sum:number; lastBuy:string|null; createdAt:number; created:string; };
export type KassaOp     = { tp:"in"|"out"; sum:number; stat:string; date:string; cashier:string; };
export type StaffMember = { id:number; name:string; phone:string; email:string; role:string; store:string; status:"active"|"blocked"|"archive"; created:string; };
export type Supplier    = { id:number; name:string; phone:string; email:string; balance:number; orders:number; goods:number; comment:string; };

// ── Placeholder ───────────────────────────────────────────────────────────────
function PageInDev({ title, bread, desc }: { title:string; bread:string; desc:string }) {
  return (
    <div>
      <div style={{ padding:"12px 14px 8px", background:"#fff", borderBottom:"1px solid #eee" }}>
        <div style={{ fontSize:11, color:"#aaa", marginBottom:3 }}>{bread}</div>
        <div style={{ fontWeight:800, fontSize:20 }}>{title}</div>
      </div>
      <div style={{ padding:"12px 14px" }}>
        <div style={{ background:"#fff", borderRadius:10, boxShadow:"0 1px 4px rgba(0,0,0,.08)", padding:"50px 20px", textAlign:"center" }}>
          <div style={{ fontSize:36, marginBottom:12 }}>🔧</div>
          <div style={{ fontWeight:700, fontSize:15, color:"#888", marginBottom:8 }}>Страница в разработке</div>
          <div style={{ fontSize:13, color:"#aaa" }}>{desc}</div>
        </div>
      </div>
    </div>
  );
}

// ── APP ───────────────────────────────────────────────────────────────────────
export default function App() {
  const [sideOpen, setSideOpen] = useState(false);
  const [page,     setPage]     = useState("all-sales");

  // ── State — теперь пустой по умолчанию, заполняется из API ──
  const [products,  setProducts]  = useState<Product[]>([]);
  const [sales,     setSales]     = useState<Sale[]>([]);
  const [clients,   setClients]   = useState<Client[]>([]);
  const [kassaOps,  setKassaOps]  = useState<KassaOp[]>([]);
  const [staff,     setStaff]     = useState<StaffMember[]>([
    { id:1, name:"кассир кассир",  phone:"+7 (701) 111-11-11", email:"", role:"Кассир",   store:"Главный магазин", status:"active", created:"01.06.2026" },
    { id:2, name:"Test Owner",     phone:"+77001000001",        email:"test@wiki.com", role:"Владелец", store:"Главный магазин", status:"active", created:"01.06.2026" },
  ]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([
    { id:1, name:"Nike", phone:"", email:"", balance:0, orders:0, goods:0, comment:"" },
  ]);

  // ── Loading / error state ──
  const [loading, setLoading] = useState(true);
  const [apiError,setApiError]= useState<string|null>(null);

  // ── Modal flags ──
  const [showSale,    setShowSale]    = useState(false);
  const [showKassaOp, setShowKassaOp] = useState(false);

  // ── Toast ──
  const [toast, setToast] = useState<string|null>(null);
  function msg(m: string) { setToast(m); setTimeout(() => setToast(null), 2600); }

  // ══════════════════════════════════════════════════════════════
  // ЗАГРУЗКА ИЗ API при старте страницы
  // ══════════════════════════════════════════════════════════════
  useEffect(() => {
    let cancelled = false;

    async function loadAll() {
      try {
        setLoading(true);
        setApiError(null);

        const [prods, sls, cls, ops] = await Promise.all([
          apiGetProducts(),
          apiGetSales(),
          apiGetClients(),
          apiGetKassaOps(),
        ]);

        if (cancelled) return;
        setProducts(prods);
        setSales(sls);
        setClients(cls);
        setKassaOps(ops);
      } catch (e: any) {
        if (!cancelled) setApiError(`Не удалось подключиться к API: ${e.message}`);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadAll();
    return () => { cancelled = true; };
  }, []);

  // ══════════════════════════════════════════════════════════════
  // ОБРАБОТЧИК ПРОДАЖИ — сохраняем в БД, обновляем state
  // ══════════════════════════════════════════════════════════════
  const handleSale = useCallback(async (s: Sale) => {
    try {
      const saved = await apiPostSale(s);
      // Сервер сам обновил qty товара и sum клиента,
      // поэтому перечитываем актуальные данные из БД
      const [freshProds, freshClients] = await Promise.all([
        apiGetProducts(),
        apiGetClients(),
      ]);
      setSales(prev => [saved, ...prev]);
      setProducts(freshProds);
      setClients(freshClients);
      msg("✅ Продажа оформлена!");
      setShowSale(false);
    } catch (e: any) {
      msg(`❌ Ошибка: ${e.message}`);
    }
  }, []);

  // ══════════════════════════════════════════════════════════════
  // ОБРАБОТЧИК ДОБАВЛЕНИЯ КЛИЕНТА (прокидывается в Customers)
  // ══════════════════════════════════════════════════════════════
  const handleSetClients = useCallback(
    (fn: (prev: Client[]) => Client[]) => {
      // Customers.tsx вызывает setClients(prev => [...prev, newClient])
      // Мы перехватываем: newClient ещё не имеет id из БД
      // Поэтому в Customers.tsx мы передаём особые функции (см. ниже)
      setClients(fn);
    },
    []
  );

  // ══════════════════════════════════════════════════════════════
  // ОБРАБОТЧИК ДОБАВЛЕНИЯ/РЕДАКТИРОВАНИЯ ТОВАРА
  // ══════════════════════════════════════════════════════════════
  const handleSetProducts = useCallback(
    (fn: (prev: Product[]) => Product[]) => {
      setProducts(fn);
    },
    []
  );

  // ── Navigate ──
  function nav(p: string) { setPage(p); setSideOpen(false); }

  // ── Экран загрузки ──
  if (loading) {
    return (
      <div style={{ minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center", background:"#f4f4f6", flexDirection:"column", gap:12 }}>
        <div style={{ width:48, height:48, borderRadius:12, background:OR, display:"flex", alignItems:"center", justifyContent:"center", color:"#fff", fontWeight:900, fontSize:22 }}>O</div>
        <div style={{ fontWeight:700, fontSize:16, color:"#444" }}>OZD загружается...</div>
        <div style={{ fontSize:13, color:"#aaa" }}>Получаем данные из базы данных</div>
      </div>
    );
  }

  // ── Ошибка API ──
  if (apiError) {
    return (
      <div style={{ minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center", background:"#f4f4f6", flexDirection:"column", gap:12, padding:20 }}>
        <div style={{ fontSize:36 }}>⚠️</div>
        <div style={{ fontWeight:700, fontSize:16, color:"#e74c3c" }}>Ошибка подключения к API</div>
        <div style={{ fontSize:13, color:"#888", textAlign:"center", maxWidth:400 }}>{apiError}</div>
        <button
          onClick={() => window.location.reload()}
          style={{ marginTop:8, padding:"9px 22px", borderRadius:8, background:OR, color:"#fff", border:"none", cursor:"pointer", fontWeight:700, fontSize:13 }}
        >
          Повторить попытку
        </button>
      </div>
    );
  }

  // ── Page renderer ──
  function renderPage() {
    switch (page) {
      case "all-sales":    return <PageAllSales sales={sales} onNewSale={() => setShowSale(true)} />;
      case "kassa-smeny":  return <PageKassaSmeny sales={sales} />;
      case "kassa-ops":    return <PageKassaOps kassaOps={kassaOps} onAdd={() => setShowKassaOp(true)} />;
      case "catalog":      return <PageCatalog products={products} setProducts={handleSetProducts} apiPostProduct={apiPostProduct} apiPatchProduct={apiPatchProduct} apiDeleteProduct={apiDeleteProduct} />;
      case "postupleniya": return <PagePostupleniya />;
      case "revision":     return <PageRevision />;
      case "transfer":     return <PageTransfer />;
      case "repricing":    return <PageRepricing />;
      case "spisanie":     return <PageSpisanie />;
      case "suppliers":    return <PageSuppliers suppliers={suppliers} setSuppliers={setSuppliers} />;
      case "clients":      return <PageClients clients={clients} setClients={handleSetClients} apiPostClient={apiPostClient} apiPatchClient={apiPatchClient} apiDeleteClient={apiDeleteClient} />;
      case "groups":       return <PageGroups clients={clients} />;
      case "loyalty":      return <PageLoyalty />;
      case "debts":        return <PageDebts clients={clients} sales={sales} setClients={handleSetClients} />;
      case "staff":        return <PageStaff staff={staff} setStaff={setStaff} />;
      case "roles":        return <PageRoles staff={staff} />;
      case "profile":      return <PageProfile />;
      case "general":      return <PageGeneral />;
      case "subscription": return <PageSubscription />;
      case "kassacfg":     return <PageKassaSettings />;
      case "refs":         return <PageRefs />;
      case "notifications":return <PageNotifications />;
      case "integrations": return <PageIntegrations />;
      default:             return <PageInDev title="Страница" bread="Главная" desc="В разработке" />;
    }
  }

  return (
    <div style={{ minHeight:"100vh", background:"#f4f4f6", fontFamily:"system-ui,-apple-system,sans-serif", color:"#1a1a1a" }}>
      <Sidebar page={page} setPage={nav} open={sideOpen} setOpen={setSideOpen} />
      <TopBar onMenu={() => setSideOpen(true)} onSale={() => setShowSale(true)} />
      <div style={{ paddingBottom:40 }}>{renderPage()}</div>

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
          onSave={async (op) => {
            try {
              const saved = await apiPostKassaOp(op);
              setKassaOps(prev => [saved, ...prev]);
              msg("✅ Операция добавлена!");
            } catch (e: any) {
              msg(`❌ Ошибка: ${e.message}`);
            }
          }}
        />
      )}

      <Toast msg={toast} />
    </div>
  );
}
