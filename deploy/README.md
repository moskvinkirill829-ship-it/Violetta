# Хостинг «Помогариум» на Reg.ru

Приложение — **один Node-процесс** (Express раздаёт сайт + API + держит Telegram-бота).
Нужен обычный VPS с Linux. Serverless (Vercel/Netlify) **не подходит** — бот требует
постоянно живущий процесс.

---

## 1. Заказать VPS на Reg.ru

[reg.ru → Облачные серверы (VPS)](https://www.reg.ru/vps/cloud) →
самый младший тариф хватает:

- **ОС: Ubuntu 22.04** (важно — не CentOS, не панель ISPmanager)
- 1 vCPU, 1 ГБ RAM, 10 ГБ диск
- ~250–400 ₽/мес

После оплаты в панели / на почте будут **IP-адрес** и **root-пароль**.

## 2. (можно позже) Домен

Если домен на Reg.ru: в карточке домена → **DNS-серверы / Управление зоной** →
добавить **A-записи**:
```
@     →  IP вашего VPS
www   →  IP вашего VPS
```
DNS обновляется 10–60 минут. Без домена сайт откроется просто по `http://IP`.

## 3. Подключиться и развернуть

С Windows — через **PowerShell** или [PuTTY](https://www.putty.org/):
```bash
ssh root@IP_СЕРВЕРА          # ввести root-пароль

git clone https://github.com/moskvinkirill829-ship-it/Violetta.git /opt/pomogarium/app
cd /opt/pomogarium/app

# без домена:
bash deploy/setup.sh
# с доменом (когда A-записи уже прописаны):
DOMAIN=ваш-домен.ru bash deploy/setup.sh
```

Скрипт сам поставит Node 20, nginx, соберёт проект, настроит автозапуск (systemd),
а с доменом — ещё и бесплатный HTTPS-сертификат. Токен бота уже в `server/.env`
в репозитории, вписывать ничего не надо.

## 4. Проверка

```bash
curl http://localhost:3001/api/health          # -> {"ok":true}
```
- Открыть `http://IP` (или `https://домен`) — сайт работает.
- В Telegram боту **@Violetta\_Zayavki\_bot** отправить `/start Violletta2670` → «✅ Готово».
- Заполнить форму на сайте → заявка придёт в Telegram.

---

## Обновление после изменений в коде

```bash
cd /opt/pomogarium/app && bash deploy/update.sh
```

## Полезные команды

```bash
journalctl -u pomogarium -f        # логи в реальном времени
systemctl status pomogarium        # статус
systemctl restart pomogarium       # перезапуск
cat /opt/pomogarium/app/server/data/leads.csv        # резервная копия заявок
cat /opt/pomogarium/app/server/data/subscribers.json # кто подписан на заявки
```

## Сменить токен / код подписки

```bash
nano /opt/pomogarium/app/server/.env
systemctl restart pomogarium
```

---

> ⚠️ Запускать **один** экземпляр сервера. Telegram-бот работает через long-polling —
> два процесса с одним токеном дадут ошибку `409 Conflict` (и заявки перестанут ходить).
>
> ⚠️ Не берите на Reg.ru «Виртуальный хостинг» с панелью — там Node-приложения
> запускаются через Passenger, фоновый цикл бота может убиваться. Нужен именно **VPS**.
