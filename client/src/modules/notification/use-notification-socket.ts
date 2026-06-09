import { useEffect, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { baseURL, getAccessToken } from "@/shared/lib/api";

/**
 * Real-time bildirishnoma WebSocket'i. Login bo'lganda ulanadi, yangi bildirishnoma
 * kelganda react-query'ni invalidate qiladi (qo'ng'iroq/badge/ro'yxat darhol yangilanadi)
 * va toast ko'rsatadi. Uzilsa avtomatik qayta ulanadi.
 */
export function useNotificationSocket(enabled: boolean) {
  const qc = useQueryClient();
  const wsRef = useRef<WebSocket | null>(null);
  const retryRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const closedRef = useRef(false);

  useEffect(() => {
    if (!enabled) return;
    closedRef.current = false;

    const connect = () => {
      const token = getAccessToken();
      if (!token) {
        retryRef.current = setTimeout(connect, 2000); // token hali tayyor emas
        return;
      }
      // WS manzilini quramiz. baseURL absolyut (http...) bo'lsa o'shandan; nisbiy
      // ("/api/v1") bo'lsa joriy origin'dan (tunnel/LAN/localhost — barchasi ishlaydi).
      const wsBase = baseURL.startsWith("http")
        ? baseURL.replace(/^http/, "ws")
        : `${window.location.protocol === "https:" ? "wss:" : "ws:"}//${window.location.host}${baseURL}`;
      const wsUrl = `${wsBase}/ws/notifications?token=${encodeURIComponent(token)}`;
      let ws: WebSocket;
      try {
        ws = new WebSocket(wsUrl);
      } catch {
        retryRef.current = setTimeout(connect, 3000);
        return;
      }
      wsRef.current = ws;

      ws.onmessage = (ev) => {
        try {
          const msg = JSON.parse(ev.data);
          if (msg?.type === "notification") {
            qc.invalidateQueries({ queryKey: ["notifications"] });
            toast(msg.title || "Yangi bildirishnoma", { description: msg.body || undefined });
          }
        } catch {
          /* ignore */
        }
      };

      ws.onclose = () => {
        wsRef.current = null;
        if (!closedRef.current) {
          retryRef.current = setTimeout(connect, 3000); // qayta ulanish
        }
      };
      ws.onerror = () => {
        try { ws.close(); } catch { /* ignore */ }
      };
    };

    connect();

    return () => {
      closedRef.current = true;
      if (retryRef.current) clearTimeout(retryRef.current);
      if (wsRef.current) {
        try { wsRef.current.close(); } catch { /* ignore */ }
        wsRef.current = null;
      }
    };
  }, [enabled, qc]);
}
