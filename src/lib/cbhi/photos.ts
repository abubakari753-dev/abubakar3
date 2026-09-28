import { getDb } from "./db";
import { newId } from "../utils";

const MAX_EDGE = 480;
const JPEG_QUALITY = 0.72;

export async function compressImageFile(file: File | Blob): Promise<Blob> {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, MAX_EDGE / Math.max(bitmap.width, bitmap.height));
  const w = Math.max(1, Math.round(bitmap.width * scale));
  const h = Math.max(1, Math.round(bitmap.height * scale));
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Could not read the photo.");
  ctx.fillStyle = "#f6f1e8";
  ctx.fillRect(0, 0, w, h);
  ctx.drawImage(bitmap, 0, 0, w, h);
  bitmap.close();
  const blob = await new Promise<Blob | null>((resolve) =>
    canvas.toBlob(resolve, "image/jpeg", JPEG_QUALITY),
  );
  if (!blob) throw new Error("Could not compress the photo.");
  return blob;
}

export async function saveMemberPhoto(memberId: string, file: File | Blob): Promise<string> {
  const db = getDb();
  const blob = await compressImageFile(file);
  const photoId = newId();
  const member = await db.members.get(memberId);
  await db.transaction("rw", db.photos, db.members, async () => {
    if (member?.photoId) {
      await db.photos.delete(member.photoId);
    }
    await db.photos.put({
      id: photoId,
      memberId,
      blob,
      mime: "image/jpeg",
      createdAt: Date.now(),
    });
    await db.members.update(memberId, { photoId, updatedAt: Date.now() });
  });
  return photoId;
}

export async function removeMemberPhoto(memberId: string): Promise<void> {
  const db = getDb();
  const member = await db.members.get(memberId);
  if (!member?.photoId) return;
  await db.transaction("rw", db.photos, db.members, async () => {
    await db.photos.delete(member.photoId!);
    await db.members.update(memberId, { photoId: null, updatedAt: Date.now() });
  });
}

export async function photoUrl(photoId: string | null | undefined): Promise<string | null> {
  if (!photoId) return null;
  const row = await getDb().photos.get(photoId);
  if (!row) return null;
  return URL.createObjectURL(row.blob);
}

export function matchPhotoFilename(
  filename: string,
  householdCode: string,
  beneficiaryCode: string,
  fullName: string,
): boolean {
  const base = filename.replace(/\.[^.]+$/, "").toLowerCase();
  const code = householdCode.toLowerCase().replace(/\//g, "_");
  const compact = householdCode.toLowerCase().replace(/\//g, "");
  const ben = beneficiaryCode.toLowerCase();
  const name = fullName.toLowerCase().replace(/\s+/g, "_");
  const nameSpace = fullName.toLowerCase();
  return (
    base === `${code}_${ben}` ||
    base === `${compact}_${ben}` ||
    base === `${code}-${ben}` ||
    base === name ||
    base === nameSpace ||
    base.endsWith(`_${ben}`) && base.includes(code.split("_").pop() ?? "___")
  );
}
