import { useEffect, useRef, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Search } from "lucide-react";
import { searchRegister } from "@/lib/cbhi/queries";
import { cn } from "@/lib/utils";
import { Input } from "./ui/input";

export function SearchOmni({
  autoFocus = false,
  tone = "page",
}: {
  autoFocus?: boolean;
  tone?: "header" | "page";
}) {
  const [q, setQ] = useState("");
  const [hits, setHits] = useState<Awaited<ReturnType<typeof searchRegister>>>([]);
  const [open, setOpen] = useState(false);
  const nav = useNavigate();
  const box = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const t = setTimeout(() => {
      if (q.trim().length < 1) {
        setHits([]);
        return;
      }
      void searchRegister(q, 30).then((rows) => {
        setHits(rows);
        setOpen(true);
      });
    }, 80);
    return () => clearTimeout(t);
  }, [q]);

  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (!box.current?.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  return (
    <div ref={box} className="relative">
      <Search
        className={cn(
          "pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2",
          tone === "header" ? "text-primary-foreground/55 md:text-faint" : "text-faint",
        )}
      />
      <Input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        onFocus={() => hits.length && setOpen(true)}
        autoFocus={autoFocus}
        placeholder="Search name, CBHI code, FAN…"
        className={cn(
          "h-11 pl-9",
          tone === "header"
            ? "border-primary-foreground/15 bg-primary-foreground/10 text-primary-foreground placeholder:text-primary-foreground/55 md:border-input md:bg-card md:text-foreground md:placeholder:text-faint"
            : "",
        )}
        aria-label="Search register"
      />
      {open && hits.length > 0 ? (
        <ul className="absolute top-[calc(100%+6px)] right-0 left-0 z-40 max-h-80 overflow-auto rounded-lg border border-border bg-card py-1 text-foreground shadow-lg">
          {hits.map((h) => (
            <li key={h.memberId}>
              <button
                type="button"
                className="flex w-full flex-col items-start gap-0.5 px-3 py-2.5 text-left hover:bg-muted"
                onClick={() => {
                  setOpen(false);
                  setQ("");
                  void nav({ to: "/households/$id", params: { id: h.householdId } });
                }}
              >
                <span className="text-sm font-medium">{h.fullName}</span>
                <span className="font-mono text-[11px] text-muted-foreground">
                  {h.householdCode}/{h.beneficiaryCode} · {h.relationship} · {h.kebeleName}
                </span>
              </button>
            </li>
          ))}
        </ul>
      ) : null}
      {open && q.trim() && hits.length === 0 ? (
        <div className="absolute top-[calc(100%+6px)] right-0 left-0 z-40 rounded-lg border border-border bg-card px-3 py-3 text-sm text-muted-foreground shadow-lg">
          No members match “{q}”.
        </div>
      ) : null}
    </div>
  );
}
