import { AdminSettings } from "./AdminSettings";

/**
 * Leader sozlamalar sahifasi. Avval bu komponent `/leader` va `/employee`
 * o'rtasida dispatch qilar edi va boshqa sahifani (employee Settings) import
 * qilardi (FSD page→page buzilishi). Endi har bir route to'g'ridan-to'g'ri o'z
 * sahifasiga ulangan, shuning uchun bu faqat leader sozlamalarini render qiladi.
 */
export function SettingsPage() {
  return <AdminSettings role="leader" />;
}
