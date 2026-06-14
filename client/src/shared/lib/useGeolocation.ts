import { useCallback, useRef, useState } from "react";
import { geoErrorInfo, type GeoErrorInfo } from "./geoError";

// navigator.geolocation uchun standart sozlamalar.
// enableHighAccuracy: GPS'dan aniq joylashuv so'raydi (sekinroq, lekin aniqroq).
// timeout: 15s ichida javob kelmasa, TIMEOUT xatosi beriladi.
// maximumAge: 0 — keshlangan eski joylashuvni ishlatmaydi, har safar yangisini oladi.
const GEO_OPTIONS: PositionOptions = {
  enableHighAccuracy: true,
  timeout: 15000,
  maximumAge: 0,
};

export interface GeoCoords {
  latitude: number;
  longitude: number;
  accuracy: number;
}

type Status = "idle" | "locating" | "success" | "error";

/**
 * Geolokatsiyani boshqaruvchi hook.
 *
 * Qaytaradi:
 *  - request(): joylashuvni so'raydi, Promise<GeoCoords> qaytaradi (xato bo'lsa reject).
 *               Tugma bosilganda chaqirilishi kerak (iOS user-gesture qoidasi uchun).
 *  - status: "idle" | "locating" | "success" | "error"
 *  - error: oxirgi xato haqida ma'lumot (GeoPermissionSheet'ga beriladi)
 *  - coords: oxirgi muvaffaqiyatli joylashuv
 *  - reset(): holatni boshlang'ich (idle) ga qaytaradi
 */
export function useGeolocation() {
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<GeoErrorInfo | null>(null);
  const [coords, setCoords] = useState<GeoCoords | null>(null);

  // request() har renderada qayta yaratilmasligi uchun useCallback.
  // pending so'rovlar bir-biriga xalaqit bermasligi uchun ref orqali kuzatamiz.
  const pendingRef = useRef(false);

  const request = useCallback((): Promise<GeoCoords> => {
    return new Promise<GeoCoords>((resolve, reject) => {
      if (!("geolocation" in navigator)) {
        const info = geoErrorInfo(new Error("unsupported"));
        setError(info);
        setStatus("error");
        reject(info);
        return;
      }
      if (pendingRef.current) return; // ketma-ket bosishdan himoya
      pendingRef.current = true;

      setStatus("locating");
      setError(null);

      navigator.geolocation.getCurrentPosition(
        (pos) => {
          pendingRef.current = false;
          const c: GeoCoords = {
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude,
            accuracy: pos.coords.accuracy,
          };
          setCoords(c);
          setStatus("success");
          resolve(c);
        },
        (err) => {
          pendingRef.current = false;
          const info = geoErrorInfo(err);
          setError(info);
          setStatus("error");
          reject(info);
        },
        GEO_OPTIONS,
      );
    });
  }, []);

  const reset = useCallback(() => {
    setStatus("idle");
    setError(null);
  }, []);

  return { request, status, error, coords, reset };
}
