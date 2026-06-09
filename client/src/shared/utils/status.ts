/** Backend davomat statusi → ko'rsatiladigan label. 3 ta sahifada takrorlanardi.
 *  Eslatma: reason (sababli) = max 2 kun PUL TO'LANADI; leave (ta'tilda) = PULSIZ. */
export const ATTENDANCE_BADGE: Record<string, string> = {
  came: "Keldi",
  left: "Keldi",        // check-out qilgan = kelgan
  late: "Kechikdi",
  absent: "Kelmadi",
  reason: "Sababli",    // sababli kelmadi — max 2 kun pul to'lanadi
  leave: "Ta'tilda",    // tasdiqlangan ta'til — pulsiz
  on_leave: "Ta'tilda",
};

/** Ko'rsatiladigan label → backend enum (teskari). Backend enum: came/late/absent/reason/leave */
export const STATUS_TO_BACKEND: Record<string, string> = {
  Keldi: "came",
  Kechikdi: "late",
  Kelmadi: "absent",
  Sababli: "reason",     // pul to'lanadi (max 2 kun)
  "Ta'tilda": "leave",   // pulsiz
};

/** Kalendar katakchasi rangi (davomat statusiga ko'ra) */
export const attendanceCalColor = (status?: string) => {
  if (status === "came" || status === "left") return "bg-success text-white shadow-sm";
  if (status === "late") return "bg-warning text-white shadow-sm";
  if (status === "absent") return "bg-destructive text-white shadow-sm";
  if (status === "reason") return "bg-amber-500 text-white shadow-sm";
  if (status === "leave" || status === "on_leave") return "bg-blue-500 text-white shadow-sm";
  return "bg-slate-50 text-slate-400 border border-slate-100";
};
