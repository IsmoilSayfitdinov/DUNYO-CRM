# 🗺️ Loyiha xaritasi — "2 soniyada topish"

Bu fayl bitta savolga javob beradi: **"X qayerda / X ni qayerga qo'shaman?"** — qidirib o'tirmang, shu jadvaldan toping.

---

## 1. "Men X qilmoqchiman → BU yerga"

| Nima qilmoqchiman | Qayerga |
|-------------------|---------|
| Yangi **API so'rov** (axios) | `modules/<modul>/api/<modul>-api.ts` |
| Yangi **React Query hook** (useX) | `modules/<modul>/hooks/use-*.ts` |
| Yangi **UI komponent** (karta, jadval, modal) | `modules/<modul>/components/` |
| Yangi **sahifa** | `modules/<modul>/pages/X.tsx` **+** `app/routes/index.ts` ga qo'shish |
| **Tip** (interface) qo'shish/o'zgartirish | `modules/<modul>/types/` |
| **Mock ma'lumot** | `modules/<modul>/constants/mock.ts` |
| Modulning **public API** si (tashqi import) | `modules/<modul>/index.ts` (barrel) |
| **Umumiy** tugma/karta/badge (hamma joyда) | `shared/ui/` |
| **Format/util** (pul, vaqt, status) | `shared/utils/` |
| **axios klient / token / interceptor** | `shared/lib/api/` |
| **Marshrut (URL ↔ sahifa)** | `app/routes/index.ts` |
| **Sidebar / Topbar / pastki menyu** | `app/layouts/` |
| **Global provayder** (theme, query-client) | `app/providers/index.tsx` |
| **Global CSS / rang / shrift** | `app/styles/` |

> **Qoida:** modul ichidan boshqa moduldan import — faqat `@/modules/<x>` (barrel) orqali. Modul **ichida** — nisbiy (`../api/...`).

---

## 2. URL → fayl (brauzerда ko'rgan sahifa qayerda)

**Leader:**
| URL | Fayl |
|-----|------|
| `/leader` | `modules/dashboard/pages/LeaderDashboard.tsx` |
| `/leader/staff` | `modules/employee/pages/EmployeeManagement.tsx` |
| `/leader/employees` | `modules/employee/pages/EmployeeAnalytics.tsx` |
| `/leader/employees/:id` | `modules/employee/pages/EmployeeDetail.tsx` |
| `/leader/today` | `modules/attendance/pages/TodayEmployees.tsx` |
| `/leader/records` | `modules/attendance/pages/AttendanceRecords.tsx` |
| `/leader/attendance` | `modules/attendance/pages/AttendanceAnalytics.tsx` |
| `/leader/verification` | `modules/attendance/pages/PendingVerification.tsx` |
| `/leader/salary` | `modules/salary/pages/SalaryAnalytics.tsx` |
| `/leader/tasks` | `modules/task/pages/ManagerTasks.tsx` |
| `/leader/leave` | `modules/leave/pages/LeaveRequests.tsx` |
| `/leader/reports` | `modules/dashboard/pages/Reports.tsx` |
| `/leader/audit` | `modules/audit/pages/AuditLogs.tsx` |
| `/leader/settings` | `modules/settings/pages/SettingsPage.tsx` |

**Employee:**
| URL | Fayl |
|-----|------|
| `/employee` | `modules/dashboard/pages/EmployeeDashboard.tsx` |
| `/employee/profile` | `modules/employee/pages/MyProfile.tsx` |
| `/employee/scanner` | `modules/attendance/pages/Scanner.tsx` |
| `/employee/attendance` | `modules/attendance/pages/MyAttendance.tsx` |
| `/employee/salary` | `modules/salary/pages/MySalary.tsx` |
| `/employee/products` | `modules/product/pages/Products.tsx` |
| `/employee/tasks` | `modules/task/pages/MyTasks.tsx` |
| `/employee/leave` | `modules/leave/pages/MyLeaveRequests.tsx` |
| `/employee/notifications` | `modules/notification/pages/Notifications.tsx` |
| `/employee/settings` | `modules/settings/pages/Settings.tsx` |
| `/` (login) | `modules/auth/pages/Login.tsx` |

---

## 3. Modul → nimaga egasi + backend

| Modul | Egasi (domen) | Backend endpoint | API bormi? |
|-------|----------------|------------------|-----------|
| **auth** | login, sessiya, token, /me | `/auth/*` | ✅ |
| **employee** | xodim CRUD, detail, profil, analitika | `/employees/*` | ✅ |
| **attendance** | davomat, scan, team, trends, tahrirlash | `/attendance/*` | ✅ |
| **salary** | ish haqi, summary, pay/calculate/adjust | `/salary-history/*` | ✅ |
| **dashboard** | panellar, activity feed, hisobotlar | — | 🟡 qisman/mock |
| **task** | vazifalar | — | ❌ mock |
| **notification** | bildirishnomalar | — | ❌ mock |
| **leave** | ta'til so'rovlari | — | ❌ mock |
| **audit** | audit jurnali | — | ❌ mock |
| **product** | mahsulotlar (QR/skaner) | tashqi (yespos) | 🟡 |
| **settings** | sozlamalar sahifalari | — | ❌ mock |

---

## 4. Har modul bir xil shaklда (shuning uchun bashorat qilsa bo'ladi)

```
modules/<modul>/
├── api/          → tarmoq so'rovlari (axios) + query-keys.ts
├── hooks/        → React Query hooklari (useX query/mutation)
├── components/   → modulning UI bloklari (modal, karta, jadval, <sahifa>/ qism-komponentlar)
├── pages/        → route sahifalari (INGICHKA — faqat ma'lumot + kompozitsiya)
├── types/        → modul tiplari (interface)
├── constants/    → mock ma'lumot, doimiylar
└── index.ts      → PUBLIC API (barrel) — tashqi import faqat shu orqali
```

> Mock-modullar (task, leave, audit, notification) faqat `constants/` + `pages/` + `index.ts` dan iborat — backend qo'shilгач `api/` + `hooks/` qo'shasiz.

---

## 5. Nomlash qoidalari (fayl nomidan vazifani biling)

| Tur | Naqsh | Misol |
|-----|-------|-------|
| Sahifa | `PascalCase.tsx` | `EmployeeDetail.tsx` |
| Komponent | `PascalCase.tsx` | `EmployeeProfileHeader.tsx` |
| Hook | `use-kebab.ts` | `use-employee-queries.ts` |
| API | `<modul>-api.ts` | `employee-api.ts` |
| Barrel | `index.ts` | har papkada |

---

## 6. Tez misollar

**"Xodimga yangi maydon qo'shaman" (masalan `email`):**
1. `modules/employee/types/index.ts` → `Employee` ga `email` qo'shasiz
2. `modules/employee/components/AddEditEmployeeModal.tsx` → formaga input
3. Tamom (api/hook avtomatik o'tkazadi)

**"Yangi sahifa qo'shaman" (masalan `/leader/holidays`):**
1. `modules/<mos-modul>/pages/Holidays.tsx` yozasiz
2. `app/routes/index.ts` → `{ path: "holidays", Component: Holidays }` + import
3. `app/layouts/components/config.tsx` → sidebar menyusiga qo'shasiz

**"Davomat sahifasidagi grafikни o'zgartiraman":**
→ `modules/attendance/components/attendance-analytics/DailyTrendChart.tsx` (sahifa emas, shu komponent)
