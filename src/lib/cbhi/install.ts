export type InstallPlatform = "android" | "ios" | "windows" | "other";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

type Listener = () => void;

const listeners = new Set<Listener>();
let deferred: BeforeInstallPromptEvent | null = null;
let installed = false;

function notify() {
  for (const fn of listeners) fn();
}

export function isStandalone(): boolean {
  if (typeof window === "undefined") return false;
  const nav = window.navigator as Navigator & { standalone?: boolean };
  if (nav.standalone) return true;
  return window.matchMedia("(display-mode: standalone)").matches || window.matchMedia("(display-mode: minimal-ui)").matches;
}

export function detectPlatform(): InstallPlatform {
  if (typeof navigator === "undefined") return "other";
  const ua = navigator.userAgent || "";
  if (/Android/i.test(ua)) return "android";
  if (/iPhone|iPad|iPod/i.test(ua) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1)) return "ios";
  if (/Windows/i.test(ua)) return "windows";
  return "other";
}

export function canPromptInstall(): boolean {
  return deferred != null && !installed && !isStandalone();
}

export async function promptInstall(): Promise<"accepted" | "dismissed" | "unavailable"> {
  if (!deferred) return "unavailable";
  const event = deferred;
  deferred = null;
  notify();
  await event.prompt();
  const { outcome } = await event.userChoice;
  if (outcome === "accepted") {
    installed = true;
    notify();
  }
  return outcome;
}

export function subscribeInstall(listener: Listener): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function bindInstallListeners(): () => void {
  if (typeof window === "undefined") return () => {};
  if (isStandalone()) {
    installed = true;
  }

  const onPrompt = (event: Event) => {
    event.preventDefault();
    deferred = event as BeforeInstallPromptEvent;
    notify();
  };
  const onInstalled = () => {
    installed = true;
    deferred = null;
    notify();
  };

  window.addEventListener("beforeinstallprompt", onPrompt);
  window.addEventListener("appinstalled", onInstalled);
  return () => {
    window.removeEventListener("beforeinstallprompt", onPrompt);
    window.removeEventListener("appinstalled", onInstalled);
  };
}

export async function requestPersistentStorage(): Promise<boolean> {
  try {
    if (!navigator.storage?.persist) return false;
    return await navigator.storage.persist();
  } catch {
    return false;
  }
}
