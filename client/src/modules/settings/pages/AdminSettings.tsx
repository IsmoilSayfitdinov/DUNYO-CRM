import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  CompanyInfoSection,
  NotificationSettings,
  SecuritySettings,
  DataManagementSection,
  ApiAccessSection,
  ActiveSessionsSection,
} from "../components/admin-settings";
import { useSettings, useUpdateSettings } from "../hooks/use-settings";

type Role = "leader";

interface Props {
  role: Role;
}

export function AdminSettings({ role }: Props) {
  const isLeader = role === "leader";

  const { data: settings } = useSettings();
  const { mutate } = useUpdateSettings();

  // Backend bilan bog'liq sozlamalar (server qiymatlari bilan boshlanadi):
  //  smsAlerts→notify_sms, payrollReady→notify_salary, leaveNotif→notify_leave
  //  autoLockout→auto_logout, twoFactor→two_factor_enabled
  const [smsAlerts, setSmsAlerts] = useState(false);
  const [pushAlerts, setPushAlerts] = useState(true);
  const [taskAlerts, setTaskAlerts] = useState(true);
  const [payrollReady, setPayrollReady] = useState(true);
  const [leaveNotif, setLeaveNotif] = useState(true);
  const [autoLockout, setAutoLockout] = useState(true);
  const [twoFactor, setTwoFactor] = useState(false);

  useEffect(() => {
    if (settings) {
      setSmsAlerts(settings.notify_sms);
      setPushAlerts(settings.notify_push);
      setTaskAlerts(settings.notify_task);
      setPayrollReady(settings.notify_salary);
      setLeaveNotif(settings.notify_leave);
      setAutoLockout(settings.auto_logout);
      setTwoFactor(settings.two_factor_enabled);
    }
  }, [settings]);

  // Backendda alohida maydoni yo'q — faqat UI (kelajakda qo'shilishi mumkin)
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [duplicateQR, setDuplicateQR] = useState(true);
  const [lowAttendance, setLowAttendance] = useState(true);
  const [manualEntryAlert, setManualEntryAlert] = useState(isLeader);
  const [auditEnabled, setAuditEnabled] = useState(true);

  const [saved, setSaved] = useState(false);
  // Bildirishnoma sozlamalarini saqlash (backend bilan bog'liqlari PATCH qilinadi)
  const handleSave = () => {
    mutate(
      {
        notify_sms: smsAlerts,
        notify_push: pushAlerts,
        notify_task: taskAlerts,
        notify_salary: payrollReady,
        notify_leave: leaveNotif,
      },
      {
        onSuccess: () => {
          setSaved(true);
          toast.success("Sozlamalar saqlandi");
          setTimeout(() => setSaved(false), 2500);
        },
      },
    );
  };

  // Xavfsizlik toggle'lari — darhol saqlanadi
  const handleAutoLockout = (v: boolean) => { setAutoLockout(v); mutate({ auto_logout: v }); };
  const handleTwoFactor = (v: boolean) => { setTwoFactor(v); mutate({ two_factor_enabled: v }); };

  const accentClass = "bg-primary text-primary-foreground hover:opacity-90 shadow-lg shadow-primary/20";

  return (
    <div className="p-3 sm:p-4 md:p-6 space-y-4 sm:space-y-6 ">
      <div>
        <h1 className="text-lg sm:text-xl font-semibold text-slate-900">Administrator sozlamalari</h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
          {isLeader ? "Tizimning global parametrlarini va xavfsizlik sozlamalarini boshqarish" : "Bo'lim xabarnomalari va shaxsiy sozlamalarni boshqarish"}
        </p>
      </div>

    
      {/* Notification preferences */}
      <NotificationSettings
        isLeader={isLeader}
        emailAlerts={emailAlerts} setEmailAlerts={setEmailAlerts}
        smsAlerts={smsAlerts} setSmsAlerts={setSmsAlerts}
        pushAlerts={pushAlerts} setPushAlerts={setPushAlerts}
        taskAlerts={taskAlerts} setTaskAlerts={setTaskAlerts}
        duplicateQR={duplicateQR} setDuplicateQR={setDuplicateQR}
        lowAttendance={lowAttendance} setLowAttendance={setLowAttendance}
        payrollReady={payrollReady} setPayrollReady={setPayrollReady}
        leaveNotif={leaveNotif} setLeaveNotif={setLeaveNotif}
        manualEntryAlert={manualEntryAlert} setManualEntryAlert={setManualEntryAlert}
        saved={saved} onSave={handleSave} accentClass={accentClass}
      />

      {/* Security */}
      <SecuritySettings
        isLeader={isLeader}
        autoLockout={autoLockout} setAutoLockout={handleAutoLockout}
        twoFactor={twoFactor} setTwoFactor={handleTwoFactor}
        auditEnabled={auditEnabled} setAuditEnabled={setAuditEnabled}
      />
      {/* Active sessions */}
      <ActiveSessionsSection />
    </div>
  );
}
