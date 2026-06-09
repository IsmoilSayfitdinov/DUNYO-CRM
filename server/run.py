import os
import uvicorn

if __name__ == "__main__":
    # HTTPS FAQAT USE_HTTPS=1 berilganda yoqiladi. Standart — HTTP.
    # Sabab: frontend vite proxy (va cloudflared tunnel) backendga ichki HTTP orqali
    # ulanadi; tashqi HTTPS'ni tunnel/proxy o'zi ta'minlaydi. Shu bilan protokol
    # nomuvofiqligi (proxy http -> backend https = 500) bo'lmaydi.
    cert_dir = os.path.join(os.path.dirname(__file__), "..", "certs")
    cert_file = os.path.join(cert_dir, "cert.pem")
    key_file = os.path.join(cert_dir, "key.pem")
    ssl_kwargs = {}
    if os.environ.get("USE_HTTPS") == "1" and os.path.exists(cert_file) and os.path.exists(key_file):
        ssl_kwargs = {"ssl_certfile": cert_file, "ssl_keyfile": key_file}
        print("🔒 HTTPS yoqildi (https://0.0.0.0:8000)")
    else:
        print("🌐 HTTP (http://0.0.0.0:8000) — tashqi HTTPS'ni tunnel/proxy beradi")

    # host="0.0.0.0" — backend lokal tarmoqdan (telefon, boshqa qurilmalar) ham
    # ochiq bo'lsin. Faqat 127.0.0.1 bo'lsa, telefon ulana olmaydi.
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True, **ssl_kwargs)