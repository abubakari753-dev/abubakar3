import { useEffect, useState, type ReactNode } from "react";
import { ensureSeededLocations } from "@/lib/cbhi/db";
import { loadDemoRegister } from "@/lib/cbhi/demo";
import { requestPersistentStorage } from "@/lib/cbhi/install";

export function CbhiReady({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        await ensureSeededLocations();
        void requestPersistentStorage();
        if (!cancelled) setReady(true);
        void loadDemoRegister();
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : "Could not open the local register.");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  if (error) {
    return (
      <main className="flex min-h-dvh flex-col items-center justify-center gap-3 px-6 text-center">
        <h1 className="font-display text-xl font-semibold">Register could not open</h1>
        <p className="max-w-sm text-sm text-muted-foreground">{error}</p>
      </main>
    );
  }

  if (!ready) {
    return (
      <main className="flex min-h-dvh flex-col items-center justify-center gap-3 px-6">
        <div className="size-10 animate-pulse rounded-full bg-primary/20" />
        <p className="text-sm text-muted-foreground">Opening Shinile CBHI register…</p>
      </main>
    );
  }

  return children;
}