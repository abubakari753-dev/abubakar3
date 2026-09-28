import Dexie, { type EntityTable } from "dexie";
import type {
  ClusterRow,
  GeoSettings,
  HouseholdRow,
  KebeleRow,
  MemberRow,
  MetaRow,
  PhcuRow,
  PhotoRow,
} from "./types";
import { DEFAULT_GEO, KEBELE_CATALOG, DEFAULT_CLUSTERS } from "./constants";
import { newId } from "../utils";

export const DB_NAME = "shinile-cbhi";
export const DB_VERSION = 1;

class CBHIDatabase extends Dexie {
  clusters!: EntityTable<ClusterRow, "id">;
  phcus!: EntityTable<PhcuRow, "id">;
  kebeles!: EntityTable<KebeleRow, "id">;
  households!: EntityTable<HouseholdRow, "id">;
  members!: EntityTable<MemberRow, "id">;
  photos!: EntityTable<PhotoRow, "id">;
  meta!: EntityTable<MetaRow, "key">;

  constructor() {
    super(DB_NAME);
    this.version(DB_VERSION).stores({
      clusters: "id, name, sort",
      phcus: "id, clusterId, name, sort",
      kebeles: "id, phcuId, name, code, sort",
      households: "id, householdCode, kebeleId, slidingScale, membershipStatus, paymentPrefix, updatedAt, fan",
      members: "id, householdId, beneficiaryCode, searchName, relationship, photoId",
      photos: "id, memberId",
      meta: "key",
    });
  }
}

let _db: CBHIDatabase | null = null;

export function getDb(): CBHIDatabase {
  if (typeof indexedDB === "undefined") {
    throw new Error("IndexedDB is not available in this environment.");
  }
  if (!_db) _db = new CBHIDatabase();
  return _db;
}

export async function getMeta(key: string): Promise<string | null> {
  const row = await getDb().meta.get(key);
  return row?.value ?? null;
}

export async function setMeta(key: string, value: string): Promise<void> {
  await getDb().meta.put({ key, value });
}

export async function getGeo(): Promise<GeoSettings> {
  const raw = await getMeta("geo");
  if (!raw) return { ...DEFAULT_GEO };
  try {
    return { ...DEFAULT_GEO, ...JSON.parse(raw) };
  } catch {
    return { ...DEFAULT_GEO };
  }
}

export async function setGeo(geo: GeoSettings): Promise<void> {
  await setMeta("geo", JSON.stringify(geo));
}

export async function ensureSeededLocations(): Promise<void> {
  const db = getDb();
  const count = await db.kebeles.count();
  if (count > 0) {
    const seeded = await getMeta("locationsSeeded");
    if (seeded) return;
  }

  await db.transaction("rw", db.clusters, db.phcus, db.kebeles, db.meta, async () => {
    const existing = await db.kebeles.count();
    if (existing > 0) {
      await db.meta.put({ key: "locationsSeeded", value: "1" });
      return;
    }
    const kebeleByCode = new Map(KEBELE_CATALOG.map((k) => [k.code, k]));
    let clusterSort = 0;
    for (const cluster of DEFAULT_CLUSTERS) {
      const clusterId = newId();
      await db.clusters.add({ id: clusterId, name: cluster.name, sort: clusterSort++ });
      let phcuSort = 0;
      for (const phcu of cluster.phcus) {
        const phcuId = newId();
        await db.phcus.add({
          id: phcuId,
          clusterId,
          name: phcu.name,
          sort: phcuSort++,
        });
        let kebeleSort = 0;
        for (const code of phcu.kebeleCodes) {
          const catalog = kebeleByCode.get(code);
          if (!catalog) continue;
          await db.kebeles.add({
            id: newId(),
            phcuId,
            name: catalog.name,
            code: catalog.code,
            ruralTown: catalog.ruralTown,
            sort: kebeleSort++,
          });
        }
      }
    }
    await db.meta.put({ key: "locationsSeeded", value: "1" });
    await db.meta.put({ key: "geo", value: JSON.stringify(DEFAULT_GEO) });
  });
}

export async function nextHouseholdSequence(kebeleCode: string, geo: GeoSettings): Promise<number> {
  const db = getDb();
  const suffix = `/${geo.regionCode}/${geo.zoneCode}/${geo.woredaCode}/${kebeleCode}/`;
  const all = await db.households.toArray();
  let max = 0;
  for (const hh of all) {
    const idx = hh.householdCode.indexOf(suffix);
    if (idx === -1) continue;
    const seq = Number(hh.householdCode.slice(idx + suffix.length));
    if (Number.isFinite(seq) && seq > max) max = seq;
  }
  return max + 1;
}

export async function wipeRegister(keepLocations = true): Promise<void> {
  const db = getDb();
  await db.transaction("rw", db.households, db.members, db.photos, db.meta, async () => {
    await db.households.clear();
    await db.members.clear();
    await db.photos.clear();
    await db.meta.delete("demoLoaded");
  });
  if (!keepLocations) {
    await db.transaction("rw", db.clusters, db.phcus, db.kebeles, db.meta, async () => {
      await db.clusters.clear();
      await db.phcus.clear();
      await db.kebeles.clear();
      await db.meta.delete("locationsSeeded");
    });
    await ensureSeededLocations();
  }
}
