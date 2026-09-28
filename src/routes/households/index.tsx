import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { householdViews } from "@/lib/cbhi/queries";
import { getDb } from "@/lib/cbhi/db";
import { MEMBERSHIP_STATUSES, SLIDING_SCALES } from "@/lib/cbhi/constants";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { NativeSelect } from "@/components/ui/field";
import { Button } from "@/components/ui/button";
import { ScaleBadge, StatusBadge } from "@/components/scale-badge";

export const Route = createFileRoute("/households/")({
  ssr: false,
  component: HouseholdsPage,
});

function HouseholdsPage() {
  const rows = useLiveQuery(() => householdViews(), []) ?? [];
  const kebeles = useLiveQuery(() => getDb().kebeles.orderBy("code").toArray(), []) ?? [];
  const [q, setQ] = useState("");
  const [kebele, setKebele] = useState("all");
  const [scale, setScale] = useState("all");
  const [status, setStatus] = useState("all");

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return rows.filter((r) => {
      if (kebele !== "all" && r.kebeleId !== kebele) return false;
      if (scale !== "all" && r.slidingScale !== scale) return false;
      if (status !== "all" && r.membershipStatus !== status) return false;
      if (!needle) return true;
      const hay = `${r.headName} ${r.householdCode} ${r.fan} ${r.kebeleName} ${r.gote}`.toLowerCase();
      return hay.includes(needle);
    });
  }, [rows, q, kebele, scale, status]);

  return (
    <div className="cbhi-enter flex flex-col gap-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl font-semibold tracking-tight">Households</h1>
          <p className="text-sm text-muted-foreground">
            {filtered.length.toLocaleString()} of {rows.length.toLocaleString()} households
          </p>
        </div>
        <Button asChild>
          <Link to="/households/new">Add household</Link>
        </Button>
      </div>

      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
        <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Filter by name, code, FAN…" />
        <NativeSelect value={kebele} onChange={(e) => setKebele(e.target.value)}>
          <option value="all">All kebeles</option>
          {kebeles.map((k) => (
            <option key={k.id} value={k.id}>
              {k.code} · {k.name}
            </option>
          ))}
        </NativeSelect>
        <NativeSelect value={scale} onChange={(e) => setScale(e.target.value)}>
          <option value="all">All sliding scales</option>
          {SLIDING_SCALES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </NativeSelect>
        <NativeSelect value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="all">All statuses</option>
          {MEMBERSHIP_STATUSES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </NativeSelect>
      </div>

      <div className="flex flex-col gap-2">
        {filtered.length === 0 ? (
          <Card>
            <CardContent className="py-10 text-center text-sm text-muted-foreground">
              No households match these filters. Import an Excel register in Settings or add a household.
            </CardContent>
          </Card>
        ) : (
          filtered.slice(0, 200).map((hh) => (
            <Link key={hh.id} to="/households/$id" params={{ id: hh.id }}>
              <Card className="transition-[box-shadow] hover:shadow-md">
                <CardContent className="flex flex-col gap-2 py-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="min-w-0">
                    <p className="truncate font-medium">{hh.headName}</p>
                    <p className="font-mono text-xs text-muted-foreground">{hh.householdCode}</p>
                    <p className="text-xs text-muted-foreground">
                      {hh.clusterName} · {hh.kebeleName}
                      {hh.gote ? ` · Gote ${hh.gote}` : ""} · {hh.memberCount} members
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    <ScaleBadge scale={hh.slidingScale} />
                    <StatusBadge status={hh.membershipStatus} />
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))
        )}
        {filtered.length > 200 ? (
          <p className="text-center text-xs text-muted-foreground">
            Showing the first 200. Narrow the search to see the rest.
          </p>
        ) : null}
      </div>
    </div>
  );
}
