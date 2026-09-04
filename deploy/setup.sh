#!/usr/bin/env bash
# ============================================================
#  Первичная установка «Помогариум» на чистый Ubuntu 22.04 / 24.04
#  Запускать НА СЕРВЕРЕ от root:
#     DOMAIN=pomogarium.ru bash setup.sh
#  Перед запуском код проекта должен лежать в /opt/pomogarium/app
#  (git clone или распакованный архив — см. deploy/README.md).
# ============================================================
set -euo pipefail

DOMAIN="${DOMAIN:-}"
APP_DIR="/opt/pomogarium/app"
APP_USER="pomogarium"

if [[ -z "$DOMAIN" ]]; then
  echo "Укажите домен:  DOMAIN=ваш-домен.ru bash setup.sh"
  exit 1
fi
if [[ ! -f "$APP_DIR/package.json" ]]; then
  echo "Не найден $APP_DIR/package.json — сначала положите туда код проекта."
  exit 1
fi

echo "==> Node.js 20 + nginx + certbot"
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt-get install -y nodejs nginx certbot python3-certbot-nginx

echo "==> Пользователь $APP_USER"
id -u "$APP_USER" &>/dev/null || useradd -r -m -d /opt/pomogarium -s /bin/bash "$APP_USER"
chown -R "$APP_USER:$APP_USER" /opt/pomogarium

echo "==> Сборка"
sudo -u "$APP_USER" bash -c "cd $APP_DIR && npm ci && npm run build"

if [[ ! -f "$APP_DIR/server/.env" ]]; then
  echo "==> server/.env не найден — создаю из шаблона (ЗАПОЛНИТЕ ТОКЕН на шаге 4!)"
  sudo -u "$APP_USER" cp "$APP_DIR/server/.env.example" "$APP_DIR/server/.env"
  sudo -u "$APP_USER" bash -c "printf '\nNODE_ENV=production\nCORS_ORIGIN=https://$DOMAIN\n' >> $APP_DIR/server/.env"
fi

echo "==> systemd-сервис"
cat >/etc/systemd/system/pomogarium.service <<EOF
[Unit]
Description=Pomogarium site
After=network.target

[Service]
Type=simple
User=$APP_USER
WorkingDirectory=$APP_DIR/server
Environment=NODE_ENV=production
ExecStart=/usr/bin/node --no-opt dist/index.js
Restart=on-failure
RestartSec=3

[Install]
WantedBy=multi-user.target
EOF

systemctl daemon-reload
systemctl enable --now pomogarium

echo "==> nginx"
cat >/etc/nginx/sites-available/pomogarium <<EOF
server {
    listen 80;
    server_name $DOMAIN www.$DOMAIN;
    location / {
        proxy_pass http://127.0.0.1:3001;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }
}
EOF
ln -sf /etc/nginx/sites-available/pomogarium /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default
nginx -t && systemctl reload nginx

echo "==> TLS (Let's Encrypt)"
certbot --nginx -d "$DOMAIN" -d "www.$DOMAIN" --non-interactive --agree-tos --register-unsafely-without-email || \
  echo "Certbot не прошёл — проверьте, что домен уже указывает на этот сервер, и запустите: certbot --nginx -d $DOMAIN -d www.$DOMAIN"

echo
echo "============================================================"
echo " Готово. Сайт: https://$DOMAIN"
echo
echo " ВАЖНО: впишите токен бота в $APP_DIR/server/.env:"
echo "   TELEGRAM_BOT_TOKEN=<токен от @BotFather>"
echo "   TELEGRAM_SUBSCRIBE_CODE=<код-пароль для подписки>"
echo " затем:  systemctl restart pomogarium"
echo
echo " Логи:      journalctl -u pomogarium -f"
echo " Статус:    systemctl status pomogarium"
echo " Проверка:  curl https://$DOMAIN/api/health"
echo "============================================================"
