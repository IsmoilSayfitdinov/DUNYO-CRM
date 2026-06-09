export const employees = [
  { id: 1, name: "Alisher Karimov", role: "Operations Manager", department: "Operations", phone: "+998 90 123-4567", shift: "09:00 – 18:00", joinDate: "2021-03-15", email: "alisher@dunyo.uz", attendancePct: 96, punctuality: 94, score: 92, salary: 4200000, salaryStatus: "Paid", isManager: true, today: "Present" },
  { id: 2, name: "Nilufar Yusupova", role: "HR Manager", department: "Human Resources", phone: "+998 93 234-5678", shift: "09:00 – 18:00", joinDate: "2022-01-10", email: "nilufar@dunyo.uz", attendancePct: 98, punctuality: 97, score: 96, salary: 3800000, salaryStatus: "Paid", isManager: true, today: "Present" },
  { id: 3, name: "Jasur Toshmatov", role: "Senior Developer", department: "Engineering", phone: "+998 91 345-6789", shift: "10:00 – 19:00", joinDate: "2022-06-20", email: "jasur@dunyo.uz", attendancePct: 94, punctuality: 89, score: 88, salary: 5500000, salaryStatus: "Paid", isManager: false, today: "Late" },
  { id: 4, name: "Dilnoza Khasanova", role: "Product Designer", department: "Product", phone: "+998 94 456-7890", shift: "09:00 – 18:00", joinDate: "2023-02-14", email: "dilnoza@dunyo.uz", attendancePct: 97, punctuality: 95, score: 94, salary: 4800000, salaryStatus: "Paid", isManager: false, today: "Present" },
  { id: 5, name: "Bobur Rakhimov", role: "Frontend Developer", department: "Engineering", phone: "+998 95 567-8901", shift: "10:00 – 19:00", joinDate: "2022-09-05", email: "bobur@dunyo.uz", attendancePct: 85, punctuality: 72, score: 71, salary: 4500000, salaryStatus: "Unpaid", isManager: false, today: "Absent" },
  { id: 6, name: "Feruza Mirzayeva", role: "HR Specialist", department: "Human Resources", phone: "+998 90 678-9012", shift: "09:00 – 18:00", joinDate: "2021-11-08", email: "feruza@dunyo.uz", attendancePct: 99, punctuality: 98, score: 97, salary: 3200000, salaryStatus: "Paid", isManager: false, today: "Present" },
  { id: 7, name: "Sardor Nazarov", role: "Backend Developer", department: "Engineering", phone: "+998 93 789-0123", shift: "10:00 – 19:00", joinDate: "2023-05-22", email: "sardor@dunyo.uz", attendancePct: 88, punctuality: 82, score: 80, salary: 4900000, salaryStatus: "Paid", isManager: false, today: "Present" },
  { id: 8, name: "Zulfiya Abdullayeva", role: "Accountant", department: "Finance", phone: "+998 91 890-1234", shift: "09:00 – 18:00", joinDate: "2020-07-30", email: "zulfiya@dunyo.uz", attendancePct: 100, punctuality: 100, score: 99, salary: 3600000, salaryStatus: "Paid", isManager: false, today: "Present" },
  { id: 9, name: "Umid Ergashev", role: "Marketing Lead", department: "Marketing", phone: "+998 94 901-2345", shift: "09:00 – 18:00", joinDate: "2023-01-16", email: "umid@dunyo.uz", attendancePct: 91, punctuality: 86, score: 85, salary: 3900000, salaryStatus: "Unpaid", isManager: false, today: "On Leave" },
  { id: 10, name: "Malika Sobirova", role: "Mobile Developer", department: "Engineering", phone: "+998 95 012-3456", shift: "10:00 – 19:00", joinDate: "2023-08-01", email: "malika@dunyo.uz", attendancePct: 93, punctuality: 90, score: 88, salary: 4700000, salaryStatus: "Paid", isManager: false, today: "Late" },
];

export const managerActivity = [
  { manager: "Alisher Karimov", managerId: 1, qrScans: 34, faceScans: 12, manualEntries: 4, approvals: 3, rejections: 1, suspicious: 1 },
  { manager: "Nilufar Yusupova", managerId: 2, qrScans: 28, faceScans: 18, manualEntries: 2, approvals: 5, rejections: 2, suspicious: 0 },
];

export const managers = [
  { id: 1, name: "Alisher Karimov", role: "Operations Manager", department: "Operations", phone: "+998 90 123-4567", email: "alisher@dunyo.uz", shift: "09:00 – 18:00", joinDate: "2021-03-15", managedCount: 4, status: "Active", qrScans: 34, approvals: 3, suspicious: 1 },
  { id: 2, name: "Nilufar Yusupova", role: "HR Manager", department: "Human Resources", phone: "+998 93 234-5678", email: "nilufar@dunyo.uz", shift: "09:00 – 18:00", joinDate: "2022-01-10", managedCount: 3, status: "Active", qrScans: 28, approvals: 5, suspicious: 0 },
];

export const myEmployee = {
  id: 3,
  name: "Jasur Toshmatov",
  role: "Senior Developer",
  department: "Engineering",
  phone: "+998 91 345-6789",
  email: "jasur@dunyo.uz",
  shift: "10:00 – 19:00",
  joinDate: "2022-06-20",
  salary: 5500000,
  salaryStatus: "Paid",
  attendancePct: 94,
  punctuality: 89,
  score: 88,
  today: "Late",
  checkIn: "10:34",
  checkOut: "",
};
