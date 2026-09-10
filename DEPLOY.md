# Деплой на Vercel

Сайт = статика (Vite) + одна serverless-функция `/api/lead`. Всё в одном проекте Vercel.

## 1. Telegram-группа (сделать один раз)

1. Создай группу в Telegram, напр. **«Помогариум — заявки»**.
2. Добавь в неё бота **@Violetta\_Zayavki\_bot** и всех, кому нужны заявки.
3. Узнай id группы:
   - напиши в группе `/id@Violetta_Zayavki_bot`;
   - открой в браузере `https://api.telegram.org/bot<ТОКЕН>/getUpdates`;
   - найди `"chat":{"id":-100XXXXXXXXXX}` — это `TELEGRAM_CHAT_ID`.

Токен бота (`TELEGRAM_BOT_TOKEN`) — в `.env.example` / у @BotFather.

## 2. Импорт проекта

1. [vercel.com/new](https://vercel.com/new) → **Import** этого репозитория (`moskvinkirill829-ship-it/Violetta`).
2. **Framework Preset:** `Other` (настройки берутся из `vercel.json`).
   - Build Command, Output Directory, Install Command трогать не нужно — они в `vercel.json`.
3. **Root Directory:** оставить корень репозитория (`./`), не `client`.
   Функция `api/` должна быть на одном уровне с проектом.

## 3. Переменные окружения

Project → **Settings → Environment Variables**, добавить для **Production** и **Preview**:

| Name | Value |
|---|---|
| `TELEGRAM_BOT_TOKEN` | `8986860813:AAG…` (токен бота) |
| `TELEGRAM_CHAT_ID` | `-100…` (id группы из шага 1) |

После добавления — **Deployments → … → Redeploy** (иначе переменные не подхватятся).

## 4. Деплой

- Первый деплой — кнопкой **Deploy**.
- Дальше: любой `git push` в `main` → автоматический продакшн-деплой,
  пуши в другие ветки / PR → preview-деплой.

## 5. Проверка

1. Открыть выданный домен `*.vercel.app`.
2. Отправить тестовую заявку через форму.
3. Сообщение должно прийти в Telegram-группу.
4. Если не пришло — Vercel → Project → **Logs**, фильтр по `/api/lead`:
   - `Telegram не настроен` → не заданы/не задеплоены переменные;
   - `Telegram API: chat not found` → бот не в группе или неверный `TELEGRAM_CHAT_ID`;
   - `Telegram API: 403` → бота кикнули из группы.

## Свой домен (опционально)

Project → **Settings → Domains** → добавить домен, прописать у регистратора
DNS-записи, которые покажет Vercel. HTTPS Vercel выпустит сам.

---

### Почему не VPS / Docker

Раньше проект деплоился на VPS с Express и Telegram-ботом на long-polling.
Для Vercel это переписано: serverless не держит постоянный процесс и не пишет
файлы, поэтому бот работает «в одну сторону» — только шлёт заявки в группу,
без подписчиков и без вебхука. Это проще и надёжнее для лендинга.
