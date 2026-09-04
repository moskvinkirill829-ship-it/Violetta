# Хостинг «Помогариум» — быстрый старт

## Что купить

| | Где | Цена | Зачем |
|---|---|---|---|
| **VPS** | [Timeweb Cloud](https://timeweb.cloud/) / [Selectel](https://selectel.ru/) / [Reg.ru Cloud](https://www.reg.ru/vps/) | ~250–450 ₽/мес | самый маленький тариф: 1 vCPU, 1 ГБ RAM, Ubuntu 22.04 |
| **Домен** | там же или [reg.ru](https://www.reg.ru/) | ~200 ₽/год (`.ru`) | адрес сайта |

Больше ничего не нужно: базы данных нет, заявки идут в Telegram + CSV.

> Проще без консоли — **[Amvera Cloud](https://amvera.ru/)** (git push → деплой, ~300 ₽/мес):
> создать проект, тип **Node.js**, команда запуска `npm start`, порт `3001`,
> переменные `TELEGRAM_BOT_TOKEN` и `TELEGRAM_SUBSCRIBE_CODE` — в настройках проекта.
> Дальше этот раздел можно не читать.

---

## Установка на VPS (10–15 минут)

### 1. Домен → сервер
В панели регистратора домена создайте **A-записи**:
```
@     →  IP вашего VPS
www   →  IP вашего VPS
```
Подождите 10–30 минут, пока обновится DNS.

### 2. Залить код на сервер
Подключитесь по SSH (`ssh root@IP`) и выберите способ:

**а) через GitHub** (удобно обновлять):
```bash
mkdir -p /opt/pomogarium
git clone https://github.com/ВАШ_АККАУНТ/ВАШ_РЕПО.git /opt/pomogarium/app
```

**б) архивом** (без GitHub): на своём компьютере запакуйте папку проекта
(без `node_modules`, `dist`, `server/.env`) в zip, загрузите на сервер
(`scp project.zip root@IP:/root/`) и распакуйте:
```bash
mkdir -p /opt/pomogarium/app
unzip /root/project.zip -d /opt/pomogarium/app
```

### 3. Запустить установку
```bash
cd /opt/pomogarium/app/deploy
DOMAIN=ваш-домен.ru bash setup.sh
```
Скрипт поставит Node 20, nginx, HTTPS-сертификат, systemd-сервис.

### 4. Вписать токен бота
```bash
nano /opt/pomogarium/app/server/.env
```
```
NODE_ENV=production
TELEGRAM_BOT_TOKEN=<токен от @BotFather>
TELEGRAM_SUBSCRIBE_CODE=<код-пароль для подписки>
CORS_ORIGIN=https://ваш-домен.ru
```
(токен и код — те, что вам передали отдельно, не через git)
```bash
systemctl restart pomogarium
```

### 5. Проверка
- Откройте `https://ваш-домен.ru` — сайт работает.
- В Telegram отправьте боту `/start ВАШ_КОД` — придёт «✅ Готово».
- Заполните форму на сайте — заявка придёт в Telegram.

---

## Обновление после правок в коде
```bash
cd /opt/pomogarium/app/deploy && bash update.sh
```

## Полезное
```bash
journalctl -u pomogarium -f          # логи в реальном времени
systemctl status pomogarium          # статус
systemctl restart pomogarium         # перезапуск
cat /opt/pomogarium/app/server/data/leads.csv   # резервная копия заявок
```

> ⚠️ Запускать нужно **один** экземпляр сервера — Telegram-бот работает через
> long-polling, два процесса с одним токеном дадут ошибку `409 Conflict`.
