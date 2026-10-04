import { A as searchKey, D as newId, O as normalizeName, f as SLIDING_SCALES, g as getGeo, h as getDb, i as GENDERS, k as padCode, l as PROFESSIONS, m as ensureSeededLocations, o as KEBELE_ALIASES, s as KEBELE_CATALOG, u as RELATIONSHIPS, v as nextHouseholdSequence, w as fileStamp } from "./input-CxFfOybE.mjs";
import { i as prefixForScale, r as parseHouseholdCode, t as formatHouseholdCode } from "./ids-BV64q0mT.mjs";
import { n as utils, r as writeSync, t as readSync } from "../_libs/xlsx.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/import-export-BKY0q1F0.js
function cell(row, i) {
	const v = row[i];
	if (v == null || v === "") return "";
	return String(v).trim();
}
function num(row, i) {
	const v = row[i];
	if (v == null || v === "") return null;
	const n = Number(String(v).replace(/\.0$/, ""));
	return Number.isFinite(n) ? n : null;
}
function canonKebele(name) {
	const key = name.trim().toLowerCase();
	return KEBELE_ALIASES[key] ?? name.trim();
}
function canonGender(v) {
	const s = v.trim().toLowerCase();
	if (s === "male" || s === "m" || s === "l" || s.startsWith("male")) return "Male";
	if (s === "female" || s === "f" || s === "dh" || s.startsWith("female")) return "Female";
	return GENDERS.includes(v) ? v : null;
}
function canonRel(v) {
	const s = v.trim().toLowerCase().replace(/p+$/, "");
	if (s === "household head") return "Household Head";
	return RELATIONSHIPS.find((r) => r.toLowerCase() === s) ?? null;
}
function canonProf(v) {
	return PROFESSIONS.find((p) => p.toLowerCase() === v.trim().toLowerCase()) ?? "Other";
}
function canonScale(v) {
	return SLIDING_SCALES.find((s) => s.toLowerCase() === v.trim().toLowerCase()) ?? null;
}
function canonRural(v) {
	const s = v.trim().toLowerCase();
	if (s === "rural" || s === "rural admin") return "Rural";
	if (s === "town" || s === "town admin" || s === "urban") return "Town";
	return null;
}
function headerIndex(rows) {
	for (let i = 0; i < Math.min(rows.length, 20); i++) if (cell(rows[i] ?? [], 0).toLowerCase().includes("full name")) return i;
	return 0;
}
async function kebeleByNameOrCode(kebeles, name, codeFromId) {
	const canon = canonKebele(name);
	let k = kebeles.find((x) => x.name.toLowerCase() === canon.toLowerCase());
	if (!k && codeFromId) k = kebeles.find((x) => x.code === padCode(codeFromId));
	if (!k && name) {
		const catalog = KEBELE_CATALOG.find((c) => c.name.toLowerCase() === canon.toLowerCase() || c.code === padCode(codeFromId ?? ""));
		if (catalog) k = kebeles.find((x) => x.code === catalog.code);
	}
	return k;
}
async function importWorkbook(buffer, opts, onProgress) {
	await ensureSeededLocations();
	const wb = readSync(buffer, {
		type: "array",
		cellDates: false
	});
	const sheetName = wb.SheetNames.find((n) => n.toLowerCase().includes("regist")) ?? wb.SheetNames[0];
	if (!sheetName) throw new Error("The file has no sheets.");
	const sheet = wb.Sheets[sheetName];
	const rows = utils.sheet_to_json(sheet, {
		header: 1,
		defval: "",
		raw: true
	});
	let dataStart = headerIndex(rows) + 1;
	while (dataStart < rows.length) {
		const a = cell(rows[dataStart] ?? [], 0).toLowerCase();
		const b = cell(rows[dataStart] ?? [], 1).toLowerCase();
		if (a && !a.includes("day") && !a.includes("ቀን") && a !== "full name *" && !b.includes("day (dd)")) break;
		dataStart += 1;
	}
	const db = getDb();
	if (opts.mode === "replace") await db.transaction("rw", db.households, db.members, db.photos, async () => {
		await db.households.clear();
		await db.members.clear();
		await db.photos.clear();
	});
	const kebeles = await db.kebeles.toArray();
	await getGeo();
	const existingCodes = new Set((await db.households.toArray()).map((h) => h.householdCode.toLowerCase()));
	const result = {
		stage: "importing",
		households: 0,
		members: 0,
		skipped: 0,
		errors: []
	};
	let currentHhId = null;
	const now = Date.now();
	const pendingHh = [];
	const pendingMem = [];
	const flush = async () => {
		if (pendingHh.length) {
			await db.households.bulkAdd(pendingHh);
			pendingHh.splice(0);
		}
		if (pendingMem.length) {
			await db.members.bulkAdd(pendingMem);
			pendingMem.splice(0);
		}
		onProgress?.({ ...result });
	};
	for (let r = dataStart; r < rows.length; r++) {
		const row = rows[r] ?? [];
		const fullName = normalizeName(cell(row, 0));
		if (!fullName) {
			result.skipped += 1;
			continue;
		}
		const lower = fullName.toLowerCase();
		if (lower.includes("letter stands") || lower.includes("lambarka") || lower.includes("kebele") || lower.startsWith("የአባሉ") || lower === "full name *") {
			result.skipped += 1;
			continue;
		}
		const gender = canonGender(cell(row, 4));
		const rel = canonRel(cell(row, 9));
		if (!gender || !rel) {
			result.skipped += 1;
			continue;
		}
		const rawCode = cell(row, 5).replace(/\\/g, "/");
		const parsed = parseHouseholdCode(rawCode);
		const beneficiary = padCode(cell(row, 6) || (rel === "Household Head" ? "00" : ""));
		const kebeleName = cell(row, 7);
		const gote = cell(row, 8);
		const scale = canonScale(cell(row, 14));
		const rural = canonRural(cell(row, 15));
		const hasCard = /^y/i.test(cell(row, 16));
		const fan = cell(row, 17);
		const status = cell(row, 18).toLowerCase().includes("un") ? "Un-renewed" : "Renewed";
		if (parsed || rel === "Household Head" && rawCode) {
			const kebele = await kebeleByNameOrCode(kebeles, kebeleName, parsed?.kebeleCode);
			if (!kebele) {
				result.errors.push(`Unknown kebele for ${fullName} (${kebeleName || rawCode})`);
				result.skipped += 1;
				currentHhId = null;
				continue;
			}
			const householdCode = parsed ? `${parsed.prefix}/${parsed.regionCode}/${parsed.zoneCode}/${parsed.woredaCode}/${parsed.kebeleCode}/${String(parsed.sequence).padStart(4, "0")}` : rawCode;
			if (existingCodes.has(householdCode.toLowerCase())) {
				if (opts.mode === "merge") currentHhId = (await db.households.where("householdCode").equals(householdCode).first())?.id ?? null;
			}
			if (!existingCodes.has(householdCode.toLowerCase())) {
				currentHhId = newId();
				const sliding = scale ?? (parsed?.prefix === "I" ? "Lower" : "Middle");
				pendingHh.push({
					id: currentHhId,
					householdCode,
					paymentPrefix: parsed?.prefix === "I" ? "I" : "P",
					kebeleId: kebele.id,
					gote,
					slidingScale: sliding,
					ruralTown: rural ?? kebele.ruralTown,
					hasIdCard: hasCard,
					fan,
					membershipStatus: status,
					enrollmentDay: num(row, 11),
					enrollmentMonth: num(row, 12),
					enrollmentYear: num(row, 13),
					notes: "",
					createdAt: now,
					updatedAt: now
				});
				existingCodes.add(householdCode.toLowerCase());
				result.households += 1;
			}
		}
		if (!currentHhId) {
			result.skipped += 1;
			continue;
		}
		pendingMem.push({
			id: newId(),
			householdId: currentHhId,
			beneficiaryCode: beneficiary || "00",
			fullName,
			searchName: searchKey(fullName),
			dobDay: num(row, 1),
			dobMonth: num(row, 2),
			dobYear: num(row, 3),
			gender,
			relationship: rel,
			profession: canonProf(cell(row, 10)),
			photoId: null,
			createdAt: now,
			updatedAt: now
		});
		result.members += 1;
		if (pendingMem.length >= 400) await flush();
	}
	await flush();
	result.stage = "done";
	onProgress?.(result);
	return result;
}
async function exportWorkbook() {
	const db = getDb();
	const geo = await getGeo();
	const [households, members, kebeles] = await Promise.all([
		db.households.orderBy("householdCode").toArray(),
		db.members.toArray(),
		db.kebeles.toArray()
	]);
	const kebeleById = new Map(kebeles.map((k) => [k.id, k]));
	const fam = /* @__PURE__ */ new Map();
	for (const m of members) {
		const list = fam.get(m.householdId) ?? [];
		list.push(m);
		fam.set(m.householdId, list);
	}
	const aoa = [];
	aoa.push(["CBHI Members & Beneficiaries Profile"]);
	aoa.push([]);
	aoa.push([]);
	aoa.push([
		"",
		"",
		"",
		"",
		"",
		"",
		"Region *",
		geo.region,
		"Zone *",
		geo.zone,
		"Woreda *",
		geo.woreda
	]);
	aoa.push([]);
	aoa.push([]);
	aoa.push([
		"ሙሉ ስም *",
		"የትውልድ ቀን *",
		"",
		"",
		"ፆታ *",
		"የማአጤመ ቁጥር *",
		"የአባሉ መለያ ቁጥር *",
		"ቀበሌ *",
		"ጎጥ",
		"የአባሉ ዝምድና *",
		"የስራ ዘርፍ",
		"የአባልነት ምዝገባ ቀን *",
		"",
		"",
		" *",
		"ገጠር / ከተማ *",
		"የማአጤመ መታወቂያ አለው? *",
		"የዲጂታል መታወቂያ ካርድ ቁጥር *",
		"Membership status"
	]);
	aoa.push([
		"Full Name *",
		"Date Of Birth *",
		"",
		"",
		"Gender *",
		"Household CBHI Id *",
		"Beneficiary CBHI Id *",
		"Kebele *",
		"Gote",
		"Relationship *",
		"Profession",
		"Enrollment Date *",
		"",
		"",
		"Sliding Scale Category *",
		"Rural / Town Admin *",
		"Has CBHI Id Card (Yes/No) *",
		"National Digital ID Card Number(FAN)*",
		"Status of HH"
	]);
	aoa.push([
		"",
		"Day (DD)",
		"Month (MM)",
		"Year (YYYY)",
		"",
		"",
		"",
		"",
		"",
		"",
		"",
		"Day (DD)",
		"Month (MM)",
		"Year (YYYY)"
	]);
	for (const hh of households) {
		const kebele = kebeleById.get(hh.kebeleId);
		(fam.get(hh.id) ?? []).sort((a, b) => a.beneficiaryCode.localeCompare(b.beneficiaryCode)).forEach((m, idx) => {
			const isHead = idx === 0 || m.relationship === "Household Head";
			aoa.push([
				m.fullName,
				m.dobDay,
				m.dobMonth,
				m.dobYear,
				m.gender,
				isHead ? hh.householdCode : "",
				m.beneficiaryCode,
				kebele?.name ?? "",
				hh.gote,
				m.relationship,
				m.profession,
				isHead ? hh.enrollmentDay : "",
				isHead ? hh.enrollmentMonth : "",
				isHead ? hh.enrollmentYear : "",
				isHead ? hh.slidingScale : "",
				isHead ? hh.ruralTown : "",
				isHead ? hh.hasIdCard ? "Yes" : "No" : "",
				isHead ? hh.fan : "",
				isHead ? hh.membershipStatus : ""
			]);
		});
	}
	const wb = utils.book_new();
	const ws = utils.aoa_to_sheet(aoa);
	ws["!cols"] = [
		{ wch: 28 },
		{ wch: 10 },
		{ wch: 10 },
		{ wch: 10 },
		{ wch: 10 },
		{ wch: 22 },
		{ wch: 12 },
		{ wch: 16 },
		{ wch: 8 },
		{ wch: 18 },
		{ wch: 18 },
		{ wch: 10 },
		{ wch: 10 },
		{ wch: 10 },
		{ wch: 12 },
		{ wch: 12 },
		{ wch: 12 },
		{ wch: 22 },
		{ wch: 14 }
	];
	utils.book_append_sheet(wb, ws, "CBHI Registration Form");
	const lookup = utils.aoa_to_sheet([
		[
			"Gender",
			"Relationship to HH",
			"Professions",
			"Sliding Scale Category",
			"Status of HH",
			"Rural / Town",
			"Has ID Card?",
			"National Digital ID Card Number(FAN)*",
			"Payment Category"
		],
		[
			"Male",
			"Household Head",
			"Farmer",
			"Higher",
			"Renewed",
			"Rural",
			"Yes",
			"",
			"Higher Class HHs 1,930 birr"
		],
		[
			"Female",
			"Parent",
			"Pastoralist",
			"Middle",
			"Un-renewed",
			"Town",
			"No",
			"",
			"Middle class HHs 1,310 birr"
		],
		[
			"",
			"Husband",
			"Merchant",
			"Lower",
			"",
			"",
			"",
			"",
			"Lower Class HHs (Subsidy Covered by Government) 720 birr"
		],
		[
			"",
			"Wife",
			"Job Seeker"
		],
		[
			"",
			"Son",
			"Housewife"
		],
		[
			"",
			"Daughter",
			"Stay at home Husband"
		],
		[
			"",
			"Other",
			"Daily Laborer"
		],
		[
			"",
			"",
			"Student"
		],
		[
			"",
			"",
			"Disabled"
		],
		[
			"",
			"",
			"Other"
		]
	]);
	utils.book_append_sheet(wb, lookup, "Lookup");
	const out = writeSync(wb, {
		bookType: "xlsx",
		type: "array"
	});
	return {
		blob: new Blob([out], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" }),
		filename: `CBHI-${geo.woreda}-${fileStamp()}.xlsx`
	};
}
async function exportCsv() {
	const { blob: xblob, filename } = await exportWorkbook();
	const buf = await xblob.arrayBuffer();
	const wb = readSync(buf, { type: "array" });
	const sheet = wb.Sheets[wb.SheetNames[0]];
	const csv = utils.sheet_to_csv(sheet);
	return {
		blob: new Blob([csv], { type: "text/csv;charset=utf-8" }),
		filename: filename.replace(/\.xlsx$/, ".csv")
	};
}
async function downloadBlob(blob, filename) {
	const picker = window.showSaveFilePicker;
	if (typeof picker === "function") try {
		const ext = filename.includes(".") ? `.${filename.split(".").pop()}` : "";
		const handle = await picker({
			suggestedName: filename,
			types: [{
				description: "Shinile CBHI file",
				accept: { [blob.type || "application/octet-stream"]: [ext || ".bin"] }
			}]
		});
		const writable = await handle.createWritable();
		await writable.write(blob);
		await writable.close();
		return {
			savedAs: handle.name || filename,
			picked: true
		};
	} catch (err) {
		if (err instanceof DOMException && err.name === "AbortError") return {
			savedAs: filename,
			picked: false
		};
	}
	const url = URL.createObjectURL(blob);
	const a = document.createElement("a");
	a.href = url;
	a.download = filename;
	a.rel = "noopener";
	document.body.appendChild(a);
	a.click();
	a.remove();
	setTimeout(() => URL.revokeObjectURL(url), 4e3);
	return {
		savedAs: filename,
		picked: false
	};
}
async function suggestHouseholdCode(kebeleCode, scale, geo) {
	const seq = await nextHouseholdSequence(kebeleCode, geo);
	return formatHouseholdCode(prefixForScale(scale), geo, kebeleCode, seq);
}
//#endregion
export { suggestHouseholdCode as a, importWorkbook as i, exportCsv as n, exportWorkbook as r, downloadBlob as t };
