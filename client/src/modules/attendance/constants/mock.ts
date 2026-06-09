export const attendanceTrend = [
  { date: "Mar 6", present: 8, absent: 1, late: 1 },
  { date: "Mar 7", present: 9, absent: 1, late: 0 },
  { date: "Mar 8", present: 7, absent: 2, late: 1 },
  { date: "Mar 9", present: 8, absent: 0, late: 2 },
  { date: "Mar 10", present: 9, absent: 1, late: 0 },
  { date: "Mar 11", present: 8, absent: 1, late: 1 },
  { date: "Mar 12", present: 7, absent: 2, late: 1 },
  { date: "Mar 13", present: 6, absent: 2, late: 2 },
];

export const attendanceMethodData = [
  { name: "QR Code", value: 100, color: "#dc2626" },
];

export const attendanceRecords = [
  { id: 1, employee: "Alisher Karimov", employeeId: 1, date: "2026-03-13", checkIn: "08:57", checkOut: "18:04", method: "QR", manager: "Self", status: "Present", notes: "" },
  { id: 2, employee: "Nilufar Yusupova", employeeId: 2, date: "2026-03-13", checkIn: "09:01", checkOut: "18:00", method: "QR", manager: "Self", status: "Present", notes: "" },
  { id: 3, employee: "Jasur Toshmatov", employeeId: 3, date: "2026-03-13", checkIn: "10:34", checkOut: "", method: "QR", manager: "Alisher Karimov", status: "Late", notes: "Arrived 34 min late" },
  { id: 4, employee: "Dilnoza Khasanova", employeeId: 4, date: "2026-03-13", checkIn: "08:58", checkOut: "18:02", method: "QR", manager: "Nilufar Yusupova", status: "Present", notes: "" },
  { id: 5, employee: "Bobur Rakhimov", employeeId: 5, date: "2026-03-13", checkIn: "", checkOut: "", method: "-", manager: "-", status: "Absent", notes: "No contact" },
  { id: 6, employee: "Feruza Mirzayeva", employeeId: 6, date: "2026-03-13", checkIn: "08:55", checkOut: "18:00", method: "QR", manager: "Nilufar Yusupova", status: "Present", notes: "" },
  { id: 7, employee: "Sardor Nazarov", employeeId: 7, date: "2026-03-13", checkIn: "10:02", checkOut: "", method: "QR", manager: "Alisher Karimov", status: "Present", notes: "" },
  { id: 8, employee: "Zulfiya Abdullayeva", employeeId: 8, date: "2026-03-13", checkIn: "08:50", checkOut: "18:00", method: "QR", manager: "Self", status: "Present", notes: "" },
  { id: 9, employee: "Umid Ergashev", employeeId: 9, date: "2026-03-13", checkIn: "", checkOut: "", method: "-", manager: "-", status: "On Leave", notes: "Annual leave approved" },
  { id: 10, employee: "Malika Sobirova", employeeId: 10, date: "2026-03-13", checkIn: "10:22", checkOut: "", method: "QR", manager: "Alisher Karimov", status: "Late", notes: "Arrived 22 min late" },
];

export const pendingVerifications = [
  { id: 1, employee: "Malika Sobirova", employeeId: 10, type: "QR Scan Timeout", confidence: null, time: "10:18", date: "2026-03-13", details: "QR scan took longer than expected. Requires verification.", severity: "warning" },
  { id: 2, employee: "Bobur Rakhimov", employeeId: 5, type: "Duplicate QR Scan", confidence: null, time: "09:45", date: "2026-03-13", details: "QR code scanned twice within 5 minutes from different locations.", severity: "critical" },
  { id: 3, employee: "Jasur Toshmatov", employeeId: 3, type: "Late Check-In Without Reason", confidence: null, time: "10:34", date: "2026-03-13", details: "Employee checked in 34 minutes after shift start. No notification sent.", severity: "warning" },
];

export const weeklyHeatmap = [
  { day: "Mon", "07:00": 1, "08:00": 4, "09:00": 3, "10:00": 1, "11:00": 0, "12:00": 0, "17:00": 2, "18:00": 1 },
  { day: "Tue", "07:00": 0, "08:00": 5, "09:00": 3, "10:00": 2, "11:00": 0, "12:00": 0, "17:00": 1, "18:00": 3 },
  { day: "Wed", "07:00": 1, "08:00": 3, "09:00": 4, "10:00": 2, "11:00": 0, "12:00": 0, "17:00": 3, "18:00": 2 },
  { day: "Thu", "07:00": 0, "08:00": 5, "09:00": 2, "10:00": 3, "11:00": 0, "12:00": 0, "17:00": 2, "18:00": 3 },
  { day: "Fri", "07:00": 2, "08:00": 4, "09:00": 4, "10:00": 1, "11:00": 0, "12:00": 0, "17:00": 4, "18:00": 2 },
];

export const myAttendance = [
  { date: "Mar 13, 2026", checkIn: "10:34", checkOut: "-", method: "QR", status: "Late", duration: "-" },
  { date: "Mar 12, 2026", checkIn: "10:02", checkOut: "19:00", method: "QR", status: "Present", duration: "8h 58m" },
  { date: "Mar 11, 2026", checkIn: "10:01", checkOut: "19:05", method: "QR", status: "Present", duration: "9h 04m" },
  { date: "Mar 10, 2026", checkIn: "10:15", checkOut: "19:00", method: "QR", status: "Late", duration: "8h 45m" },
  { date: "Mar 9, 2026", checkIn: "10:00", checkOut: "19:00", method: "QR", status: "Present", duration: "9h 00m" },
  { date: "Mar 8, 2026", checkIn: "", checkOut: "", method: "-", status: "Absent", duration: "-" },
  { date: "Mar 7, 2026", checkIn: "10:00", checkOut: "19:02", method: "QR", status: "Present", duration: "9h 02m" },
  { date: "Mar 6, 2026", checkIn: "09:58", checkOut: "19:00", method: "QR", status: "Present", duration: "9h 02m" },
];
