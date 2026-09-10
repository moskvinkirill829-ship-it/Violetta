# Помогариум — лендинг репетиторского центра

Одностраничный сайт: подбор репетиторов, карусели преподавателей и отзывов,
форма заявки с отправкой в Telegram-группу.

**Стек:** React 18 + Vite + TypeScript · одна serverless-функция на Vercel (`/api/lead`) · npm workspaces.

---

## Структура

```
client/            React + Vite (весь фронтенд)
api/
  lead.mjs         serverless-функция POST /api/lead (Vercel)
  _lib/lead.mjs    общая логика: валидация + антиспам + отправка в Telegram
vercel.json        конфиг деплоя (build client → client/dist, SPA-роутинг)
.env.example       шаблон переменных окружения
```

Бэкенда-сервера больше нет — на Vercel работает только функция `api/lead.mjs`.
В деве её логику подхватывает Vite (`client/vite.config.ts`, плагин `dev-lead-api`).

---

## Требования

- **Node.js 20 LTS** или новее (`node -v`).
- npm 10+ (идёт с Node).

> ⚠️ Путь к проекту — только латиница, без пробелов и кириллицы,
> иначе на Windows падают нативные пакеты (`esbuild`).

---

## Установка и запуск

```bash
npm install
cp .env.example .env      # подставить TELEGRAM_CHAT_ID (см. ниже)
npm run dev               # http://localhost:5173
```

Форма в деве работает по-настоящему — отправляет сообщение в ту же Telegram-группу,
что и прод (переменные берутся из корневого `.env`).

Прод-сборка локально:

```bash
npm run build            # → client/dist (статика)
npm run preview          # предпросмотр сборки (без /api — это только на Vercel)
npm run typecheck
```

---

## Форма заявки → Telegram-группа

Каждая заявка уходит сообщением в одну группу (`TELEGRAM_CHAT_ID`). Кто в группе —
тот и получает заявки; управление доступом = состав участников группы.

### Настройка

1. **Группа.** Создай в Telegram группу (напр. «Помогариум — заявки»),
   добавь бота **@Violetta\_Zayavki\_bot** и сотрудников.
2. **Токен.** `TELEGRAM_BOT_TOKEN` — от [@BotFather](https://t.me/BotFather)
   (`/newbot` или `/token`). Токен текущего бота уже в `.env.example`.
3. **ID группы.** `TELEGRAM_CHAT_ID` (отрицательное число `-100…`):
   - напиши в группе `/id@Violetta_Zayavki_bot`;
   - открой `https://api.telegram.org/bot<ТОКЕН>/getUpdates`;
   - в ответе найди `"chat":{"id":-100…}` — это и есть `TELEGRAM_CHAT_ID`.
4. Пропиши обе переменные:
   - **локально** — в `.env`;
   - **на Vercel** — Project → Settings → Environment Variables (Production + Preview), затем Redeploy.

> Скомпрометирован токен — в [@BotFather](https://t.me/BotFather) `/revoke`, обнови переменную.

---

## Антиспам

- honeypot-поле `company` (скрыто от людей);
- «time-trap» — заявки быстрее 1.5 с после загрузки формы игнорируются.

Жёсткий rate-limit по IP на serverless сделать негде без внешнего хранилища —
для лендинга honeypot + time-trap достаточно.

---

## Деплой на Vercel

См. [`DEPLOY.md`](DEPLOY.md). Кратко:

1. Импортировать репозиторий в Vercel (Framework Preset: **Other**, конфиг берётся из `vercel.json`).
2. Добавить env-переменные `TELEGRAM_BOT_TOKEN`, `TELEGRAM_CHAT_ID`.
3. Deploy. Пуш в `main` → автодеплой.

---

## Что заменить перед публикацией (искать `TODO`)

- `client/src/data/site.ts` — телефон, ссылки на Telegram/WhatsApp/MAX, e-mail,
  реквизиты, список и фото преподавателей;
- `client/public/images/` — фото Анастасии (`teacher-anastasia.jpg`) и остальных;
- футер — реальные QR-коды мессенджеров;
- `client/src/pages/PrivacyPage.tsx` — текст политики (согласовать с юристом).

---

## Про флаг `--no-opt` в скриптах

Скрипты клиента запускают Node как `node --no-opt …` — отключают оптимизирующий
JIT V8. Причина: на машине разработки корпоративный антивирус/EDR роняет `node.exe`
(`0xC0000005`) при JIT-компиляции. На чистой машине и на билд-серверах Vercel флаг
безвреден (чуть медленнее сборка). `NODE_OPTIONS=--no-opt` не работает — Node
запрещает флаг в переменной, поэтому он прямо в командах.
