import { createBrowserRouter } from "react-router";
import React from "react";

import { NotFound } from "./NotFound";
import { Login } from "@/modules/auth/pages/Login";
import { ProtectedRoute } from "./ProtectedRoute";
import { withComingSoon } from "@/shared/ui/ComingSoon";

// Leader
import { LeaderLayout } from "@/app/layouts";
import { LeaderDashboard } from "@/modules/dashboard/pages/LeaderDashboard";
import { AttendanceAnalytics } from "@/modules/attendance/pages/AttendanceAnalytics";
import { EmployeeDetail } from "@/modules/employee/pages/EmployeeDetail";
import { SalaryAnalytics } from "@/modules/salary/pages/SalaryAnalytics";
import { LeaveRequests } from "@/modules/leave/pages/LeaveRequests";
import { Reports } from "@/modules/dashboard/pages/Reports";
import { AuditLogs } from "@/modules/audit/pages/AuditLogs";
import { SettingsPage } from "@/modules/settings/pages/SettingsPage";
import { EmployeeManagement } from "@/modules/employee/pages/EmployeeManagement";
import { Branches } from "@/modules/branch";

// Leader — operatsion sahifalar (avval manager'da edi)
import { TodayEmployees } from "@/modules/attendance/pages/TodayEmployees";
import { AttendanceRecords } from "@/modules/attendance/pages/AttendanceRecords";
import { PendingVerification } from "@/modules/attendance/pages/PendingVerification";
import { ManagerTasks } from "@/modules/task/pages/ManagerTasks";
import { LeaderReminders } from "@/modules/reminder";

// Employee
import { EmployeeLayout } from "@/app/layouts";
import { EmployeeDashboard } from "@/modules/dashboard/pages/EmployeeDashboard";
import { MyProfile } from "@/modules/employee/pages/MyProfile";
import { Scanner } from "@/modules/attendance/pages/Scanner";
import { Products } from "@/modules/product/pages/Products";
import { MyAttendance } from "@/modules/attendance/pages/MyAttendance";
import { MySalary } from "@/modules/salary/pages/MySalary";
import { MyLeaveRequests } from "@/modules/leave/pages/MyLeaveRequests";
import { MyTasks } from "@/modules/task/pages/MyTasks";
import { Notifications } from "@/modules/notification/pages/Notifications";
import { Settings } from "@/modules/settings/pages/Settings";

export const router = createBrowserRouter([
  { path: "/", Component: Login },
  {
    path: "/leader",
    element: React.createElement(ProtectedRoute, { allowedRoles: ["leader"] }, React.createElement(LeaderLayout)),
    children: [
      { index: true, Component: LeaderDashboard },
      { path: "staff", Component: EmployeeManagement },
      { path: "branches", Component: Branches },
      { path: "today", Component: TodayEmployees },
      { path: "records", Component: AttendanceRecords },
      { path: "attendance", Component: AttendanceAnalytics },
      { path: "employees/:id", Component: EmployeeDetail },
      { path: "salary", Component: SalaryAnalytics },
      { path: "tasks", Component: ManagerTasks },
      { path: "reminders", Component: LeaderReminders },
      { path: "leave", Component: LeaveRequests },
      { path: "reports", Component: Reports },
      { path: "audit", Component: withComingSoon(AuditLogs) },
      { path: "settings", Component: SettingsPage },
      { path: "*", Component: NotFound },
    ],
  },

  {
    path: "/employee",
    element: React.createElement(ProtectedRoute, { allowedRoles: ["employee"] }, React.createElement(EmployeeLayout)),
    children: [
      { index: true, Component: EmployeeDashboard },
      { path: "profile", Component: MyProfile },
      { path: "scanner", Component: Scanner },
      { path: "products", Component: Products },
      { path: "attendance", Component: MyAttendance },
      { path: "salary", Component: MySalary },
      { path: "leave", Component: MyLeaveRequests },
      { path: "tasks", Component: MyTasks },
      { path: "notifications", Component: Notifications },
      { path: "settings", Component: Settings },
      { path: "*", Component: NotFound },
    ],
  },

  { path: "*", Component: NotFound },
]);