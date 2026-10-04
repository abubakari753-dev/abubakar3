import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Smartphone, X } from "lucide-react";
import {
  bindInstallListeners,
  canPromptInstall,
  detectPlatform,
  isStandalone,
  promptInstall,
  subscribeInstall,
} from "@/lib/cbhi/install";
import { Button } from "@/components/ui/button";

export function InstallHost() {
  const [, setTick] = useState(0);

  useEffect(() => {
    const unbind = bindInstallListeners();
    const unsub = subscribeInstall(() => setTick((n) => n + 1));
    return () => {
      unbind();
      unsub();
    };
  }, []);

  return null;
}

export function useInstallUi() {
  const [, setTick] = useState(0);
  useEffect(() => subscribeInstall(() => setTick((n) => n + 1)), []);
  return {
    standalone: isStandalone(),
    canPrompt: canPromptInstall(),
    platform: detectPlatform(),
    prompt: promptInstall,
  };
}

export function InstallBanner() {
  const { standalone, canPrompt, prompt } = useInstallUi();
  const [dismissed, setDismissed] = useState(false);

  if (standalone || dismissed) return null;

  return (
    <div className="relative overflow-hidden rounded-xl border border-teal/25 bg-accent px-4 py-3 text-accent-foreground">
      <button
        type="button"
        aria-label="Dismiss"
        className="absolute top-2 right-2 rounded-md p-1 text-accent-foreground/60 hover:bg-primary/10 hover:text-accent-foreground"
        onClick={() => setDismissed(true)}
      >
        <X className="size-4" />
      </button>
      <div className="flex items-start gap-3 pr-6">
        <span className="mt-0.5 flex size-10 shrink-0 items-center justify-center rounded-md bg-primary text-primary-foreground">
          <Smartphone className="size-5" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="font-medium">Install Shinile CBHI on this device</p>
          <p className="text-sm text-accent-foreground/80">
            Add it to the Android home screen or the Windows Start menu. After that it opens like an app and keeps working without internet.
          </p>
          <div className="mt-2 flex flex-wrap gap-2">
            {canPrompt ? (
              <Button
                size="sm"
                onClick={() => {
                  void prompt();
                }}
              >
                Install now
              </Button>
            ) : (
              <Button size="sm" asChild>
                <Link to="/install">Show install steps</Link>
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
