import { createFileRoute } from "@tanstack/react-router";
import { Check, Monitor, Smartphone } from "lucide-react";
import { toast } from "sonner";
import { useInstallUi } from "@/components/install-host";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export const Route = createFileRoute("/install")({
  ssr: false,
  component: InstallPage,
});

const ANDROID_STEPS = [
  {
    title: "Open in Chrome",
    body: "On the Android phone, open this same Shinile CBHI page in Google Chrome. Do not use Facebook, Telegram or the in-app browser — those cannot install apps.",
  },
  {
    title: "Publish first if you are still in preview",
    body: "If you are reading this inside Grok preview, publish the app, then open the published Shinile CBHI link in Chrome on the phone.",
  },
  {
    title: "Tap Chrome’s menu",
    body: "Tap the three dots in the top-right corner of Chrome.",
  },
  {
    title: "Install app / Add to Home screen",
    body: "Choose Install app or Add to Home screen. Confirm Install. A Shinile CBHI icon appears on the home screen.",
  },
  {
    title: "Open from the icon",
    body: "Launch Shinile CBHI from the home-screen icon. It opens full-screen, stores the register on this phone, and keeps working without internet.",
  },
];

const WINDOWS_STEPS = [
  {
    title: "Use Microsoft Edge or Google Chrome",
    body: "Open Shinile CBHI in Edge or Chrome on the Windows computer.",
  },
  {
    title: "Install from the address bar",
    body: "Click the install icon on the right of the address bar, or open the browser menu and choose Install Shinile CBHI.",
  },
  {
    title: "Pin it like a desktop program",
    body: "Windows adds it to the Start menu. You can pin it to the taskbar. Households, photos and Excel files stay in this computer’s storage.",
  },
];

function InstallPage() {
  const { standalone, canPrompt, platform, prompt } = useInstallUi();

  return (
    <div className="cbhi-enter mx-auto flex max-w-2xl flex-col gap-4">
      <div>
        <p className="text-xs font-medium tracking-wide text-primary uppercase">Phone & computer</p>
        <h1 className="font-display text-3xl font-semibold tracking-tight">Install Shinile CBHI</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          This is a full registrar that lives on the device. After install it works offline — no Play Store
          package is required.
        </p>
      </div>

      {standalone ? (
        <Card className="border-primary/30 bg-accent">
          <CardContent className="flex items-start gap-3 pt-5">
            <span className="flex size-10 items-center justify-center rounded-full bg-primary text-primary-foreground">
              <Check className="size-5" />
            </span>
            <div>
              <p className="font-medium">Installed on this device</p>
              <p className="text-sm text-muted-foreground">
                You are running the home-screen app. Households, members and photos stay in this device’s storage.
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className="border-primary/25 bg-primary text-primary-foreground">
          <CardHeader>
            <CardTitle className="text-primary-foreground">
              {platform === "android" ? "Install on this Android phone" : "Install on this device"}
            </CardTitle>
            <CardDescription className="text-primary-foreground/75">
              {canPrompt
                ? "Chrome is ready to add Shinile CBHI to the home screen."
                : "Follow the steps below. After you publish, Chrome on Android shows an Install button."}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {canPrompt ? (
              <Button
                size="lg"
                className="w-full bg-primary-foreground text-primary hover:bg-primary-foreground/90"
                onClick={async () => {
                  const result = await prompt();
                  if (result === "accepted") toast.success("Shinile CBHI is on this device");
                  if (result === "dismissed") toast.message("Install cancelled");
                  if (result === "unavailable") toast.message("Use the steps below to add it to the home screen");
                }}
              >
                <Smartphone className="size-4" />
                Install now
              </Button>
            ) : (
              <p className="text-sm text-primary-foreground/85">
                If the Install button is missing, use the numbered steps. Chrome only offers install from a real
                published page, not from an in-app preview.
              </p>
            )}
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Smartphone className="size-4" />
            Android phone
          </CardTitle>
          <CardDescription>Works on Chrome for Android. Samsung Internet also supports Add to Home screen.</CardDescription>
        </CardHeader>
        <CardContent>
          <ol className="flex flex-col gap-3">
            {ANDROID_STEPS.map((step, i) => (
              <li key={step.title} className="flex gap-3">
                <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">
                  {i + 1}
                </span>
                <div className="min-w-0">
                  <p className="font-medium">{step.title}</p>
                  <p className="text-sm text-muted-foreground">{step.body}</p>
                </div>
              </li>
            ))}
          </ol>
          <p className="mt-4 rounded-md bg-muted px-3 py-2 text-sm text-muted-foreground">
            After install, exports land in the phone’s Downloads / Files app. Photos stay inside the registrar.
            The register can hold 15,000+ households on the phone.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Monitor className="size-4" />
            Windows computer
          </CardTitle>
          <CardDescription>
            The same registrar installs as a desktop app in Edge or Chrome. Data is stored on that computer.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ol className="flex flex-col gap-3">
            {WINDOWS_STEPS.map((step, i) => (
              <li key={step.title} className="flex gap-3">
                <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-secondary text-sm font-semibold">
                  {i + 1}
                </span>
                <div className="min-w-0">
                  <p className="font-medium">{step.title}</p>
                  <p className="text-sm text-muted-foreground">{step.body}</p>
                </div>
              </li>
            ))}
          </ol>
        </CardContent>
      </Card>
    </div>
  );
}
