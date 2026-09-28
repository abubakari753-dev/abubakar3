import { useEffect } from "react";

export function RegisterServiceWorker() {
  useEffect(() => {
    if (!import.meta.env.PROD) return;
    if (!("serviceWorker" in navigator)) return;
    const url = "/sw.js";
    navigator.serviceWorker.register(url).catch(() => {
      /* offline install is best-effort */
    });
  }, []);
  return null;
}
