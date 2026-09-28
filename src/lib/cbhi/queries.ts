import { getDb } from "./db";
import { SLIDING_SCALE_META } from "./constants";
import type {
  DashboardStats,
  HouseholdView,
  KebeleRow,
  MemberRow,
  SlidingScale,
  RuralTown,
  Gender,
} from "./types";

export async function locationMaps() {
  const db = getDb();
  const [clusters, phcus, kebeles] = await Promise.all([
    db.clusters.toArray(),
    db.phcus.toArray(),
    db.kebeles.toArray(),
  ]);
  const clusterById = new Map(clusters.map((c) => [c.id, c]));
  const phcuById = new Map(phcus.map((p) => [p.id, p]));
  const kebeleById = new Map(kebeles.map((k) => [k.id, k]));
  return { clusters, phcus, kebeles, clusterById, phcuById, kebeleById };
}

export async function householdViews(): Promise<HouseholdView[]> {
  const db = getDb();
  const [households, members, maps] = await Promise.all([
    db.households.orderBy("householdCode").toArray(),
    db.members.toArray(),
    locationMaps(),
  ]);
  const byHh = new Map<string, MemberRow[]>();
  for (const m of members) {
    const list = byHh.get(m.householdId) ?? [];
    list.push(m);
    byHh.set(m.householdId, list);
  }
  return households.map((hh) => {
    const kebele = maps.kebeleById.get(hh.kebeleId);
    const phcu = kebele ? maps.phcuById.get(kebele.phcuId) : undefined;
    const cluster = phcu ? maps.clusterById.get(phcu.clusterId) : undefined;
    const fam = byHh.get(hh.id) ?? [];
    const head = fam.find((m) => m.relationship === "Household Head") ?? fam[0];
    return {
      ...hh,
      kebeleName: kebele?.name ?? "—",
      kebeleCode: kebele?.code ?? "",
      phcuName: phcu?.name ?? "—",
      clusterName: cluster?.name ?? "—",
      headName: head?.fullName ?? "No head recorded",
      memberCount: fam.length,
      premium: SLIDING_SCALE_META[hh.slidingScale].amount,
    };
  });
}

export async function membersForHousehold(householdId: string): Promise<MemberRow[]> {
  const rows = await getDb().members.where("householdId").equals(householdId).toArray();
  return rows.sort((a, b) => a.beneficiaryCode.localeCompare(b.beneficiaryCode));
}

export async function searchRegister(query: string, limit = 40) {
  const q = query.trim().toLowerCase();
  if (q.length < 1) return [];
  const db = getDb();
  const [members, households, kebeles] = await Promise.all([
    db.members.toArray(),
    db.households.toArray(),
    db.kebeles.toArray(),
  ]);
  const hhById = new Map(households.map((h) => [h.id, h]));
  const kebeleById = new Map(kebeles.map((k) => [k.id, k]));
  const hits: {
    memberId: string;
    householdId: string;
    fullName: string;
    householdCode: string;
    beneficiaryCode: string;
    kebeleName: string;
    relationship: string;
  }[] = [];
  for (const m of members) {
    const hh = hhById.get(m.householdId);
    if (!hh) continue;
    const kebele = kebeleById.get(hh.kebeleId);
    const hay = `${m.searchName} ${hh.householdCode.toLowerCase()} ${m.beneficiaryCode} ${hh.fan.toLowerCase()} ${kebele?.name.toLowerCase() ?? ""}`;
    if (!hay.includes(q)) continue;
    hits.push({
      memberId: m.id,
      householdId: hh.id,
      fullName: m.fullName,
      householdCode: hh.householdCode,
      beneficiaryCode: m.beneficiaryCode,
      kebeleName: kebele?.name ?? "—",
      relationship: m.relationship,
    });
    if (hits.length >= limit) break;
  }
  return hits;
}

export async function dashboardStats(): Promise<DashboardStats> {
  const db = getDb();
  const [households, members, photos, kebeles] = await Promise.all([
    db.households.toArray(),
    db.members.toArray(),
    db.photos.count(),
    db.kebeles.toArray(),
  ]);
  const kebeleById = new Map(kebeles.map((k) => [k.id, k]));
  const byScale: DashboardStats["byScale"] = {
    Higher: { households: 0, members: 0, premium: 0 },
    Middle: { households: 0, members: 0, premium: 0 },
    Lower: { households: 0, members: 0, premium: 0 },
  };
  const byRural: Record<RuralTown, number> = { Rural: 0, Town: 0 };
  const kebeleStats = new Map<string, { name: string; code: string; households: number; members: number }>();
  for (const k of kebeles) {
    kebeleStats.set(k.id, { name: k.name, code: k.code, households: 0, members: 0 });
  }
  let renewed = 0;
  let unrenewed = 0;
  let paying = 0;
  let indigent = 0;
  const membersByHh = new Map<string, number>();
  for (const m of members) {
    membersByHh.set(m.householdId, (membersByHh.get(m.householdId) ?? 0) + 1);
  }
  for (const hh of households) {
    const mc = membersByHh.get(hh.id) ?? 0;
    const bucket = byScale[hh.slidingScale as SlidingScale];
    bucket.households += 1;
    bucket.members += mc;
    bucket.premium += SLIDING_SCALE_META[hh.slidingScale].amount;
    byRural[hh.ruralTown] += 1;
    if (hh.membershipStatus === "Renewed") renewed += 1;
    else unrenewed += 1;
    if (hh.paymentPrefix === "P") paying += 1;
    else indigent += 1;
    const ks = kebeleStats.get(hh.kebeleId);
    if (ks) {
      ks.households += 1;
      ks.members += mc;
    }
  }
  const byGender: Record<Gender, number> = { Male: 0, Female: 0 };
  const profMap = new Map<string, number>();
  for (const m of members) {
    byGender[m.gender] += 1;
    profMap.set(m.profession, (profMap.get(m.profession) ?? 0) + 1);
  }
  return {
    households: households.length,
    members: members.length,
    photos,
    renewed,
    unrenewed,
    byScale,
    byRural,
    byKebele: [...kebeleStats.values()].sort((a, b) => b.households - a.households),
    byGender,
    byProfession: [...profMap.entries()]
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count),
    paying,
    indigent,
  };
}

export function emptyStats(): DashboardStats {
  return {
    households: 0,
    members: 0,
    photos: 0,
    renewed: 0,
    unrenewed: 0,
    byScale: {
      Higher: { households: 0, members: 0, premium: 0 },
      Middle: { households: 0, members: 0, premium: 0 },
      Lower: { households: 0, members: 0, premium: 0 },
    },
    byRural: { Rural: 0, Town: 0 },
    byKebele: [],
    byGender: { Male: 0, Female: 0 },
    byProfession: [],
    paying: 0,
    indigent: 0,
  };
}

export type { KebeleRow };
