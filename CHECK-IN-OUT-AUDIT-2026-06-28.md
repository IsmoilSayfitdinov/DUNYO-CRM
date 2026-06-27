# Check-in / Check-out Audit — 2026-06-28

> **Maqsad:** "Check-in va check-out to'g'ri ishlayaptimi, ko'payib (duplicate) yoki
> noto'g'ri bo'lib ketmayaptimi?" — degan savolga **taxmin emas, dalil bilan** javob.
>
> **Usul:** Kod o'qildi + jonli DB (`dunyo_db`) tekshirildi + race scenariylar SQL bilan
> reproduksiya qilindi. Hamma test `ROLLBACK` bilan — DB o'zgarmadi.

---

## TL;DR (qisqa xulosa)

| Savol | Holat |
|-------|-------|
| Oddiy check-in 2 marta bosilsa duplicate row bo'ladimi? | ✅ **YO'Q** — DB unique index bloklaydi (jonli tasdiqlandi) |
| Hozir DB'da duplicate / buzuq yozuv bormi? | ✅ **YO'Q** — barcha integrity tekshiruvlari toza |
| Hozir kimdir "lockout" (kira ham, chiqa ham olmaydigan) holatdami? | ✅ **YO'Q** — hozircha hech kim |
| Kelajakda muammo chiqishi mumkinmi? | ⚠️ **HA, 3 ta nozik holatda** — pastda |

**Bir jumlada:** Normal foydalanishda hammasi to'g'ri ishlaydi. Lekin himoyaning hammasi
**bitta DB index**ga tayanadi, va u index faqat **yangi row qo'shish** (INSERT) ni
bloklaydi — **mavjud row'ni yangilash** (UPDATE) va **eski ochiq smena** holatlarini emas.

---

## 1. Arxitektura — qanday ishlaydi (5 daqiqada)

```
QR skan  ──▶ POST /attendance/scan ─┐
NFC tap  ──▶ POST /attendance/nfc  ─┴─▶ AttendanceService
                                          │
                  ┌───────────────────────┴───────────────────────┐
                  │ get_open() bormi?                              │
                  │   HA  ─▶ check_out (status=left, check_out=now)│
                  │   YO'Q ─▶ check_in (status=came/late)          │
                  └───────────────────────────────────────────────┘
                                          │
                                   DB: attendances jadvali
```

**Duplicate'dan himoya — yagona mexanizm:** PostgreSQL'dagi *partial unique index*:

```sql
CREATE UNIQUE INDEX uq_attendance_open_per_employee
  ON attendances (employee_id)
  WHERE check_out IS NULL AND status IN ('came','late');
```

**Bu nima qiladi?** "Bitta xodimda bir vaqtda faqat BITTA ochiq smena bo'lsin." Agar
ikkinchi ochiq smena yaratilmoqchi bo'lsa — DB `IntegrityError` beradi, kod uni ushlab
`409 Conflict` qaytaradi.

> 💡 **Analogiya:** Bu index — kinoteatrdagi "bitta odam bitta o'rindiq" qoidasi.
> Lekin u faqat **yangi chipta sotishni** tekshiradi (INSERT). Agar kimdir allaqachon
> o'tirgan odamning chiptasini **qayta yozsa** (UPDATE) — qoida buni ko'rmaydi.

---

## 2. Nima TO'G'RI ishlayapti (dalil bilan)

### ✅ 2.1. Oddiy ikki marta check-in — bloklanadi
Jonli test: bitta xodimga ikkita ochiq `came` row qo'shishga urindik →
```
ERROR: duplicate key value violates unique constraint "uq_attendance_open_per_employee"
```
**Demak:** Eng keng tarqalgan holat ("xodim sabrsizlik bilan 2 marta skanerladi") — himoyalangan.

### ✅ 2.2. Schema to'g'ri sozlangan
- `check_in` / `check_out` = `timestamp with time zone` (UTC saqlanadi, mahalliy vaqtda hisoblanadi) ✓
- `is_late` ustuni bor (check-out'dan keyin ham saqlanadi, reyting uchun) ✓
- Enum: `came/late/left/absent/leave/reason` — hammasi bor ✓

### ✅ 2.3. DB'da hozir buzuq yozuv YO'Q
Tekshirildi va hammasi toza:
- `check_out < check_in` (manfiy davomiylik) → **0 ta**
- `absent/leave` bo'lib turib check_in/out bor → **0 ta**
- Bir kunda bir xodimda dublikat `came/late/left` → **0 ta**
- `left` bo'lib check_out yo'q → **0 ta**
- check_out bor lekin check_in yo'q → **0 ta**

### ✅ 2.4. O'ylab qilingan himoyalar (kodda)
- **Yarim tunni kesuvchi smena** (22:00–06:00) — `_is_late` to'g'ri hisoblaydi.
- **NaN/Infinity GPS** bilan geo-fence'ni aldash — bloklangan.
- **MIN_REST_HOURS=6** — bir smenadan keyin darhol qayta kirib ikkinchi pul olishning oldini oladi.
- **MAX_SHIFT_HOURS=16** — pul hisobida (`worked_hours`) smena 16 soatga cheklanadi.
- **Placeholder qayta ishlatish** — avto-job "absent" yozsa, xodim kelganda yangi row emas, o'sha row yangilanadi.

---

## 3. Topilgan ZAIFLIKLAR (kelajakdagi xavf)

> Bularning hammasi **race condition** (poyga) — ya'ni *bir vaqtda ikki so'rov*
> kelganda yuzaga keladi. Hozir DB'da zarari yo'q, lekin yuk oshganda chiqishi mumkin.
>
> **Ildiz sabab:** Hech qanday **qulf (lock)** yo'q (`with_for_update`, `version_id_col`,
> serializable izolatsiya — hech biri ishlatilmagan). Butun himoya bitta index'ga tayanadi,
> u esa faqat INSERT-vs-INSERT'ni ushlaydi.

### ⚠️ 3.1. Placeholder'ni bir vaqtda yangilash (UPDATE race)
**Holat:** Avto-job bugun "absent" yozgan. Xodim deyarli bir vaqtda 2 marta skanerladi.
Ikkala so'rov ham o'sha **bir xil** absent row'ni o'qiydi va ikkalasi ham uni `came` ga
o'zgartiradi.

**Jonli test natijasi:** Ikkala UPDATE ham **xatosiz** o'tdi. Index ushlamadi
(chunki yangi row YO'Q — bitta row ikki marta yozildi).

**Zarari:** Duplicate ROW **emas** (bu yaxshi). Lekin:
- Birinchi so'rovning check-in vaqti / izohi **jimgina yo'qoladi** (overwrite).
- Ikkita "check-in muvaffaqiyatli" bildirishnomasi keladi.

**Xavf darajasi:** O'rta (ma'lumot yo'qolishi, lekin pul dublikati emas).

### ⚠️ 3.2. Check-out'ni bir vaqtda bosish (UPDATE race)
**Holat:** Ikkita check-out so'rovi bir vaqtda. Ikkalasi ham bir xil ochiq row'ni
ko'radi, ikkalasi ham `check_out=now` qo'yadi.

**Zarari:** Ikki marta to'lov **EMAS** (bitta row qoladi). Lekin:
- Yakuniy `check_out` vaqti aniq emas (qaysi so'rov oxiri yozsa — o'sha).
- Ikkita "ish kuni yakunlandi" bildirishnomasi.

**Xavf darajasi:** Past (asosan UX/notifikatsiya muammosi).

### 🔴 3.3. 2 kundan ortiq ochiq smena → LOCKOUT (eng jiddiy)
**Bu eng muhim topilma.** Sabab — ikki joyda **mos kelmaydigan filtr**:

| Joy | Sana filtri |
|-----|-------------|
| `get_open()` (kod, ochiq smenani topadi) | `work_date >= bugun − 1 kun` ❗ |
| Unique index (DB) | **sana filtri YO'Q** |

**Stsenariy:**
1. Xodim check-out qilishni unutdi, smena 3 kun ochiq qoldi (`work_date = bugun−3`).
2. Bu row **index uchun "ochiq slot"ni egallaydi**, lekin `get_open()` uni **ko'rmaydi** (juda eski).
3. Xodim **check-in** qilmoqchi → `get_open()` "ochiq yo'q" deydi → yangi row INSERT →
   index eski row bilan to'qnashadi → `409 "Avval check-out qiling"`.
4. Xodim **check-out** qilmoqchi → `get_open()` baribir eski row'ni topolmaydi →
   `400 "Avval check-in qiling"`.
5. **Natija:** Xodim na kira oladi, na chiqa oladi. **Qulflanib qoldi.**
   Faqat rahbar qo'lda (PATCH) yoki DB orqali tuzata oladi.

**Jonli test:** Hozir bunday holat **YO'Q** (`work_date <= bugun−2` bo'lgan ochiq smena topilmadi).
Ya'ni bug mavjud, ammo **hali hech kimga tegmagan**. Eski 63 soatlik test smenasi (10–13 iyun)
o'sha vaqtdagi himoyalardan oldin paydo bo'lgan.

**Xavf darajasi:** Yuqori (bitta xodim butunlay ishlay olmay qolishi mumkin).

---

## 4. Migration holati — ✅ TOZA (avvalgi xavotir noto'g'ri edi)

> **Tuzatish:** Auditning birinchi qoralamasida "alembic qotib qolgan" deb yozilgan edi.
> `alembic history` bilan chuqurroq tekshirgach, bu **noto'g'ri** ekani aniqlandi.

`alembic current` = `5afe90e55b27` **VA** `alembic heads` = `5afe90e55b27` —
ikkisi **bir xil**, ya'ni DB **to'liq yangilangan** (current == head).

Migration zanjiri to'liq va to'g'ri ulangan:
```
... f1a2b3c4d5e6 (is_late) → ... → a1b2c3d4e5f7 (index fix) → 5afe90e55b27 (nfc, HEAD)
```

`a1b2c3d4e5f7` (index fix) va `f1a2b3c4d5e6` (is_late) head'dan **oldin** turadi, demak
ular allaqachon qo'llangan — bu DB tekshiruvi bilan mos (index bor, is_late bor, enum to'liq).

**Xulosa:** `alembic upgrade head` xavfsiz (qiladigan ishi yo'q), `alembic stamp` kerak emas.

> 💡 **Saboq:** "alembic current" ni "alembic heads" bilan solishtirib ko'rmasdan
> xulosa chiqarmaslik kerak. `current == head` bo'lsa — hammasi joyida.

---

## 5. Auditor xulosasi

**Bugungi savolga javob:** ✅ **Check-in/check-out hozir to'g'ri ishlayapti.**
Oddiy foydalanishda duplicate ham, buzuq yozuv ham chiqmaydi — buni jonli DB testlari
bilan tasdiqladim. DB'da hozir hech qanday anomaliya yo'q (bitta eski test yozuvidan tashqari).

**Lekin "100% ishonch" uchun bilib qo'yish kerak:** Butun himoya **bitta DB index**ga
tayanadi. U INSERT-vs-INSERT (eng keng tarqalgan holat)ni ushlaydi, ammo:
- UPDATE-vs-UPDATE (3.1, 3.2) — ushlamaydi (zarari yengil).
- 2 kundan eski ochiq smena (3.3) — lockout xavfi (zarari og'ir, lekin hozir yuz bermagan).

Bular **shoshilinch emas** (hozir hech kimga zarar yetmagan), lekin **bilingan xavf** —
yuk oshganda yoki kimdir check-out'ni unutganda yuzaga chiqishi mumkin.

---

### Tekshirilgan fayllar
- `server/app/services/attendance_services.py` — check_in / check_out / scan / nfc
- `server/app/repositories/attendance_repository.py` — get_open / placeholder / count
- `server/app/model/attendance.py` — unique index
- `server/app/core/timezone.py` — UTC↔mahalliy vaqt
- `server/app/db/database.py` — session (qulf yo'q)
- `server/migrations/versions/a1b2c3d4e5f7_*.py` — index migration

### Tekshirish usuli
Jonli `dunyo_db` (PostgreSQL 14, host:5432) — schema, mavjud ma'lumot integrity'si,
va race scenariylar SQL bilan reproduksiya qilindi (hammasi `ROLLBACK`, DB o'zgarmadi).
