/** Ta'til turlari — backend qiymati (value) + o'zbekcha ko'rinish (label). */
export const LEAVE_TYPE_OPTIONS = [
  { value: "Annual Leave", label: "Yillik mehnat ta'tili" },
  { value: "Sick Leave", label: "Kasalik ta'tili" },
  { value: "Personal Leave", label: "Shaxsiy sabab" },
  { value: "Emergency Leave", label: "Favqulodda ta'til" },
  { value: "Unpaid Leave", label: "Ish haqisiz ta'til" },
];

/** Ko'rsatish uchun: xom (inglizcha) turdan o'zbekcha labelni topadi. */
export const leaveTypeLabel = (t: string) =>
  LEAVE_TYPE_OPTIONS.find((o) => o.value === t)?.label ?? t;
