import { useState } from "react";
import {
  OR, OL, fmt, toDay,
  Sc, mkBtn, mkBadge,
  Modal, PageHead, SearchBar, Tabs,
  EmptyState, Pagination,
} from "./shared";
import type { Client, Sale } from "./App";

// ─── Types ────────────────────────────────────────────────────────────────────

type ClientDebt = Client & {
  totalDebt: number;
  repaid:    number;
  remaining: number;
};

// ── Долги клиентов ────────────────────────────────────────────────────────────

export function PageDebts({
  clients,
  sales,
  setClients,
}: {
  clients:    Client[];
  sales:      Sale[];
  setClients: (fn: (prev: Client[]) => Client[]) => void;
}) {
  const [mainTab,   setMainTab]   = useState("debts");
  const [subFilter, setSubFilter] = useState("Все");
  const [q,         setQ]         = useState("");
  const [page,      setPage]      = useState(1);
  const [showRepay, setShowRepay] = useState<ClientDebt | null>(null);
  const [showSms,   setShowSms]   = useState(false);
  const PER = 5;

  // Продажи в долг
  const debtSales = sales.filter(s => s.pay === "debt" && s.type === "продажа");

  // Сводка долгов по клиентам
  const clientDebts: ClientDebt[] = clients.map(c => {
    const fromSales = debtSales
      .filter(s => s.clientId === String(c.id))
      .reduce((a, s) => a + s.total, 0);
    const totalDebt = (c.debt ?? 0) + fromSales;
    const repaid    = c.repaid ?? 0;
    const remaining = totalDebt - repaid;
    return { ...c, totalDebt, repaid, remaining };
  });

  // Клиенты с долгом
  const debtors = clientDebts.filter(c => c.totalDebt > 0);

  // Фильтрация
  const filtered = debtors.filter(c => {
    const qm = !q
      || c.name.toLowerCase().includes(q.toLowerCase())
      || (c.phone ?? "").includes(q);
    switch (subFilter) {
      case "Просроченные":        return qm && c.remaining > 0;
      case "Непогашенные":        return qm && c.remaining > 0 && c.repaid === 0;
      case "Погашенные":          return qm && c.remaining <= 0;
      case "Частично погашенные": return qm && c.repaid > 0 && c.remaining > 0;
      default:                    return qm;
    }
  });

  const paged = filtered.slice((page - 1) * PER, page * PER);

  // Статистика
  const totalDebtSum   = debtors.reduce((a, c) => a + c.totalDebt,   0);
  const totalRepaidSum = debtors.reduce((a, c) => a + c.repaid,       0);
  const totalRemaining = debtors.reduce((a, c) => a + c.remaining,    0);

  // Погашения из продаж
  const repayments = sales
    .filter(s => s.type === "repayment")
    .map(s => ({
      ...s,
      clientName: clients.find(c => String(c.id) === s.clientId)?.name ?? "Неизвестно",
    }));

  function repayDebt(clientId: number, amount: number) {
    setClients(prev =>
      prev.map(c =>
        c.id === clientId
          ? { ...c, repaid: (c.repaid ?? 0) + amount }
          : c
      )
    );
    setShowRepay(null);
  }

  const subFilters = [
    "Все",
    "Просроченные",
    "Непогашенные",
    "Погашенные",
    "Частично погашенные",
  ];

  return (
    <div>
      <PageHead
        title="Долги клиентов"
        bread="Главная › Покупатели › Долги клиентов"
        right={
          <button style={mkBtn("s", { fontSize: 12 })}>
            📅 Дата выдачи · Весь период
          </button>
        }
      />

      <div style={{ padding: "12px 14px" }}>

        {/* Основные вкладки */}
        <div style={{ display: "flex", marginBottom: 14 }}>
          {[["debts", "Долги"], ["repayments", "Погашения"]].map(([k, l]) => (
            <button
              key={k}
              onClick={() => setMainTab(k)}
              style={{
                flex: 1, padding: "10px 16px", border: "none",
                cursor: "pointer", fontSize: 13, fontWeight: 700,
                background: mainTab === k ? "#fff" : "#f0f0f0",
                color: mainTab === k ? OR : "#555",
                borderBottom: `2px solid ${mainTab === k ? OR : "transparent"}`,
              }}
            >
              {l}
            </button>
          ))}
        </div>

        {/* ══════════════════════════════════════════════════ */}
        {/* Вкладка: Долги                                    */}
        {/* ══════════════════════════════════════════════════ */}
        {mainTab === "debts" && (
          <>
            {/* Подфильтры */}
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 14 }}>
              {subFilters.map(f => (
                <button
                  key={f}
                  onClick={() => { setSubFilter(f); setPage(1); }}
                  style={{
                    padding: "5px 14px", borderRadius: 6, cursor: "pointer",
                    fontSize: 12, fontWeight: 700,
                    border: `1px solid ${subFilter === f ? OR : "#e0e0e0"}`,
                    background: subFilter === f ? OL : "#fff",
                    color: subFilter === f ? OR : "#666",
                  }}
                >
                  {f}
                </button>
              ))}
            </div>

            {/* Поиск */}
            <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
              <SearchBar
                value={q}
                onChange={v => { setQ(v); setPage(1); }}
                placeholder="Клиент, пользователь, магазин"
              />
              <button style={mkBtn("s", { fontSize: 12 })}>▾ Фильтры</button>
            </div>

            {/* Таблица долгов */}
            <div style={{ ...Sc.card, padding: 0 }}>
              {paged.length === 0 ? (
                <EmptyState
                  icon="💳"
                  title="Долги не найдены"
                  sub="Попробуйте изменить параметры фильтрации"
                />
              ) : (
                <>
                  <table style={{ width: "100%", borderCollapse: "collapse" }}>
                    <thead>
                      <tr>
                        {[
                          "Клиент", "Телефон", "Сумма долга",
                          "Погашено", "Остаток", "Статус", "Действие",
                        ].map(h => (
                          <th key={h} style={Sc.th}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {paged.map(c => (
                        <tr
                          key={c.id}
                          onMouseEnter={e => (e.currentTarget.style.background = "#fafafa")}
                          onMouseLeave={e => (e.currentTarget.style.background = "")}
                        >
                          <td style={{ ...Sc.td, fontWeight: 600, color: OR, cursor: "pointer" }}>
                            {c.name}
                          </td>
                          <td style={Sc.td}>{c.phone || "—"}</td>
                          <td style={{ ...Sc.td, fontWeight: 700 }}>
                            {fmt(c.totalDebt)} ₸
                          </td>
                          <td style={{ ...Sc.td, color: "#1a8a3a", fontWeight: 600 }}>
                            {fmt(c.repaid)} ₸
                          </td>
                          <td style={{
                            ...Sc.td, fontWeight: 700,
                            color: c.remaining > 0 ? "#e74c3c" : "#1a8a3a",
                          }}>
                            {fmt(c.remaining)} ₸
                          </td>
                          <td style={Sc.td}>
                            <span style={mkBadge(
                              c.remaining <= 0
                                ? "gr"
                                : c.repaid > 0
                                  ? "or"
                                  : "rd"
                            )}>
                              {c.remaining <= 0
                                ? "Погашен"
                                : c.repaid > 0
                                  ? "Частично"
                                  : "Непогашен"}
                            </span>
                          </td>
                          <td style={Sc.td}>
                            {c.remaining > 0 && (
                              <button
                                onClick={() => setShowRepay(c)}
                                style={mkBtn("s", { fontSize: 11, padding: "4px 10px" })}
                              >
                                Погасить
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  <div style={{
                    padding: "0 12px",
                    borderTop: "1px solid #f5f5f5",
                    display: "flex", justifyContent: "space-between", alignItems: "center",
                  }}>
                    <Pagination
                      page={page}
                      total={filtered.length}
                      perPage={PER}
                      onChange={setPage}
                    />
                    <div style={{ display: "flex", gap: 8 }}>
                      <button style={mkBtn("s", { fontSize: 12 })}>⬇ Скачать</button>
                      <span style={{ fontSize: 12, color: "#aaa" }}>
                        Показать по {PER}
                      </span>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Кнопки массовых действий */}
            <div style={{ marginTop: 14, display: "flex", flexDirection: "column", gap: 10 }}>
              <div
                onClick={() => {}}
                style={{
                  ...Sc.card,
                  background: OR, color: "#fff",
                  display: "flex", justifyContent: "space-between", alignItems: "center",
                  cursor: "pointer", padding: "14px 18px", marginBottom: 0,
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span style={{ fontSize: 18 }}>📋</span>
                  <span style={{ fontWeight: 700, fontSize: 14 }}>Массовое погашение</span>
                </div>
                <span style={{ fontSize: 18 }}>→</span>
              </div>

              <div
                onClick={() => setShowSms(true)}
                style={{
                  ...Sc.card,
                  background: OR, color: "#fff",
                  display: "flex", justifyContent: "space-between", alignItems: "center",
                  cursor: "pointer", padding: "14px 18px", marginBottom: 0,
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span style={{ fontSize: 18 }}>💬</span>
                  <span style={{ fontWeight: 700, fontSize: 14 }}>SMS-рассылка должникам</span>
                </div>
                <span style={{ fontSize: 18 }}>→</span>
              </div>
            </div>

            {/* Сводная статистика */}
            <div style={{ marginTop: 14 }}>

              {/* Сумма долгов */}
              <div style={{ ...Sc.card, padding: 0 }}>
                <div style={{ padding: "14px 16px", borderBottom: "1px solid #f5f5f5" }}>
                  <div style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                  }}>
                    <div style={{ fontSize: 12, color: "#888" }}>Сумма долгов</div>
                    <span style={{ fontSize: 14, color: "#aaa" }}>📅</span>
                  </div>
                  <div style={{ fontSize: 26, fontWeight: 800, marginTop: 4 }}>
                    {fmt(totalDebtSum)}{" "}
                    <span style={{ fontSize: 13, fontWeight: 400, color: "#888" }}>KZT</span>
                  </div>
                  <div style={{ marginTop: 10, display: "flex", flexDirection: "column", gap: 6 }}>
                    {(
                      [
                        ["Сумма погашений",    fmt(totalRepaidSum) + " ₸", "#333"],
                        ["Системные погашения","0 ₸",                      "#333"],
                        ["Остаток долгов",     fmt(totalRemaining) + " ₸", OR],
                      ] as [string, string, string][]
                    ).map(([l, v, c]) => (
                      <div
                        key={l}
                        style={{ display: "flex", justifyContent: "space-between", fontSize: 13 }}
                      >
                        <span style={{ color: "#888" }}>{l}</span>
                        <span style={{ fontWeight: 600, color: c }}>{v}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Кол-во должников */}
                <div style={{ padding: "14px 16px" }}>
                  <div style={{ fontSize: 12, color: "#888" }}>Кол-во должников</div>
                  <div style={{ fontSize: 26, fontWeight: 800, marginTop: 4 }}>
                    {debtors.filter(c => c.remaining > 0).length}{" "}
                    <span style={{ fontSize: 13, fontWeight: 400, color: "#888" }}>клиентов</span>
                  </div>
                  <div style={{ marginTop: 10, display: "flex", flexDirection: "column", gap: 6 }}>
                    {(
                      [
                        ["Погашенные",    debtors.filter(c => c.remaining <= 0).length          + " долгов"],
                        ["Непогашенные",  debtors.filter(c => c.remaining > 0 && c.repaid === 0).length + " долгов"],
                        ["Просроченные",  "0 долгов"],
                      ] as [string, string][]
                    ).map(([l, v]) => (
                      <div
                        key={l}
                        style={{ display: "flex", justifyContent: "space-between", fontSize: 13 }}
                      >
                        <span style={{ color: "#888" }}>{l}</span>
                        <span>{v}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        {/* ══════════════════════════════════════════════════ */}
        {/* Вкладка: Погашения                                */}
        {/* ══════════════════════════════════════════════════ */}
        {mainTab === "repayments" && (
          <>
            <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
              <SearchBar value="" onChange={() => {}} placeholder="Клиент, пользователь, магазин" />
              <button style={mkBtn("s", { fontSize: 12 })}>▾ Фильтры</button>
            </div>

            <div style={{ ...Sc.card, padding: 0 }}>
              {repayments.length === 0 ? (
                <EmptyState
                  icon="💰"
                  title="Погашений нет"
                  sub="Оформите первое погашение долга"
                />
              ) : (
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr>
                      {["Клиент", "Сумма", "Способ оплаты", "Дата"].map(h => (
                        <th key={h} style={Sc.th}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {repayments.map((r, i) => (
                      <tr
                        key={i}
                        onMouseEnter={e => (e.currentTarget.style.background = "#fafafa")}
                        onMouseLeave={e => (e.currentTarget.style.background = "")}
                      >
                        <td style={{ ...Sc.td, fontWeight: 600, color: OR }}>
                          {r.clientName}
                        </td>
                        <td style={{ ...Sc.td, fontWeight: 700, color: "#1a8a3a" }}>
                          {fmt(r.total)} ₸
                        </td>
                        <td style={Sc.td}>{r.pay}</td>
                        <td style={{ ...Sc.td, fontSize: 12, color: "#aaa" }}>{r.date}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </>
        )}
      </div>

      {/* Modal: Погашение долга */}
      {showRepay && (
        <ModalRepayDebt
          client={showRepay}
          onClose={() => setShowRepay(null)}
          onSave={repayDebt}
        />
      )}

      {/* Modal: SMS-рассылка */}
      {showSms && (
        <ModalSmsDebtors
          debtors={debtors.filter(c => c.remaining > 0)}
          onClose={() => setShowSms(false)}
        />
      )}
    </div>
  );
}

// ── Modal: Погашение долга ────────────────────────────────────────────────────

function ModalRepayDebt({
  client,
  onClose,
  onSave,
}: {
  client:  ClientDebt;
  onClose: () => void;
  onSave:  (clientId: number, amount: number) => void;
}) {
  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState("cash");

  const pays: [string, string][] = [
    ["cash",   "Наличные"],
    ["visa",   "Visa / Master"],
    ["kaspiG", "Kaspi Gold"],
    ["kaspiR", "Kaspi Red"],
  ];

  const quickPcts = [25, 50, 75, 100];

  return (
    <Modal title={`Погашение долга — ${client.name}`} onClose={onClose} width={440}>

      {/* Сводка по долгу */}
      <div style={{
        background: "#f9f9f9", borderRadius: 10,
        padding: "14px 16px", marginBottom: 18,
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 6 }}>
          <span style={{ color: "#888" }}>Общий долг:</span>
          <span style={{ fontWeight: 700 }}>{fmt(client.totalDebt)} ₸</span>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 6 }}>
          <span style={{ color: "#888" }}>Уже погашено:</span>
          <span style={{ fontWeight: 700, color: "#1a8a3a" }}>{fmt(client.repaid)} ₸</span>
        </div>
        <div style={{
          display: "flex", justifyContent: "space-between",
          fontSize: 14, fontWeight: 700,
          borderTop: "1px solid #e0e0e0", paddingTop: 10, marginTop: 4,
        }}>
          <span style={{ color: "#888" }}>Остаток:</span>
          <span style={{ color: OR }}>{fmt(client.remaining)} ₸</span>
        </div>
      </div>

      {/* Сумма погашения */}
      <div style={{ marginBottom: 14 }}>
        <label style={Sc.lbl}>Сумма погашения (₸)</label>
        <input
          type="number"
          value={amount}
          onChange={e => setAmount(e.target.value)}
          max={client.remaining}
          style={Sc.inp}
          placeholder="0"
          autoFocus
        />
        {/* Быстрый выбор % */}
        <div style={{ display: "flex", gap: 6, marginTop: 8 }}>
          {quickPcts.map(pct => (
            <button
              key={pct}
              onClick={() => setAmount(String(Math.floor(client.remaining * pct / 100)))}
              style={{
                flex: 1, padding: "5px 0", borderRadius: 6, cursor: "pointer",
                border: `1px solid ${OR}`,
                background: OL, color: OR,
                fontSize: 12, fontWeight: 700,
              }}
            >
              {pct}%
            </button>
          ))}
        </div>
      </div>

      {/* Способ оплаты */}
      <div style={{ marginBottom: 20 }}>
        <label style={Sc.lbl}>Способ оплаты</label>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 7, marginTop: 4 }}>
          {pays.map(([k, l]) => (
            <button
              key={k}
              onClick={() => setMethod(k)}
              style={{
                padding: "7px 14px", borderRadius: 50,
                border: `2px solid ${method === k ? OR : "#e0e0e0"}`,
                background: method === k ? OL : "#fafafa",
                color: method === k ? OR : "#666",
                fontSize: 13, cursor: "pointer", fontWeight: 600,
              }}
            >
              {l}
            </button>
          ))}
        </div>
      </div>

      <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
        <button onClick={onClose} style={mkBtn("s")}>Отмена</button>
        <button
          onClick={() => {
            const amt = Number(amount);
            if (!amt || amt <= 0) return;
            onSave(client.id, amt);
          }}
          disabled={!amount || Number(amount) <= 0}
          style={{
            ...mkBtn("p"),
            opacity: amount && Number(amount) > 0 ? 1 : 0.5,
            cursor: amount && Number(amount) > 0 ? "pointer" : "not-allowed",
          }}
        >
          Погасить
        </button>
      </div>
    </Modal>
  );
}

// ── Modal: SMS-рассылка должникам ─────────────────────────────────────────────

function ModalSmsDebtors({
  debtors,
  onClose,
}: {
  debtors: ClientDebt[];
  onClose: () => void;
}) {
  const defaultText =
    "Уважаемый клиент! Напоминаем о наличии задолженности. " +
    "Просим погасить долг в ближайшее время. С уважением, OZD.";

  const [text,     setText]     = useState(defaultText);
  const [selected, setSelected] = useState<number[]>(debtors.map(d => d.id));

  function toggleAll() {
    setSelected(
      selected.length === debtors.length ? [] : debtors.map(d => d.id)
    );
  }

  function toggleOne(id: number) {
    setSelected(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  }

  return (
    <Modal title="SMS-рассылка должникам" onClose={onClose} width={520}>

      {/* Текст сообщения */}
      <div style={{ marginBottom: 16 }}>
        <label style={Sc.lbl}>Текст сообщения</label>
        <textarea
          value={text}
          onChange={e => setText(e.target.value)}
          style={{ ...Sc.inp, height: 90, resize: "vertical", fontFamily: "inherit" }}
        />
        <div style={{ fontSize: 11, color: "#aaa", marginTop: 4, textAlign: "right" }}>
          {text.length} символов
        </div>
      </div>

      {/* Список получателей */}
      <div style={{ marginBottom: 16 }}>
        <div style={{
          display: "flex", justifyContent: "space-between",
          alignItems: "center", marginBottom: 8,
        }}>
          <label style={{ ...Sc.lbl, marginBottom: 0 }}>
            Получатели ({selected.length} из {debtors.length})
          </label>
          <button onClick={toggleAll} style={mkBtn("s", { fontSize: 11 })}>
            {selected.length === debtors.length ? "Снять все" : "Выбрать все"}
          </button>
        </div>

        <div style={{
          maxHeight: 200, overflowY: "auto",
          border: "1px solid #e0e0e0", borderRadius: 8,
        }}>
          {debtors.length === 0 ? (
            <div style={{ padding: 20, textAlign: "center", color: "#aaa", fontSize: 13 }}>
              Должников нет
            </div>
          ) : (
            debtors.map(d => (
              <div
                key={d.id}
                onClick={() => toggleOne(d.id)}
                style={{
                  display: "flex", alignItems: "center", gap: 10,
                  padding: "10px 14px", borderBottom: "1px solid #f5f5f5",
                  cursor: "pointer",
                }}
                onMouseEnter={e => (e.currentTarget.style.background = "#fafafa")}
                onMouseLeave={e => (e.currentTarget.style.background = "")}
              >
                <input
                  type="checkbox"
                  checked={selected.includes(d.id)}
                  onChange={() => toggleOne(d.id)}
                  style={{ accentColor: OR, flexShrink: 0 }}
                />
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: 13 }}>{d.name}</div>
                  <div style={{ fontSize: 11, color: "#aaa" }}>
                    {d.phone || "Нет телефона"}
                  </div>
                </div>
                <div style={{ fontWeight: 700, color: OR, fontSize: 13 }}>
                  {fmt(d.remaining)} ₸
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Предупреждение */}
      <div style={{
        background: "#fff3e6",
        border: "1px solid #fde8c8",
        borderRadius: 8, padding: "10px 14px",
        marginBottom: 18,
        fontSize: 12, color: "#c76b00",
      }}>
        ⚠️ Будет отправлено {selected.length} SMS. Убедитесь в наличии активной
        интеграции с SMS-провайдером.
      </div>

      <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
        <button onClick={onClose} style={mkBtn("s")}>Отмена</button>
        <button
          disabled={selected.length === 0}
          style={{
            ...mkBtn("p"),
            opacity: selected.length > 0 ? 1 : 0.5,
            cursor: selected.length > 0 ? "pointer" : "not-allowed",
          }}
        >
          Отправить {selected.length} SMS
        </button>
      </div>
    </Modal>
  );
}
