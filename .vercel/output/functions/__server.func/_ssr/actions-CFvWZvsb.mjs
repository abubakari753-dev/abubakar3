import { E as searchKey, S as newId, T as padCode, w as normalizeName, y as getDb } from "./input-CbEkyqtb.mjs";
import { n as nextBeneficiaryCode } from "./ids-wbR7wW5G.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/actions-CFvWZvsb.js
async function upsertHousehold(input) {
	const db = getDb();
	const now = Date.now();
	const id = input.id ?? newId();
	const existing = input.id ? await db.households.get(id) : void 0;
	const row = {
		id,
		householdCode: input.householdCode.trim(),
		paymentPrefix: input.paymentPrefix,
		kebeleId: input.kebeleId,
		gote: input.gote.trim(),
		slidingScale: input.slidingScale,
		ruralTown: input.ruralTown,
		hasIdCard: input.hasIdCard,
		fan: input.fan.trim(),
		membershipStatus: input.membershipStatus,
		enrollmentDay: input.enrollmentDay,
		enrollmentMonth: input.enrollmentMonth,
		enrollmentYear: input.enrollmentYear,
		notes: input.notes ?? "",
		createdAt: existing?.createdAt ?? now,
		updatedAt: now
	};
	const clash = await db.households.where("householdCode").equals(row.householdCode).first();
	if (clash && clash.id !== id) throw new Error(`Household code ${row.householdCode} is already registered.`);
	await db.households.put(row);
	return id;
}
async function deleteHousehold(id) {
	const db = getDb();
	const members = await db.members.where("householdId").equals(id).toArray();
	await db.transaction("rw", db.households, db.members, db.photos, async () => {
		for (const m of members) {
			if (m.photoId) await db.photos.delete(m.photoId);
			await db.members.delete(m.id);
		}
		await db.households.delete(id);
	});
}
async function upsertMember(input) {
	const db = getDb();
	const now = Date.now();
	const siblings = await db.members.where("householdId").equals(input.householdId).toArray();
	const id = input.id ?? newId();
	let code = input.beneficiaryCode ? padCode(input.beneficiaryCode) : "";
	if (!code) code = input.relationship === "Household Head" ? "00" : nextBeneficiaryCode(siblings.map((s) => s.beneficiaryCode));
	if (input.relationship === "Household Head") {
		if (siblings.find((s) => s.relationship === "Household Head" && s.id !== id)) throw new Error("This household already has a head. Change the other member first.");
		code = "00";
	}
	const existing = await db.members.get(id);
	const row = {
		id,
		householdId: input.householdId,
		beneficiaryCode: code,
		fullName: normalizeName(input.fullName),
		searchName: searchKey(input.fullName),
		dobDay: input.dobDay,
		dobMonth: input.dobMonth,
		dobYear: input.dobYear,
		gender: input.gender,
		relationship: input.relationship,
		profession: input.profession,
		photoId: existing?.photoId ?? null,
		createdAt: existing?.createdAt ?? now,
		updatedAt: now
	};
	if (!row.fullName) throw new Error("Full name is required.");
	await db.members.put(row);
	await db.households.update(input.householdId, { updatedAt: now });
	return id;
}
async function deleteMember(id) {
	const db = getDb();
	const member = await db.members.get(id);
	if (!member) return;
	await db.transaction("rw", db.members, db.photos, db.households, async () => {
		if (member.photoId) await db.photos.delete(member.photoId);
		await db.members.delete(id);
		await db.households.update(member.householdId, { updatedAt: Date.now() });
	});
}
async function upsertCluster(name, id, sort) {
	const db = getDb();
	const rowId = id ?? newId();
	const count = await db.clusters.count();
	await db.clusters.put({
		id: rowId,
		name: name.trim(),
		sort: sort ?? count
	});
	return rowId;
}
async function upsertPhcu(clusterId, name, id, sort) {
	const db = getDb();
	const rowId = id ?? newId();
	const count = await db.phcus.where("clusterId").equals(clusterId).count();
	await db.phcus.put({
		id: rowId,
		clusterId,
		name: name.trim(),
		sort: sort ?? count
	});
	return rowId;
}
async function upsertKebele(input) {
	const db = getDb();
	const id = input.id ?? newId();
	const count = await db.kebeles.where("phcuId").equals(input.phcuId).count();
	const code = input.code.replace(/\D/g, "").padStart(2, "0");
	const clash = await db.kebeles.where("code").equals(code).first();
	if (clash && clash.id !== id) throw new Error(`Kebele code ${code} is already used.`);
	await db.kebeles.put({
		id,
		phcuId: input.phcuId,
		name: input.name.trim(),
		code,
		ruralTown: input.ruralTown,
		sort: input.sort ?? count
	});
	return id;
}
async function deleteCluster(id) {
	const db = getDb();
	const phcus = await db.phcus.where("clusterId").equals(id).toArray();
	for (const p of phcus) {
		const kebeles = await db.kebeles.where("phcuId").equals(p.id).toArray();
		for (const k of kebeles) if (await db.households.where("kebeleId").equals(k.id).count() > 0) throw new Error(`Cannot delete ${k.name}: households are registered there.`);
	}
	await db.transaction("rw", db.clusters, db.phcus, db.kebeles, async () => {
		for (const p of phcus) {
			await db.kebeles.where("phcuId").equals(p.id).delete();
			await db.phcus.delete(p.id);
		}
		await db.clusters.delete(id);
	});
}
async function deletePhcu(id) {
	const db = getDb();
	const kebeles = await db.kebeles.where("phcuId").equals(id).toArray();
	for (const k of kebeles) if (await db.households.where("kebeleId").equals(k.id).count() > 0) throw new Error(`Cannot delete PHCU: ${k.name} still has households.`);
	await db.transaction("rw", db.phcus, db.kebeles, async () => {
		await db.kebeles.where("phcuId").equals(id).delete();
		await db.phcus.delete(id);
	});
}
async function deleteKebele(id) {
	if (await getDb().households.where("kebeleId").equals(id).count() > 0) throw new Error("Cannot delete a kebele that has registered households.");
	await getDb().kebeles.delete(id);
}
//#endregion
export { deletePhcu as a, upsertKebele as c, deleteMember as i, upsertMember as l, deleteHousehold as n, upsertCluster as o, deleteKebele as r, upsertHousehold as s, deleteCluster as t, upsertPhcu as u };
