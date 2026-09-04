#!/usr/bin/env bash
# ============================================================
#  Обновление «Помогариум» после изменений в коде.
#  Запускать НА СЕРВЕРЕ от root:  bash update.sh
# ============================================================
set -euo pipefail

APP_DIR="/opt/pomogarium/app"
APP_USER="pomogarium"

cd "$APP_DIR"

if [[ -d .git ]]; then
  echo "==> git pull"
  sudo -u "$APP_USER" git pull --ff-only
else
  echo "Репозиторий не git — залейте новый код в $APP_DIR (rsync/scp) и запустите снова."
fi

echo "==> npm ci + build"
sudo -u "$APP_USER" bash -c "cd $APP_DIR && npm ci && npm run build"

echo "==> restart"
systemctl restart pomogarium
sleep 2
systemctl --no-pager status pomogarium | head -n 12
echo
curl -fsS http://127.0.0.1:3001/api/health && echo " <- API отвечает"
