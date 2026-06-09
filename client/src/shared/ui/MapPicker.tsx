import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

const TASHKENT: [number, number] = [41.311081, 69.240562];

const pinIcon = L.divIcon({
  className: "branch-pin",
  html: `<div style="width:22px;height:22px;background:#dc2626;border:3px solid #fff;border-radius:50% 50% 50% 0;transform:rotate(-45deg);box-shadow:0 2px 6px rgba(0,0,0,0.35)"></div>`,
  iconSize: [22, 22],
  iconAnchor: [11, 22],
});

interface Props {
  lat: number | null;
  lng: number | null;
  radius: number;
  onPick: (lat: number, lng: number) => void;
}

export function MapPicker({ lat, lng, radius, onPick }: Props) {
  const elRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);
  const circleRef = useRef<L.Circle | null>(null);
  const onPickRef = useRef(onPick);
  onPickRef.current = onPick;

  // Xaritani bir marta yaratamiz
  useEffect(() => {
    if (!elRef.current || mapRef.current) return;
    const start: [number, number] = lat != null && lng != null ? [lat, lng] : TASHKENT;

    const map = L.map(elRef.current, { zoomControl: true }).setView(start, 15);
    mapRef.current = map;

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "&copy; OpenStreetMap",
      maxZoom: 19,
    }).addTo(map);

    const marker = L.marker(start, { draggable: true, icon: pinIcon }).addTo(map);
    markerRef.current = marker;

    const circle = L.circle(start, {
      radius: radius || 0,
      color: "#dc2626",
      fillColor: "#dc2626",
      fillOpacity: 0.12,
      weight: 2,
    }).addTo(map);
    circleRef.current = circle;

    const apply = (ll: L.LatLng) => {
      marker.setLatLng(ll);
      circle.setLatLng(ll);
      onPickRef.current(ll.lat, ll.lng);
    };
    map.on("click", (e) => apply(e.latlng));
    marker.on("dragend", () => apply(marker.getLatLng()));

    // Modal ichida o'lcham kech hisoblanishi mumkin — qayta o'lchaymiz
    const t = setTimeout(() => map.invalidateSize(), 120);

    return () => {
      clearTimeout(t);
      map.remove();
      mapRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Tashqaridan lat/lng o'zgarsa (masalan "Joriy lokatsiya") — markerni ko'chiramiz
  useEffect(() => {
    if (!mapRef.current || lat == null || lng == null) return;
    const ll = L.latLng(lat, lng);
    markerRef.current?.setLatLng(ll);
    circleRef.current?.setLatLng(ll);
    mapRef.current.setView(ll, mapRef.current.getZoom());
  }, [lat, lng]);

  // Radius o'zgarsa — doirani yangilaymiz
  useEffect(() => {
    circleRef.current?.setRadius(radius || 0);
  }, [radius]);

  return <div ref={elRef} className="w-full h-[240px] rounded-xl overflow-hidden border border-slate-200 isolate" style={{ zIndex: 0 }} />;
}
