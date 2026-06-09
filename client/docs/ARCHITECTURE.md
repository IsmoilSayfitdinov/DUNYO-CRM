# Arxitektura — Module (Feature) Based

Loyiha **modul (feature) asosidagi** arxitekturaga ko'ra tashkil etilgan. Har bir biznes-domen — bitta **modul**, va o'sha domenga tegishli hamma narsa (api, hooks, types, components, pages) **bitta papkada**. "Hammasi qayerda?" — domenni ochasiz, ichida bor.

```
src/
├── app/                  # Ilova darajasi
│   ├── providers/        # QueryClient, AuthProvider kompozitsiyasi
│   ├── routes/           # createBrowserRouter + ProtectedRoute + NotFound
│   ├── layouts/          # AppLayout, Leader/EmployeeLayout
│   └── styles/           # global CSS
│
├── modules/              # Biznes-modullar (domen bo'yicha)
│   ├── auth/             # session, login, role-select
│   ├── employee/         # xodimlar (CRUD, detail, analytics, profil)
│   ├── attendance/       # davomat (me/team/scan/edit/trends)
│   ├── salary/           # ish haqi (history/summary/pay/calculate/adjust)
│   ├── dashboard/        # boshqaruv panellari + activity + reports
│   ├── task / notification / leave / audit / product / settings
│
└── shared/               # Domenga bog'liq bo'lmagan umumiy kod
    ├── ui/               # shadcn + StatusBadge, ScoreRing, EmptyState, MonthYearPicker, TimePicker, CustomSelect/DatePicker
    ├── hooks/            # use-mobile (umumiy hooklar)
    ├── utils/            # format (money/time), status (badge/calColor)
    ├── lib/              # cn (utils) + api/ (axios klient, token, interceptor)
    ├── types/            # umumiy tiplar (Paginated, PageParams)
    ├── config/           # i18n
    └── assets/
```

## Modul ichki tuzilishi

```
modules/<module>/
├── api/          # tarmoq so'rovlari (axios) + query-keys
├── hooks/        # React Query hooklari (useXQuery, useXMutation) + kontekst
├── components/   # modulning UI bloklari (modallar, sahifa qismlari)
├── pages/        # route darajasidagi sahifalar (ingichka — komponentlardan tuziladi)
├── types/        # modul tiplari
├── constants/    # mock ma'lumotlar, doimiylar
└── index.ts      # PUBLIC API (barrel) — tashqi import faqat shu orqali
```

## Qoidalar

- **Import faqat barrel orqali**: tashqi kod `@/modules/employee` dan import qiladi, ichki fayllarga to'g'ridan-to'g'ri murojaat qilmaydi. Modul ichida — **nisbiy** (`../api/...`) import (barrel siklini oldini olish uchun).
- **Sahifalar ingichka**: sahifa asosan komponentlarni kompozitsiya qiladi + ma'lumot olib, handlerlarni biriktiradi. Biznes-mantiq (so'rov, formatlash, transformatsiya) sahifada turmaydi.
- **Biznes-mantiq UI'dan ajratilgan**: so'rovlar → `api/`, React Query → `hooks/`, formatlash/util → `shared/utils` yoki `<module>/utils`, doimiylar → `constants/`.
- **Takror yo'q**: umumiy bloklar `shared/ui` (masalan `ScoreRing`), umumiy util `shared/utils` (`toHHMM`, `formatSom`, `ATTENDANCE_BADGE`).
- **Komponent 150–200 qatordan oshmasin** — oshsa, mayda komponentlarga bo'linadi (masalan `EmployeeDetail` → `components/employee-detail/*`).

## Misol: ingichka sahifa

```tsx
export function EmployeeDetail() {
  const { data: emp } = useEmployee(id);
  // ...
  return (
    <>
      <EmployeeProfileHeader emp={emp} ... />
      <EmployeeStatsGrid attRows={attRows} ... />
      <AttendanceCalendar period={period} ... />
      <SalaryHistoryCard salaryData={salaryData} />
      <AttendanceRecordsTable attRows={attRows} ... />
      <ManagerNotes />
    </>
  );
}
```

## Eslatma
- TypeScript o'rnatilmagan; `npm run build` (Vite/esbuild) yagona resolve tekshiruvi. **Eslatma:** esbuild aniqlanmagan o'zgaruvchini ushlamaydi (faqat importlarni) — o'zgaruvchi o'chirilganда `grep` bilan tekshiring.
- Backend endpointi bo'lmagan modullar (task, notification, leave, audit) hozircha mock ishlatadi (`constants/mock.ts`).
