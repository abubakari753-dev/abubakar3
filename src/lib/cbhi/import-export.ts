import * as XLSX from "xlsx";
import { getDb, ensureSeededLocations, getGeo, nextHouseholdSequence } from "./db";
import {
  GENDERS,
  KEBELE_ALIASES,
  KEBELE_CATALOG,
  PROFESSIONS,
  RELATIONSHIPS,
  SLIDING_SCALE_META,
  SLIDING_SCALES,
  type Gender,
  type Profession,
  type Relationship,
  type RuralTown,
  type SlidingScale,
  type MembershipStatus,
} from "./constants";
import { formatHouseholdCode, parseHouseholdCode, prefixForScale } from "./ids";
import { newId, padCode, searchKey, normalizeName, fileStamp } from "../utils";
import type { GeoSettings, HouseholdRow, KebeleRow, MemberRow } from "./types";

export interface ImportProgress {
  stage: string;
  households: number;
  members: number;
  skipped: number;
}

export interface ImportResult extends ImportProgress {
  errors: string[];
}

function cell(row: unknown[], i: number): string {
  const v = row[i];
  if (v == null || v === "") return "";
  return String(v).trim();
}

function num(row: unknown[], i: number): number | null {
  const v = row[i];
  if (v == null || v === "") return null;
  const n = Number(String(v).replace(/\.0$/, ""));
  return Number.isFinite(n) ? n : null;
}

function canonKebele(name: string): string {
  const key = name.trim().toLowerCase();
  return KEBELE_ALIASES[key] ?? name.trim();
}

function canonGender(v: string): Gender | null {
  const s = v.trim().toLowerCase();
  if (s === "male" || s === "m" || s === "l" || s.startsWith("male")) return "Male";
  if (s === "female" || s === "f" || s === "dh" || s.startsWith("female")) return "Female";
  return (GENDERS as readonly string[]).includes(v) ? (v as Gender) : null;
}

function canonRel(v: string): Relationship | null {
  const s = v.trim().toLowerCase().replace(/p+$/, "");
  if (s === "household head") return "Household Head";
  const hit = RELATIONSHIPS.find((r) => r.toLowerCase() === s);
  return hit ?? null;
}

function canonProf(v: string): Profession {
  const hit = PROFESSIONS.find((p) => p.toLowerCase() === v.trim().toLowerCase());
  return hit ?? "Other";
}

function canonScale(v: string): SlidingScale | null {
  const hit = SLIDING_SCALES.find((s) => s.toLowerCase() === v.trim().toLowerCase());
  return hit ?? null;
}

function canonRural(v: string): RuralTown | null {
  const s = v.trim().toLowerCase();
  if (s === "rural" || s === "rural admin") return "Rural";
  if (s === "town" || s === "town admin" || s === "urban") return "Town";
  return null;
}

function headerIndex(rows: unknown[][]): number {
  for (let i = 0; i < Math.min(rows.length, 20); i++) {
    const a = cell(rows[i] ?? [], 0).toLowerCase();
    if (a.includes("full name")) return i;
  }
  return 0;
}

async function kebeleByNameOrCode(
  kebeles: KebeleRow[],
  name: string,
  codeFromId?: string,
): Promise<KebeleRow | undefined> {
  const canon = canonKebele(name);
  let k = kebeles.find((x) => x.name.toLowerCase() === canon.toLowerCase());
  if (!k && codeFromId) k = kebeles.find((x) => x.code === padCode(codeFromId));
  if (!k && name) {
    const catalog = KEBELE_CATALOG.find(
      (c) => c.name.toLowerCase() === canon.toLowerCase() || c.code === padCode(codeFromId ?? ""),
    );
    if (catalog) {
      k = kebeles.find((x) => x.code === catalog.code);
    }
  }
  return k;
}

export async function importWorkbook(
  buffer: ArrayBuffer,
  opts: { mode: "merge" | "replace" },
  onProgress?: (p: ImportProgress) => void,
): Promise<ImportResult> {
  await ensureSeededLocations();
  const wb = XLSX.read(buffer, { type: "array", cellDates: false });
  const sheetName = wb.SheetNames.find((n) => n.toLowerCase().includes("regist")) ?? wb.SheetNames[0];
  if (!sheetName) throw new Error("The file has no sheets.");
  const sheet = wb.Sheets[sheetName];
  const rows = XLSX.utils.sheet_to_json(sheet, {
    header: 1,
    defval: "",
    raw: true,
  }) as unknown as unknown[][];

  const start = headerIndex(rows);
  let dataStart = start + 1;
  while (dataStart < rows.length) {
    const a = cell(rows[dataStart] ?? [], 0).toLowerCase();
    const b = cell(rows[dataStart] ?? [], 1).toLowerCase();
    if (a && !a.includes("day") && !a.includes("ቀን") && a !== "full name *" && !b.includes("day (dd)")) {
      break;
    }
    dataStart += 1;
  }

  const db = getDb();
  if (opts.mode === "replace") {
    await db.transaction("rw", db.households, db.members, db.photos, async () => {
      await db.households.clear();
      await db.members.clear();
      await db.photos.clear();
    });
  }

  const kebeles = await db.kebeles.toArray();
  const geo = await getGeo();
  const existingCodes = new Set((await db.households.toArray()).map((h) => h.householdCode.toLowerCase()));

  const result: ImportResult = { stage: "importing", households: 0, members: 0, skipped: 0, errors: [] };
  let currentHhId: string | null = null;
  let currentCode = "";
  const now = Date.now();
  const pendingHh: HouseholdRow[] = [];
  const pendingMem: MemberRow[] = [];

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
    if (
      lower.includes("letter stands") ||
      lower.includes("lambarka") ||
      lower.includes("kebele") ||
      lower.startsWith("የአባሉ") ||
      lower === "full name *"
    ) {
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
    const statusRaw = cell(row, 18).toLowerCase();
    const status: MembershipStatus = statusRaw.includes("un") ? "Un-renewed" : "Renewed";

    if (parsed || (rel === "Household Head" && rawCode)) {
      const kebele = await kebeleByNameOrCode(kebeles, kebeleName, parsed?.kebeleCode);
      if (!kebele) {
        result.errors.push(`Unknown kebele for ${fullName} (${kebeleName || rawCode})`);
        result.skipped += 1;
        currentHhId = null;
        continue;
      }
      const householdCode = parsed
        ? `${parsed.prefix}/${parsed.regionCode}/${parsed.zoneCode}/${parsed.woredaCode}/${parsed.kebeleCode}/${String(parsed.sequence).padStart(4, "0")}`
        : rawCode;
      if (existingCodes.has(householdCode.toLowerCase())) {
        if (opts.mode === "merge") {
          const existing = await db.households.where("householdCode").equals(householdCode).first();
          currentHhId = existing?.id ?? null;
          currentCode = householdCode;
          // still add members if missing
        }
      }
      if (!existingCodes.has(householdCode.toLowerCase())) {
        currentHhId = newId();
        currentCode = householdCode;
        const sliding: SlidingScale = scale ?? (parsed?.prefix === "I" ? "Lower" : "Middle");
        pendingHh.push({
          id: currentHhId,
          householdCode,
          paymentPrefix: (parsed?.prefix === "I" ? "I" : "P") as "P" | "I",
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
          updatedAt: now,
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
      updatedAt: now,
    });
    result.members += 1;

    if (pendingMem.length >= 400) await flush();
    void currentCode;
    void geo;
  }

  await flush();
  result.stage = "done";
  onProgress?.(result);
  return result;
}

export async function exportWorkbook(): Promise<{ blob: Blob; filename: string }> {
  const db = getDb();
  const geo = await getGeo();
  const [households, members, kebeles] = await Promise.all([
    db.households.orderBy("householdCode").toArray(),
    db.members.toArray(),
    db.kebeles.toArray(),
  ]);
  const kebeleById = new Map(kebeles.map((k) => [k.id, k]));
  const fam = new Map<string, typeof members>();
  for (const m of members) {
    const list = fam.get(m.householdId) ?? [];
    list.push(m);
    fam.set(m.householdId, list);
  }

  const aoa: (string | number | null)[][] = [];
  aoa.push(["CBHI Members & Beneficiaries Profile"]);
  aoa.push([]);
  aoa.push([]);
  aoa.push(["", "", "", "", "", "", "Region *", geo.region, "Zone *", geo.zone, "Woreda *", geo.woreda]);
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
    "Membership status",
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
    "Status of HH",
  ]);
  aoa.push(["", "Day (DD)", "Month (MM)", "Year (YYYY)", "", "", "", "", "", "", "", "Day (DD)", "Month (MM)", "Year (YYYY)"]);

  for (const hh of households) {
    const kebele = kebeleById.get(hh.kebeleId);
    const people = (fam.get(hh.id) ?? []).sort((a, b) => a.beneficiaryCode.localeCompare(b.beneficiaryCode));
    people.forEach((m, idx) => {
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
        isHead ? (hh.hasIdCard ? "Yes" : "No") : "",
        isHead ? hh.fan : "",
        isHead ? hh.membershipStatus : "",
      ]);
    });
  }

  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.aoa_to_sheet(aoa);
  ws["!cols"] = [
    { wch: 28 }, { wch: 10 }, { wch: 10 }, { wch: 10 }, { wch: 10 },
    { wch: 22 }, { wch: 12 }, { wch: 16 }, { wch: 8 }, { wch: 18 },
    { wch: 18 }, { wch: 10 }, { wch: 10 }, { wch: 10 }, { wch: 12 },
    { wch: 12 }, { wch: 12 }, { wch: 22 }, { wch: 14 },
  ];
  XLSX.utils.book_append_sheet(wb, ws, "CBHI Registration Form");

  const lookup = XLSX.utils.aoa_to_sheet([
    ["Gender", "Relationship to HH", "Professions", "Sliding Scale Category", "Status of HH", "Rural / Town", "Has ID Card?", "National Digital ID Card Number(FAN)*", "Payment Category"],
    ["Male", "Household Head", "Farmer", "Higher", "Renewed", "Rural", "Yes", "", "Higher Class HHs 1,930 birr"],
    ["Female", "Parent", "Pastoralist", "Middle", "Un-renewed", "Town", "No", "", "Middle class HHs 1,310 birr"],
    ["", "Husband", "Merchant", "Lower", "", "", "", "", "Lower Class HHs (Subsidy Covered by Government) 720 birr"],
    ["", "Wife", "Job Seeker"],
    ["", "Son", "Housewife"],
    ["", "Daughter", "Stay at home Husband"],
    ["", "Other", "Daily Laborer"],
    ["", "", "Student"],
    ["", "", "Disabled"],
    ["", "", "Other"],
  ]);
  XLSX.utils.book_append_sheet(wb, lookup, "Lookup");

  const out = XLSX.write(wb, { bookType: "xlsx", type: "array" });
  const blob = new Blob([out], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
  const filename = `CBHI-${geo.woreda}-${fileStamp()}.xlsx`;
  return { blob, filename };
}

export async function exportCsv(): Promise<{ blob: Blob; filename: string }> {
  const { blob: xblob, filename } = await exportWorkbook();
  const buf = await xblob.arrayBuffer();
  const wb = XLSX.read(buf, { type: "array" });
  const sheet = wb.Sheets[wb.SheetNames[0]!];
  const csv = XLSX.utils.sheet_to_csv(sheet);
  return {
    blob: new Blob([csv], { type: "text/csv;charset=utf-8" }),
    filename: filename.replace(/\.xlsx$/, ".csv"),
  };
}

export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.rel = "noopener";
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 4000);
}

export async function suggestHouseholdCode(
  kebeleCode: string,
  scale: SlidingScale,
  geo: GeoSettings,
): Promise<string> {
  const seq = await nextHouseholdSequence(kebeleCode, geo);
  return formatHouseholdCode(prefixForScale(scale), geo, kebeleCode, seq);
}

export { formatHouseholdCode, SLIDING_SCALE_META };
