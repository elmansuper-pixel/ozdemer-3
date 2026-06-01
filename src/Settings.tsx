import { useState } from "react";
import {
  OR, OL, fmt, toDay,
  Sc, mkBtn, mkBadge,
  Modal, PageHead, StatCard,
  SearchBar, Tabs, Toggle,
  EmptyState,
  INIT_CATEGORIES,
} from "./shared";

// ── Профиль ───────────────────────────────────────────────────────────────────

export function PageProfile() {
  const [form, setForm] = useState({
    fn:     "Test",
    ln:     "Owner",
    email:  "test@wiki.com",
    phone:  "+7 (700) 100-00-01",
    theme:  "auto",
    lang:   "ru",
  });
  const [saved, setSaved] = useState(false);

  function save() {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <div>
      <PageHead
        title="Настройки профиля"
        sub="Управляйте личными данными и внешним видом приложения."
        bread="Главная › Профиль"
      />
      <div style={{ padding: "12px 14px" }}>

        {/* Основная информация */}
        <div style={Sc.card}>
          <div style={{ fontSize: 13, fontWeight: 700, color: "#444", marginBottom: 16 }}>
            Основная информация
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 20 }}>
            <div style={{
              width: 64, height: 64, borderRadius: 50, background: OR, flexShrink: 0,
              display: "flex", alignItems: "center", justifyContent: "center",
              color: "#fff", fontWeight: 800, fontSize: 24,
            }}>
              {form.fn[0] ?? "?"}
            </div>
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <button style={mkBtn("s", { fontSize: 12 })}>📤 Загрузить фото</button>
              <button style={{ ...mkBtn("s", { fontSize: 12 }), color: "#e74c3c" }}>
                Удалить
              </button>
            </div>
            <span style={{ fontSize: 11, color: "#aaa" }}>JPG, PNG до 5MB</span>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 14 }}>
            <div>
              <label style={Sc.lbl}>Имя</label>
              <input
                value={form.fn}
                onChange={e => setForm(f => ({ ...f, fn: e.target.value }))}
                style={Sc.inp}
              />
            </div>
            <div>
              <label style={Sc.lbl}>Фамилия</label>
              <input
                value={form.ln}
                onChange={e => setForm(f => ({ ...f, ln: e.target.value }))}
                style={Sc.inp}
              />
            </div>
          </div>

          <div style={{ marginBottom: 12 }}>
            <label style={Sc.lbl}>Email</label>
            <input
              value={form.email}
              disabled
              style={{ ...Sc.inp, background: "#f5f5f5", color: "#aaa", cursor: "not-allowed" }}
            />
            <div style={{ fontSize: 11, color: "#aaa", marginTop: 4 }}>
              Email нельзя изменить
            </div>
          </div>

          <div style={{ marginBottom: 12 }}>
            <label style={Sc.lbl}>Телефон</label>
            <input
              value={form.phone}
              onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
              style={Sc.inp}
            />
          </div>

          <div style={{ fontSize: 12, color: "#aaa", marginTop: 4 }}>
            Роль:{" "}
            <span style={{ color: OR, fontWeight: 700, letterSpacing: 0.5 }}>OWNER</span>
          </div>
        </div>

        {/* Интерфейс */}
        <div style={Sc.card}>
          <div style={{ fontSize: 13, fontWeight: 700, color: "#444", marginBottom: 16 }}>
            Интерфейс
          </div>

          <div style={{ marginBottom: 16 }}>
            <label style={Sc.lbl}>Язык</label>
            <select
              value={form.lang}
              onChange={e => setForm(f => ({ ...f, lang: e.target.value }))}
              style={{ ...Sc.inp, appearance: "none", maxWidth: 200 }}
            >
              <option value="ru">Русский</option>
              <option value="kk">Қазақша</option>
              <option value="en">English</option>
            </select>
          </div>

          <div>
            <label style={Sc.lbl}>Тема</label>
            <div style={{ display: "flex", gap: 8, marginTop: 6 }}>
              {(
                [
                  ["light", "☀️", "Светлая"],
                  ["dark",  "🌙", "Тёмная"],
                  ["auto",  "💻", "Автоматическая"],
                ] as [string, string, string][]
              ).map(([k, ico, l]) => (
                <button
                  key={k}
                  onClick={() => setForm(f => ({ ...f, theme: k }))}
                  style={{
                    flex: 1, padding: "12px 6px", borderRadius: 9, cursor: "pointer",
                    fontSize: 12, fontWeight: form.theme === k ? 700 : 400,
                    border: `2px solid ${form.theme === k ? OR : "#e0e0e0"}`,
                    background: form.theme === k ? OL : "#fafafa",
                    color: form.theme === k ? OR : "#555",
                    display: "flex", flexDirection: "column", alignItems: "center", gap: 4,
                  }}
                >
                  <span style={{ fontSize: 20 }}>{ico}</span>
                  {l}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Безопасность */}
        <div style={Sc.card}>
          <div style={{ fontSize: 13, fontWeight: 700, color: "#444", marginBottom: 16 }}>
            Безопасность
          </div>

          <div style={{
            display: "flex", justifyContent: "space-between",
            alignItems: "center", padding: "10px 0",
          }}>
            <div>
              <div style={{ fontWeight: 600, fontSize: 13 }}>🔒 Пароль</div>
              <div style={{ fontSize: 12, color: "#aaa", marginTop: 2 }}>
                Последнее изменение: Информация недоступна
              </div>
            </div>
            <button style={mkBtn("s", { fontSize: 12 })}>Изменить пароль</button>
          </div>

          <div style={{
            display: "flex", justifyContent: "space-between",
            alignItems: "center", padding: "10px 0",
            borderTop: "1px solid #f5f5f5",
          }}>
            <div>
              <div style={{ fontWeight: 600, fontSize: 13 }}>
                📲 Двухфакторная аутентификация
              </div>
              <div style={{ fontSize: 12, color: "#aaa", marginTop: 2 }}>Не настроена</div>
            </div>
            <button style={mkBtn("s", { fontSize: 12 })}>Настроить</button>
          </div>
        </div>

        <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
          {saved && (
            <span style={{ color: "#1a8a3a", fontSize: 13, fontWeight: 600, alignSelf: "center" }}>
              ✓ Сохранено
            </span>
          )}
          <button onClick={save} style={mkBtn()}>Сохранить изменения</button>
        </div>
      </div>
    </div>
  );
}

// ── Общие настройки ───────────────────────────────────────────────────────────

export function PageGeneral() {
  const [storeName,  setStoreName]  = useState("Главный магазин");
  const [storePhone, setStorePhone] = useState("");
  const [storeAddr,  setStoreAddr]  = useState("ул. Абая 150, Алматы");
  const [storeHours, setStoreHours] = useState("");
  const [status,     setStatus]     = useState("Активен");
  const [source,     setSource]     = useState("Локальный склад");
  const [compAddr,   setCompAddr]   = useState("г. Алматы, ул. Абая 1");
  const [compEmail,  setCompEmail]  = useState("");
  const [compPhone,  setCompPhone]  = useState("+7");
  const [domain,     setDomain]     = useState("your-store");
  const [country,    setCountry]    = useState("Казахстан");
  const [zip,        setZip]        = useState("050000");
  const [timezone,   setTimezone]   = useState("Алматы (UTC+5)");
  const [legalName,  setLegalName]  = useState("");
  const [bin,        setBin]        = useState("123456789012");
  const [legalAddr,  setLegalAddr]  = useState("");
  const [saved,      setSaved]      = useState(false);

  function save() {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <div>
      <PageHead
        title="Общие настройки"
        sub="Основные параметры компании, региональные настройки и реквизиты."
        bread="Главная › Общие настройки"
      />
      <div style={{ padding: "12px 14px" }}>

        {/* Редактирование магазина */}
        <div style={Sc.card}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
            <span style={{ fontSize: 16 }}>🏪</span>
            <div style={{ fontSize: 13, fontWeight: 700 }}>Редактирование магазина</div>
          </div>
          <div style={{ fontSize: 12, color: "#888", marginBottom: 16 }}>
            Настройка филиала: данные точки, сотрудники, кассы, склад, статус и архивирование.
          </div>

          {/* Выбор магазина */}
          <div style={{ marginBottom: 14 }}>
            <label style={Sc.lbl}>Выбор магазина</label>
            <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
              <select style={{ ...Sc.inp, flex: 1, maxWidth: 260, appearance: "none" }}>
                <option>Главный магазин</option>
                <option>Филиал Центр</option>
              </select>
              <span style={{ fontSize: 11, color: "#aaa", whiteSpace: "nowrap" }}>
                Лимит магазинов: без ограничений (0)
              </span>
            </div>
          </div>

          <button style={{ ...mkBtn("s"), marginBottom: 12 }}>+ Добавить магазин</button>

          <div style={{ fontSize: 11, color: "#aaa", marginBottom: 14 }}>
            В этом редакторе показываются все магазины компании.
            В переключателе в сайдбаре — только доступные пользователю.
          </div>

          {/* Данные точки */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
            <div>
              <label style={Sc.lbl}>Название точки</label>
              <input
                value={storeName}
                onChange={e => setStoreName(e.target.value)}
                style={Sc.inp}
              />
            </div>
            <div>
              <label style={Sc.lbl}>Телефон филиала</label>
              <input
                value={storePhone}
                onChange={e => setStorePhone(e.target.value)}
                style={Sc.inp}
              />
            </div>
          </div>

          <div style={{ marginBottom: 12 }}>
            <label style={Sc.lbl}>Адрес точки</label>
            <input
              value={storeAddr}
              onChange={e => setStoreAddr(e.target.value)}
              style={Sc.inp}
            />
          </div>

          <div style={{ marginBottom: 12 }}>
            <label style={Sc.lbl}>График работы</label>
            <textarea
              value={storeHours}
              onChange={e => setStoreHours(e.target.value)}
              style={{ ...Sc.inp, height: 64, resize: "vertical" }}
              placeholder="Пн–Пт: 09:00–18:00"
            />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 16 }}>
            <div>
              <label style={Sc.lbl}>Источник остатков</label>
              <select
                value={source}
                onChange={e => setSource(e.target.value)}
                style={{ ...Sc.inp, appearance: "none" }}
              >
                <option>Локальный склад</option>
                <option>Общий склад</option>
              </select>
            </div>
            <div>
              <label style={Sc.lbl}>Статус</label>
              <select
                value={status}
                onChange={e => setStatus(e.target.value)}
                style={{ ...Sc.inp, appearance: "none" }}
              >
                <option>Активен</option>
                <option>Временно закрыт</option>
              </select>
            </div>
          </div>

          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 10 }}>
            <button onClick={save} style={mkBtn()}>🖫 Сохранить магазин</button>
            <button style={mkBtn("s")}>Временно закрыть</button>
            <button style={{ ...mkBtn("s"), color: "#e74c3c", borderColor: "#fcc", background: "#fee" }}>
              🗑 Архивировать магазин
            </button>
          </div>

          <div style={{ fontSize: 12, color: OR, cursor: "pointer", marginTop: 4 }}>
            → Перейти в настройки чека/кассы
          </div>

          {/* Сотрудники точки */}
          <div style={{ borderTop: "1px solid #f0f0f0", paddingTop: 14, marginTop: 16 }}>
            <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 12 }}>
              Сотрудники точки
            </div>
            <div style={{ display: "flex", gap: 8, marginBottom: 12, alignItems: "center" }}>
              <select style={{ ...Sc.inp, flex: 1, appearance: "none" }}>
                <option value="">Выберите сотрудника</option>
                <option>Test Owner</option>
                <option>кассир кассир</option>
              </select>
              <button style={mkBtn("s", { fontSize: 12 })}>👤 Назначить</button>
            </div>
            {[
              "Test Owner · OWNER · Основной",
              "кассир кассир · CASHIER · Основной",
            ].map(s => (
              <div
                key={s}
                style={{
                  display: "flex", justifyContent: "space-between", alignItems: "center",
                  padding: "10px 0", borderBottom: "1px solid #f5f5f5", fontSize: 13,
                }}
              >
                <span style={{ color: "#444" }}>{s}</span>
                <button style={{
                  background: "none", border: "none",
                  cursor: "pointer", color: "#e74c3c", fontSize: 18,
                }}>
                  🗑
                </button>
              </div>
            ))}
          </div>

          {/* Кассы */}
          <div style={{ borderTop: "1px solid #f0f0f0", paddingTop: 14, marginTop: 14 }}>
            <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 10 }}>
              Кассы и рабочие места
            </div>
            <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 8 }}>
              <input placeholder="Касса 1" style={{ ...Sc.inp, flex: 1 }} />
              <button style={mkBtn("s", { fontSize: 12 })}>Добавить кассу</button>
            </div>
            <div style={{ fontSize: 12, color: "#aaa" }}>Кассы не зарегистрированы</div>
          </div>
        </div>

        {/* Брендинг */}
        <div style={Sc.card}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
            <span style={{ fontSize: 16 }}>📱</span>
            <div style={{ fontSize: 13, fontWeight: 700 }}>Брендинг</div>
          </div>
          <div style={{ fontSize: 12, color: "#888", marginBottom: 16 }}>
            Логотип и основная информация о компании
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 18 }}>
            <div style={{
              width: 56, height: 56, borderRadius: 12, background: OR,
              display: "flex", alignItems: "center", justifyContent: "center",
              color: "#fff", fontSize: 22,
            }}>
              🏪
            </div>
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <button style={mkBtn("s", { fontSize: 12 })}>📤 Загрузить логотип</button>
              <span style={{ fontSize: 11, color: "#aaa" }}>JPG, PNG до 5MB</span>
            </div>
          </div>

          <div style={{ marginBottom: 12 }}>
            <label style={Sc.lbl}>Название компании</label>
            <input style={Sc.inp} placeholder="Введите название компании" />
          </div>

          <div style={{ marginBottom: 12 }}>
            <label style={Sc.lbl}>Физический адрес</label>
            <input
              value={compAddr}
              onChange={e => setCompAddr(e.target.value)}
              style={Sc.inp}
            />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
            <div>
              <label style={Sc.lbl}>Публичный email</label>
              <input
                value={compEmail}
                onChange={e => setCompEmail(e.target.value)}
                style={Sc.inp}
                placeholder="info@example.com"
              />
            </div>
            <div>
              <label style={Sc.lbl}>Телефон</label>
              <input
                value={compPhone}
                onChange={e => setCompPhone(e.target.value)}
                style={Sc.inp}
              />
            </div>
          </div>

          {/* Поддомен */}
          <div style={{ marginBottom: 12 }}>
            <label style={Sc.lbl}>Поддомен</label>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <span style={{ fontSize: 13, color: "#888", whiteSpace: "nowrap" }}>
                https://
              </span>
              <input
                value={domain}
                onChange={e => setDomain(e.target.value)}
                style={{ ...Sc.inp, flex: 1 }}
              />
              <span style={{ fontSize: 13, color: "#888", whiteSpace: "nowrap" }}>
                .wiki.io
              </span>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div>
              <label style={Sc.lbl}>Страна</label>
              <select
                value={country}
                onChange={e => setCountry(e.target.value)}
                style={{ ...Sc.inp, appearance: "none" }}
              >
                <option>Казахстан</option>
                <option>Россия</option>
                <option>Кыргызстан</option>
              </select>
            </div>
            <div>
              <label style={Sc.lbl}>Почтовый индекс</label>
              <input value={zip} onChange={e => setZip(e.target.value)} style={Sc.inp} />
            </div>
            <div>
              <label style={Sc.lbl}>Регион</label>
              <select style={{ ...Sc.inp, appearance: "none" }}>
                <option value="">Выберите регион</option>
                <option>Алматы</option>
                <option>Астана</option>
              </select>
            </div>
            <div>
              <label style={Sc.lbl}>Часовой пояс</label>
              <select
                value={timezone}
                onChange={e => setTimezone(e.target.value)}
                style={{ ...Sc.inp, appearance: "none" }}
              >
                <option>Алматы (UTC+5)</option>
                <option>Астана (UTC+5)</option>
              </select>
            </div>
            <div>
              <label style={Sc.lbl}>Базовая валюта (Учёт)</label>
              <select style={{ ...Sc.inp, appearance: "none" }}>
                <option>KZT (₸) – Kazakhstani Tenge</option>
                <option>USD ($) – US Dollar</option>
              </select>
              <div style={{ fontSize: 10, color: "#aaa", marginTop: 3 }}>
                Используется для стоимости и остатков
              </div>
            </div>
            <div>
              <label style={Sc.lbl}>Валюта продаж (Продажа)</label>
              <select style={{ ...Sc.inp, appearance: "none" }}>
                <option>KZT (₸) – Kazakhstani Tenge</option>
                <option>USD ($) – US Dollar</option>
              </select>
              <div style={{ fontSize: 10, color: "#aaa", marginTop: 3 }}>
                Используется для цен в POS
              </div>
            </div>
          </div>
        </div>

        {/* Юридические данные */}
        <div style={Sc.card}>
          <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 4 }}>
            Юридические данные
          </div>
          <div style={{ fontSize: 12, color: "#888", marginBottom: 16 }}>
            Официальная информация о компании
          </div>
          <div style={{ marginBottom: 12 }}>
            <label style={Sc.lbl}>Юридическое название</label>
            <input
              value={legalName}
              onChange={e => setLegalName(e.target.value)}
              style={Sc.inp}
              placeholder="ООО «Название компании»"
            />
          </div>
          <div style={{ marginBottom: 12 }}>
            <label style={Sc.lbl}>ИНН/БИН</label>
            <input value={bin} onChange={e => setBin(e.target.value)} style={Sc.inp} />
          </div>
          <div>
            <label style={Sc.lbl}>Юридический адрес</label>
            <textarea
              value={legalAddr}
              onChange={e => setLegalAddr(e.target.value)}
              style={{ ...Sc.inp, height: 70, resize: "vertical" }}
              placeholder="Введите полный юридический адрес"
            />
          </div>
        </div>

        {/* Банковские счета */}
        <div style={Sc.card}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
            <span>💳</span>
            <div style={{ fontSize: 13, fontWeight: 700 }}>Банковские счета</div>
          </div>
          <div style={{ fontSize: 12, color: "#888", marginBottom: 14 }}>
            Реквизиты для финансовых операций
          </div>
          <div style={{
            textAlign: "center", color: "#bbb", padding: "16px 0", marginBottom: 10, fontSize: 13,
          }}>
            Нет добавленных счетов
          </div>
          <button style={{ ...mkBtn("s"), width: "100%", justifyContent: "center" }}>
            + Добавить счёт
          </button>
        </div>

        {/* Опасная зона */}
        <div style={{ ...Sc.card, border: "1px solid #fcc" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
            <span style={{ color: "#e74c3c" }}>⚠️</span>
            <div style={{ fontSize: 13, fontWeight: 700, color: "#e74c3c" }}>Опасная зона</div>
          </div>
          <div style={{ fontSize: 12, color: "#888", marginBottom: 14 }}>
            Необратимые действия с компанией
          </div>
          <button style={{ ...mkBtn("s"), color: "#e74c3c", borderColor: "#fcc", background: "#fee" }}>
            Удалить компанию
          </button>
        </div>

        <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
          {saved && (
            <span style={{ color: "#1a8a3a", fontSize: 13, fontWeight: 600, alignSelf: "center" }}>
              ✓ Сохранено
            </span>
          )}
          <button onClick={save} style={mkBtn()}>Сохранить изменения</button>
        </div>
      </div>
    </div>
  );
}

// ── Подписка и оплата ─────────────────────────────────────────────────────────

export function PageSubscription() {
  const plans = [
    {
      id: "starter", name: "Starter", price: 9990,
      features: ["1 магазин", "2 сотрудника", "500 товаров", "Базовые отчёты"],
      current: false,
    },
    {
      id: "pro", name: "Pro", price: 49990,
      features: ["∞ магазины", "∞ сотрудники", "∞ товары", "Все отчёты", "SMS-уведомления", "API доступ"],
      current: true,
    },
    {
      id: "enterprise", name: "Enterprise", price: null,
      features: ["Всё из Pro", "Выделенный сервер", "SLA 99.9%", "Персональный менеджер"],
      current: false,
    },
  ];

  return (
    <div>
      <PageHead
        title="Подписка и оплата"
        sub="Управление тарифом, лимитами и историей платежей."
        bread="Главная › Подписка и оплата"
      />
      <div style={{ padding: "12px 14px" }}>

        {/* Текущий тариф */}
        <div style={Sc.card}>
          <div style={{ fontSize: 12, color: "#888", marginBottom: 4 }}>Текущий тариф</div>
          <div style={{ fontSize: 11, color: "#aaa", marginBottom: 12 }}>
            Информация о вашей текущей подписке
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div>
              <div style={{ fontSize: 26, fontWeight: 800, lineHeight: 1 }}>Pro</div>
              <span style={{ ...mkBadge("gr"), marginTop: 8, display: "inline-block" }}>
                Активна
              </span>
              <div style={{ fontSize: 12, color: "#888", marginTop: 10 }}>
                📅 Период: 17.04.2026 – 26.06.2026
              </div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: 26, fontWeight: 800 }}>49 990 ₸</div>
              <div style={{ fontSize: 12, color: "#aaa" }}>в месяц</div>
            </div>
          </div>
          <div style={{ display: "flex", gap: 8, marginTop: 16 }}>
            <button style={mkBtn()}>Сменить тариф</button>
            <button style={mkBtn("s")}>Отменить подписку</button>
          </div>
        </div>

        {/* Доступные тарифы */}
        <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 10, padding: "0 2px" }}>
          Доступные тарифы
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 16 }}>
          {plans.map(p => (
            <div
              key={p.id}
              style={{
                ...Sc.card, marginBottom: 0, position: "relative",
                border: `2px solid ${p.current ? OR : "#e0e0e0"}`,
              }}
            >
              {p.current && (
                <div style={{
                  position: "absolute", top: -1, right: 14,
                  background: OR, color: "#fff",
                  fontSize: 10, fontWeight: 700,
                  padding: "2px 10px", borderRadius: "0 0 6px 6px",
                }}>
                  ТЕКУЩИЙ
                </div>
              )}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div>
                  <div style={{ fontSize: 16, fontWeight: 800 }}>{p.name}</div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 4, marginTop: 8 }}>
                    {p.features.map(f => (
                      <span key={f} style={{
                        fontSize: 11, color: "#555",
                        background: "#f5f5f5", padding: "2px 8px", borderRadius: 4,
                      }}>
                        {f}
                      </span>
                    ))}
                  </div>
                </div>
                <div style={{ textAlign: "right", flexShrink: 0, paddingLeft: 12 }}>
                  <div style={{ fontSize: 18, fontWeight: 800 }}>
                    {p.price ? `${fmt(p.price)} ₸` : "Договорная"}
                  </div>
                  {p.price && <div style={{ fontSize: 11, color: "#aaa" }}>в месяц</div>}
                </div>
              </div>
              {!p.current && (
                <button style={{ ...mkBtn("s", { fontSize: 12 }), marginTop: 12 }}>
                  {p.price ? "Перейти" : "Связаться с нами"}
                </button>
              )}
            </div>
          ))}
        </div>

        {/* Использование лимитов */}
        <div style={Sc.card}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
            <span>📊</span>
            <div style={{ fontSize: 13, fontWeight: 700 }}>Использование лимитов</div>
          </div>
          <div style={{ fontSize: 12, color: "#888", marginBottom: 14 }}>
            Текущее использование ресурсов вашего тарифа
          </div>
          {(
            [
              ["🏪 Магазины",   "0 / ∞"],
              ["👤 Сотрудники", "0 / ∞"],
              ["👥 Клиенты",    "0 / ∞"],
              ["📦 Товары",     "0 / ∞"],
            ] as [string, string][]
          ).map(([l, v]) => (
            <div
              key={l}
              style={{
                display: "flex", justifyContent: "space-between", alignItems: "center",
                padding: "10px 0", borderBottom: "1px solid #f5f5f5", fontSize: 13,
              }}
            >
              <span>{l}</span>
              <span style={{ fontWeight: 600, color: "#888" }}>{v}</span>
            </div>
          ))}
        </div>

        {/* Способ оплаты */}
        <div style={Sc.card}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
            <span>💳</span>
            <div style={{ fontSize: 13, fontWeight: 700 }}>Способ оплаты</div>
          </div>
          <div style={{ fontSize: 12, color: "#888", marginBottom: 14 }}>
            Управление способом оплаты для автоматического списания
          </div>
          <div style={{
            textAlign: "center", color: "#aaa", padding: "20px 0", marginBottom: 12, fontSize: 13,
          }}>
            Способ оплаты не добавлен
          </div>
          <div style={{ textAlign: "center" }}>
            <button style={mkBtn()}>+ Добавить способ оплаты</button>
          </div>
        </div>

        {/* История платежей */}
        <div style={Sc.card}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
            <span>🧾</span>
            <div style={{ fontSize: 13, fontWeight: 700 }}>История платежей</div>
          </div>
          <div style={{ fontSize: 12, color: "#888", marginBottom: 14 }}>
            История всех платежей и инвойсов
          </div>
          <EmptyState icon="📄" title="История платежей пуста" />
        </div>
      </div>
    </div>
  );
}

// ── Касса и продажи ───────────────────────────────────────────────────────────

type PayMethod = {
  id:   number;
  ico:  string;
  name: string;
  type: string;
  on:   boolean;
};

export function PageKassaSettings() {
  const [pays, setPays] = useState<PayMethod[]>([
    { id: 1, ico: "💵", name: "Наличные",   type: "Пользовательский", on: true  },
    { id: 2, ico: "💳", name: "Карта",      type: "Пользовательский", on: true  },
    { id: 3, ico: "🟠", name: "Kaspi",      type: "Пользовательский", on: false },
    { id: 4, ico: "🟢", name: "Halyk Bank", type: "Пользовательский", on: false },
    { id: 5, ico: "📲", name: "Перевод",    type: "Пользовательский", on: false },
  ]);

  const [tape,      setTape]      = useState("80");
  const [logo,      setLogo]      = useState(false);
  const [storeInfo, setStoreInfo] = useState(true);
  const [showName,  setShowName]  = useState(true);
  const [showAddr,  setShowAddr]  = useState(true);
  const [showPhone, setShowPhone] = useState(true);
  const [showHours, setShowHours] = useState(false);
  const [showAdd,   setShowAdd]   = useState(false);
  const [newPay,    setNewPay]    = useState({ name: "", ico: "💳" });

  function togglePay(id: number) {
    setPays(prev => prev.map(p => p.id === id ? { ...p, on: !p.on } : p));
  }

  function addPay() {
    if (!newPay.name) return;
    setPays(prev => [
      ...prev,
      { id: Date.now(), ico: newPay.ico, name: newPay.name, type: "Пользовательский", on: true },
    ]);
    setNewPay({ name: "", ico: "💳" });
    setShowAdd(false);
  }

  return (
    <div>
      <PageHead
        title="Касса и продажи"
        sub="Управление способами оплаты и внешним видом чеков."
        bread="Главная › Касса и продажи"
      />
      <div style={{ padding: "12px 14px" }}>

        {/* Способы оплаты */}
        <div style={Sc.card}>
          <div style={{
            display: "flex", justifyContent: "space-between",
            alignItems: "flex-start", marginBottom: 14,
          }}>
            <div>
              <div style={{ fontSize: 13, fontWeight: 700 }}>💳 Способы оплаты</div>
              <div style={{ fontSize: 12, color: "#888", marginTop: 2 }}>
                Управление способами оплаты для кассовых операций
              </div>
            </div>
            <button
              onClick={() => setShowAdd(true)}
              style={mkBtn("p", { fontSize: 12 })}
            >
              + Добавить метод
            </button>
          </div>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                {["Иконка", "Название", "Тип", "Статус", "Действия"].map(h => (
                  <th key={h} style={Sc.th}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {pays.map(p => (
                <tr key={p.id}>
                  <td style={{ ...Sc.td, fontSize: 20 }}>{p.ico}</td>
                  <td style={{ ...Sc.td, fontWeight: 600 }}>{p.name}</td>
                  <td style={{ ...Sc.td, fontSize: 12, color: "#888" }}>{p.type}</td>
                  <td style={Sc.td}>
                    <Toggle on={p.on} onChange={() => togglePay(p.id)} />
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
        </div>

        {/* Конструктор чека */}
        <div style={Sc.card}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
            <span>🖨</span>
            <div style={{ fontSize: 13, fontWeight: 700 }}>Конструктор чека</div>
          </div>
          <div style={{ fontSize: 12, color: "#888", marginBottom: 16 }}>
            Настройте внешний вид и содержимое чека
          </div>

          {/* Предпросмотр */}
          <div style={{ textAlign: "center", marginBottom: 20 }}>
            <div style={{ fontSize: 12, color: "#888", marginBottom: 10 }}>
              Предпросмотр чека ({tape} мм)
            </div>
            <div style={{
              background: "#fff", border: "1px solid #e0e0e0", borderRadius: 8,
              padding: "18px 20px",
              maxWidth: tape === "80" ? 280 : 230,
              margin: "0 auto",
              fontFamily: "'Courier New', monospace",
              fontSize: 11, textAlign: "left",
              boxShadow: "0 2px 12px rgba(0,0,0,.08)",
            }}>
              {logo && (
                <div style={{ textAlign: "center", marginBottom: 8, fontSize: 20 }}>🏪</div>
              )}
              {storeInfo && (
                <>
                  {showName && (
                    <div style={{ textAlign: "center", fontWeight: 700, marginBottom: 2 }}>
                      Магазин OZD
                    </div>
                  )}
                  {showAddr && (
                    <div style={{ textAlign: "center", fontSize: 10, color: "#555" }}>
                      г. Алматы, ул. Абая 150
                    </div>
                  )}
                  {showPhone && (
                    <div style={{
                      textAlign: "center", fontSize: 10, color: "#555", marginBottom: 8,
                    }}>
                      +7 (777) 123-45-67
                    </div>
                  )}
                </>
              )}
              <div style={{ borderTop: "1px dashed #ccc", marginBottom: 8 }} />
              <div style={{ fontSize: 10, color: "#888", marginBottom: 6 }}>
                Дата: {toDay()}<br />Кассир: Test Owner
              </div>
              <div style={{ borderTop: "1px dashed #ccc", marginBottom: 6 }} />
              <div style={{ fontSize: 10, fontWeight: 700, marginBottom: 4 }}>ТОВАРЫ:</div>
              <div style={{ fontSize: 10, marginBottom: 2 }}>FRITUR 12L</div>
              <div style={{ fontSize: 10, color: "#888", marginBottom: 2 }}>Арт: 10023</div>
              <div style={{
                display: "flex", justifyContent: "space-between",
                fontSize: 10, marginBottom: 6,
              }}>
                <span>1 × 70 000 ₸</span>
                <span>70 000 ₸</span>
              </div>
              <div style={{ borderTop: "1px dashed #ccc", marginBottom: 6 }} />
              <div style={{
                display: "flex", justifyContent: "space-between",
                fontSize: 11, fontWeight: 700, marginBottom: 6,
              }}>
                <span>ИТОГО:</span>
                <span>70 000 ₸</span>
              </div>
              <div style={{ borderTop: "1px dashed #ccc", marginBottom: 6 }} />
              <div style={{ textAlign: "center", fontSize: 10, color: "#888" }}>
                СПАСИБО ЗА ПОКУПКУ!
              </div>
            </div>
          </div>

          {/* Ширина ленты */}
          <div style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 10 }}>Ширина ленты</div>
            <div style={Sc.card}>
              <div style={{ fontSize: 12, color: "#888", marginBottom: 4 }}>
                Ширина термоленты
              </div>
              <div style={{ fontSize: 11, color: "#aaa", marginBottom: 10 }}>
                58 мм или 80 мм — выберите под ваш принтер
              </div>
              <div style={{ display: "flex", gap: 20 }}>
                {["58", "80"].map(v => (
                  <label
                    key={v}
                    style={{ display: "flex", alignItems: "center", gap: 6, cursor: "pointer", fontSize: 13 }}
                  >
                    <input
                      type="radio"
                      name="tape"
                      value={v}
                      checked={tape === v}
                      onChange={() => setTape(v)}
                      style={{ accentColor: OR }}
                    />
                    {v} мм
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* Брендинг и заголовок */}
          <div style={{ marginBottom: 14 }}>
            <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 10 }}>
              Брендинг и заголовок
            </div>
            {(
              [
                ["Показать логотип",              "Логотип компании в верхней части чека",  logo,      setLogo      ],
                ["Блок информации о магазине",    "Основная информация о магазине",         storeInfo, setStoreInfo ],
              ] as [string, string, boolean, (v: boolean) => void][]
            ).map(([l, d, v, fn]) => (
              <div key={l} style={{ ...Sc.card, marginBottom: 8 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <div style={{ fontWeight: 500, fontSize: 13 }}>{l}</div>
                    <div style={{ fontSize: 11, color: "#aaa", marginTop: 2 }}>{d}</div>
                  </div>
                  <Toggle on={v} onChange={fn} />
                </div>
              </div>
            ))}

            {storeInfo && (
              <div style={{ paddingLeft: 14 }}>
                {(
                  [
                    ["Название магазина", showName,  setShowName ],
                    ["Адрес",             showAddr,  setShowAddr ],
                    ["Контакты",          showPhone, setShowPhone],
                    ["Режим работы",      showHours, setShowHours],
                  ] as [string, boolean, (v: boolean) => void][]
                ).map(([l, v, fn]) => (
                  <div
                    key={l}
                    style={{
                      display: "flex", justifyContent: "space-between", alignItems: "center",
                      padding: "8px 0", borderBottom: "1px solid #f5f5f5",
                    }}
                  >
                    <span style={{ fontSize: 13 }}>{l}</span>
                    <Toggle on={v} onChange={fn} />
                  </div>
                ))}
              </div>
            )}
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end" }}>
            <button style={mkBtn()}>Сохранить изменения</button>
          </div>
        </div>
      </div>

      {/* Modal: Добавить метод */}
      {showAdd && (
        <Modal title="Добавить метод оплаты" onClose={() => setShowAdd(false)} width={400}>
          <div style={{ marginBottom: 14 }}>
            <label style={Sc.lbl}>Иконка</label>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 4 }}>
              {["💵", "💳", "📲", "🟠", "🟢", "🔴", "🔵", "💜"].map(ico => (
                <button
                  key={ico}
                  onClick={() => setNewPay(p => ({ ...p, ico }))}
                  style={{
                    width: 40, height: 40, borderRadius: 8, fontSize: 20,
                    cursor: "pointer",
                    border: `2px solid ${newPay.ico === ico ? OR : "#e0e0e0"}`,
                    background: newPay.ico === ico ? OL : "#fafafa",
                  }}
                >
                  {ico}
                </button>
              ))}
            </div>
          </div>
          <div style={{ marginBottom: 18 }}>
            <label style={Sc.lbl}>Название метода *</label>
            <input
              value={newPay.name}
              onChange={e => setNewPay(p => ({ ...p, name: e.target.value }))}
              style={Sc.inp}
              placeholder="Например: QR-оплата"
              autoFocus
            />
          </div>
          <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
            <button onClick={() => setShowAdd(false)} style={mkBtn("s")}>Отмена</button>
            <button onClick={addPay} style={mkBtn()}>Добавить</button>
          </div>
        </Modal>
      )}
    </div>
  );
}

// ── Справочники ───────────────────────────────────────────────────────────────

export function PageRefs() {
  const [tab, setTab] = useState("cats");

  return (
    <div>
      <PageHead
        title="Справочники"
        sub="Управление категориями, брендами, единицами измерения, характеристиками и настройками каталога товаров."
        bread="Главная › Справочники"
      />
      <div style={{ padding: "12px 14px" }}>
        <Tabs
          tabs={[
            { k: "cats",   l: "Категории"           },
            { k: "brands", l: "Бренды"               },
            { k: "units",  l: "Единицы измерения"    },
            { k: "chars",  l: "Характеристики"       },
            { k: "trade",  l: "Настройки каталога"   },
          ]}
          active={tab}
          onChange={setTab}
        />
        {tab === "cats"   && <TabCategories />}
        {tab === "brands" && <TabBrands />}
        {tab === "units"  && <TabUnits />}
        {tab === "chars"  && <TabChars />}
        {tab === "trade"  && <TabTradeSettings />}
      </div>
    </div>
  );
}

// ── Справочники: Категории ────────────────────────────────────────────────────

type Category = {
  id:     number;
  name:   string;
  parent: string;
  count:  number;
  status: string;
};

function TabCategories() {
  const [cats, setCats] = useState<Category[]>(
    INIT_CATEGORIES.map((name, i) => ({
      id:     i + 1,
      name,
      parent: "—",
      count:  0,
      status: "Активна",
    }))
  );
  const [q,       setQ]       = useState("");
  const [showAdd, setShowAdd] = useState(false);
  const [newName, setNewName] = useState("");

  const shown = cats.filter(
    c => !q || c.name.toLowerCase().includes(q.toLowerCase())
  );

  function add() {
    if (!newName) return;
    setCats(prev => [
      ...prev,
      { id: Date.now(), name: newName, parent: "—", count: 0, status: "Активна" },
    ]);
    setNewName("");
    setShowAdd(false);
  }

  return (
    <>
      <div style={{
        display: "flex", justifyContent: "space-between",
        alignItems: "center", marginBottom: 12,
      }}>
        <div>
          <div style={{ fontWeight: 700 }}>Категории</div>
          <div style={{ fontSize: 12, color: "#888" }}>Управление категориями товаров</div>
        </div>
        <button onClick={() => setShowAdd(true)} style={mkBtn("p", { fontSize: 12 })}>
          + Создать категорию
        </button>
      </div>

      <SearchBar value={q} onChange={setQ} placeholder="Поиск категорий..." />

      <div style={{ ...Sc.card, padding: 0, marginTop: 10 }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              {["Название", "Родительская категория", "Товаров", "Статус", "Действия"].map(h => (
                <th key={h} style={Sc.th}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {shown.map(c => (
              <tr
                key={c.id}
                onMouseEnter={e => (e.currentTarget.style.background = "#fafafa")}
                onMouseLeave={e => (e.currentTarget.style.background = "")}
              >
                <td style={{ ...Sc.td, fontWeight: 500 }}>{c.name}</td>
                <td style={{ ...Sc.td, color: "#aaa" }}>{c.parent}</td>
                <td style={Sc.td}>
                  <span style={{
                    background: "#f0f0f0", borderRadius: 4,
                    padding: "2px 8px", fontSize: 12,
                  }}>
                    {c.count}
                  </span>
                </td>
                <td style={Sc.td}>
                  <span style={mkBadge("gr")}>{c.status}</span>
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
        {shown.length === 0 && <EmptyState icon="📂" title="Категорий нет" />}
      </div>

      {showAdd && (
        <Modal title="Создать категорию" onClose={() => setShowAdd(false)} width={400}>
          <div style={{ marginBottom: 14 }}>
            <label style={Sc.lbl}>Название *</label>
            <input
              value={newName}
              onChange={e => setNewName(e.target.value)}
              style={Sc.inp}
              autoFocus
            />
          </div>
          <div style={{ marginBottom: 16 }}>
            <label style={Sc.lbl}>Родительская категория</label>
            <select style={{ ...Sc.inp, appearance: "none" }}>
              <option value="">— нет —</option>
              {cats.map(c => <option key={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
            <button onClick={() => setShowAdd(false)} style={mkBtn("s")}>Отмена</button>
            <button onClick={add} style={mkBtn()}>Создать</button>
          </div>
        </Modal>
      )}
    </>
  );
}

// ── Справочники: Бренды ───────────────────────────────────────────────────────

type Brand = { id: number; name: string; slug: string; desc: string };

function TabBrands() {
  const [brands,  setBrands]  = useState<Brand[]>([
    { id: 1, name: "Jazz", slug: "jazz", desc: "—" },
  ]);
  const [showAdd, setShowAdd] = useState(false);
  const [form,    setForm]    = useState({ name: "", slug: "", desc: "" });

  function add() {
    if (!form.name) return;
    setBrands(prev => [
      ...prev,
      { id: Date.now(), name: form.name, slug: form.slug || form.name.toLowerCase(), desc: form.desc || "—" },
    ]);
    setForm({ name: "", slug: "", desc: "" });
    setShowAdd(false);
  }

  return (
    <>
      <div style={{
        display: "flex", justifyContent: "space-between",
        alignItems: "center", marginBottom: 12,
      }}>
        <div>
          <div style={{ fontWeight: 700 }}>Бренды</div>
          <div style={{ fontSize: 12, color: "#888" }}>Управление брендами товаров</div>
        </div>
        <button onClick={() => setShowAdd(true)} style={mkBtn("p", { fontSize: 12 })}>
          + Добавить бренд
        </button>
      </div>

      <SearchBar value="" onChange={() => {}} placeholder="Поиск брендов..." />

      <div style={{ ...Sc.card, padding: 0, marginTop: 10 }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              {["Логотип", "Название", "Slug", "Описание", "Действия"].map(h => (
                <th key={h} style={Sc.th}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {brands.map(b => (
              <tr
                key={b.id}
                onMouseEnter={e => (e.currentTarget.style.background = "#fafafa")}
                onMouseLeave={e => (e.currentTarget.style.background = "")}
              >
                <td style={Sc.td}>
                  <div style={{
                    width: 28, height: 28, background: "#f0f0f0", borderRadius: 4,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontWeight: 700, fontSize: 11,
                  }}>
                    {b.name[0].toUpperCase()}
                  </div>
                </td>
                <td style={{ ...Sc.td, fontWeight: 600 }}>{b.name}</td>
                <td style={{ ...Sc.td, fontFamily: "monospace", color: OR }}>{b.slug}</td>
                <td style={{ ...Sc.td, color: "#aaa" }}>{b.desc}</td>
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
        {brands.length === 0 && <EmptyState icon="🏷" title="Брендов нет" />}
      </div>

      {showAdd && (
        <Modal title="Добавить бренд" onClose={() => setShowAdd(false)} width={400}>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <div>
              <label style={Sc.lbl}>Название *</label>
              <input
                value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                style={Sc.inp}
                autoFocus
              />
            </div>
            <div>
              <label style={Sc.lbl}>Slug</label>
              <input
                value={form.slug}
                onChange={e => setForm(f => ({ ...f, slug: e.target.value }))}
                style={Sc.inp}
                placeholder="авто-заполнение из названия"
              />
            </div>
            <div>
              <label style={Sc.lbl}>Описание</label>
              <input
                value={form.desc}
                onChange={e => setForm(f => ({ ...f, desc: e.target.value }))}
                style={Sc.inp}
              />
            </div>
          </div>
          <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 18 }}>
            <button onClick={() => setShowAdd(false)} style={mkBtn("s")}>Отмена</button>
            <button onClick={add} style={mkBtn()}>Добавить</button>
          </div>
        </Modal>
      )}
    </>
  );
}

// ── Справочники: Единицы измерения ────────────────────────────────────────────

type Unit = { id: number; name: string; short: string; precision: string; type: string };

function TabUnits() {
  const [units, setUnits] = useState<Unit[]>([
    { id: 1, name: "Штука",     short: "шт", precision: "Целое число",           type: "Системная" },
    { id: 2, name: "Килограмм", short: "кг", precision: "3 знака после запятой", type: "Системная" },
    { id: 3, name: "Литр",      short: "л",  precision: "3 знака после запятой", type: "Системная" },
    { id: 4, name: "Метр",      short: "м",  precision: "2 знака после запятой", type: "Системная" },
    { id: 5, name: "Упаковка",  short: "уп", precision: "Целое число",           type: "Системная" },
  ]);
  const [showAdd, setShowAdd] = useState(false);
  const [form,    setForm]    = useState({ name: "", short: "", precision: "Целое число" });

  function add() {
    if (!form.name || !form.short) return;
    setUnits(prev => [
      ...prev,
      { id: Date.now(), name: form.name, short: form.short, precision: form.precision, type: "Пользовательская" },
    ]);
    setForm({ name: "", short: "", precision: "Целое число" });
    setShowAdd(false);
  }

  return (
    <>
      <div style={{
        display: "flex", justifyContent: "space-between",
        alignItems: "center", marginBottom: 12,
      }}>
        <div>
          <div style={{ fontWeight: 700 }}>Единицы измерения</div>
          <div style={{ fontSize: 12, color: "#888" }}>Управление единицами измерения товаров</div>
        </div>
        <button onClick={() => setShowAdd(true)} style={mkBtn("p", { fontSize: 12 })}>
          + Добавить единицу
        </button>
      </div>

      <SearchBar value="" onChange={() => {}} placeholder="Поиск единиц измерения..." />

      <div style={{ ...Sc.card, padding: 0, marginTop: 10 }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              {["Название", "Сокращение", "Точность", "Тип", "Действия"].map(h => (
                <th key={h} style={Sc.th}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {units.map(u => (
              <tr
                key={u.id}
                onMouseEnter={e => (e.currentTarget.style.background = "#fafafa")}
                onMouseLeave={e => (e.currentTarget.style.background = "")}
              >
                <td style={{ ...Sc.td, fontWeight: 500 }}>{u.name}</td>
                <td style={Sc.td}>
                  <span style={{
                    background: "#f0f0f0", borderRadius: 4,
                    padding: "2px 8px", fontSize: 12, fontFamily: "monospace",
                  }}>
                    {u.short}
                  </span>
                </td>
                <td style={{ ...Sc.td, color: "#888", fontSize: 12 }}>{u.precision}</td>
                <td style={Sc.td}>
                  <span style={mkBadge(u.type === "Системная" ? "or" : "gr")}>{u.type}</span>
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
      </div>

      {showAdd && (
        <Modal title="Добавить единицу измерения" onClose={() => setShowAdd(false)} width={400}>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <div>
              <label style={Sc.lbl}>Название *</label>
              <input
                value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                style={Sc.inp}
                placeholder="Например: Коробка"
                autoFocus
              />
            </div>
            <div>
              <label style={Sc.lbl}>Сокращение *</label>
              <input
                value={form.short}
                onChange={e => setForm(f => ({ ...f, short: e.target.value }))}
                style={Sc.inp}
                placeholder="кор"
              />
            </div>
            <div>
              <label style={Sc.lbl}>Точность</label>
              <select
                value={form.precision}
                onChange={e => setForm(f => ({ ...f, precision: e.target.value }))}
                style={{ ...Sc.inp, appearance: "none" }}
              >
                <option>Целое число</option>
                <option>1 знак после запятой</option>
                <option>2 знака после запятой</option>
                <option>3 знака после запятой</option>
              </select>
            </div>
          </div>
          <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 18 }}>
            <button onClick={() => setShowAdd(false)} style={mkBtn("s")}>Отмена</button>
            <button onClick={add} style={mkBtn()}>Добавить</button>
          </div>
        </Modal>
      )}
    </>
  );
}

// ── Справочники: Характеристики ───────────────────────────────────────────────

type CharField = {
  id:         number;
  name:       string;
  fieldType:  string;
  type:       string;
  visible:    boolean;
};

function TabChars() {
  const [chars, setChars] = useState<CharField[]>([
    { id: 1, name: "Название",     fieldType: "Текст",       type: "Системное", visible: true },
    { id: 2, name: "Бренд",        fieldType: "Текст",       type: "Системное", visible: true },
    { id: 3, name: "Фото",         fieldType: "Изображение", type: "Системное", visible: true },
    { id: 4, name: "Категория",    fieldType: "Текст",       type: "Системное", visible: true },
    { id: 5, name: "Цена продажи", fieldType: "Число",       type: "Системное", visible: true },
    { id: 6, name: "Штрихкод",     fieldType: "Текст",       type: "Системное", visible: true },
  ]);

  const [showAdd, setShowAdd] = useState(false);
  const [form,    setForm]    = useState({ name: "", fieldType: "Текст" });

  function toggleVisible(id: number) {
    setChars(prev => prev.map(c => c.id === id ? { ...c, visible: !c.visible } : c));
  }

  function add() {
    if (!form.name) return;
    setChars(prev => [
      ...prev,
      { id: Date.now(), name: form.name, fieldType: form.fieldType, type: "Пользовательское", visible: true },
    ]);
    setForm({ name: "", fieldType: "Текст" });
    setShowAdd(false);
  }

  return (
    <>
      <div style={{
        display: "flex", justifyContent: "space-between",
        alignItems: "center", marginBottom: 12,
      }}>
        <div>
          <div style={{ fontWeight: 700 }}>Характеристики товаров</div>
          <div style={{ fontSize: 12, color: "#888" }}>Управление полями и свойствами товаров</div>
        </div>
        <button onClick={() => setShowAdd(true)} style={mkBtn("p", { fontSize: 12 })}>
          + Добавить поле
        </button>
      </div>

      <SearchBar value="" onChange={() => {}} placeholder="Поиск характеристик..." />

      <div style={{ ...Sc.card, padding: 0, marginTop: 10 }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              {["Название", "Тип", "Тип поля", "Видимость", "Действия"].map(h => (
                <th key={h} style={Sc.th}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {chars.map(c => (
              <tr
                key={c.id}
                onMouseEnter={e => (e.currentTarget.style.background = "#fafafa")}
                onMouseLeave={e => (e.currentTarget.style.background = "")}
              >
                <td style={{ ...Sc.td, fontWeight: 500 }}>{c.name}</td>
                <td style={Sc.td}>
                  <span style={mkBadge("or")}>{c.type}</span>
                </td>
                <td style={{ ...Sc.td, fontSize: 12, color: "#888" }}>{c.fieldType}</td>
                <td style={Sc.td}>
                  <Toggle on={c.visible} onChange={() => toggleVisible(c.id)} />
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
      </div>

      {showAdd && (
        <Modal title="Добавить поле" onClose={() => setShowAdd(false)} width={400}>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <div>
              <label style={Sc.lbl}>Название поля *</label>
              <input
                value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                style={Sc.inp}
                autoFocus
              />
            </div>
            <div>
              <label style={Sc.lbl}>Тип поля</label>
              <select
                value={form.fieldType}
                onChange={e => setForm(f => ({ ...f, fieldType: e.target.value }))}
                style={{ ...Sc.inp, appearance: "none" }}
              >
                {["Текст", "Число", "Изображение", "Дата", "Список", "Да/Нет"].map(t => (
                  <option key={t}>{t}</option>
                ))}
              </select>
            </div>
          </div>
          <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 18 }}>
            <button onClick={() => setShowAdd(false)} style={mkBtn("s")}>Отмена</button>
            <button onClick={add} style={mkBtn()}>Добавить</button>
          </div>
        </Modal>
      )}
    </>
  );
}

// ── Справочники: Настройки каталога ───────────────────────────────────────────

type TradeRule = {
  key:     string;
  label:   string;
  desc:    string;
  default: boolean;
};

const TRADE_RULES: TradeRule[] = [
  { key: "wholesale",    label: "Оптовая цена",                 desc: "Включить поле оптовой цены для товаров",                              default: false },
  { key: "lowStock",     label: "Малый остаток",                 desc: "Показывать предупреждение при малом остатке товара",                   default: false },
  { key: "quickAdd",     label: "Быстрое добавление",            desc: "Разрешить быстрое добавление товаров в кассе",                        default: false },
  { key: "negMargin",    label: "Отрицательная маржинальность",  desc: "Разрешить продажу товаров ниже закупочной цены",                      default: false },
  { key: "freePrice",    label: "Свободная цена",                desc: "Разрешить кассиру вводить произвольную цену при продаже",             default: false },
  { key: "zeroStock",    label: "Продажа при нулевом остатке",   desc: "Разрешить продажу товаров даже при нулевом или отрицательном остатке", default: true  },
];

function TabTradeSettings() {
  const [toggles, setToggles] = useState<Record<string, boolean>>(
    Object.fromEntries(TRADE_RULES.map(r => [r.key, r.default]))
  );
  const [discounts, setDiscounts] = useState([10, 20, 30, 50]);
  const [cardFields, setCardFields] = useState<Record<string, boolean>>({
    name:  false,
    brand: false,
    photo: false,
    cat:   false,
    price: false,
    code:  false,
  });

  const cardFieldLabels: [keyof typeof cardFields, string][] = [
    ["name",  "Название"],
    ["brand", "Бренд"],
    ["photo", "Фото"],
    ["cat",   "Категория"],
    ["price", "Цена продажи"],
    ["code",  "Штрихкод"],
  ];

  return (
    <>
      {/* Правила торговли */}
      <div style={Sc.card}>
        <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 14 }}>Правила торговли</div>
        <div style={{ fontSize: 12, color: "#888", marginBottom: 14 }}>
          Глобальные настройки для работы с товарами
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {TRADE_RULES.map(r => (
            <div
              key={r.key}
              style={{
                background: "#fafafa", borderRadius: 8,
                padding: "12px 14px",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div style={{ paddingRight: 14 }}>
                  <div style={{ fontWeight: 600, fontSize: 13 }}>{r.label}</div>
                  <div style={{ fontSize: 12, color: "#888", marginTop: 2 }}>{r.desc}</div>
                </div>
                <Toggle
                  on={toggles[r.key] ?? false}
                  onChange={v => setToggles(prev => ({ ...prev, [r.key]: v }))}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Карточка товара */}
      <div style={Sc.card}>
        <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 4 }}>Карточка товара</div>
        <div style={{ fontSize: 12, color: "#888", marginBottom: 14 }}>
          Выберите свойства для отображения на карточке товара в кассе
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {cardFieldLabels.map(([k, l]) => (
            <div
              key={k}
              style={{
                display: "flex", alignItems: "center", gap: 10,
                padding: "8px 0", borderBottom: "1px solid #f5f5f5",
                cursor: "pointer",
              }}
              onClick={() => setCardFields(prev => ({ ...prev, [k]: !prev[k] }))}
            >
              <input
                type="checkbox"
                checked={cardFields[k]}
                onChange={() => setCardFields(prev => ({ ...prev, [k]: !prev[k] }))}
                style={{ accentColor: OR, width: 16, height: 16 }}
              />
              <div>
                <div style={{ fontSize: 13, fontWeight: 500 }}>{l}</div>
                <div style={{ fontSize: 11, color: "#aaa" }}>Системное поле</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Быстрые скидки */}
      <div style={Sc.card}>
        <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 4 }}>Быстрые скидки</div>
        <div style={{ fontSize: 12, color: "#888", marginBottom: 14 }}>
          Настройте кнопки быстрых скидок для кассы (в процентах)
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8 }}>
          {discounts.map((v, i) => (
            <div key={i}>
              <div style={{ fontSize: 11, color: "#888", marginBottom: 4 }}>Кнопка {i + 1}</div>
              <input
                type="number"
                value={v}
                onChange={e =>
                  setDiscounts(prev => prev.map((x, j) => j === i ? Number(e.target.value) : x))
                }
                style={{ ...Sc.inp, textAlign: "center" }}
              />
              <div style={{ fontSize: 11, color: "#888", textAlign: "center", marginTop: 2 }}>%</div>
            </div>
          ))}
        </div>
        <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 14 }}>
          <button style={mkBtn()}>Сохранить</button>
        </div>
      </div>
    </>
  );
}

// ── Уведомления ───────────────────────────────────────────────────────────────

export function PageNotifications() {
  return (
    <div>
      <PageHead
        title="Уведомления"
        sub="Настройка уведомлений и оповещений"
        bread="Главная › Настройки › Уведомления"
      />
      <div style={{ padding: "12px 14px" }}>
        <div style={Sc.card}>
          <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 6 }}>
            Страница в разработке
          </div>
          <div style={{ fontSize: 13, color: "#888", marginBottom: 16 }}>
            Раздел «Уведомления» будет доступен в ближайших обновлениях.
            Здесь вы сможете настроить способы получения уведомлений (email, SMS, push).
          </div>
          <div style={{ color: OR, fontSize: 13, cursor: "pointer" }}>
            ← Вернуться в настройки
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Интеграции ────────────────────────────────────────────────────────────────

export function PageIntegrations() {
  return (
    <div>
      <PageHead
        title="Интеграции"
        sub="Подключение внешних сервисов и приложений"
        bread="Главная › Настройки › Интеграции"
      />
      <div style={{ padding: "12px 14px" }}>
        <div style={Sc.card}>
          <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 6 }}>
            Страница в разработке
          </div>
          <div style={{ fontSize: 13, color: "#888", marginBottom: 16 }}>
            Раздел «Интеграции» будет доступен в ближайших обновлениях.
            Здесь вы сможете подключать учётные системы, платёжные сервисы и другие приложения.
          </div>
          <div style={{ color: OR, fontSize: 13, cursor: "pointer" }}>
            ← Вернуться в настройки
          </div>
        </div>
      </div>
    </div>
  );
}
