# 🏪 DUNYO CRM

> Dunyo Supermarket uchun xodimlar boshqaruv va ish jarayonlari tizimi —
> **davomat, ish haqi, vazifalar, ta'tillar, mahsulotlar va bildirishnomalar** bir joyda.

<p align="left">
  <img alt="Python" src="https://img.shields.io/badge/Python-3.10+-3776AB?logo=python&logoColor=white">
  <img alt="FastAPI" src="https://img.shields.io/badge/FastAPI-0.136-009688?logo=fastapi&logoColor=white">
  <img alt="PostgreSQL" src="https://img.shields.io/badge/PostgreSQL-asyncpg-4169E1?logo=postgresql&logoColor=white">
  <img alt="React" src="https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black">
  <img alt="Vite" src="https://img.shields.io/badge/Vite-6-646CFF?logo=vite&logoColor=white">
  <img alt="TypeScript" src="https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white">
  <img alt="PWA" src="https://img.shields.io/badge/PWA-installable-5A0FC8?logo=pwa&logoColor=white">
</p>

---

## ✨ Asosiy imkoniyatlar

| Modul | Nima qiladi |
|-------|-------------|
| 👥 **Xodimlar** | Xodim, rahbar (leader) va filiallarni boshqarish |
| 🕒 **Davomat** | QR-kod orqali check-in/check-out, kechikish hisobi, **avtomatik absent/leave to'ldirish** (har tunda) |
| 💰 **Ish haqi** | Oylik hisob-kitob, davomatdan kelib chiqqan ushlanmalar, qo'lda tuzatishlar va to'lov tarixi |
| 📝 **Vazifalar** | Xodimlarga task biriktirish, holatini kuzatish |
| 🌴 **Ta'tillar** | Ta'til so'rovi → rahbar tasdig'i → davomatga `leave` sifatida o'tkazish |
| 📦 **Mahsulotlar** | YesPOS integratsiyasi — barcode bo'yicha mahsulot qidirish |
| 🔔 **Bildirishnomalar** | Real-vaqt (WebSocket) + Web Push (VAPID) qurilmaga push |
| 📊 **Dashboard** | Rahbar uchun umumiy ko'rsatkichlar va trendlar |
| 🧾 **Audit** | Tizimdagi muhim o'zgarishlar tarixi |

---

## 🏗️ Monorepo tuzilishi

```
dunyosupermarket/
├── server/    # Backend — FastAPI + PostgreSQL (async SQLAlchemy)
├── client/    # Frontend — React + Vite + TypeScript (PWA)
├── mobile/    # (rejada)
└── certs/     # Lokal HTTPS sertifikatlari (ixtiyoriy)
```

---

## 🚀 Ishga tushirish

Loyihada **ikki qism** mustaqil ishlaydi: avval backend, keyin frontend.

### 1. Backend (`server/`)

**Talablar:** Python 3.10+, PostgreSQL.

```bash
cd server

# 1) Virtual muhit
python -m venv .venv
source .venv/bin/activate        # Windows: .venv\Scripts\activate

# 2) Paketlar
pip install -r requirements.txt

# 3) Konfiguratsiya — namunadan .env yarating va to'ldiring
cp .env.example .env             # so'ng .env ichidagi qiymatlarni to'ldiring

# 4) Migratsiya (jadvallarni yaratish)
alembic upgrade head

# 5) Boshlang'ich superuser/seed (faqat birinchi marta)
python scripts/init_db.py

# 6) Serverni ishga tushirish — http://0.0.0.0:8000
python run.py
```

- API hujjatlari (faqat `DEBUG=true` bo'lsa): **http://localhost:8000/api/docs**
- Health-check: **http://localhost:8000/health**

> 🔒 **Xavfsizlik:** `DEBUG` production'da **`false`** bo'lishi shart — aks holda stack-trace va DB ulanish ma'lumotlari mijozga sizib chiqadi. `.env` git'ga **tushmaydi**.

### 2. Frontend (`client/`)

**Talablar:** Node.js 18+ (yoki Bun).

```bash
cd client

npm i            # paketlarni o'rnatish
npm run dev      # dev server (Vite)
npm run build    # production build
npm run preview  # build'ni lokal ko'rish
```

Frontend dev rejimida backendga **Vite proxy** orqali ulanadi, shuning uchun backend `:8000` da ishlab turishi kerak.

---

## ⚙️ Konfiguratsiya (`server/.env`)

Asosiy kalitlar (to'liq namuna — [`server/.env.example`](server/.env.example)):

| Kalit | Tavsif |
|-------|--------|
| `DATABASE_URL` | PostgreSQL ulanishi (`postgresql+asyncpg://...`) |
| `DEBUG` | Production'da `false` (majburiy) |
| `JWT_ACCESS_SECRET` / `JWT_REFRESH_SECRET` | JWT sirlari — har biri mustaqil, yuqori entropiyali |
| `SUPERUSER_*` | Boshlang'ich admin (faqat birinchi seed) |
| `VAPID_PUBLIC_KEY` / `VAPID_PRIVATE_KEY` | Web Push (bildirishnoma) kalitlari |
| `YESPOS_URL`, `YES_POS_*` | YesPOS integratsiyasi (barcode bo'yicha mahsulot) |
| `CORS_ORIGINS`, `ALLOWED_HOSTS` | Ruxsat etilgan domenlar |

> JWT sirini yaratish: `python -c "import secrets; print(secrets.token_urlsafe(64))"`

---

## 🧰 Texnologiyalar

**Backend**
- [FastAPI](https://fastapi.tiangolo.com/) + Uvicorn (ASGI)
- [SQLAlchemy 2.0](https://www.sqlalchemy.org/) (async) + **PostgreSQL** (asyncpg)
- [Alembic](https://alembic.sqlalchemy.org/) — migratsiyalar
- JWT autentifikatsiya · WebSocket (real-vaqt) · Web Push (VAPID)
- Sentry — xato kuzatuvi

**Frontend**
- [React 19](https://react.dev/) + [Vite 6](https://vite.dev/) + TypeScript
- [TanStack Query](https://tanstack.com/query) — server-state
- [MUI](https://mui.com/) + [Radix UI](https://www.radix-ui.com/) + [Tailwind CSS](https://tailwindcss.com/)
- React Router · React Hook Form + Zod · Recharts
- **PWA** (o'rnatiladigan, push bildirishnomalar bilan)

---

## 📁 Frontend arxitekturasi

Modul (feature) asosidagi arxitektura — "X qayerda?" degan savolga tezda javob:

```
client/src/
├── app/        router · providers · layouts · styles
├── modules/    auth · employee · attendance · salary · dashboard · task
│   │           notification · leave · audit · product · settings · branch · reminder
│   └── <modul>/  api · hooks · components · pages · types · constants · index.ts
└── shared/     ui · hooks · utils · lib(api) · types · config · assets
```

Batafsil:
- [`client/docs/MAP.md`](client/docs/MAP.md) — "2 soniyada topish" xaritasi (URL → fayl, nomlash qoidalari)
- [`client/docs/ARCHITECTURE.md`](client/docs/ARCHITECTURE.md) — arxitektura tamoyillari

---

## 🗄️ Backend arxitekturasi

Qatlamli (layered) tuzilish:

```
server/app/
├── routes/        # FastAPI endpoint'lar (HTTP/WS)
├── services/      # Biznes-logika
├── repositories/  # DB kirish qatlami
├── model/         # SQLAlchemy modellar
├── schemas/       # Pydantic sxemalar (request/response)
├── core/          # config · middleware · scheduler · timezone
├── enum/          # AttendanceStatus va boshqa enum'lar
├── helper/        # yordamchi funksiyalar
└── db/            # sessiya/engine
```

**Avtomatik davomat:** server ishga tushganda fon-loop har tunda **00:10** da kechagi kunni yopadi — kelmaganlarni `absent`, tasdiqlangan ta'tildagilarni `leave` qiladi (`core/attendance_scheduler.py`).

---

## 🧪 Testlar

```bash
cd server
pytest
```

---

## 📜 Litsenziya

Ichki loyiha — **Dunyo Supermarket**. Barcha huquqlar himoyalangan.
