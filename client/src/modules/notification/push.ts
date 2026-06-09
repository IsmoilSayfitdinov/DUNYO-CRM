import { apiClient } from "@/shared/lib/api";

function urlB64ToUint8Array(base64String: string): Uint8Array {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const raw = atob(base64);
  const arr = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i++) arr[i] = raw.charCodeAt(i);
  return arr;
}

/** Push qo'llab-quvvatlanadimi (SW + PushManager + secure context). */
export function pushSupported(): boolean {
  return (
    typeof window !== "undefined" &&
    "serviceWorker" in navigator &&
    "PushManager" in window &&
    "Notification" in window
  );
}

/** Joriy qurilma push'ga obuna bo'lganmi. */
export async function isPushSubscribed(): Promise<boolean> {
  if (!pushSupported()) return false;
  const reg = await navigator.serviceWorker.getRegistration();
  const sub = await reg?.pushManager.getSubscription();
  return !!sub;
}

/** Push'ga obuna bo'lish: ruxsat -> VAPID -> subscribe -> serverga saqlash. */
export async function subscribeToPush(): Promise<void> {
  if (!pushSupported()) throw new Error("Brauzer push bildirishnomani qo'llab-quvvatlamaydi");

  const permission = await Notification.requestPermission();
  if (permission !== "granted") throw new Error("Bildirishnomaga ruxsat berilmadi");

  const reg = await navigator.serviceWorker.ready;

  const { data } = await apiClient.get<{ public_key: string | null }>("/push/vapid-public-key");
  if (!data.public_key) throw new Error("Serverda push sozlanmagan (VAPID)");

  const sub = await reg.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: urlB64ToUint8Array(data.public_key),
  });

  const json = sub.toJSON() as { endpoint?: string; keys?: { p256dh?: string; auth?: string } };
  await apiClient.post("/push/subscribe", {
    endpoint: json.endpoint,
    keys: { p256dh: json.keys?.p256dh, auth: json.keys?.auth },
  });
}

/** Sinov push: server joriy foydalanuvchiga test bildirishnoma yuboradi. */
export async function sendTestPush(): Promise<void> {
  await apiClient.post("/push/test");
}

/** Push obunani bekor qilish. */
export async function unsubscribeFromPush(): Promise<void> {
  if (!pushSupported()) return;
  const reg = await navigator.serviceWorker.getRegistration();
  const sub = await reg?.pushManager.getSubscription();
  if (sub) {
    await apiClient.post("/push/unsubscribe", { endpoint: sub.endpoint }).catch(() => {});
    await sub.unsubscribe();
  }
}
