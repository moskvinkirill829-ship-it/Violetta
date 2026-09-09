#!/usr/bin/env bash
# ============================================================
#  Первичная установка «Помогариум» на чистый Ubuntu 22.04 / 24.04
#  (Reg.ru / Timeweb / Selectel VPS и т.п.)
#
#  Запускать НА СЕРВЕРЕ от root, из папки проекта:
#     bash deploy/setup.sh                 # доступ по IP
#     DOMAIN=pomogarium.ru bash deploy/setup.sh   # с доменом + HTTPS
#
#  Код проекта должен уже лежать в /opt/pomogarium/app
#  (git clone ... /opt/pomogarium/app — см. deploy/README.md).
# ============================================================
set -euo pipefail

DOMAIN="${DOMAIN:-}"
APP_DIR="/opt/pomogarium/app"
APP_USER="pomogarium"

if [[ ! -f "$APP_DIR/package.json" ]]; then
  echo "Не найден $APP_DIR/package.json — сначала склонируйте проект в $APP_DIR"
  echo "  git clone <репозиторий> $APP_DIR"
  exit 1
fi

echo "==> apt update + базовые пакеты"
export DEBIAN_FRONTEND=noninteractive
apt-get update -y
apt-get install -y curl git nginx ca-certificates

echo "==> Node.js 20"
if ! command -v node >/dev/null || [[ "$(node -v)" != v20* ]]; then
  curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
  apt-get install -y nodejs
fi
node -v

# --- swap, если памяти мало (сборка Vite может не влезть в 1 ГБ) ---
if [[ ! -f /swapfile ]] && [[ "$(free -m | awk '/^Mem:/{print $2}')" -lt 1800 ]]; then
  echo "==> Создаю swap 2 ГБ (мало RAM)"
  fallocate -l 2G /swapfile || dd if=/dev/zero of=/swapfile bs=1M count=2048
  chmod 600 /swapfile && mkswap /swapfile && swapon /swapfile
  echo '/swapfile none swap sw 0 0' >> /etc/fstab
fi

echo "==> Пользователь $APP_USER"
id -u "$APP_USER" &>/dev/null || useradd -r -m -d /opt/pomogarium -s /bin/bash "$APP_USER"
chown -R "$APP_USER:$APP_USER" /opt/pomogarium

echo "==> Сборка (npm ci + build)"
sudo -u "$APP_USER" bash -lc "cd $APP_DIR && npm ci && npm run build"

echo "==> server/.env"
if [[ ! -f "$APP_DIR/server/.env" ]]; then
  sudo -u "$APP_USER" cp "$APP_DIR/server/.env.example" "$APP_DIR/server/.env"
fi
if [[ -n "$DOMAIN" ]] && ! grep -q '^CORS_ORIGIN=' "$APP_DIR/server/.env"; then
  sudo -u "$APP_USER" bash -c "printf '\nCORS_ORIGIN=https://$DOMAIN\n' >> $APP_DIR/server/.env"
fi

echo "==> systemd-сервис pomogarium"
cat >/etc/systemd/system/pomogarium.service <<EOF
[Unit]
Description=Pomogarium site
After=network.target

[Service]
Type=simple
User=$APP_USER
WorkingDirectory=$APP_DIR/server
Environment=NODE_ENV=production
ExecStart=/usr/bin/node dist/index.js
Restart=on-failure
RestartSec=3

[Install]
WantedBy=multi-user.target
EOF
systemctl daemon-reload
systemctl enable --now pomogarium
sleep 2

echo "==> nginx"
SERVER_NAME="_"
[[ -n "$DOMAIN" ]] && SERVER_NAME="$DOMAIN www.$DOMAIN"
cat >/etc/nginx/sites-available/pomogarium <<EOF
server {
    listen 80 default_server;
    server_name $SERVER_NAME;
    client_max_body_size 1m;
    location / {
        proxy_pass http://127.0.0.1:3001;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }
}
EOF
ln -sf /etc/nginx/sites-available/pomogarium /etc/nginx/sites-enabled/pomogarium
rm -f /etc/nginx/sites-enabled/default
nginx -t && systemctl reload nginx

if [[ -n "$DOMAIN" ]]; then
  echo "==> HTTPS (Let's Encrypt)"
  apt-get install -y certbot python3-certbot-nginx
  certbot --nginx -d "$DOMAIN" -d "www.$DOMAIN" --non-interactive --agree-tos --register-unsafely-without-email \
    || echo "Certbot не прошёл. Убедитесь, что $DOMAIN уже указывает A-записью на этот сервер, и запустите: certbot --nginx -d $DOMAIN -d www.$DOMAIN"
fi

IP="$(curl -fsS ifconfig.me 2>/dev/null || echo 'IP_сервера')"
URL="http://$IP"
[[ -n "$DOMAIN" ]] && URL="https://$DOMAIN"

echo
echo "============================================================"
echo " Готово. Сайт: $URL"
echo
echo " Проверка API:   curl $URL/api/health   ->  {\"ok\":true}"
echo " Логи:           journalctl -u pomogarium -f"
echo " Перезапуск:     systemctl restart pomogarium"
echo
echo " Токен бота — в $APP_DIR/server/.env (уже заполнен из репозитория)."
echo " Дальше: в Telegram боту @Violetta_Zayavki_bot отправить"
echo "   /start Violletta2670"
echo " и проверить форму на сайте."
echo "============================================================"
