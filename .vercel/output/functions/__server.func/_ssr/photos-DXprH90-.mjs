import { D as newId, h as getDb } from "./input-CxFfOybE.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/photos-DXprH90-.js
var MAX_EDGE = 480;
var JPEG_QUALITY = .72;
async function compressImageFile(file) {
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
	const blob = await new Promise((resolve) => canvas.toBlob(resolve, "image/jpeg", JPEG_QUALITY));
	if (!blob) throw new Error("Could not compress the photo.");
	return blob;
}
async function saveMemberPhoto(memberId, file) {
	const db = getDb();
	const blob = await compressImageFile(file);
	const photoId = newId();
	const member = await db.members.get(memberId);
	await db.transaction("rw", db.photos, db.members, async () => {
		if (member?.photoId) await db.photos.delete(member.photoId);
		await db.photos.put({
			id: photoId,
			memberId,
			blob,
			mime: "image/jpeg",
			createdAt: Date.now()
		});
		await db.members.update(memberId, {
			photoId,
			updatedAt: Date.now()
		});
	});
	return photoId;
}
async function photoUrl(photoId) {
	if (!photoId) return null;
	const row = await getDb().photos.get(photoId);
	if (!row) return null;
	return URL.createObjectURL(row.blob);
}
function matchPhotoFilename(filename, householdCode, beneficiaryCode, fullName) {
	const base = filename.replace(/\.[^.]+$/, "").toLowerCase();
	const code = householdCode.toLowerCase().replace(/\//g, "_");
	const compact = householdCode.toLowerCase().replace(/\//g, "");
	const ben = beneficiaryCode.toLowerCase();
	const name = fullName.toLowerCase().replace(/\s+/g, "_");
	const nameSpace = fullName.toLowerCase();
	return base === `${code}_${ben}` || base === `${compact}_${ben}` || base === `${code}-${ben}` || base === name || base === nameSpace || base.endsWith(`_${ben}`) && base.includes(code.split("_").pop() ?? "___");
}
//#endregion
export { photoUrl as n, saveMemberPhoto as r, matchPhotoFilename as t };
