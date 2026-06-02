import { useState } from "react";
import {
  OR, OL, fmt, toDay,
  Sc, mkBtn, mkBadge,
  Modal, PageHead, StatCard, Grid2,
  SearchBar, Tabs, Toggle,
  EmptyState, Pagination,
} from "./shared";
import type { Client } from "./App";

// ── Все клиенты ───────────────────────────────────────────────────────────────

export function PageClients({
  clients,
  setClients,
  apiPostClient,
  apiPatchClient,
  apiDeleteClient,
}: {
  clients:         Client[];
  setClients:      (fn: (prev: Client[]) => Client[]) => void;
  apiPostClient:   (b: any) => Promise<any>;
  apiPatchClient:  (id: number, b: any) => Promise<any>;
  apiDeleteClient: (id: number) => Promise<void>;
}) {
  const [q,         setQ]         = useState("");
  const [showAdd,   setShowAdd]   = useState(false);
  const [showEdit,  setShowEdit]  = useState<Client | null>(null);
  const [showStats, setShowStats] = useState(true);
  const [page,      setPage]      = useState(1);
  const PER = 10;

  const [form, setForm] = useState({
    name: "", phone: "", email: "",
    gender: "", birthday: "", comment: "", debt: 0, group: "",
  });

  const shown = q
    ? clients.filter(
        c =>
          c.name.toLowerCase().includes(q.toLowerCase()) ||
          (c.phone ?? "").includes(q) ||
          (c.email ?? "").includes(q)
      )
    : clients;

  const paged = shown.slice((page - 1) * PER, page * PER);

  const thisWeek = clients.filter(c => {
    const d   = new Date(c.createdAt ?? 0);
    const now = new Date();
    return now.getTime() - d.getTime() < 7 * 24 * 3600 * 1000;
  }).length;

  // ── addClient — POST в API ────────────────────────────────────────
  async function addClient() {
    if (!form.name) return;
    try {
      const saved = await apiPostClient({
        name:     form.name,
        phone:    form.phone,
        email:    form.email,
        gender:   form.gender,
        birthday: form.birthday,
        comment:  form.comment,
        debt:     Number(form.debt) || 0,
        repaid:   0,
        group:    form.group,
        sum:      0,
        lastBuy:  null,
        created:  toDay(),
      });
      setClients(prev => [saved, ...prev]);
      setForm({
        name: "", phone: "", email: "",
        gender: "", birthday: "", comment: "", debt: 0, group: "",
      });
      setShowAdd(false);
    } catch (e: any) {
      alert(`Ошибка: ${e.message}`);
    }
  }

  // ── saveEdit — PATCH ──────────────────────────────────────────────
  async function saveEdit(c: Client) {
    try {
      const saved = await apiPatchClient(c.id, c);
      setClients(prev => prev.map(x => (x.id === c.id ? saved : x)));
      setShowEdit(null);
    } catch (e: any) {
      alert(`Ошибка: ${e.message}`);
    }
  }

  // ── deleteClient — DELETE ─────────────────────────────────────────
  async function deleteClient(id: number) {
    try {
      await apiDeleteClient(id);
      setClients(prev => prev.filter(c => c.id !== id));
      setShowEdit(null);
    } catch (e: any) {
      alert(`Ошибка: ${e.message}`);
    }
  }

  return (
    <div>
      <PageHead
        title="Все клиенты"
        bread="Главная › Покупатели › Все клиенты"
        right={
          <button
            onClick={() => setShowStats(s => !s)}
            style={mkBtn("s", { fontSize: 12 })}
          >
            {showStats ? "▲" : "▼"} Скрыть статистику
          </button>
        }
      />

      <div style={{ padding: "12px 14px" }}>

        {/* Статистика */}
        {showStats && (
          <Grid2>
            <StatCard label="Всего клиентов"   value={`${clients.length} клиентов`} ico="👥" />
            <StatCard label="Последняя неделя" value={`${thisWeek} клиентов`}       ico="📅" />
            <StatCard label="Не возвращающиеся"value="0 клиентов"                   ico="👤" />
            <StatCard label="Дни рождения"     value="0 клиентов"                   ico="🎁" />
          </Grid2>
        )}

        {/* Панель действий */}
        <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
          <SearchBar
            value={q}
            onChange={v => { setQ(v); setPage(1); }}
            placeholder="ID, имя, телефон"
          />
          <button style={mkBtn("s", { fontSize: 12 })}>▾ Фильтры</button>
          <button style={mkBtn("s", { fontSize: 12 })}>⋯ Действия</button>
          <button
            onClick={() => setShowAdd(true)}
            style={mkBtn("p", { fontSize: 12 })}
          >
            + Новый клиент
          </button>
        </div>

        {/* Таблица */}
        <div style={{ ...Sc.card, padding: 0, overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 640 }}>
            <thead>
              <tr>
                <th style={{ ...Sc.th, width: 32 }}>
                  <input type="checkbox" style={{ accentColor: OR }} />
                </th>
                {[
                  "ID", "ФИО", "Телефон", "Группы", "Теги", "Пол",
                  "Сумма покупок", "Последняя покупка", "День рождения", "Дата",
                ].map(h => (
                  <th key={h} style={Sc.th}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {paged.length === 0 ? (
                <tr>
                  <td colSpan={11}>
                    <EmptyState
                      icon="👥"
                      title="Клиентов нет"
                      sub="Добавьте первого клиента"
                      action={
                        <button
                          onClick={() => setShowAdd(true)}
                          style={mkBtn()}
                        >
                          + Новый клиент
                        </button>
                      }
                    />
                  </td>
                </tr>
              ) : (
                paged.map((c, i) => (
                  <tr
                    key={c.id}
                    onMouseEnter={e => (e.currentTarget.style.background = "#fafafa")}
                    onMouseLeave={e => (e.currentTarget.style.background = "")}
                  >
                    <td style={Sc.td}>
                      <input type="checkbox" style={{ accentColor: OR }} />
                    </td>
                    <td style={Sc.td}>{(page - 1) * PER + i + 1}</td>
                    <td
                      style={{ ...Sc.td, fontWeight: 600, color: OR, cursor: "pointer" }}
                      onClick={() => setShowEdit({ ...c })}
                    >
                      {c.name}
                    </td>
                    <td style={Sc.td}>{c.phone || "—"}</td>
                    <td style={{ ...Sc.td, color: "#aaa" }}>—</td>
                    <td style={{ ...Sc.td, color: "#aaa" }}>—</td>
                    <td style={{ ...Sc.td, color: "#aaa" }}>—</td>
                    <td style={{ ...Sc.td, fontWeight: 600 }}>{fmt(c.sum ?? 0)} ₸</td>
                    <td style={{ ...Sc.td, color: "#aaa" }}>{c.lastBuy ?? "—"}</td>
                    <td style={{ ...Sc.td, color: "#aaa" }}>{c.birthday || "—"}</td>
                    <td style={{ ...Sc.td, fontSize: 11, color: "#aaa" }}>{c.created}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>

          <div style={{
            padding: "0 12px",
            borderTop: "1px solid #f5f5f5",
            display: "flex", justifyContent: "space-between", alignItems: "center",
          }}>
            <Pagination
              page={page}
              total={shown.length}
              perPage={PER}
              onChange={setPage}
            />
            <div style={{ display: "flex", gap: 8 }}>
              <button style={mkBtn("s", { fontSize: 12 })}>⬇ Скачать</button>
              <span style={{ fontSize: 12, color: "#aaa" }}>
                Показать по {PER} ▾
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Modal: Добавить клиента */}
      {showAdd && (
        <Modal title="Новый клиент" onClose={() => setShowAdd(false)} width={500}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>

            <div style={{ gridColumn: "1 / -1" }}>
              <label style={Sc.lbl}>ФИО *</label>
              <input
                value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                style={Sc.inp}
                placeholder="Иван Иванов"
                autoFocus
              />
            </div>

            <div>
              <label style={Sc.lbl}>Телефон</label>
              <input
                value={form.phone}
                onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                style={Sc.inp}
                placeholder="+7 777 000 00 00"
              />
            </div>

            <div>
              <label style={Sc.lbl}>Email</label>
              <input
                value={form.email}
                onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                style={Sc.inp}
                placeholder="client@example.com"
              />
            </div>

            <div>
              <label style={Sc.lbl}>Пол</label>
              <select
                value={form.gender}
                onChange={e => setForm(f => ({ ...f, gender: e.target.value }))}
                style={{ ...Sc.inp, appearance: "none" }}
              >
                <option value="">— не указан —</option>
                <option value="М">Мужской</option>
                <option value="Ж">Женский</option>
              </select>
            </div>

            <div>
              <label style={Sc.lbl}>День рождения</label>
              <input
                type="date"
                value={form.birthday}
                onChange={e => setForm(f => ({ ...f, birthday: e.target.value }))}
                style={Sc.inp}
              />
            </div>

            <div>
              <label style={Sc.lbl}>Начальный долг (₸)</label>
              <input
                type="number"
                value={form.debt}
                onChange={e => setForm(f => ({ ...f, debt: Number(e.target.value) }))}
                style={Sc.inp}
              />
            </div>

            <div style={{ gridColumn: "1 / -1" }}>
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
            <button onClick={addClient} style={mkBtn()}>Сохранить</button>
          </div>
        </Modal>
      )}

      {/* Modal: Редактировать клиента */}
      {showEdit && (
        <Modal
          title={`Клиент: ${showEdit.name}`}
          onClose={() => setShowEdit(null)}
          width={500}
        >
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>

            <div style={{ gridColumn: "1 / -1" }}>
              <label style={Sc.lbl}>ФИО</label>
              <input
                value={showEdit.name}
                onChange={e => setShowEdit(c => c ? { ...c, name: e.target.value } : c)}
                style={Sc.inp}
              />
            </div>

            <div>
              <label style={Sc.lbl}>Телефон</label>
              <input
                value={showEdit.phone ?? ""}
                onChange={e => setShowEdit(c => c ? { ...c, phone: e.target.value } : c)}
                style={Sc.inp}
              />
            </div>

            <div>
              <label style={Sc.lbl}>Email</label>
              <input
                value={showEdit.email ?? ""}
                onChange={e => setShowEdit(c => c ? { ...c, email: e.target.value } : c)}
                style={Sc.inp}
              />
            </div>

            <div>
              <label style={Sc.lbl}>Пол</label>
              <select
                value={showEdit.gender ?? ""}
                onChange={e => setShowEdit(c => c ? { ...c, gender: e.target.value } : c)}
                style={{ ...Sc.inp, appearance: "none" }}
              >
                <option value="">— не указан —</option>
                <option value="М">Мужской</option>
                <option value="Ж">Женский</option>
              </select>
            </div>

            <div>
              <label style={Sc.lbl}>День рождения</label>
              <input
                type="date"
                value={showEdit.birthday ?? ""}
                onChange={e => setShowEdit(c => c ? { ...c, birthday: e.target.value } : c)}
                style={Sc.inp}
              />
            </div>

            <div style={{ gridColumn: "1 / -1" }}>
              <label style={Sc.lbl}>Комментарий</label>
              <textarea
                value={showEdit.comment ?? ""}
                onChange={e => setShowEdit(c => c ? { ...c, comment: e.target.value } : c)}
                style={{ ...Sc.inp, height: 64, resize: "vertical" }}
              />
            </div>
          </div>

          <div style={{
            display: "flex", justifyContent: "space-between",
            alignItems: "center", marginTop: 20,
          }}>
            <button
              onClick={() => showEdit && deleteClient(showEdit.id)}
              style={{
                ...mkBtn("s"),
                color: "#e74c3c",
                border: "1px solid #fcc",
                background: "#fee",
              }}
            >
              Удалить клиента
            </button>
            <div style={{ display: "flex", gap: 10 }}>
              <button onClick={() => setShowEdit(null)} style={mkBtn("s")}>Отмена</button>
              <button
                onClick={() => showEdit && saveEdit(showEdit)}
                style={mkBtn()}
              >
                Сохранить
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

// ── Группы и теги ─────────────────────────────────────────────────────────────

type Group = {
  id:          number;
  name:        string;
  bonus:       string;
  clientCount: number;
  status:      string;
  created:     string;
};

type Tag = {
  id:          number;
  name:        string;
  clientCount: number;
  created:     string;
};

export function PageGroups({ clients }: { clients: Client[] }) {
  const [subTab,    setSubTab]    = useState("groups");
  const [showAdd,   setShowAdd]   = useState(false);
  const [showStats, setShowStats] = useState(true);

  const [groups, setGroups] = useState<Group[]>([
    {
      id: 2, name: "группа 1", bonus: "—",
      clientCount: 2, status: "Открытый", created: "10.05.2026",
    },
  ]);

  const [tags, setTags] = useState<Tag[]>([
    { id: 1, name: "VIP", clientCount: 0, created: "10.05.2026" },
  ]);

  const [form, setForm] = useState({ name: "", bonus: "", type: "group" });

  function add() {
    if (!form.name) return;
    if (form.type === "group") {
      setGroups(prev => [
        ...prev,
        {
          id:          Date.now(),
          name:        form.name,
          bonus:       form.bonus || "—",
          clientCount: 0,
          status:      "Открытый",
          created:     toDay(),
        },
      ]);
    } else {
      setTags(prev => [
        ...prev,
        { id: Date.now(), name: form.name, clientCount: 0, created: toDay() },
      ]);
    }
    setForm({ name: "", bonus: "", type: "group" });
    setShowAdd(false);
  }

  return (
    <div>
      <PageHead
        title="Группы и теги"
        bread="Главная › Покупатели › Группы и теги"
        right={
          <button
            onClick={() => setShowStats(s => !s)}
            style={mkBtn("s", { fontSize: 12 })}
          >
            {showStats ? "▲" : "▼"} Скрыть статистику
          </button>
        }
      />

      <div style={{ padding: "12px 14px" }}>

        {showStats && (
          <Grid2>
            <StatCard label="Кол-во групп" value={`${groups.length} шт`} ico="👥" />
            <StatCard label="Кол-во тегов" value={`${tags.length} шт`}   ico="🏷" />
          </Grid2>
        )}

        <div style={{ display: "flex", marginBottom: 14 }}>
          {[["groups", "Группы"], ["tags", "Теги"]].map(([k, l]) => (
            <button
              key={k}
              onClick={() => setSubTab(k)}
              style={{
                flex: 1, padding: "10px", border: "none", cursor: "pointer",
                fontSize: 13, fontWeight: 600,
                background: subTab === k ? "#fff" : "#f0f0f0",
                color: subTab === k ? OR : "#555",
                borderBottom: `2px solid ${subTab === k ? OR : "transparent"}`,
              }}
            >
              {l}
            </button>
          ))}
        </div>

        <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
          <SearchBar value="" onChange={() => {}} placeholder="ID, тип" />
          <button
            onClick={() => setShowAdd(true)}
            style={mkBtn("p", { fontSize: 12 })}
          >
            + Создать
          </button>
        </div>

        {subTab === "groups" && (
          <div style={{ ...Sc.card, padding: 0 }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr>
                  {["ID", "Наименование", "Бонус", "Кол-во клиентов", "Статус", "Дата создания"].map(h => (
                    <th key={h} style={Sc.th}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {groups.map(g => (
                  <tr
                    key={g.id}
                    onMouseEnter={e => (e.currentTarget.style.background = "#fafafa")}
                    onMouseLeave={e => (e.currentTarget.style.background = "")}
                  >
                    <td style={Sc.td}>{g.id}</td>
                    <td style={{ ...Sc.td, color: OR, fontWeight: 600, cursor: "pointer" }}>
                      {g.name}
                    </td>
                    <td style={{ ...Sc.td, color: "#aaa" }}>{g.bonus}</td>
                    <td style={{ ...Sc.td, color: OR, fontWeight: 700 }}>{g.clientCount}</td>
                    <td style={Sc.td}><span style={mkBadge("gr")}>{g.status}</span></td>
                    <td style={{ ...Sc.td, fontSize: 12, color: "#aaa" }}>{g.created}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {groups.length === 0 && <EmptyState icon="👥" title="Групп нет" />}
            <div style={{
              padding: "8px 14px", fontSize: 12, color: "#aaa",
              display: "flex", justifyContent: "space-between",
              borderTop: "1px solid #f5f5f5",
            }}>
              <span>◀ 1 ▶</span>
              <span>Показать по 10 ▾</span>
            </div>
          </div>
        )}

        {subTab === "tags" && (
          <div style={{ ...Sc.card, padding: 0 }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr>
                  {["ID", "Наименование", "Кол-во клиентов", "Дата создания"].map(h => (
                    <th key={h} style={Sc.th}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {tags.map(t => (
                  <tr
                    key={t.id}
                    onMouseEnter={e => (e.currentTarget.style.background = "#fafafa")}
                    onMouseLeave={e => (e.currentTarget.style.background = "")}
                  >
                    <td style={Sc.td}>{t.id}</td>
                    <td style={{ ...Sc.td, color: OR, fontWeight: 600, cursor: "pointer" }}>
                      {t.name}
                    </td>
                    <td style={{ ...Sc.td, color: OR, fontWeight: 700 }}>{t.clientCount}</td>
                    <td style={{ ...Sc.td, fontSize: 12, color: "#aaa" }}>{t.created}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {tags.length === 0 && <EmptyState icon="🏷" title="Тегов нет" />}
          </div>
        )}
      </div>

      {showAdd && (
        <Modal title="Создать" onClose={() => setShowAdd(false)} width={400}>
          <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
            {[["group", "Группа"], ["tag", "Тег"]].map(([k, l]) => (
              <button
                key={k}
                onClick={() => setForm(f => ({ ...f, type: k }))}
                style={{
                  flex: 1, padding: "9px", borderRadius: 7, cursor: "pointer",
                  border: `2px solid ${form.type === k ? OR : "#e0e0e0"}`,
                  background: form.type === k ? OL : "#fafafa",
                  color: form.type === k ? OR : "#555",
                  fontWeight: 700,
                }}
              >
                {l}
              </button>
            ))}
          </div>

          <div style={{ marginBottom: 14 }}>
            <label style={Sc.lbl}>Наименование *</label>
            <input
              value={form.name}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              style={Sc.inp}
              autoFocus
            />
          </div>

          {form.type === "group" && (
            <div style={{ marginBottom: 14 }}>
              <label style={Sc.lbl}>Бонус (%)</label>
              <input
                type="number"
                value={form.bonus}
                onChange={e => setForm(f => ({ ...f, bonus: e.target.value }))}
                style={Sc.inp}
                placeholder="Необязательно"
              />
            </div>
          )}

          <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 8 }}>
            <button onClick={() => setShowAdd(false)} style={mkBtn("s")}>Отмена</button>
            <button onClick={add} style={mkBtn()}>Создать</button>
          </div>
        </Modal>
      )}
    </div>
  );
}

// ── Программа лояльности ──────────────────────────────────────────────────────

type LoyaltyLevel = {
  id:       number;
  name:     string;
  minSum:   number;
  discount: number;
  bonus:    number;
};

export function PageLoyalty() {
  const [type, setType] = useState<"discount" | "bonus">("discount");

  const [levels, setLevels] = useState<LoyaltyLevel[]>([
    { id: 1, name: "Серебро", minSum: 0,      discount: 5,  bonus: 0 },
    { id: 2, name: "Золото",  minSum: 50000,  discount: 10, bonus: 0 },
    { id: 3, name: "Платина", minSum: 150000, discount: 15, bonus: 0 },
  ]);

  const [showAdd,  setShowAdd]  = useState(false);
  const [showEdit, setShowEdit] = useState<LoyaltyLevel | null>(null);
  const [newLevel, setNewLevel] = useState({ name: "", minSum: 0, discount: 0, bonus: 0 });

  function addLevel() {
    if (!newLevel.name) return;
    setLevels(prev => [...prev, { id: Date.now(), ...newLevel }]);
    setNewLevel({ name: "", minSum: 0, discount: 0, bonus: 0 });
    setShowAdd(false);
  }

  function saveLevel(l: LoyaltyLevel) {
    setLevels(prev => prev.map(x => (x.id === l.id ? l : x)));
    setShowEdit(null);
  }

  function deleteLevel(id: number) {
    setLevels(prev => prev.filter(l => l.id !== id));
  }

  const levelColors = ["#f39c12", "#f1c40f", "#bdc3c7"];

  return (
    <div>
      <PageHead
        title="Программа лояльности"
        sub="Управление программой лояльности"
        bread="Главная › Покупатели › Программа лояльности"
        right={
          <button style={mkBtn("p", { fontSize: 12 })}>✏ Редактировать</button>
        }
      />

      <div style={{ padding: "12px 14px" }}>

        <div style={Sc.card}>
          <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 12 }}>
            Тип программы лояльности
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            {(["discount", "bonus"] as const).map(k => (
              <button
                key={k}
                onClick={() => setType(k)}
                style={{
                  padding: "9px 18px", borderRadius: 7, cursor: "pointer",
                  border: `2px solid ${type === k ? OR : "#e0e0e0"}`,
                  background: type === k ? OL : "#fafafa",
                  color: type === k ? OR : "#555",
                  fontWeight: 700, fontSize: 13,
                }}
              >
                {k === "discount" ? "Дисконтная система" : "Бонусная система"}
              </button>
            ))}
          </div>
          <div style={{ marginTop: 12, fontSize: 12, color: "#888" }}>
            {type === "discount"
              ? "Клиент получает скидку при достижении суммы покупок."
              : "Клиент накапливает бонусы и тратит их при следующих покупках."}
          </div>
        </div>

        <div style={Sc.card}>
          <div style={{
            display: "flex", justifyContent: "space-between",
            alignItems: "center", marginBottom: 14,
          }}>
            <div style={{ fontSize: 13, fontWeight: 700 }}>Уровни программы</div>
            <button onClick={() => setShowAdd(true)} style={mkBtn("s", { fontSize: 12 })}>
              + Добавить уровень
            </button>
          </div>

          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                {["Уровень", "Мин. сумма покупок", "Скидка / Бонус (%)", "Действие"].map(h => (
                  <th key={h} style={Sc.th}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {levels.map((l, idx) => (
                <tr
                  key={l.id}
                  onMouseEnter={e => (e.currentTarget.style.background = "#fafafa")}
                  onMouseLeave={e => (e.currentTarget.style.background = "")}
                >
                  <td style={Sc.td}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <div style={{
                        width: 12, height: 12, borderRadius: 50,
                        background: levelColors[idx] ?? OR, flexShrink: 0,
                      }} />
                      <span
                        style={{ fontWeight: 600, color: OR, cursor: "pointer" }}
                        onClick={() => setShowEdit({ ...l })}
                      >
                        {l.name}
                      </span>
                    </div>
                  </td>
                  <td style={Sc.td}>{fmt(l.minSum)} ₸</td>
                  <td style={Sc.td}>
                    <span style={{ color: OR, fontWeight: 700 }}>
                      {type === "discount" ? l.discount : l.bonus}%
                    </span>
                  </td>
                  <td style={Sc.td}>
                    <button
                      onClick={() => deleteLevel(l.id)}
                      style={{
                        background: "#fee", border: "1px solid #fcc",
                        borderRadius: 5, padding: "3px 8px",
                        cursor: "pointer", fontSize: 11, color: "#e74c3c",
                      }}
                    >
                      ✕
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {levels.length === 0 && (
            <EmptyState icon="🏆" title="Уровней нет" sub="Добавьте первый уровень" />
          )}

          <div style={{ marginTop: 14, display: "flex", justifyContent: "flex-end" }}>
            <button style={mkBtn()}>Сохранить изменения</button>
          </div>
        </div>
      </div>

      {showAdd && (
        <Modal title="Новый уровень" onClose={() => setShowAdd(false)} width={400}>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <div>
              <label style={Sc.lbl}>Название уровня *</label>
              <input
                value={newLevel.name}
                onChange={e => setNewLevel(l => ({ ...l, name: e.target.value }))}
                style={Sc.inp}
                placeholder="Серебро"
                autoFocus
              />
            </div>
            <div>
              <label style={Sc.lbl}>Минимальная сумма покупок (₸)</label>
              <input
                type="number"
                value={newLevel.minSum}
                onChange={e => setNewLevel(l => ({ ...l, minSum: Number(e.target.value) }))}
                style={Sc.inp}
              />
            </div>
            <div>
              <label style={Sc.lbl}>
                {type === "discount" ? "Скидка (%)" : "Бонус (%)"}
              </label>
              <input
                type="number"
                value={type === "discount" ? newLevel.discount : newLevel.bonus}
                onChange={e =>
                  setNewLevel(l =>
                    type === "discount"
                      ? { ...l, discount: Number(e.target.value) }
                      : { ...l, bonus: Number(e.target.value) }
                  )
                }
                style={Sc.inp}
              />
            </div>
          </div>
          <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 18 }}>
            <button onClick={() => setShowAdd(false)} style={mkBtn("s")}>Отмена</button>
            <button onClick={addLevel} style={mkBtn()}>Создать</button>
          </div>
        </Modal>
      )}

      {showEdit && (
        <Modal title={`Уровень: ${showEdit.name}`} onClose={() => setShowEdit(null)} width={400}>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <div>
              <label style={Sc.lbl}>Название</label>
              <input
                value={showEdit.name}
                onChange={e => setShowEdit(l => l ? { ...l, name: e.target.value } : l)}
                style={Sc.inp}
              />
            </div>
            <div>
              <label style={Sc.lbl}>Минимальная сумма (₸)</label>
              <input
                type="number"
                value={showEdit.minSum}
                onChange={e => setShowEdit(l => l ? { ...l, minSum: Number(e.target.value) } : l)}
                style={Sc.inp}
              />
            </div>
            <div>
              <label style={Sc.lbl}>
                {type === "discount" ? "Скидка (%)" : "Бонус (%)"}
              </label>
              <input
                type="number"
                value={type === "discount" ? showEdit.discount : showEdit.bonus}
                onChange={e =>
                  setShowEdit(l =>
                    l
                      ? type === "discount"
                        ? { ...l, discount: Number(e.target.value) }
                        : { ...l, bonus: Number(e.target.value) }
                      : l
                  )
                }
                style={Sc.inp}
              />
            </div>
          </div>
          <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 18 }}>
            <button onClick={() => setShowEdit(null)} style={mkBtn("s")}>Отмена</button>
            <button onClick={() => showEdit && saveLevel(showEdit)} style={mkBtn()}>
              Сохранить
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}
