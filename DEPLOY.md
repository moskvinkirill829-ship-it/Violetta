# Деплой «Помогариум»

Приложение — один Node-процесс: Express отдаёт API `/api/*` и статику `client/dist`,
плюс поднимает Telegram-бота (long-polling). База данных не требуется.

Рекомендация по хостингу для РФ-аудитории: **Timeweb Cloud / Selectel / REG.RU Cloud**
(VPS, Ubuntu 22.04, 1 vCPU, 1 ГБ RAM хватит). Нужен только исходящий HTTPS к
`api.telegram.org` (есть по умолчанию).

> ⚠️ Telegram-бот работает через long-polling — запускайте **ровно один** экземпляр
> сервера. Два параллельных процесса с одним токеном → ошибка `409 Conflict`.

---

## Вариант A. VPS + Nginx + systemd (рекомендуется)

### 1. Подготовка сервера

```bash
# Node 20 LTS
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs nginx

sudo useradd -r -m -d /opt/pomogarium -s /bin/bash pomogarium
```

### 2. Код и сборка

```bash
sudo -u pomogarium -i
git clone <репозиторий> /opt/pomogarium/app   # или загрузить архивом
cd /opt/pomogarium/app
npm ci
cp server/.env.example server/.env
nano server/.env            # PORT=3001, NODE_ENV=production, CORS_ORIGIN=https://ВАШ_ДОМЕН,
                            # TELEGRAM_BOT_TOKEN=... (обязательно), TELEGRAM_SUBSCRIBE_CODE=... (по желанию)
npm run build
exit
```

### 3. systemd-юнит

`/etc/systemd/system/pomogarium.service`:

```ini
[Unit]
Description=Pomogarium site
After=network.target

[Service]
Type=simple
User=pomogarium
WorkingDirectory=/opt/pomogarium/app
Environment=NODE_ENV=production
ExecStart=/usr/bin/node server/dist/index.js
Restart=on-failure
RestartSec=3

[Install]
WantedBy=multi-user.target
```

```bash
sudo systemctl daemon-reload
sudo systemctl enable --now pomogarium
sudo systemctl status pomogarium
```

### 4. Nginx reverse proxy

`/etc/nginx/sites-available/pomogarium`:

```nginx
server {
    listen 80;
    server_name ВАШ_ДОМЕН www.ВАШ_ДОМЕН;

    location / {
        proxy_pass http://127.0.0.1:3001;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location ~* \.(js|css|png|jpg|jpeg|svg|woff2?)$ {
        proxy_pass http://127.0.0.1:3001;
        expires 30d;
        add_header Cache-Control "public, immutable";
    }
}
```

```bash
sudo ln -s /etc/nginx/sites-available/pomogarium /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx

# TLS
sudo apt-get install -y certbot python3-certbot-nginx
sudo certbot --nginx -d ВАШ_ДОМЕН -d www.ВАШ_ДОМЕН
```

### 5. Обновление

```bash
sudo -u pomogarium -i
cd /opt/pomogarium/app && git pull && npm ci && npm run build && exit
sudo systemctl restart pomogarium
```

---

## Вариант B. Docker

```bash
cp server/.env.example server/.env   # заполнить
docker compose up -d --build
```

Приложение на `http://localhost:3001`. Nginx/TLS — сверху, как в варианте A,
либо добавить Caddy/Traefik.

Файлы: [`Dockerfile`](Dockerfile), [`docker-compose.yml`](docker-compose.yml).
`server/data/` (CSV-заявки + `subscribers.json` со списком подписчиков бота)
смонтирована томом, чтобы не терялась при пересборке.

---

## Заметки

- `client/dist` собирается в образе/на сервере — коммитить не нужно.
- `server/data/leads.csv` — бэкап заявок, забирайте периодически (`scp`, том Docker).
- `server/data/subscribers.json` — список получателей заявок в Telegram; при переезде
  сервера скопируйте его, иначе подписчикам придётся снова нажать `/start`.
- После деплоя откройте бота и нажмите `/start` — иначе заявки будут только в CSV.
- Меняли контент в `client/src/data/site.ts` → нужна пересборка клиента (`npm run build`).
- Форма шлёт `POST /api/lead`; проверить живость API: `GET /api/health` → `{"ok":true}`.
