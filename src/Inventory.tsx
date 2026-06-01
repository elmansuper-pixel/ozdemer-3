import { useState } from "react";
import {
  OR, OL, fmt, toDay,
  Sc, mkBtn, mkBadge,
  Modal, PageHead, StatCard, Grid2,
  SearchBar, Tabs, EmptyState, Pagination,
  INIT_CATEGORIES, INVENTORY_DATA, TRANSFER_DATA,
  REPRICING_DATA, WRITEOFF_DATA,
} from "./shared";
import type { Product, Supplier } from "./App";

// ── Каталог ───────────────────────────────────────────────────────────────────

export function PageCatalog({
  products,
  setProducts,
}: {
  products:    Product[];
  setProducts: (fn: (prev: Product[]) => Product[]) => void;
}) {
  const [q,         setQ]         = useState("");
  const [tab,       setTab]       = useState("all");
  const [showAdd,   setShowAdd]   = useState(false);
  const [showEdit,  setShowEdit]  = useState<Product | null>(null);
  const [showStats, setShowStats] = useState(true);
  const [page,      setPage]      = useState(1);
  const PER = 50;

  const [nP, setNP] = useState({
    name: "", cat: "", qty: "", retail: "", opt: "", cost: "", barcode: "",
  });

  const totQty    = products.reduce((a, p) => a + p.qty,            0);
  const totCost   = products.reduce((a, p) => a + p.qty * p.cost,   0);
  const totRetail = products.reduce((a, p) => a + p.qty * p.retail, 0);

  const shown = products.filter(p => {
    const qm =
      !q ||
      p.name.toLowerCase().includes(q.toLowerCase()) ||
      p.art.includes(q) ||
      p.cat.toLowerCase().includes(q.toLowerCase()) ||
      (p.barcode ?? "").includes(q);
    if (tab === "active")   return qm && p.qty > 0;
    if (tab === "inactive") return qm && p.qty === 0;
    if (tab === "low")      return qm && p.qty <= 2 && p.qty > 0;
    if (tab === "zero")     return qm && p.qty === 0;
    return qm;
  });

  const paged = shown.slice((page - 1) * PER, page * PER);

  const tabList = [
    { k: "all",      l: `Все (${products.length})` },
    { k: "active",   l: `Активные (${products.filter(p => p.qty > 0).length})` },
    { k: "inactive", l: `Неактивные (${products.filter(p => p.qty === 0).length})` },
    { k: "low",      l: `Малый остаток (${products.filter(p => p.qty <= 2 && p.qty > 0).length})` },
    { k: "zero",     l: `Нулевой остаток (${products.filter(p => p.qty === 0).length})` },
  ];

  function addProduct() {
    if (!nP.name || !nP.retail) return;
    setProducts(prev => [
      ...prev,
      {
        id:      Date.now(),
        art:     String(10000 + prev.length + 1),
        name:    nP.name,
        cat:     nP.cat || "Другое",
        qty:     Number(nP.qty)    || 0,
        retail:  Number(nP.retail) || 0,
        opt:     Number(nP.opt)    || 0,
        cost:    Number(nP.cost)   || 0,
        barcode: nP.barcode || "",
      },
    ]);
    setNP({ name: "", cat: "", qty: "", retail: "", opt: "", cost: "", barcode: "" });
    setShowAdd(false);
  }

  function saveEdit(p: Product) {
    setProducts(prev => prev.map(x => (x.id === p.id ? p : x)));
    setShowEdit(null);
  }

  function deleteProduct(id: number) {
    setProducts(prev => prev.filter(p => p.id !== id));
  }

  return (
    <div>
      <PageHead
        title="Каталог"
        bread="Главная › Склад › Список товаров"
        right={
          <>
            <button
              onClick={() => setShowStats(s => !s)}
              style={mkBtn("s", { fontSize: 12 })}
            >
              📊 {showStats ? "Скрыть" : "Показать"} статистику
            </button>
            <button style={mkBtn("s", { fontSize: 12 })}>🗂</button>
            <button style={mkBtn("s", { fontSize: 12 })}>⚙</button>
          </>
        }
      />

      <div style={{ padding: "12px 14px" }}>

        {/* Статистика */}
        {showStats && (
          <Grid2>
            <StatCard
              label="Товаров"
              value={products.length}
              sub="Всего в каталоге"
              ico="📦"
            />
            <StatCard
              label="Товарных единиц"
              value={fmt(totQty)}
              sub="Сумма остатков"
              ico="📚"
            />
            <StatCard
              label="Сумма по цене поставки"
              value={`${fmt(totCost)} ₸`}
              sub="Стоимость склада"
              ico="🛒"
            />
            <StatCard
              label="Сумма по цене продажи"
              value={`${fmt(totRetail)} ₸`}
              sub="Потенциальная выручка"
              ico="📈"
            />
          </Grid2>
        )}

        {/* Вкладки */}
        <Tabs
          tabs={tabList}
          active={tab}
          onChange={v => { setTab(v); setPage(1); }}
        />

        {/* Панель действий */}
        <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
          <SearchBar
            value={q}
            onChange={v => { setQ(v); setPage(1); }}
            placeholder="Артикул, баркод, наименование"
          />
          <button style={mkBtn("s", { fontSize: 12 })}>⚙ Действия</button>
          <button
            onClick={() => setShowAdd(true)}
            style={mkBtn("p", { fontSize: 12 })}
          >
            + Создать
          </button>
        </div>

        {/* Таблица */}
        <div style={{ ...Sc.card, padding: 0, overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 680 }}>
            <thead>
              <tr>
                <th style={{ ...Sc.th, width: 32 }}>
                  <input type="checkbox" style={{ accentColor: OR }} />
                </th>
                <th style={Sc.th}>Фото</th>
                <th style={Sc.th}>Артикул</th>
                <th style={Sc.th}>Наименование</th>
                <th style={Sc.th}>Баркод</th>
                <th style={Sc.th}>Категория</th>
                <th style={{ ...Sc.th, textAlign: "right" }}>Кол-во</th>
                <th style={{ ...Sc.th, textAlign: "right" }}>Розница</th>
                <th style={{ ...Sc.th, textAlign: "right" }}>Оптом</th>
                <th style={{ ...Sc.th, textAlign: "right" }}>Себ-ть</th>
                <th style={Sc.th}></th>
              </tr>
            </thead>
            <tbody>
              {paged.map(p => (
                <tr
                  key={p.id}
                  style={{ cursor: "pointer" }}
                  onMouseEnter={e => (e.currentTarget.style.background = "#fafafa")}
                  onMouseLeave={e => (e.currentTarget.style.background = "")}
                >
                  <td style={Sc.td}>
                    <input type="checkbox" style={{ accentColor: OR }} />
                  </td>
                  <td style={Sc.td}>
                    <div style={{
                      width: 36, height: 36, background: "#f0f0f0",
                      borderRadius: 7,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      color: "#ccc", fontSize: 16,
                    }}>
                      📷
                    </div>
                  </td>
                  <td style={{ ...Sc.td, color: OR, fontWeight: 700 }}>{p.art}</td>
                  <td style={{ ...Sc.td, fontWeight: 500, maxWidth: 160 }}>
                    <div style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {p.name}
                    </div>
                  </td>
                  <td style={{ ...Sc.td, fontSize: 11, color: "#aaa" }}>
                    {p.barcode || "—"}
                  </td>
                  <td style={{ ...Sc.td, fontSize: 12, color: "#888" }}>{p.cat}</td>
                  <td style={{
                    ...Sc.td, textAlign: "right", fontWeight: 700,
                    color: p.qty === 0 ? "#e74c3c" : p.qty <= 2 ? "#f39c12" : "#1a1a1a",
                  }}>
                    {p.qty}
                  </td>
                  <td style={{ ...Sc.td, textAlign: "right", color: OR, fontWeight: 600 }}>
                    {fmt(p.retail)} ₸
                  </td>
                  <td style={{ ...Sc.td, textAlign: "right" }}>{fmt(p.opt)} ₸</td>
                  <td style={{ ...Sc.td, textAlign: "right", color: "#888" }}>
                    {fmt(p.cost)} ₸
                  </td>
                  <td style={Sc.td}>
                    <div style={{ display: "flex", gap: 4 }}>
                      <button
                        onClick={() => setShowEdit({ ...p })}
                        style={{
                          background: "none", border: "1px solid #e0e0e0",
                          borderRadius: 5, padding: "3px 8px",
                          cursor: "pointer", fontSize: 11, color: "#555",
                        }}
                      >
                        ✏
                      </button>
                      <button
                        onClick={() => deleteProduct(p.id)}
                        style={{
                          background: "#fee", border: "1px solid #fcc",
                          borderRadius: 5, padding: "3px 8px",
                          cursor: "pointer", fontSize: 11, color: "#e74c3c",
                        }}
                      >
                        ✕
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {shown.length === 0 && (
            <EmptyState
              icon="📦"
              title="Товары не найдены"
              sub="Попробуйте изменить параметры поиска"
            />
          )}

          <div style={{
            padding: "0 12px", borderTop: "1px solid #f0f0f0",
            display: "flex", justifyContent: "space-between", alignItems: "center",
          }}>
            <Pagination
              page={page}
              total={shown.length}
              perPage={PER}
              onChange={setPage}
            />
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <button style={mkBtn("s", { fontSize: 12 })}>⬇ Скачать</button>
              <span style={{ fontSize: 12, color: "#aaa" }}>
                Показать по {PER} ▾
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Modal: Добавить товар */}
      {showAdd && (
        <Modal title="Новый товар" onClose={() => setShowAdd(false)} width={520}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>

            <div style={{ gridColumn: "1 / -1" }}>
              <label style={Sc.lbl}>Наименование *</label>
              <input
                value={nP.name}
                onChange={e => setNP(p => ({ ...p, name: e.target.value }))}
                style={Sc.inp}
                placeholder="Название товара"
                autoFocus
              />
            </div>

            <div>
              <label style={Sc.lbl}>Категория</label>
              <select
                value={nP.cat}
                onChange={e => setNP(p => ({ ...p, cat: e.target.value }))}
                style={{ ...Sc.inp, appearance: "none" }}
              >
                <option value="">— выберите —</option>
                {INIT_CATEGORIES.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
                <option value="Другое">Другое</option>
              </select>
            </div>

            <div>
              <label style={Sc.lbl}>Баркод</label>
              <input
                value={nP.barcode}
                onChange={e => setNP(p => ({ ...p, barcode: e.target.value }))}
                style={Sc.inp}
                placeholder="Штрихкод"
              />
            </div>

            <div>
              <label style={Sc.lbl}>Количество</label>
              <input
                type="number"
                value={nP.qty}
                onChange={e => setNP(p => ({ ...p, qty: e.target.value }))}
                style={Sc.inp}
              />
            </div>

            <div>
              <label style={Sc.lbl}>Розничная цена (₸) *</label>
              <input
                type="number"
                value={nP.retail}
                onChange={e => setNP(p => ({ ...p, retail: e.target.value }))}
                style={Sc.inp}
              />
            </div>

            <div>
              <label style={Sc.lbl}>Оптовая цена (₸)</label>
              <input
                type="number"
                value={nP.opt}
                onChange={e => setNP(p => ({ ...p, opt: e.target.value }))}
                style={Sc.inp}
              />
            </div>

            <div>
              <label style={Sc.lbl}>Себестоимость (₸)</label>
              <input
                type="number"
                value={nP.cost}
                onChange={e => setNP(p => ({ ...p, cost: e.target.value }))}
                style={Sc.inp}
              />
            </div>
          </div>

          {nP.retail && nP.cost && (
            <div style={{
              background: "#f9f9f9", borderRadius: 8,
              padding: "10px 14px", marginTop: 12, fontSize: 13,
            }}>
              Маржа:{" "}
              <b style={{ color: OR }}>
                {fmt(Number(nP.retail) - Number(nP.cost))} ₸
              </b>
              {" "}(
              {(((Number(nP.retail) - Number(nP.cost)) / Number(nP.retail)) * 100).toFixed(1)}
              %)
            </div>
          )}

          <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 18 }}>
            <button onClick={() => setShowAdd(false)} style={mkBtn("s")}>Отмена</button>
            <button onClick={addProduct} style={mkBtn()}>Сохранить</button>
          </div>
        </Modal>
      )}

      {/* Modal: Редактировать товар */}
      {showEdit && (
        <Modal title="Редактировать товар" onClose={() => setShowEdit(null)} width={520}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div style={{ gridColumn: "1 / -1" }}>
              <label style={Sc.lbl}>Наименование</label>
              <input
                value={showEdit.name}
                onChange={e => setShowEdit(p => p ? { ...p, name: e.target.value } : p)}
                style={Sc.inp}
              />
            </div>
            {(
              [
                ["Количество",      "qty",    "number"],
                ["Розница (₸)",     "retail", "number"],
                ["Оптом (₸)",       "opt",    "number"],
                ["Себестоимость (₸)","cost",  "number"],
              ] as [string, keyof Product, string][]
            ).map(([l, k, t]) => (
              <div key={k as string}>
                <label style={Sc.lbl}>{l}</label>
                <input
                  type={t}
                  value={showEdit[k] as number}
                  onChange={e =>
                    setShowEdit(p => p ? { ...p, [k]: Number(e.target.value) } : p)
                  }
                  style={Sc.inp}
                />
              </div>
            ))}
          </div>
          <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 18 }}>
            <button onClick={() => setShowEdit(null)} style={mkBtn("s")}>Отмена</button>
            <button onClick={() => showEdit && saveEdit(showEdit)} style={mkBtn()}>
              Сохранить
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}

// ── Закупки ───────────────────────────────────────────────────────────────────

export function PagePostupleniya() {
  const [tab,    setTab]    = useState("orders");
  const [subTab, setSubTab] = useState("all");

  const subTabs = [
    { k: "all",     l: "Все (0)" },
    { k: "unpaid",  l: "Неоплаченные (0)" },
    { k: "partial", l: "Частично оплаченные (0)" },
    { k: "paid",    l: "Оплаченные (0)" },
  ];

  return (
    <div>
      <PageHead
        title="Заказы поставщиков"
        sub="Управление заказами и возвратами поставщиков"
        bread="Главная › Склад › Закупки"
        right={
          <button style={mkBtn("p", { fontSize: 12 })}>+ Создать</button>
        }
      />
      <div style={{ padding: "12px 14px" }}>

        {/* Переключатель Заказы / Возвраты */}
        <div style={{ display: "flex", marginBottom: 14 }}>
          {[
            ["orders",  "Список заказов"],
            ["returns", "Возвраты заказов"],
          ].map(([k, l]) => (
            <button
              key={k}
              onClick={() => setTab(k)}
              style={{
                flex: 1, padding: "10px 16px", border: "none",
                cursor: "pointer", fontSize: 13, fontWeight: 600,
                background: tab === k ? OR : "#f0f0f0",
                color: tab === k ? "#fff" : "#555",
                borderRadius:
                  k === "orders" ? "6px 0 0 6px" : "0 6px 6px 0",
              }}
            >
              {l}
            </button>
          ))}
        </div>

        {/* Подфильтры */}
        <div style={{ display: "flex", gap: 6, marginBottom: 14 }}>
          {subTabs.map(({ k, l }) => (
            <button
              key={k}
              onClick={() => setSubTab(k)}
              style={{
                padding: "6px 14px", borderRadius: 6, border: "none",
                cursor: "pointer", fontSize: 12, fontWeight: 700,
                background: subTab === k ? OR : "#f0f0f0",
                color: subTab === k ? "#fff" : "#555",
              }}
            >
              {l}
            </button>
          ))}
        </div>

        {/* Поиск */}
        <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
          <SearchBar value="" onChange={() => {}} placeholder="ID, наименование поставщика" />
          <button style={mkBtn("s", { fontSize: 12 })}>▾ Фильтры</button>
        </div>

        <div style={Sc.card}>
          <EmptyState
            icon="📋"
            title="Нет заказов"
            sub="Создайте первый заказ, чтобы начать работу"
            action={<button style={mkBtn()}>+ Создать заказ</button>}
          />
        </div>
      </div>
    </div>
  );
}

// ── Ревизия / Инвентаризация ──────────────────────────────────────────────────

export function PageRevision() {
  const [q, setQ] = useState("");

  const shown = INVENTORY_DATA.filter(
    r =>
      !q ||
      r.name.toLowerCase().includes(q.toLowerCase()) ||
      r.store.toLowerCase().includes(q.toLowerCase())
  );

  return (
    <div>
      <PageHead
        title="Инвентаризация"
        bread="Главная › Склад › Ревизия"
        right={
          <button style={mkBtn("p", { fontSize: 12 })}>
            + Новая инвентаризация
          </button>
        }
      />
      <div style={{ padding: "12px 14px" }}>

        <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
          <SearchBar value={q} onChange={setQ} placeholder="ID, наименование, магазин..." />
          <button style={mkBtn("s", { fontSize: 12 })}>▾ Фильтры</button>
        </div>

        <div style={{ ...Sc.card, padding: 0, overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 560 }}>
            <thead>
              <tr>
                {["ID", "Наименование", "Магазин", "Кол-во", "Разница", "Сумма", "Действие", ""].map(h => (
                  <th key={h} style={Sc.th}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {shown.map(r => (
                <tr
                  key={r.id}
                  onMouseEnter={e => (e.currentTarget.style.background = "#fafafa")}
                  onMouseLeave={e => (e.currentTarget.style.background = "")}
                >
                  <td style={Sc.td}>{r.id}</td>
                  <td style={{ ...Sc.td, color: OR, fontWeight: 600, cursor: "pointer" }}>
                    {r.name}
                  </td>
                  <td style={Sc.td}>{r.store}</td>
                  <td style={Sc.td}>{r.qty}</td>
                  <td style={Sc.td}>
                    <div style={{ fontSize: 12, lineHeight: 1.8 }}>
                      <div><span style={{ color: "#1a8a3a", fontWeight: 600 }}>⊕ {r.plus}</span></div>
                      <div><span style={{ color: OR,        fontWeight: 600 }}>⊖ {r.minus}</span></div>
                      <div><span style={{ color: "#3498db", fontWeight: 600 }}>● {r.zero}</span></div>
                    </div>
                  </td>
                  <td style={{ ...Sc.td, fontWeight: 700 }}>{fmt(r.diff)} ₸</td>
                  <td style={Sc.td}>
                    <span style={mkBadge(r.status === "Полностью" ? "gr" : "or")}>
                      {r.status}
                    </span>
                  </td>
                  <td style={Sc.td}>
                    <button style={{
                      background: "none", border: "none",
                      cursor: "pointer", color: "#bbb", fontSize: 20,
                    }}>
                      ⋯
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {shown.length === 0 && (
            <EmptyState icon="📋" title="Инвентаризаций нет" />
          )}

          <div style={{
            padding: "8px 14px",
            display: "flex", justifyContent: "space-between",
            borderTop: "1px solid #f0f0f0",
            fontSize: 12, color: "#aaa",
          }}>
            <span>◀ 1 ▶</span>
            <span>Показать по 20 ▾</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Перемещения ───────────────────────────────────────────────────────────────

export function PageTransfer() {
  const [q, setQ] = useState("");

  const shown = TRANSFER_DATA.filter(
    r => !q || r.name.toLowerCase().includes(q.toLowerCase())
  );

  return (
    <div>
      <PageHead
        title="Трансфер"
        bread="Главная › Склад › Перемещения"
        right={
          <button style={mkBtn("p", { fontSize: 12 })}>+ Новый трансфер</button>
        }
      />
      <div style={{ padding: "12px 14px" }}>

        <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
          <SearchBar value={q} onChange={setQ} placeholder="ID, наименование, магазин" />
          <button style={mkBtn("s", { fontSize: 12 })}>▾ Фильтры</button>
        </div>

        <div style={{ ...Sc.card, padding: 0, overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 520 }}>
            <thead>
              <tr>
                {["ID", "Наименование", "Из магазина", "В магазин", "Кол-во", "Статус"].map(h => (
                  <th key={h} style={Sc.th}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {shown.map(r => (
                <tr
                  key={r.id}
                  onMouseEnter={e => (e.currentTarget.style.background = "#fafafa")}
                  onMouseLeave={e => (e.currentTarget.style.background = "")}
                >
                  <td style={Sc.td}>{r.id}</td>
                  <td style={{ ...Sc.td, color: OR, fontWeight: 600, cursor: "pointer" }}>
                    {r.name}
                  </td>
                  <td style={Sc.td}>{r.from}</td>
                  <td style={Sc.td}>{r.to}</td>
                  <td style={Sc.td}>
                    <div style={{ fontSize: 12, lineHeight: 1.8 }}>
                      <div style={{ color: OR }}>↓ {r.qtyOut}</div>
                      <div style={{ color: "#1a8a3a" }}>● {r.qtyIn}</div>
                    </div>
                  </td>
                  <td style={Sc.td}>
                    <span style={mkBadge(r.status === "Завершён" ? "gr" : "or")}>
                      {r.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {shown.length === 0 && (
            <EmptyState icon="🚚" title="Перемещений нет" />
          )}

          <div style={{
            padding: "8px 14px",
            display: "flex", justifyContent: "space-between",
            borderTop: "1px solid #f0f0f0",
            fontSize: 12, color: "#aaa",
          }}>
            <span>◀ 1 ▶</span>
            <div style={{ display: "flex", gap: 10 }}>
              <button style={mkBtn("s", { fontSize: 12 })}>⬇ Скачать</button>
              <span>Показать по 20 ▾</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Редактор цен (Переоценка) ─────────────────────────────────────────────────

export function PageRepricing() {
  const [q, setQ] = useState("");

  const shown = REPRICING_DATA.filter(
    r => !q || r.name.toLowerCase().includes(q.toLowerCase())
  );

  return (
    <div>
      <PageHead
        title="Переоценка"
        sub="Управление переоценкой товаров"
        bread="Главная › Склад › Редактор цен"
        right={
          <button style={mkBtn("p", { fontSize: 12 })}>+ Новая переоценка</button>
        }
      />
      <div style={{ padding: "12px 14px" }}>

        <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
          <SearchBar value={q} onChange={setQ} placeholder="ID, наименование, магазин" />
          <button style={mkBtn("s", { fontSize: 12 })}>▾ Фильтры</button>
        </div>

        <div style={{ ...Sc.card, padding: 0, overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 560 }}>
            <thead>
              <tr>
                {["Номер", "Дата", "Название акта", "Магазин", "Тип", "Кол-во", "Статус"].map(h => (
                  <th key={h} style={Sc.th}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {shown.map(r => (
                <tr
                  key={r.id}
                  onMouseEnter={e => (e.currentTarget.style.background = "#fafafa")}
                  onMouseLeave={e => (e.currentTarget.style.background = "")}
                >
                  <td style={{ ...Sc.td, color: OR, fontWeight: 600 }}>{r.id}</td>
                  <td style={{ ...Sc.td, fontSize: 12, color: "#888" }}>{r.date}</td>
                  <td style={Sc.td}>{r.name}</td>
                  <td style={Sc.td}>{r.store}</td>
                  <td style={Sc.td}>
                    <span style={mkBadge("or")}>{r.type}</span>
                  </td>
                  <td style={Sc.td}>{r.qty} шт</td>
                  <td style={Sc.td}>
                    <span style={mkBadge("gr")}>{r.status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {shown.length === 0 && (
            <EmptyState icon="🏷" title="Переоценок нет" />
          )}
        </div>
      </div>
    </div>
  );
}

// ── Списания ──────────────────────────────────────────────────────────────────

export function PageSpisanie() {
  const [q, setQ] = useState("");

  const shown = WRITEOFF_DATA.filter(
    r => !q || r.name.toLowerCase().includes(q.toLowerCase())
  );

  return (
    <div>
      <PageHead
        title="Списание"
        sub="Управление списанием товаров"
        bread="Главная › Склад › Списания"
        right={
          <button style={mkBtn("p", { fontSize: 12 })}>+ Новое списание</button>
        }
      />
      <div style={{ padding: "12px 14px" }}>

        <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
          <SearchBar value={q} onChange={setQ} placeholder="ID, наименование, магазин" />
          <button style={mkBtn("s", { fontSize: 12 })}>▾ Фильтры</button>
        </div>

        <div style={{ ...Sc.card, padding: 0, overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 540 }}>
            <thead>
              <tr>
                {["Номер", "Наименование", "Магазин", "Кол-во", "Сумма (Убыток)", "Тип списания", "Статус"].map(h => (
                  <th key={h} style={Sc.th}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {shown.map(r => (
                <tr
                  key={r.id}
                  onMouseEnter={e => (e.currentTarget.style.background = "#fafafa")}
                  onMouseLeave={e => (e.currentTarget.style.background = "")}
                >
                  <td style={{ ...Sc.td, color: OR, fontWeight: 600 }}>{r.id}</td>
                  <td style={Sc.td}>
                    <div style={{ fontWeight: 500 }}>{r.name}</div>
                    <div style={{ fontSize: 11, color: "#aaa" }}>{r.date}</div>
                  </td>
                  <td style={Sc.td}>{r.store}</td>
                  <td style={Sc.td}>{r.qty}</td>
                  <td style={{ ...Sc.td, color: "#e74c3c", fontWeight: 600 }}>
                    ↓ {fmt(r.sum)} ₸
                  </td>
                  <td style={Sc.td}>
                    <span style={mkBadge("rd")}>{r.type}</span>
                  </td>
                  <td style={Sc.td}>
                    <span style={mkBadge("gr")}>{r.status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {shown.length === 0 && (
            <EmptyState icon="🗑" title="Списаний нет" />
          )}
        </div>
      </div>
    </div>
  );
}

// ── Поставщики ────────────────────────────────────────────────────────────────

export function PageSuppliers({
  suppliers,
  setSuppliers,
}: {
  suppliers:    Supplier[];
  setSuppliers: (fn: (prev: Supplier[]) => Supplier[]) => void;
}) {
  const [showAdd,   setShowAdd]   = useState(false);
  const [showStats, setShowStats] = useState(true);
  const [q,         setQ]         = useState("");
  const [debtOnly,  setDebtOnly]  = useState(false);

  const [form, setForm] = useState({
    name: "", phone: "", email: "", balance: 0, comment: "",
  });

  const shown = suppliers.filter(
    s =>
      (!q || s.name.toLowerCase().includes(q.toLowerCase())) &&
      (!debtOnly || s.balance > 0)
  );

  const totalDebt = suppliers.reduce((a, s) => a + Math.max(0, s.balance), 0);

  function addSupplier() {
    if (!form.name) return;
    setSuppliers(prev => [
      ...prev,
      {
        id:      Date.now(),
        name:    form.name,
        phone:   form.phone,
        email:   form.email,
        balance: Number(form.balance) || 0,
        orders:  0,
        goods:   0,
        comment: form.comment,
      },
    ]);
    setForm({ name: "", phone: "", email: "", balance: 0, comment: "" });
    setShowAdd(false);
  }

  return (
    <div>
      <PageHead
        title="Поставщики"
        sub="Управление поставщиками"
        bread="Главная › Склад › Поставщики"
        right={
          <>
            <button
              onClick={() => setShowStats(s => !s)}
              style={mkBtn("s", { fontSize: 12 })}
            >
              🙈 {showStats ? "Скрыть" : "Показать"} статистику
            </button>
            <button style={mkBtn("s", { fontSize: 12 })}>🗂 Архив</button>
            <button
              onClick={() => setShowAdd(true)}
              style={mkBtn("p", { fontSize: 12 })}
            >
              + Новый поставщик
            </button>
          </>
        }
      />
      <div style={{ padding: "12px 14px" }}>

        {/* Статистика */}
        {showStats && (
          <div style={{
            display: "grid", gridTemplateColumns: "repeat(4, 1fr)",
            gap: 10, marginBottom: 14,
          }}>
            <StatCard label="Кол-во поставщиков"  value={`${suppliers.length} шт`} />
            <StatCard label="Общая сумма долга"    value={`${fmt(totalDebt)} ₸`} />
            <StatCard label="Общая сумма заказов"  value="0 ₸" />
            <StatCard label="Общая сумма оплат"    value="0 ₸" />
          </div>
        )}

        {/* Панель действий */}
        <div style={{ display: "flex", gap: 8, marginBottom: 12, alignItems: "center" }}>
          <SearchBar value={q} onChange={setQ} placeholder="ID, имя, телефон..." />
          <label style={{
            display: "flex", alignItems: "center", gap: 6,
            cursor: "pointer", fontSize: 13, whiteSpace: "nowrap",
          }}>
            <input
              type="checkbox"
              checked={debtOnly}
              onChange={e => setDebtOnly(e.target.checked)}
              style={{ accentColor: OR }}
            />
            Есть долг
          </label>
          <button style={mkBtn("s", { fontSize: 12 })}>+ Добавить оплату</button>
        </div>

        {/* Таблица */}
        <div style={{ ...Sc.card, padding: 0, overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                <th style={{ ...Sc.th, width: 32 }}>
                  <input type="checkbox" style={{ accentColor: OR }} />
                </th>
                {["ID", "Наименование", "Контакты", "Текущий баланс", "Кол-во товаров", "Действия"].map(h => (
                  <th key={h} style={Sc.th}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {shown.length === 0 ? (
                <tr>
                  <td colSpan={7}>
                    <EmptyState
                      icon="🏭"
                      title="Поставщиков нет"
                      sub="Добавьте первого поставщика"
                    />
                  </td>
                </tr>
              ) : (
                shown.map((s, i) => (
                  <tr
                    key={s.id}
                    onMouseEnter={e => (e.currentTarget.style.background = "#fafafa")}
                    onMouseLeave={e => (e.currentTarget.style.background = "")}
                  >
                    <td style={Sc.td}>
                      <input type="checkbox" style={{ accentColor: OR }} />
                    </td>
                    <td style={Sc.td}>{i + 1}</td>
                    <td style={{ ...Sc.td, color: OR, fontWeight: 600, cursor: "pointer" }}>
                      {s.name}
                    </td>
                    <td style={Sc.td}>
                      <div style={{ fontSize: 12 }}>{s.phone || "—"}</div>
                      {!s.phone && (
                        <div style={{ fontSize: 11, color: "#bbb" }}>Нет телефона</div>
                      )}
                    </td>
                    <td style={{
                      ...Sc.td, fontWeight: 700,
                      color: s.balance > 0 ? "#e74c3c" : "#333",
                    }}>
                      {fmt(Math.abs(s.balance))} ₸
                    </td>
                    <td style={Sc.td}>{s.goods} шт</td>
                    <td style={Sc.td}>
                      <button style={{
                        background: "none", border: "none",
                        cursor: "pointer", color: "#bbb", fontSize: 20,
                      }}>
                        ⋯
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Новый поставщик */}
      {showAdd && (
        <Modal title="Новый поставщик" onClose={() => setShowAdd(false)} width={480}>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>

            <div>
              <label style={Sc.lbl}>Наименование *</label>
              <input
                value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                style={Sc.inp}
                placeholder="ООО «Поставщик»"
                autoFocus
              />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <div>
                <label style={Sc.lbl}>Телефон</label>
                <input
                  value={form.phone}
                  onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                  style={Sc.inp}
                  placeholder="+7 700 000 00 00"
                />
              </div>
              <div>
                <label style={Sc.lbl}>Email</label>
                <input
                  value={form.email}
                  onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                  style={Sc.inp}
                  placeholder="supplier@example.com"
                />
              </div>
            </div>

            <div>
              <label style={Sc.lbl}>Начальный баланс (₸)</label>
              <input
                type="number"
                value={form.balance}
                onChange={e => setForm(f => ({ ...f, balance: Number(e.target.value) }))}
                style={Sc.inp}
              />
            </div>

            <div>
              <label style={Sc.lbl}>Комментарий</label>
              <textarea
                value={form.comment}
                onChange={e => setForm(f => ({ ...f, comment: e.target.value }))}
                style={{ ...Sc.inp, height: 64, resize: "vertical" }}
                placeholder="Необязательно"
              />
            </div>
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 18 }}>
            <button onClick={() => setShowAdd(false)} style={mkBtn("s")}>Отмена</button>
            <button onClick={addSupplier} style={mkBtn()}>Сохранить</button>
          </div>
        </Modal>
      )}
    </div>
  );
}
