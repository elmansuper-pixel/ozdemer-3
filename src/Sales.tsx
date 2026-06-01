import { useState } from "react";
import {
  OR, OL, fmt, toDay, toTime, rcpId,
  Sc, mkBtn, mkBadge,
  Modal, PageHead, StatCard, Grid2,
  SearchBar, DateFilter, EmptyState, Pagination,
} from "./shared";
import type { Sale, Product, Client, KassaOp } from "./App";

const PAY_LABELS: Record<string, string> = {
  cash:   "Наличные",
  visa:   "Visa / Master",
  kaspiG: "Kaspi Gold",
  kaspiR: "Kaspi Red",
  debt:   "В долг",
};

// ── Все продажи ───────────────────────────────────────────────────────────────

export function PageAllSales({
  sales,
  onNewSale,
}: {
  sales: Sale[];
  onNewSale: () => void;
}) {
  const [q,    setQ]    = useState("");
  const [df,   setDf]   = useState("Сегодня");
  const [page, setPage] = useState(1);
  const PER = 10;

  const todaySales = sales.filter(s => s.date === toDay() && s.type === "продажа");

  const shown = q
    ? sales.filter(
        s =>
          s.rcpId?.toLowerCase().includes(q.toLowerCase()) ||
          s.pName?.toLowerCase().includes(q.toLowerCase())
      )
    : sales;

  const paged = shown.slice((page - 1) * PER, page * PER);

  const totalSum    = todaySales.reduce((a, s) => a + s.total, 0);
  const totalQty    = todaySales.reduce((a, s) => a + s.qty,   0);
  const totalCash   = todaySales.filter(s => s.pay === "cash"  ).reduce((a, s) => a + s.total, 0);
  const totalVisa   = todaySales.filter(s => s.pay === "visa"  ).reduce((a, s) => a + s.total, 0);
  const totalKaspiG = todaySales.filter(s => s.pay === "kaspiG").reduce((a, s) => a + s.total, 0);
  const totalKaspiR = todaySales.filter(s => s.pay === "kaspiR").reduce((a, s) => a + s.total, 0);
  const totalDebt   = todaySales.filter(s => s.pay === "debt"  ).reduce((a, s) => a + s.total, 0);

  return (
    <div>
      <PageHead
        title="Все продажи"
        bread="Главная › Продажи › Все продажи"
        right={
          <>
            <DateFilter active={df} onChange={setDf} />
            <button style={mkBtn("p", { fontSize: 12 })} onClick={onNewSale}>
              🖨 Распечатать отчёт
            </button>
          </>
        }
      />

      <div style={{ padding: "12px 14px" }}>

        {/* ── Статистические карточки ── */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 14 }}>

          {/* Транзакции */}
          <div style={{ ...Sc.card, marginBottom: 0 }}>
            <div style={{ fontSize: 11, color: "#888", marginBottom: 6 }}>Транзакции</div>
            <div style={{ fontSize: 28, fontWeight: 800, lineHeight: 1 }}>
              {todaySales.length}{" "}
              <span style={{ fontSize: 14, fontWeight: 400, color: "#888" }}>шт</span>
            </div>
            <div style={{
              display: "grid", gridTemplateColumns: "1fr 1fr",
              gap: 6, marginTop: 12,
              borderTop: "1px solid #f5f5f5", paddingTop: 10,
            }}>
              {[
                ["Товары",      totalQty + " шт"],
                ["Услуги",      "0 шт"],
                ["Комплекты",   "0 шт"],
                ["Сертификаты", "0 шт"],
                ["Возвраты",    "0 шт"],
                ["Обмены",      "0 шт"],
              ].map(([l, v]) => (
                <div key={l}>
                  <div style={{ fontSize: 11, color: "#aaa" }}>{l}</div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: OR }}>{v}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Сумма транзакций */}
          <div style={{ ...Sc.card, marginBottom: 0 }}>
            <div style={{ fontSize: 11, color: "#888", marginBottom: 6 }}>Сумма транзакций</div>
            <div style={{ fontSize: 24, fontWeight: 800, lineHeight: 1 }}>
              {fmt(totalSum)}{" "}
              <span style={{ fontSize: 12, fontWeight: 400 }}>KZT</span>
            </div>
            <div style={{ marginTop: 12, borderTop: "1px solid #f5f5f5", paddingTop: 10 }}>
              {(
                [
                  ["Наличные",      totalCash],
                  ["Visa / Master", totalVisa],
                  ["Kaspi Gold",    totalKaspiG],
                  ["Kaspi Red",     totalKaspiR],
                  ["В долг",        totalDebt],
                ] as [string, number][]
              )
                .filter(([, v]) => v > 0)
                .map(([l, v]) => (
                  <div key={l} style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 4 }}>
                    <span style={{ color: "#888" }}>{l}</span>
                    <span style={{ fontWeight: 600, color: OR }}>{fmt(v)} ₸</span>
                  </div>
                ))}
              {totalSum === 0 && (
                <div style={{ fontSize: 12, color: OR }}>Наличные: 0 KZT</div>
              )}
            </div>
          </div>

          {/* Баланс клиентов */}
          <div style={{ ...Sc.card, marginBottom: 0 }}>
            <div style={{ fontSize: 11, color: "#888", marginBottom: 4 }}>Баланс клиентов</div>
            <div style={{ fontSize: 22, fontWeight: 800 }}>
              0 <span style={{ fontSize: 12 }}>KZT</span>
            </div>
            <div style={{ display: "flex", gap: 16, marginTop: 8 }}>
              <div>
                <div style={{ fontSize: 11, color: "#aaa" }}>Начислено</div>
                <div style={{ fontSize: 12, fontWeight: 600, color: OR }}>0 KZT</div>
              </div>
              <div>
                <div style={{ fontSize: 11, color: "#aaa" }}>Потрачено</div>
                <div style={{ fontSize: 12, fontWeight: 600, color: OR }}>0 KZT</div>
              </div>
            </div>
          </div>

          {/* Подарочные сертификаты */}
          <div style={{ ...Sc.card, marginBottom: 0 }}>
            <div style={{ fontSize: 11, color: "#888", marginBottom: 4 }}>Подарочные сертификаты</div>
            <div style={{ fontSize: 22, fontWeight: 800 }}>
              0 <span style={{ fontSize: 12 }}>шт</span>
            </div>
            <div style={{ display: "flex", gap: 16, marginTop: 8 }}>
              <div>
                <div style={{ fontSize: 11, color: "#aaa" }}>Продано</div>
                <div style={{ fontSize: 12, fontWeight: 600, color: OR }}>0 шт</div>
              </div>
              <div>
                <div style={{ fontSize: 11, color: "#aaa" }}>Сумма</div>
                <div style={{ fontSize: 12, fontWeight: 600, color: OR }}>0 KZT</div>
              </div>
            </div>
          </div>

          {/* Погашение долгов */}
          <div style={{ ...Sc.card, marginBottom: 0, gridColumn: "1 / -1" }}>
            <div style={{ fontSize: 11, color: "#888", marginBottom: 4 }}>Погашение долгов</div>
            <div style={{ fontSize: 22, fontWeight: 800 }}>
              0 <span style={{ fontSize: 12 }}>KZT</span>
            </div>
            <div style={{ display: "flex", gap: 24, marginTop: 8 }}>
              <div>
                <div style={{ fontSize: 11, color: "#aaa" }}>Карта</div>
                <div style={{ fontSize: 12, fontWeight: 600, color: OR }}>0 KZT</div>
              </div>
              <div>
                <div style={{ fontSize: 11, color: "#aaa" }}>Наличные</div>
                <div style={{ fontSize: 12, fontWeight: 600, color: OR }}>0 KZT</div>
              </div>
            </div>
          </div>
        </div>

        {/* ── Панель поиска и действий ── */}
        <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
          <SearchBar
            value={q}
            onChange={v => { setQ(v); setPage(1); }}
            placeholder="ID транз, наименование..."
          />
          <button style={mkBtn("s", { fontSize: 12 })}>🔽 Фильтры</button>
          <button onClick={onNewSale} style={mkBtn("p", { fontSize: 12 })}>
            + Продажа
          </button>
        </div>

        {/* ── Дата-заголовок ── */}
        {todaySales.length > 0 && (
          <div style={{ fontSize: 12, color: "#aaa", fontWeight: 600, marginBottom: 8, padding: "0 2px" }}>
            {toDay()}
          </div>
        )}

        {/* ── Таблица продаж ── */}
        <div style={{ ...Sc.card, padding: 0, overflowX: "auto" }}>
          {shown.length === 0 ? (
            <EmptyState
              icon="🕐"
              title="Продаж нет"
              sub="Оформите первую продажу"
            />
          ) : (
            <>
              <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 520 }}>
                <thead>
                  <tr>
                    {["Транзакция", "Товар", "Кол-во", "Оплата", "Сумма", "Время"].map(h => (
                      <th key={h} style={Sc.th}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {paged.map(s => (
                    <tr
                      key={s.id}
                      style={{ cursor: "pointer" }}
                      onMouseEnter={e => (e.currentTarget.style.background = "#fafafa")}
                      onMouseLeave={e => (e.currentTarget.style.background = "")}
                    >
                      <td style={Sc.td}>
                        <div style={{ fontWeight: 600, color: OR, fontSize: 12 }}>{s.rcpId}</div>
                        <div style={{ fontSize: 11, color: "#aaa" }}>{s.date}</div>
                      </td>
                      <td style={Sc.td}>
                        <div style={{ fontWeight: 500 }}>{s.pName}</div>
                        <div style={{ fontSize: 11, color: "#aaa" }}>Арт: {s.art}</div>
                      </td>
                      <td style={Sc.td}>{s.qty} ед.</td>
                      <td style={Sc.td}>
                        <span style={mkBadge("or")}>{PAY_LABELS[s.pay] ?? s.pay}</span>
                      </td>
                      <td style={{ ...Sc.td, fontWeight: 700, color: OR }}>{fmt(s.total)} ₸</td>
                      <td style={{ ...Sc.td, fontSize: 11, color: "#aaa" }}>{s.time}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div style={{ padding: "0 12px" }}>
                <Pagination
                  page={page}
                  total={shown.length}
                  perPage={PER}
                  onChange={setPage}
                />
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Кассовые смены ────────────────────────────────────────────────────────────

export function PageKassaSmeny({ sales }: { sales: Sale[] }) {
  const [df, setDf] = useState("Сегодня");

  const rev = sales
    .filter(s => s.date === toDay() && s.type === "продажа")
    .reduce((a, s) => a + s.total, 0);

  return (
    <div>
      <PageHead
        title="Кассовые смены"
        bread="Главная › Продажи › Кассовые смены"
        right={
          <>
            <span style={{
              fontSize: 11, color: "#888", padding: "5px 10px",
              background: "#f0f0f0", borderRadius: 6,
            }}>
              1
            </span>
            <button style={mkBtn("s", { fontSize: 12 })}>
              Закрыть текущую смену
            </button>
            <span style={{ fontSize: 12, color: "#888" }}>
              📅 {toDay()} – {toDay()}
            </span>
          </>
        }
      />

      <div style={{ padding: "12px 14px" }}>
        <DateFilter active={df} onChange={setDf} />

        {/* ── Статистика ── */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 14 }}>
          <div style={{ ...Sc.card, marginBottom: 0 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ fontSize: 22, color: OR }}>💵</span>
              <div>
                <div style={{ fontSize: 11, color: "#888" }}>Наличных в кассе</div>
                <div style={{ fontSize: 20, fontWeight: 700, color: OR }}>{fmt(4590)} ₸</div>
              </div>
            </div>
          </div>

          <div style={{ ...Sc.card, marginBottom: 0 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ fontSize: 22 }}>⚠️</span>
              <div>
                <div style={{ fontSize: 11, color: "#888" }}>Сумма недостач</div>
                <div style={{ fontSize: 20, fontWeight: 700, color: "#e74c3c" }}>0 ₸</div>
              </div>
            </div>
          </div>

          <div style={{ ...Sc.card, marginBottom: 0 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ fontSize: 22 }}>🕐</span>
              <div>
                <div style={{ fontSize: 11, color: "#888" }}>Смен за период</div>
                <div style={{ fontSize: 20, fontWeight: 700 }}>1</div>
              </div>
            </div>
          </div>

          <div style={{ ...Sc.card, marginBottom: 0 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ color: "#1a8a3a", fontSize: 16 }}>●</span>
              <div>
                <div style={{ fontSize: 11, color: "#888" }}>Статус кассы</div>
                <div style={{ fontSize: 14, fontWeight: 700, color: "#1a8a3a" }}>
                  Смена открыта
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── Поиск ── */}
        <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
          <SearchBar value="" onChange={() => {}} placeholder="Поиск по номеру смены, кассиру..." />
          <select style={{ ...Sc.inp, width: "auto", minWidth: 130 }}>
            <option>Все статусы</option>
            <option>Открытые</option>
            <option>Закрытые</option>
          </select>
        </div>

        {/* ── Таблица смен ── */}
        <div style={{ ...Sc.card, padding: 0, overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 540 }}>
            <thead>
              <tr>
                {["№ Смены", "Статус", "Кассир", "Период", "Размен", "Выручка", "Расхождение"].map(h => (
                  <th key={h} style={Sc.th}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style={Sc.td}>
                  <span style={Sc.lnk}>SHIFT-20260601-1</span>
                </td>
                <td style={Sc.td}>
                  <span style={mkBadge("gr")}>Открыта</span>
                </td>
                <td style={Sc.td}>
                  <div style={{ fontWeight: 500 }}>Test Owner</div>
                </td>
                <td style={{ ...Sc.td, fontSize: 11 }}>
                  <div>{toDay()}</div>
                  <div style={{ color: "#aaa" }}>13:36</div>
                </td>
                <td style={Sc.td}>50 ₸</td>
                <td style={{ ...Sc.td, fontWeight: 700 }}>{fmt(rev)} ₸</td>
                <td style={Sc.td}>—</td>
              </tr>
            </tbody>
          </table>
          <div style={{ padding: "8px 14px", fontSize: 12, color: "#aaa", textAlign: "right" }}>
            Показано 1–1 из 1
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Кассовые операции ─────────────────────────────────────────────────────────

export function PageKassaOps({
  kassaOps,
  onAdd,
}: {
  kassaOps: KassaOp[];
  onAdd: () => void;
}) {
  const [df,    setDf]    = useState("Сегодня");
  const [typeF, setTypeF] = useState("Все операции");
  const [statF, setStatF] = useState("Все статьи");
  const [empF,  setEmpF]  = useState("Все сотрудники");

  const inc = kassaOps.filter(o => o.tp === "in" ).reduce((a, o) => a + o.sum, 0);
  const exp = kassaOps.filter(o => o.tp === "out").reduce((a, o) => a + o.sum, 0);

  const statMap: Record<string, number> = {};
  kassaOps
    .filter(o => o.tp === "out")
    .forEach(o => {
      const k = o.stat || "Без статьи";
      statMap[k] = (statMap[k] || 0) + o.sum;
    });
  const topStat = Object.keys(statMap).sort((a, b) => statMap[b] - statMap[a])[0];

  return (
    <div>
      <PageHead
        title={
          <span>
            Кассовые операции{" "}
            <span style={{
              background: "#f0f0f0", borderRadius: 50,
              padding: "2px 10px", fontSize: 13, fontWeight: 600, color: "#888",
            }}>
              {kassaOps.length}
            </span>
          </span>
        }
        bread="Главная › Продажи › Кассовые операции"
        right={
          <span style={{ fontSize: 12, color: "#888" }}>
            📅 {toDay()} – {toDay()}
          </span>
        }
      />

      <div style={{ padding: "12px 14px" }}>
        <DateFilter active={df} onChange={setDf} />

        {/* ── Статистика ── */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 14 }}>
          <div style={{ ...Sc.card, marginBottom: 0 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{
                width: 36, height: 36, borderRadius: 50,
                background: "#e6f9ee",
                display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18,
              }}>⊕</div>
              <div>
                <div style={{ fontSize: 11, color: "#888" }}>Всего внесено</div>
                <div style={{ fontSize: 20, fontWeight: 700, color: "#1a8a3a" }}>
                  + {fmt(inc)} ₸
                </div>
              </div>
            </div>
          </div>

          <div style={{ ...Sc.card, marginBottom: 0 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{
                width: 36, height: 36, borderRadius: 50,
                background: "#fee",
                display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18,
              }}>⊖</div>
              <div>
                <div style={{ fontSize: 11, color: "#888" }}>Всего изъято</div>
                <div style={{ fontSize: 20, fontWeight: 700, color: "#e74c3c" }}>
                  – {fmt(exp)} ₸
                </div>
              </div>
            </div>
          </div>

          <div style={{ ...Sc.card, marginBottom: 0, gridColumn: "1 / -1" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ fontSize: 20 }}>📊</span>
              <div>
                <div style={{ fontSize: 11, color: "#888" }}>Топ статьи расходов</div>
                <div style={{ fontSize: 13, fontWeight: 600, color: "#555", marginTop: 2 }}>
                  {topStat ? `— ${topStat}` : "— Нет расходов"}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── Фильтры ── */}
        <div style={{ display: "flex", gap: 8, marginBottom: 12, flexWrap: "wrap" }}>
          <select
            value={typeF}
            onChange={e => setTypeF(e.target.value)}
            style={{ ...Sc.inp, width: "auto", minWidth: 140 }}
          >
            <option>Все операции</option>
            <option>Внесение</option>
            <option>Изъятие</option>
          </select>

          <select
            value={statF}
            onChange={e => setStatF(e.target.value)}
            style={{ ...Sc.inp, width: "auto", minWidth: 120 }}
          >
            <option>Все статьи</option>
            {["Зарплата", "Аренда", "Коммунальные", "Закупка", "Инкассация", "Прочее"].map(s => (
              <option key={s}>{s}</option>
            ))}
          </select>

          <select
            value={empF}
            onChange={e => setEmpF(e.target.value)}
            style={{ ...Sc.inp, width: "auto", minWidth: 150 }}
          >
            <option>Все сотрудники</option>
            <option>Test Owner</option>
            <option>кассир кассир</option>
          </select>

          <div style={{ flex: 1 }} />
          <button style={mkBtn("s", { fontSize: 12 })}>⬇ Выгрузить</button>
          <button onClick={onAdd} style={mkBtn("p", { fontSize: 12 })}>
            + Новая операция
          </button>
        </div>

        {/* ── Таблица операций ── */}
        <div style={{ ...Sc.card, padding: 0 }}>
          {kassaOps.length === 0 ? (
            <EmptyState
              icon="🕐"
              title="Операции не найдены"
              sub="Попробуйте изменить параметры фильтрации или выбрать другой период"
            />
          ) : (
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr>
                  {["Тип", "Статья", "Кассир", "Сумма", "Дата"].map(h => (
                    <th key={h} style={Sc.th}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {kassaOps.map((o, i) => (
                  <tr
                    key={i}
                    onMouseEnter={e => (e.currentTarget.style.background = "#fafafa")}
                    onMouseLeave={e => (e.currentTarget.style.background = "")}
                  >
                    <td style={Sc.td}>
                      <span style={mkBadge(o.tp === "in" ? "gr" : "rd")}>
                        {o.tp === "in" ? "Внесение" : "Изъятие"}
                      </span>
                    </td>
                    <td style={Sc.td}>{o.stat || "—"}</td>
                    <td style={Sc.td}>{o.cashier || "Test Owner"}</td>
                    <td style={{
                      ...Sc.td,
                      fontWeight: 700,
                      color: o.tp === "in" ? "#1a8a3a" : "#e74c3c",
                    }}>
                      {o.tp === "in" ? "+" : "–"}{fmt(o.sum)} ₸
                    </td>
                    <td style={{ ...Sc.td, fontSize: 12, color: "#aaa" }}>{o.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Modal: Оформить продажу ───────────────────────────────────────────────────

export function ModalSale({
  products,
  clients,
  onClose,
  onSave,
}: {
  products: Product[];
  clients:  Client[];
  onClose:  () => void;
  onSave:   (s: Sale) => void;
}) {
  const [cat,      setCat]      = useState("");
  const [prodId,   setProdId]   = useState("");
  const [qty,      setQty]      = useState(1);
  const [pt,       setPt]       = useState<"retail" | "opt">("retail");
  const [pay,      setPay]      = useState("cash");
  const [disc,     setDisc]     = useState(0);
  const [clientId, setClientId] = useState("");
  const [note,     setNote]     = useState("");

  const cats    = [...new Set(products.map(p => p.cat))].sort();
  const inCat   = cat ? products.filter(p => p.cat === cat) : products;
  const prod    = products.find(p => p.id === Number(prodId));
  const price   = prod ? (pt === "retail" ? prod.retail : prod.opt) : 0;
  const discAmt = Math.round(price * qty * disc / 100);
  const total   = price * qty - discAmt;
  const profit  = prod ? total - prod.cost * qty : 0;

  const pays: [string, string][] = [
    ["cash",   "Наличные"],
    ["visa",   "Visa / Master"],
    ["kaspiG", "Kaspi Gold"],
    ["kaspiR", "Kaspi Red"],
    ["debt",   "В долг"],
  ];

  const quickDiscs = [10, 20, 30, 50];

  function save() {
    if (!prod) return;
    onSave({
      id:        Date.now(),
      rcpId:     rcpId(),
      date:      toDay(),
      time:      toTime(),
      type:      "продажа",
      productId: prod.id,
      pName:     prod.name,
      art:       prod.art,
      qty,
      price,
      total,
      cost:      prod.cost,
      profit,
      pay,
      pt,
      discount:  disc,
      clientId,
      note,
    });
  }

  return (
    <Modal title="Оформить продажу" onClose={onClose} width={540}>

      {/* Тип цены: Розница / Оптом */}
      <div style={{ display: "flex", gap: 8, marginBottom: 18 }}>
        {(["retail", "opt"] as const).map(k => (
          <button
            key={k}
            onClick={() => setPt(k)}
            style={{
              flex: 1, padding: "10px", borderRadius: 8,
              border: `2px solid ${pt === k ? OR : "#e0e0e0"}`,
              background: pt === k ? OL : "#fafafa",
              color: pt === k ? OR : "#666",
              fontWeight: 700, fontSize: 14, cursor: "pointer",
            }}
          >
            {k === "retail" ? "Розница" : "Оптом"}
          </button>
        ))}
      </div>

      {/* Категория + Количество */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 14 }}>
        <div>
          <label style={Sc.lbl}>Категория</label>
          <select
            value={cat}
            onChange={e => { setCat(e.target.value); setProdId(""); }}
            style={{ ...Sc.inp, appearance: "none" }}
          >
            <option value="">— все категории —</option>
            {cats.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div>
          <label style={Sc.lbl}>Количество</label>
          <input
            type="number"
            min={1}
            max={prod ? prod.qty : 9999}
            value={qty}
            onChange={e => setQty(Number(e.target.value))}
            style={Sc.inp}
          />
        </div>
      </div>

      {/* Товар */}
      <div style={{ marginBottom: 14 }}>
        <label style={Sc.lbl}>Товар</label>
        <select
          value={prodId}
          onChange={e => setProdId(e.target.value)}
          style={{ ...Sc.inp, appearance: "none" }}
        >
          <option value="">— выберите товар —</option>
          {inCat.map(p => (
            <option key={p.id} value={p.id} disabled={p.qty === 0}>
              [{p.art}] {p.name} — {fmt(pt === "retail" ? p.retail : p.opt)} ₸  (ост: {p.qty})
            </option>
          ))}
        </select>
      </div>

      {/* Скидка */}
      <div style={{ marginBottom: 14 }}>
        <label style={Sc.lbl}>Скидка</label>
        <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
          <input
            type="number"
            min={0}
            max={100}
            value={disc}
            onChange={e => setDisc(Number(e.target.value))}
            style={{ ...Sc.inp, width: 80 }}
          />
          <span style={{ fontSize: 13, color: "#888" }}>%</span>
          <div style={{ display: "flex", gap: 5, marginLeft: 8 }}>
            {quickDiscs.map(d => (
              <button
                key={d}
                onClick={() => setDisc(d)}
                style={{
                  padding: "4px 10px", borderRadius: 6, cursor: "pointer",
                  border: `1px solid ${disc === d ? OR : "#e0e0e0"}`,
                  background: disc === d ? OL : "#f9f9f9",
                  color: disc === d ? OR : "#666",
                  fontSize: 12, fontWeight: 600,
                }}
              >
                {d}%
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Предпросмотр цены */}
      {prod && (
        <div style={{
          background: "#f7f7f7", borderRadius: 10,
          padding: "12px 16px", marginBottom: 16,
        }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8 }}>
            {(
              [
                ["Цена",    `${fmt(price)} ₸`],
                ["Скидка",  discAmt > 0 ? `–${fmt(discAmt)} ₸` : "0 ₸"],
                ["Итого",   `${fmt(total)} ₸`],
                ["Прибыль", `${fmt(profit)} ₸`],
              ] as [string, string][]
            ).map(([l, v]) => (
              <div key={l} style={{ textAlign: "center" }}>
                <div style={{ fontSize: 11, color: "#aaa", marginBottom: 2 }}>{l}</div>
                <div style={{
                  fontWeight: 700,
                  color: l === "Прибыль" ? "#1a8a3a" : OR,
                  fontSize: 14,
                }}>
                  {v}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Способ оплаты */}
      <div style={{ marginBottom: 14 }}>
        <label style={Sc.lbl}>Способ оплаты</label>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 7, marginTop: 4 }}>
          {pays.map(([k, l]) => (
            <button
              key={k}
              onClick={() => setPay(k)}
              style={{
                padding: "7px 14px", borderRadius: 50,
                border: `2px solid ${pay === k ? OR : "#e0e0e0"}`,
                background: pay === k ? OL : "#fafafa",
                color: pay === k ? OR : "#666",
                fontSize: 13, cursor: "pointer", fontWeight: 600,
              }}
            >
              {l}
            </button>
          ))}
        </div>
      </div>

      {/* Клиент */}
      {clients.length > 0 && (
        <div style={{ marginBottom: 14 }}>
          <label style={Sc.lbl}>Клиент (необязательно)</label>
          <select
            value={clientId}
            onChange={e => setClientId(e.target.value)}
            style={{ ...Sc.inp, appearance: "none" }}
          >
            <option value="">— без клиента —</option>
            {clients.map(c => (
              <option key={c.id} value={c.id}>
                {c.name} {c.phone ? `(${c.phone})` : ""}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Примечание */}
      <div style={{ marginBottom: 20 }}>
        <label style={Sc.lbl}>Примечание</label>
        <input
          value={note}
          onChange={e => setNote(e.target.value)}
          style={Sc.inp}
          placeholder="Необязательно"
        />
      </div>

      <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
        <button onClick={onClose} style={mkBtn("s")}>Отмена</button>
        <button
          onClick={save}
          disabled={!prod}
          style={{ ...mkBtn("p"), opacity: prod ? 1 : 0.5, cursor: prod ? "pointer" : "not-allowed" }}
        >
          Оформить продажу
        </button>
      </div>
    </Modal>
  );
}

// ── Modal: Кассовая операция ──────────────────────────────────────────────────

export function ModalKassaOp({
  onClose,
  onSave,
}: {
  onClose: () => void;
  onSave:  (op: KassaOp) => void;
}) {
  const [tp,   setTp]   = useState<"in" | "out">("in");
  const [sum,  setSum]  = useState("");
  const [stat, setStat] = useState("");
  const [note, setNote] = useState("");

  return (
    <Modal title="Новая кассовая операция" onClose={onClose} width={440}>

      {/* Тип */}
      <div style={{ display: "flex", gap: 8, marginBottom: 18 }}>
        {(["in", "out"] as const).map(k => (
          <button
            key={k}
            onClick={() => setTp(k)}
            style={{
              flex: 1, padding: "10px", borderRadius: 8,
              border: `2px solid ${tp === k ? OR : "#e0e0e0"}`,
              background: tp === k ? OL : "#fafafa",
              color: tp === k ? OR : "#555",
              fontWeight: 700, cursor: "pointer",
            }}
          >
            {k === "in" ? "Внесение" : "Изъятие"}
          </button>
        ))}
      </div>

      {/* Сумма */}
      <div style={{ marginBottom: 14 }}>
        <label style={Sc.lbl}>Сумма (₸)</label>
        <input
          type="number"
          value={sum}
          onChange={e => setSum(e.target.value)}
          style={Sc.inp}
          placeholder="0"
        />
      </div>

      {/* Статья */}
      <div style={{ marginBottom: 14 }}>
        <label style={Sc.lbl}>Статья</label>
        <select
          value={stat}
          onChange={e => setStat(e.target.value)}
          style={{ ...Sc.inp, appearance: "none" }}
        >
          <option value="">— выберите статью —</option>
          {["Зарплата", "Аренда", "Коммунальные", "Закупка", "Инкассация", "Прочее"].map(s => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </div>

      {/* Комментарий */}
      <div style={{ marginBottom: 20 }}>
        <label style={Sc.lbl}>Комментарий</label>
        <input
          value={note}
          onChange={e => setNote(e.target.value)}
          style={Sc.inp}
          placeholder="Необязательно"
        />
      </div>

      <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
        <button onClick={onClose} style={mkBtn("s")}>Отмена</button>
        <button
          onClick={() => {
            if (!sum) return;
            onSave({
              tp,
              sum:     Number(sum),
              stat:    stat || note || "—",
              date:    toDay(),
              cashier: "Test Owner",
            });
            onClose();
          }}
          style={mkBtn()}
        >
          Сохранить
        </button>
      </div>
    </Modal>
  );
}
