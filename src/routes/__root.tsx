import { createRootRoute, HeadContent, Outlet, Scripts } from "@tanstack/react-router";
import { AuthProvider } from "@/lib/auth/provider";
import { PreviewHostBridge } from "@/components/preview-host-bridge";
import { RegisterServiceWorker } from "@/components/register-sw";
import { InstallHost } from "@/components/install-host";
import { CbhiReady } from "@/components/cbhi-ready";
import { AppShell } from "@/components/app-shell";
import { Toaster } from "sonner";
import { APP_NAME } from "@/lib/cbhi/constants";
import appCss from "../styles.css?url";

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1, viewport-fit=cover" },
      { title: APP_NAME },
      { name: "theme-color", content: "#0B5F4B" },
      {
        name: "description",
        content:
          "Offline Community Based Health Insurance registrar for Shinile Woreda — household and beneficiary registration on this device.",
      },
      { name: "apple-mobile-web-app-capable", content: "yes" },
      { name: "mobile-web-app-capable", content: "yes" },
      { name: "apple-mobile-web-app-title", content: APP_NAME },
      { name: "apple-mobile-web-app-status-bar-style", content: "black-translucent" },
    ],
    links: [
      { rel: "icon", type: "image/svg+xml", href: "/favicon.svg" },
      { rel: "apple-touch-icon", href: "/apple-touch-icon.png" },
      { rel: "stylesheet", href: appCss },
      { rel: "manifest", href: "/manifest.webmanifest" },
      { rel: "manifest", href: "/__grok/manifest.webmanifest" },
    ],
  }),
  component: RootLayout,
});

function RootLayout() {
  return (
    <html lang="en" className="antialiased" suppressHydrationWarning>
      <head>
        <HeadContent />
      </head>
      <body>
        <PreviewHostBridge />
        <AuthProvider>
          <CbhiReady>
            <AppShell>
              <Outlet />
            </AppShell>
          </CbhiReady>
        </AuthProvider>
        <Toaster position="top-center" richColors closeButton />
        <InstallHost />
        <RegisterServiceWorker />
        <Scripts />
      </body>
    </html>
  );
}