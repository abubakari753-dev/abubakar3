import { getDb } from "./db";
import type { PhotoRow } from "./types";

const BACKUP_KIND = "shinile-cbhi-backup";

type PhotoDump = {
  id: string;
  memberId: string;
  mime: string;
  createdAt: number;
  dataUrl: string;
};

async function blobToDataUrl(blob: Blob): Promise<string> {
  return await new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(blob);
  });
}

async function dataUrlToBlob(dataUrl: string): Promise<Blob> {
  const res = await fetch(dataUrl);
  return await res.blob();
}

export async function exportBackup(): Promise<{ blob: Blob; filename: string }> {
  const db = getDb();
  const photosRaw = await db.photos.toArray();
  const photos: PhotoDump[] = [];
  for (const row of photosRaw) {
    if (!row.blob) continue;
    photos.push({
      id: row.id,
      memberId: row.memberId,
      mime: row.mime || row.blob.type || "image/jpeg",
      createdAt: row.createdAt,
      dataUrl: await blobToDataUrl(row.blob),
    });
  }
  const payload = {
    kind: BACKUP_KIND,
    version: 1,
    exportedAt: new Date().toISOString(),
    clusters: await db.clusters.toArray(),
    phcus: await db.phcus.toArray(),
    kebeles: await db.kebeles.toArray(),
    households: await db.households.toArray(),
    members: await db.members.toArray(),
    meta: await db.meta.toArray(),
    photos,
  };
  const blob = new Blob([JSON.stringify(payload)], { type: "application/json" });
  const stamp = new Date().toISOString().slice(0, 16).replace(/[:T]/g, "");
  return { blob, filename: `Shinile_CBHI_Backup_${stamp}.json` };
}

export async function importBackup(buf: ArrayBuffer): Promise<{ households: number; members: number; photos: number }> {
  const text = new TextDecoder().decode(buf);
  const data = JSON.parse(text) as {
    kind?: string;
    clusters?: unknown[];
    phcus?: unknown[];
    kebeles?: unknown[];
    households?: unknown[];
    members?: unknown[];
    meta?: unknown[];
    photos?: PhotoDump[];
  };
  if (data.kind !== BACKUP_KIND) {
    throw new Error("This file is not a Shinile CBHI backup.");
  }
  const db = getDb();
  const tables = [db.clusters, db.phcus, db.kebeles, db.households, db.members, db.photos, db.meta];
  await db.transaction("rw", tables, async () => {
    await Promise.all([
      db.clusters.clear(),
      db.phcus.clear(),
      db.kebeles.clear(),
      db.households.clear(),
      db.members.clear(),
      db.photos.clear(),
      db.meta.clear(),
    ]);
    if (data.clusters?.length) await db.clusters.bulkPut(data.clusters as never[]);
    if (data.phcus?.length) await db.phcus.bulkPut(data.phcus as never[]);
    if (data.kebeles?.length) await db.kebeles.bulkPut(data.kebeles as never[]);
    if (data.households?.length) await db.households.bulkPut(data.households as never[]);
    if (data.members?.length) await db.members.bulkPut(data.members as never[]);
    if (data.meta?.length) await db.meta.bulkPut(data.meta as never[]);
    for (const photo of data.photos ?? []) {
      const blob = await dataUrlToBlob(photo.dataUrl);
      const row: PhotoRow = {
        id: photo.id,
        memberId: photo.memberId,
        blob,
        mime: photo.mime || blob.type || "image/jpeg",
        createdAt: photo.createdAt ?? Date.now(),
      };
      await db.photos.put(row);
    }
  });
  return {
    households: data.households?.length ?? 0,
    members: data.members?.length ?? 0,
    photos: data.photos?.length ?? 0,
  };
}
