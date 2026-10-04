import { useEffect, useState, type ReactNode } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import { Home, Users, MapPinned, Settings, Plus, Smartphone } from "lucide-react";
import { cn } from "@/lib/utils";
import { APP_NAME } from "@/lib/cbhi/constants";
import { SearchOmni } from "./search-omni";
import { isStandalone } from "@/lib/cbhi/install";

const NAV = [
  { to: "/", label: "Dashboard", icon: Home },
  { to: "/households", label: "Households", icon: Users },
  { to: "/locations", label: "Kebeles", icon: MapPinned },
  { to: "/settings", label: "Settings", icon: Settings },
] as const;

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [installed, setInstalled] = useState(false);
  useEffect(() => {
    setInstalled(isStandalone());
  }, []);

  return (
    <div className="min-h-dvh bg-background text-foreground">
      <header className="sticky top-0 z-30 border-b border-teal-dim/40 bg-primary text-primary-foreground">
        <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-3">
          <Link to="/" className="flex min-w-0 items-center gap-2.5">
            <span className="flex size-9 items-center justify-center rounded-md bg-primary-foreground/10 ring-1 ring-primary-foreground/15">
              <svg viewBox="0 0 24 24" className="size-5" aria-hidden>
                <rect x="10" y="4" width="4" height="16" rx="1" fill="currentColor" />
                <rect x="4" y="10" width="16" height="4" rx="1" fill="currentColor" />
              </svg>
            </span>
            <span className="min-w-0">
              <span className="block font-display text-base leading-tight font-semibold tracking-tight">
                {APP_NAME}
              </span>
              <span className="block truncate text-[11px] text-primary-foreground/70">
                Sitti · Shinile Woreda
              </span>
            </span>
          </Link>
          <div className="ml-auto hidden flex-1 justify-end md:flex">
            <div className="w-full max-w-md">
              <SearchOmni tone="header" />
            </div>
          </div>
          {!installed ? (
            <Link
              to="/install"
              className="ml-auto flex size-11 shrink-0 items-center justify-center rounded-md bg-primary-foreground/10 text-primary-foreground md:hidden"
              aria-label="Install on this phone"
            >
              <Smartphone className="size-5" />
            </Link>
          ) : null}
        </div>
      </header>

      <div className="mx-auto flex max-w-6xl">
        <aside className="sticky top-[61px] hidden h-[calc(100dvh-61px)] w-56 shrink-0 flex-col gap-1 border-r border-border p-3 md:flex">
          {NAV.map((item) => {
            const active = item.to === "/" ? pathname === "/" : pathname.startsWith(item.to);
            const Icon = item.icon;
            return (
              <Link
                key={item.to}
                to={item.to}
                className={cn(
                  "flex min-h-11 items-center gap-2 rounded-md px-3 text-sm font-medium",
                  active ? "bg-accent text-accent-foreground" : "text-muted-foreground hover:bg-muted hover:text-foreground",
                )}
              >
                <Icon className="size-4" />
                {item.label}
              </Link>
            );
          })}
          <Link
            to="/households/new"
            className="mt-2 flex min-h-11 items-center justify-center gap-2 rounded-md bg-primary px-3 text-sm font-medium text-primary-foreground hover:bg-teal-dim"
          >
            <Plus className="size-4" />
            New household
          </Link>
          {!installed ? (
            <Link
              to="/install"
              className="flex min-h-11 items-center gap-2 rounded-md px-3 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground"
            >
              <Smartphone className="size-4" />
              Install app
            </Link>
          ) : null}
        </aside>

        <main className="min-w-0 flex-1 px-4 pt-4 pb-24 md:px-6 md:pt-6 md:pb-10">{children}</main>
      </div>

      <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-card/95 backdrop-blur md:hidden">
        <ul className="grid grid-cols-5 px-1 pb-[env(safe-area-inset-bottom)]">
          {NAV.map((item) => {
            const active = item.to === "/" ? pathname === "/" : pathname.startsWith(item.to);
            const Icon = item.icon;
            return (
              <li key={item.to}>
                <Link
                  to={item.to}
                  className={cn(
                    "flex min-h-14 flex-col items-center justify-center gap-0.5 text-[10px] font-medium",
                    active ? "text-primary" : "text-muted-foreground",
                  )}
                >
                  <Icon className="size-5" />
                  {item.label}
                </Link>
              </li>
            );
          })}
          <li>
            <Link
              to="/households/new"
              className="flex min-h-14 flex-col items-center justify-center gap-0.5 text-[10px] font-medium text-primary"
            >
              <span className="flex size-8 items-center justify-center rounded-full bg-primary text-primary-foreground">
                <Plus className="size-4" />
              </span>
              Add
            </Link>
          </li>
        </ul>
      </nav>
    </div>
  );
}