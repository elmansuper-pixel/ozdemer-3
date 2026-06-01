import { useState } from "react";
import {
  OR, OL, fmt, toDay,
  Sc, mkBtn, mkBadge,
  Modal, PageHead, SearchBar, Tabs,
  EmptyState, Pagination,
} from "./shared";
import type { StaffMember } from "./App";

// ─── Permission types ─────────────────────────────────────────────────────────

type Permissions = {
  sales:     boolean;
  refunds:   boolean;
  warehouse: boolean;
  reports:   boolean;
  settings:  boolean;
  staff:     boolean;
  clients:   boolean;
  kassa:     boolean;
};

type Role = {
  id:    number;
  name:  string;
  count: number;
  desc:  string;
  perms: Permissions;
};

// ─── Default permissions per role ─────────────────────────────────────────────

const DEFAULT_PERMS: Record<string, Permissions> = {
  "Владелец": {
    sales: true, refunds: true,  warehouse: true,
    reports: true,  settings: true,  staff: true,
    clients: true,  kassa: true,
  },
  "Администратор": {
    sales: true, refunds: true,  warehouse: true,
    reports: true,  settings: false, staff: true,
    clients: true,  kassa: true,
  },
  "Кассир": {
    sales: true, refunds: false, warehouse: false,
    reports: false, settings: false, staff: false,
    clients: true,  kassa: true,
  },
  "Менеджер": {
    sales: false, refunds: false, warehouse: true,
    reports: true,  settings: false, staff: false,
    clients: true,  kassa: false,
  },
};

const EMPTY_PERMS: Permissions = {
  sales: false, refunds: false, warehouse: false,
  reports: false, settings: false, staff: false,
  clients: false, kassa: false,
};

const PERM_LABELS: [keyof Permissions, string][] = [
  ["sales",     "Продажи"],
  ["refunds",   "Возвраты"],
  ["warehouse", "Склад"],
  ["reports",   "Отчёты"],
  ["settings",  "Настройки"],
  ["staff",     "Персонал"],
  ["clients",   "Клиенты"],
  ["kassa",     "Кассовые операции"],
];

// ── Персонал ──────────────────────────────────────────────────────────────────

export function PageStaff({
  staff,
  setStaff,
}: {
  staff:    StaffMember[];
  setStaff: (fn: (prev: StaffMember[]) => StaffMember[]) => void;
}) {
  const [tab,      setTab]      = useState("active");
  const [showAdd,  setShowAdd]  = useState(false);
  const [showEdit, setShowEdit] = useState<StaffMember & { _menu?: boolean } | null>(null);
  const [page,     setPage]     = useState(1);
  const [q,        setQ]        = useState("");
  const [roleF,    setRoleF]    = useState("");
  const [storeF,   setStoreF]   = useState("");
  const PER = 10;

  const [form, setForm] = useState({
    name: "", phone: "", email: "",
    role: "Кассир", store: "Главный магазин", password: "",
  });

  const shown = staff.filter(s => {
    const qm  = !q    || s.name.toLowerCase().includes(q.toLowerCase()) || (s.phone ?? "").includes(q);
    const rm  = !roleF  || s.role  === roleF;
    const sm  = !storeF || s.store === storeF;
    return s.status === tab && qm && rm && sm;
  });

  const paged = shown.slice((page - 1) * PER, page * PER);

  const stores = [...new Set(staff.map(s => s.store))];

  const tabCounts = {
    active:  staff.filter(s => s.status === "active").length,
    blocked: staff.filter(s => s.status === "blocked").length,
    archive: staff.filter(s => s.status === "archive").length,
  };

  const tabs = [
    { k: "active",  l: `Активные (${tabCounts.active})`            },
    { k: "blocked", l: `Заблокированные (${tabCounts.blocked})`     },
    { k: "archive", l: `Архив (${tabCounts.archive})`               },
  ];

  // Инициалы из имени
  function initials(name: string): string {
    return name
      .split(" ")
      .filter(Boolean)
      .map(w => w[0].toUpperCase())
      .join("")
      .slice(0, 2);
  }

  // Цвет аватара
  const avatarColors = ["#E8531D", "#3498db", "#9b59b6", "#1abc9c", "#e74c3c", "#f39c12"];
  function avatarColor(id: number): string {
    return avatarColors[id % avatarColors.length];
  }

  function addStaff() {
    if (!form.name || !form.role) return;
    setStaff(prev => [
      ...prev,
      {
        id:      Date.now(),
        name:    form.name,
        phone:   form.phone,
        email:   form.email,
        role:    form.role,
        store:   form.store,
        status:  "active",
        created: toDay(),
      },
    ]);
    setForm({
      name: "", phone: "", email: "",
      role: "Кассир", store: "Главный магазин", password: "",
    });
    setShowAdd(false);
  }

  function updateStatus(id: number, status: StaffMember["status"]) {
    setStaff(prev => prev.map(s => s.id === id ? { ...s, status } : s));
    setShowEdit(null);
  }

  function deleteStaff(id: number) {
    setStaff(prev => prev.filter(s => s.id !== id));
    setShowEdit(null);
  }

  function saveEdit(s: StaffMember) {
    setStaff(prev => prev.map(x => x.id === s.id ? { ...x, ...s } : x));
    setShowEdit(null);
  }

  return (
    <div>
      <PageHead
        title="Персонал"
        sub="Управление сотрудниками, ролями и доступом."
        bread="Главная › Персонал"
        right={
          <span style={{ fontSize: 12, color: "#888", fontWeight: 600 }}>
            Всего: {staff.length}
          </span>
        }
      />

      <div style={{ padding: "12px 14px" }}>

        <Tabs tabs={tabs} active={tab} onChange={v => { setTab(v); setPage(1); }} />

        {/* Панель фильтров */}
        <div style={{ display: "flex", gap: 8, marginBottom: 12, flexWrap: "wrap" }}>
          <input
            value={q}
            onChange={e => { setQ(e.target.value); setPage(1); }}
            placeholder="🔍 Поиск сотрудника..."
            style={{ ...Sc.inp, width: 200 }}
          />
          <select
            value={roleF}
            onChange={e => { setRoleF(e.target.value); setPage(1); }}
            style={{ ...Sc.inp, width: "auto", minWidth: 120 }}
          >
            <option value="">Все роли</option>
            {Object.keys(DEFAULT_PERMS).map(r => (
              <option key={r} value={r}>{r}</option>
            ))}
          </select>
          <select
            value={storeF}
            onChange={e => { setStoreF(e.target.value); setPage(1); }}
            style={{ ...Sc.inp, width: "auto", minWidth: 150 }}
          >
            <option value="">Все магазины</option>
            {stores.map(s => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
          <div style={{ flex: 1 }} />
          <button
            onClick={() => setShowAdd(true)}
            style={mkBtn("p", { fontSize: 12 })}
          >
            + Добавить сотрудника
          </button>
        </div>

        {/* Таблица сотрудников */}
        <div style={{ ...Sc.card, padding: 0, overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 520 }}>
            <thead>
              <tr>
                {["Сотрудник", "Роль", "Магазин", "Статус", "Действия"].map(h => (
                  <th key={h} style={Sc.th}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {paged.length === 0 ? (
                <tr>
                  <td colSpan={5}>
                    <EmptyState
                      icon="👤"
                      title="Нет сотрудников"
                      sub="Добавьте первого сотрудника"
                      action={
                        <button
                          onClick={() => setShowAdd(true)}
                          style={mkBtn()}
                        >
                          + Добавить сотрудника
                        </button>
                      }
                    />
                  </td>
                </tr>
              ) : (
                paged.map(s => (
                  <tr
                    key={s.id}
                    onMouseEnter={e => (e.currentTarget.style.background = "#fafafa")}
                    onMouseLeave={e => (e.currentTarget.style.background = "")}
                  >
                    {/* Сотрудник */}
                    <td style={Sc.td}>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <div style={{
                          width: 38, height: 38, borderRadius: 50, flexShrink: 0,
                          background: avatarColor(s.id),
                          display: "flex", alignItems: "center", justifyContent: "center",
                          color: "#fff", fontWeight: 800, fontSize: 13,
                        }}>
                          {initials(s.name)}
                        </div>
                        <div>
                          <div
                            style={{ fontWeight: 600, fontSize: 13, color: OR, cursor: "pointer" }}
                            onClick={() => setShowEdit({ ...s })}
                          >
                            {s.name}
                          </div>
                          <div style={{ fontSize: 11, color: "#aaa" }}>
                            {s.phone || s.email || "—"}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Роль */}
                    <td style={Sc.td}>
                      <span style={mkBadge("or")}>{s.role}</span>
                    </td>

                    {/* Магазин */}
                    <td style={{ ...Sc.td, fontSize: 12, color: "#555" }}>
                      {s.store}
                    </td>

                    {/* Статус */}
                    <td style={Sc.td}>
                      <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                        <span style={{
                          width: 8, height: 8, borderRadius: 50, flexShrink: 0,
                          background:
                            s.status === "active"  ? "#1a8a3a" :
                            s.status === "blocked" ? "#e74c3c" : "#aaa",
                        }} />
                        <span style={{ fontSize: 12 }}>
                          {s.status === "active"  ? "Активен" :
                           s.status === "blocked" ? "Заблокирован" : "В архиве"}
                        </span>
                      </div>
                    </td>

                    {/* Действия */}
                    <td style={Sc.td}>
                      <button
                        onClick={() => setShowEdit({ ...s, _menu: true })}
                        style={{
                          background: "none", border: "none",
                          cursor: "pointer", color: "#bbb", fontSize: 22, padding: "0 4px",
                        }}
                      >
                        ⋯
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>

          <div style={{
            padding: "0 12px", borderTop: "1px solid #f5f5f5",
            display: "flex", justifyContent: "space-between", alignItems: "center",
          }}>
            <Pagination page={page} total={shown.length} perPage={PER} onChange={setPage} />
          </div>
        </div>
      </div>

      {/* Modal: Добавить сотрудника */}
      {showAdd && (
        <Modal title="Добавить сотрудника" onClose={() => setShowAdd(false)} width={500}>
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
                placeholder="+7 700 000 00 00"
              />
            </div>

            <div>
              <label style={Sc.lbl}>Email</label>
              <input
                value={form.email}
                onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                style={Sc.inp}
                placeholder="staff@ozd.kz"
              />
            </div>

            <div>
              <label style={Sc.lbl}>Роль *</label>
              <select
                value={form.role}
                onChange={e => setForm(f => ({ ...f, role: e.target.value }))}
                style={{ ...Sc.inp, appearance: "none" }}
              >
                {Object.keys(DEFAULT_PERMS).map(r => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
            </div>

            <div>
              <label style={Sc.lbl}>Магазин</label>
              <select
                value={form.store}
                onChange={e => setForm(f => ({ ...f, store: e.target.value }))}
                style={{ ...Sc.inp, appearance: "none" }}
              >
                <option>Главный магазин</option>
                <option>Филиал Центр</option>
              </select>
            </div>

            <div style={{ gridColumn: "1 / -1" }}>
              <label style={Sc.lbl}>Пароль (для входа в POS)</label>
              <input
                type="password"
                value={form.password}
                onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                style={Sc.inp}
                placeholder="Минимум 6 символов"
              />
            </div>
          </div>

          {/* Превью прав роли */}
          {form.role && DEFAULT_PERMS[form.role] && (
            <div style={{
              background: "#f9f9f9", borderRadius: 8,
              padding: "12px 14px", marginTop: 14,
            }}>
              <div style={{ fontSize: 12, color: "#888", fontWeight: 600, marginBottom: 8 }}>
                Права роли «{form.role}»:
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                {PERM_LABELS.map(([k, l]) => (
                  <span
                    key={k}
                    style={{
                      padding: "3px 10px", borderRadius: 50, fontSize: 11, fontWeight: 600,
                      background: DEFAULT_PERMS[form.role][k] ? "#e6f9ee" : "#f0f0f0",
                      color:      DEFAULT_PERMS[form.role][k] ? "#1a8a3a" : "#aaa",
                    }}
                  >
                    {DEFAULT_PERMS[form.role][k] ? "✓" : "✕"} {l}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 18 }}>
            <button onClick={() => setShowAdd(false)} style={mkBtn("s")}>Отмена</button>
            <button onClick={addStaff} style={mkBtn()}>Добавить</button>
          </div>
        </Modal>
      )}

      {/* Modal: Контекстное меню / Редактирование */}
      {showEdit && (
        <Modal
          title={showEdit._menu ? "Действия" : `Сотрудник: ${showEdit.name}`}
          onClose={() => setShowEdit(null)}
          width={showEdit._menu ? 300 : 500}
        >
          {showEdit._menu ? (
            /* Контекстное меню */
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <button
                onClick={() => setShowEdit({ ...showEdit, _menu: false })}
                style={{ ...mkBtn("s"), justifyContent: "flex-start", width: "100%" }}
              >
                ✏️ Редактировать
              </button>

              {showEdit.status === "active" && (
                <button
                  onClick={() => updateStatus(showEdit.id, "blocked")}
                  style={{
                    ...mkBtn("s"),
                    justifyContent: "flex-start", width: "100%",
                    color: "#e74c3c",
                  }}
                >
                  🚫 Заблокировать
                </button>
              )}

              {showEdit.status === "blocked" && (
                <button
                  onClick={() => updateStatus(showEdit.id, "active")}
                  style={{
                    ...mkBtn("s"),
                    justifyContent: "flex-start", width: "100%",
                    color: "#1a8a3a",
                  }}
                >
                  ✅ Разблокировать
                </button>
              )}

              {showEdit.status !== "archive" && (
                <button
                  onClick={() => updateStatus(showEdit.id, "archive")}
                  style={{
                    ...mkBtn("s"),
                    justifyContent: "flex-start", width: "100%",
                    color: "#888",
                  }}
                >
                  🗂 В архив
                </button>
              )}

              {showEdit.status === "archive" && (
                <button
                  onClick={() => updateStatus(showEdit.id, "active")}
                  style={{
                    ...mkBtn("s"),
                    justifyContent: "flex-start", width: "100%",
                    color: "#1a8a3a",
                  }}
                >
                  ↩ Восстановить
                </button>
              )}

              <div style={{ borderTop: "1px solid #eee", paddingTop: 8 }}>
                <button
                  onClick={() => deleteStaff(showEdit.id)}
                  style={{
                    ...mkBtn("s"),
                    justifyContent: "flex-start", width: "100%",
                    color: "#e74c3c", background: "#fee", border: "1px solid #fcc",
                  }}
                >
                  🗑 Удалить сотрудника
                </button>
              </div>
            </div>
          ) : (
            /* Форма редактирования */
            <>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div style={{ gridColumn: "1 / -1" }}>
                  <label style={Sc.lbl}>ФИО</label>
                  <input
                    value={showEdit.name}
                    onChange={e => setShowEdit(s => s ? { ...s, name: e.target.value } : s)}
                    style={Sc.inp}
                  />
                </div>
                <div>
                  <label style={Sc.lbl}>Телефон</label>
                  <input
                    value={showEdit.phone ?? ""}
                    onChange={e => setShowEdit(s => s ? { ...s, phone: e.target.value } : s)}
                    style={Sc.inp}
                  />
                </div>
                <div>
                  <label style={Sc.lbl}>Email</label>
                  <input
                    value={showEdit.email ?? ""}
                    onChange={e => setShowEdit(s => s ? { ...s, email: e.target.value } : s)}
                    style={Sc.inp}
                  />
                </div>
                <div>
                  <label style={Sc.lbl}>Роль</label>
                  <select
                    value={showEdit.role}
                    onChange={e => setShowEdit(s => s ? { ...s, role: e.target.value } : s)}
                    style={{ ...Sc.inp, appearance: "none" }}
                  >
                    {Object.keys(DEFAULT_PERMS).map(r => (
                      <option key={r} value={r}>{r}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label style={Sc.lbl}>Магазин</label>
                  <select
                    value={showEdit.store}
                    onChange={e => setShowEdit(s => s ? { ...s, store: e.target.value } : s)}
                    style={{ ...Sc.inp, appearance: "none" }}
                  >
                    <option>Главный магазин</option>
                    <option>Филиал Центр</option>
                  </select>
                </div>
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 18 }}>
                <button onClick={() => setShowEdit(null)} style={mkBtn("s")}>Отмена</button>
                <button
                  onClick={() => showEdit && saveEdit(showEdit)}
                  style={mkBtn()}
                >
                  Сохранить
                </button>
              </div>
            </>
          )}
        </Modal>
      )}
    </div>
  );
}

// ── Права доступа (Роли) ──────────────────────────────────────────────────────

export function PageRoles({ staff }: { staff: StaffMember[] }) {
  const [tab,      setTab]      = useState("active");
  const [showAdd,  setShowAdd]  = useState(false);
  const [showEdit, setShowEdit] = useState<Role | null>(null);
  const [q,        setQ]        = useState("");

  const [roles, setRoles] = useState<Role[]>([
    {
      id: 57, name: "Владелец",
      count: staff.filter(s => s.role === "Владелец").length,
      desc: "Владелец компании с полным доступом ко всем функциям",
      perms: { ...DEFAULT_PERMS["Владелец"] },
    },
    {
      id: 58, name: "Администратор",
      count: staff.filter(s => s.role === "Администратор").length,
      desc: "Администратор с широкими правами управления",
      perms: { ...DEFAULT_PERMS["Администратор"] },
    },
    {
      id: 59, name: "Кассир",
      count: staff.filter(s => s.role === "Кассир").length,
      desc: "Кассир с ограниченным доступом к кассовым операциям",
      perms: { ...DEFAULT_PERMS["Кассир"] },
    },
    {
      id: 60, name: "Менеджер",
      count: staff.filter(s => s.role === "Менеджер").length,
      desc: "Менеджер с доступом к отчетам и инвентаризации",
      perms: { ...DEFAULT_PERMS["Менеджер"] },
    },
  ]);

  const [deleted, setDeleted] = useState<Role[]>([]);

  const [newRole, setNewRole] = useState({
    name: "", desc: "",
    perms: { ...EMPTY_PERMS },
  });

  const shown = (tab === "active" ? roles : deleted).filter(r =>
    !q || r.name.toLowerCase().includes(q.toLowerCase())
  );

  function addRole() {
    if (!newRole.name) return;
    setRoles(prev => [
      ...prev,
      {
        id:    Date.now(),
        name:  newRole.name,
        count: 0,
        desc:  newRole.desc,
        perms: { ...newRole.perms },
      },
    ]);
    setNewRole({ name: "", desc: "", perms: { ...EMPTY_PERMS } });
    setShowAdd(false);
  }

  function deleteRole(id: number) {
    const r = roles.find(x => x.id === id);
    if (!r) return;
    setDeleted(prev => [...prev, r]);
    setRoles(prev => prev.filter(x => x.id !== id));
  }

  function restoreRole(id: number) {
    const r = deleted.find(x => x.id === id);
    if (!r) return;
    setRoles(prev => [...prev, r]);
    setDeleted(prev => prev.filter(x => x.id !== id));
  }

  function saveRole(r: Role) {
    setRoles(prev => prev.map(x => (x.id === r.id ? r : x)));
    setShowEdit(null);
  }

  return (
    <div>
      <PageHead
        title="Роли"
        bread="Главная › Роли"
        right={
          <button onClick={() => setShowAdd(true)} style={mkBtn("p", { fontSize: 12 })}>
            + Новая роль
          </button>
        }
      />

      <div style={{ padding: "12px 14px" }}>

        <Tabs
          tabs={[
            { k: "active",  l: `Активные роли (${roles.length})`   },
            { k: "deleted", l: `Удалённые роли (${deleted.length})` },
          ]}
          active={tab}
          onChange={setTab}
        />

        <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
          <SearchBar value={q} onChange={setQ} placeholder="ID, имя, магазин" />
        </div>

        {/* Таблица ролей */}
        <div style={{ ...Sc.card, padding: 0, overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                <th style={{ ...Sc.th, width: 32 }}>
                  <input type="checkbox" style={{ accentColor: OR }} />
                </th>
                {["ID", "Роль", "Кол-во", "Магазин", "Описание", "Действие"].map(h => (
                  <th key={h} style={Sc.th}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {shown.length === 0 ? (
                <tr>
                  <td colSpan={7}>
                    <EmptyState icon="🔐" title="Ролей нет" />
                  </td>
                </tr>
              ) : (
                shown.map(r => (
                  <tr
                    key={r.id}
                    onMouseEnter={e => (e.currentTarget.style.background = "#fafafa")}
                    onMouseLeave={e => (e.currentTarget.style.background = "")}
                  >
                    <td style={Sc.td}>
                      <input type="checkbox" style={{ accentColor: OR }} />
                    </td>
                    <td style={Sc.td}>{r.id}</td>
                    <td
                      style={{ ...Sc.td, color: OR, fontWeight: 700, cursor: "pointer" }}
                      onClick={() => setShowEdit({ ...r })}
                    >
                      {r.name}
                    </td>
                    <td style={Sc.td}>{r.count}</td>
                    <td style={{ ...Sc.td, color: "#aaa" }}>—</td>
                    <td style={{ ...Sc.td, fontSize: 12, color: "#555", maxWidth: 200 }}>
                      <div style={{
                        overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                      }}>
                        {r.desc}
                      </div>
                    </td>
                    <td style={Sc.td}>
                      {tab === "active" ? (
                        <button
                          onClick={() => deleteRole(r.id)}
                          style={{
                            background: "#fee", border: "none", borderRadius: 5,
                            color: "#e74c3c", width: 28, height: 28,
                            cursor: "pointer", fontSize: 14,
                          }}
                        >
                          ✕
                        </button>
                      ) : (
                        <button
                          onClick={() => restoreRole(r.id)}
                          style={mkBtn("s", { fontSize: 11, padding: "3px 10px" })}
                        >
                          Восстановить
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div style={{
          display: "flex", justifyContent: "space-between",
          marginTop: 10, fontSize: 12, color: "#aaa",
        }}>
          <span>◀ 1 ▶</span>
          <span>Показать по 10</span>
        </div>
      </div>

      {/* Modal: Новая роль */}
      {showAdd && (
        <Modal title="Новая роль" onClose={() => setShowAdd(false)} width={520}>

          <div style={{ marginBottom: 14 }}>
            <label style={Sc.lbl}>Название роли *</label>
            <input
              value={newRole.name}
              onChange={e => setNewRole(r => ({ ...r, name: e.target.value }))}
              style={Sc.inp}
              placeholder="Например: Старший кассир"
              autoFocus
            />
          </div>

          <div style={{ marginBottom: 18 }}>
            <label style={Sc.lbl}>Описание</label>
            <input
              value={newRole.desc}
              onChange={e => setNewRole(r => ({ ...r, desc: e.target.value }))}
              style={Sc.inp}
              placeholder="Краткое описание роли"
            />
          </div>

          <div style={{ marginBottom: 18 }}>
            <label style={{ ...Sc.lbl, marginBottom: 10 }}>Права доступа</label>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {PERM_LABELS.map(([k, l]) => (
                <div
                  key={k}
                  style={{
                    display: "flex", justifyContent: "space-between", alignItems: "center",
                    padding: "10px 14px", background: "#fafafa", borderRadius: 8,
                  }}
                >
                  <span style={{ fontSize: 13, fontWeight: 500 }}>{l}</span>
                  <input
                    type="checkbox"
                    checked={newRole.perms[k]}
                    onChange={e =>
                      setNewRole(r => ({
                        ...r,
                        perms: { ...r.perms, [k]: e.target.checked },
                      }))
                    }
                    style={{ accentColor: OR, width: 16, height: 16 }}
                  />
                </div>
              ))}
            </div>
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
            <button onClick={() => setShowAdd(false)} style={mkBtn("s")}>Отмена</button>
            <button onClick={addRole} style={mkBtn()}>Создать роль</button>
          </div>
        </Modal>
      )}

      {/* Modal: Редактировать роль */}
      {showEdit && (
        <Modal title={`Роль: ${showEdit.name}`} onClose={() => setShowEdit(null)} width={520}>

          <div style={{ marginBottom: 14 }}>
            <label style={Sc.lbl}>Название роли</label>
            <input
              value={showEdit.name}
              onChange={e => setShowEdit(r => r ? { ...r, name: e.target.value } : r)}
              style={Sc.inp}
            />
          </div>

          <div style={{ marginBottom: 18 }}>
            <label style={Sc.lbl}>Описание</label>
            <input
              value={showEdit.desc ?? ""}
              onChange={e => setShowEdit(r => r ? { ...r, desc: e.target.value } : r)}
              style={Sc.inp}
            />
          </div>

          <div style={{ marginBottom: 18 }}>
            <label style={{ ...Sc.lbl, marginBottom: 10 }}>Права доступа</label>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {PERM_LABELS.map(([k, l]) => (
                <div
                  key={k}
                  style={{
                    display: "flex", justifyContent: "space-between", alignItems: "center",
                    padding: "10px 14px", background: "#fafafa", borderRadius: 8,
                  }}
                >
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 500 }}>{l}</div>
                  </div>
                  <input
                    type="checkbox"
                    checked={showEdit.perms?.[k] ?? false}
                    onChange={e =>
                      setShowEdit(r =>
                        r
                          ? { ...r, perms: { ...r.perms, [k]: e.target.checked } }
                          : r
                      )
                    }
                    style={{ accentColor: OR, width: 16, height: 16 }}
                  />
                </div>
              ))}
            </div>
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
            <button onClick={() => setShowEdit(null)} style={mkBtn("s")}>Отмена</button>
            <button
              onClick={() => showEdit && saveRole(showEdit)}
              style={mkBtn()}
            >
              Сохранить
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}
