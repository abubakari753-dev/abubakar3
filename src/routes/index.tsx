import { createFileRoute, Link } from "@tanstack/react-router";
import { useLiveQuery } from "dexie-react-hooks";
import { Users, Home, RefreshCw, Landmark, Camera } from "lucide-react";
import {
  Bar,
  BarChart,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { dashboardStats, emptyStats, householdViews } from "@/lib/cbhi/queries";
import { SLIDING_SCALE_META } from "@/lib/cbhi/constants";
import { formatBirr } from "@/lib/utils";
import { SearchOmni } from "@/components/search-omni";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScaleBadge, StatusBadge } from "@/components/scale-badge";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/")({
  ssr: false,
  component: Dashboard,
});

const PIE_COLORS = {
  Higher: "#b45309",
  Middle: "#0b5f4b",
  Lower: "#1e3a5f",
};

function Dashboard() {
  const stats = useLiveQuery(() => dashboardStats(), []) ?? emptyStats();
  const recent = useLiveQuery(async () => {
    const rows = await householdViews();
    return rows.sort((a, b) => b.updatedAt - a.updatedAt).slice(0, 6);
  }, []) ?? [];

  const scaleData = (["Higher", "Middle", "Lower"] as const).map((k) => ({
    name: k,
    value: stats.byScale[k].households,
    premium: stats.byScale[k].premium,
  }));
  const kebeleData = stats.byKebele.filter((k) => k.households > 0).slice(0, 10);

  return (
    <div className="cbhi-enter flex flex-col gap-5">
      <div className="md:hidden">
        <SearchOmni />
      </div>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs font-medium tracking-wide text-primary uppercase">Shinile Woreda register</p>
          <h1 className="font-display text-3xl leading-tight font-semibold tracking-tight">Coverage at a glance</h1>
          <p className="mt-1 max-w-xl text-sm text-muted-foreground">
            Households, beneficiaries and contributions stored only on this device. Works without internet.
          </p>
        </div>
        <Button asChild>
          <Link to="/households/new">Register household</Link>
        </Button>
      </div>

      <section className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard icon={Home} label="Households" value={stats.households} />
        <StatCard icon={Users} label="Members" value={stats.members} />
        <StatCard icon={RefreshCw} label="Renewed" value={stats.renewed} hint={`${stats.unrenewed} un-renewed`} />
        <StatCard icon={Camera} label="Photos on device" value={stats.photos} />
      </section>

      <section className="grid gap-3 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Sliding scale</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            <div className="h-44">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={scaleData} dataKey="value" nameKey="name" innerRadius={42} outerRadius={68} paddingAngle={3}>
                    {scaleData.map((d) => (
                      <Cell key={d.name} fill={PIE_COLORS[d.name]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <ul className="space-y-1.5 text-sm">
              {scaleData.map((d) => (
                <li key={d.name} className="flex items-center justify-between gap-2">
                  <span className="text-muted-foreground">
                    {d.name} · {formatBirr(SLIDING_SCALE_META[d.name].amount)}
                  </span>
                  <span className="tabular font-medium">
                    {d.value} HH · {formatBirr(d.premium)}
                  </span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Households by kebele</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={kebeleData} layout="vertical" margin={{ left: 16, right: 8, top: 4, bottom: 4 }}>
                  <XAxis type="number" hide />
                  <YAxis type="category" dataKey="name" width={88} tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Bar dataKey="households" fill="#0b5f4b" radius={[0, 6, 6, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Mini label="Town admin" value={stats.byRural.Town} />
        <Mini label="Rural" value={stats.byRural.Rural} />
        <Mini label="Paying (P)" value={stats.paying} />
        <Mini label="Indigent (I)" value={stats.indigent} hint="Lower class, government subsidy" />
        <Mini label="Female members" value={stats.byGender.Female} />
        <Mini label="Male members" value={stats.byGender.Male} />
        <Mini
          label="Expected contribution"
          value={formatBirr(
            stats.byScale.Higher.premium + stats.byScale.Middle.premium + stats.byScale.Lower.premium,
          )}
        />
        <Mini label="Top profession" value={stats.byProfession[0]?.name ?? "—"} hint={stats.byProfession[0] ? `${stats.byProfession[0].count} members` : ""} />
      </section>

      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-display text-lg font-semibold">Recently updated</h2>
          <Link to="/households" className="text-sm font-medium text-primary">
            View all
          </Link>
        </div>
        <div className="grid gap-3 md:grid-cols-2">
          {recent.map((hh) => (
            <Link key={hh.id} to="/households/$id" params={{ id: hh.id }} className="block">
              <Card className="transition-[box-shadow] hover:shadow-md">
                <CardContent className="flex flex-col gap-2 pt-5">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-medium">{hh.headName}</p>
                      <p className="font-mono text-xs text-muted-foreground">{hh.householdCode}</p>
                    </div>
                    <Landmark className="size-4 text-faint" />
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    <ScaleBadge scale={hh.slidingScale} />
                    <StatusBadge status={hh.membershipStatus} />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {hh.kebeleName} · {hh.memberCount} members · {hh.ruralTown}
                  </p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  hint,
}: {
  icon: typeof Home;
  label: string;
  value: number;
  hint?: string;
}) {
  return (
    <Card>
      <CardContent className="flex flex-col gap-1 pt-5">
        <Icon className="size-4 text-primary" />
        <p className="tabular font-display text-2xl font-semibold">{value.toLocaleString()}</p>
        <p className="text-xs text-muted-foreground">{label}</p>
        {hint ? <p className="text-[11px] text-faint">{hint}</p> : null}
      </CardContent>
    </Card>
  );
}

function Mini({ label, value, hint }: { label: string; value: string | number; hint?: string }) {
  return (
    <Card>
      <CardContent className="pt-4">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="tabular mt-1 font-display text-xl font-semibold">{value}</p>
        {hint ? <p className="text-[11px] text-faint">{hint}</p> : null}
      </CardContent>
    </Card>
  );
}
