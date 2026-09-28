import { getDb, ensureSeededLocations, getGeo, setMeta, getMeta } from "./db";
import { formatHouseholdCode, prefixForScale } from "./ids";
import { newId, searchKey } from "../utils";
import type { Gender, Profession, Relationship, SlidingScale } from "./constants";

const FIRST = [
  "Hodan", "Yusuf", "Amina", "Farah", "Sahra", "Abdi", "Nimco", "Hassan",
  "Khadra", "Omar", "Fardowsa", "Ibrahim", "Deqa", "Mustafe", "Idil", "Guled",
];
const SECOND = [
  "Barre", "Gedi", "Warsame", "Roble", "Hirsi", "Duale", "Maydhane", "Barkhad",
  "Awl", "Samatar", "Cigal", "Qawdhan", "Tahlil", "Shire",
];
const THIRD = [
  "Wiil", "Fahiye", "Nuur", "Aden", "Jama", "Khayre", "Bile", "Awl",
];

function pick<T>(arr: T[], i: number): T {
  return arr[i % arr.length]!;
}

function nameFor(i: number): string {
  return `${pick(FIRST, i)} ${pick(SECOND, i * 3)} ${pick(THIRD, i * 7)}`;
}

const REL_CHILD: Relationship[] = ["Son", "Daughter", "Son", "Daughter", "Other"];

export async function loadDemoRegister(): Promise<{ households: number; members: number }> {
  await ensureSeededLocations();
  const db = getDb();
  const existing = await db.households.count();
  if (existing > 0) {
    const already = await getMeta("demoLoaded");
    if (!already) await setMeta("demoLoaded", "1");
    return { households: existing, members: await db.members.count() };
  }

  const geo = await getGeo();
  const kebeles = await db.kebeles.orderBy("code").toArray();
  const now = Date.now();
  let hhCount = 0;
  let memCount = 0;

  await db.transaction("rw", db.households, db.members, async () => {
    let n = 0;
    for (const kebele of kebeles) {
      const perKebele = kebele.ruralTown === "Town" ? 3 : 2;
      for (let k = 0; k < perKebele; k++) {
        n += 1;
        const scale: SlidingScale = n % 7 === 0 ? "Lower" : n % 3 === 0 ? "Higher" : "Middle";
        const prefix = prefixForScale(scale);
        const householdCode = formatHouseholdCode(prefix, geo, kebele.code, k + 1);
        const hhId = newId();
        const headName = nameFor(n * 11);
        const status = n % 5 === 0 ? "Un-renewed" : "Renewed";
        await db.households.add({
          id: hhId,
          householdCode,
          paymentPrefix: prefix,
          kebeleId: kebele.id,
          gote: kebele.ruralTown === "Town" ? pick(["01", "04", "05", "06"], n) : "",
          slidingScale: scale,
          ruralTown: kebele.ruralTown,
          hasIdCard: n % 4 !== 0,
          fan: n % 6 === 0 ? `FAN${String(100000 + n).slice(1)}` : "",
          membershipStatus: status,
          enrollmentDay: 3,
          enrollmentMonth: 7,
          enrollmentYear: 2016,
          notes: "",
          createdAt: now,
          updatedAt: now,
        });
        hhCount += 1;

        const familySize = 2 + (n % 5);
        for (let m = 0; m < familySize; m++) {
          const isHead = m === 0;
          const gender: Gender = isHead ? (n % 2 === 0 ? "Female" : "Male") : m % 2 === 0 ? "Female" : "Male";
          let relationship: Relationship;
          if (isHead) relationship = "Household Head";
          else if (m === 1) relationship = gender === "Female" ? "Wife" : "Husband";
          else relationship = REL_CHILD[(m + n) % REL_CHILD.length]!;
          const profession: Profession = isHead
            ? kebele.ruralTown === "Rural"
              ? "Pastoralist"
              : n % 2 === 0
                ? "Daily Laborer"
                : "Merchant"
            : relationship === "Wife"
              ? "Housewife"
              : m > 2
                ? "Student"
                : "Other";
          const year = isHead
            ? 1968 + (n % 20)
            : relationship === "Wife" || relationship === "Husband"
              ? 1974 + (n % 16)
              : 2004 + ((m + n) % 18);
          const fullName = isHead ? headName : nameFor(n * 17 + m * 5);
          await db.members.add({
            id: newId(),
            householdId: hhId,
            beneficiaryCode: String(m).padStart(2, "0"),
            fullName,
            searchName: searchKey(fullName),
            dobDay: 1 + ((n + m) % 28),
            dobMonth: 1 + ((n * m) % 12),
            dobYear: year,
            gender,
            relationship,
            profession,
            photoId: null,
            createdAt: now,
            updatedAt: now,
          });
          memCount += 1;
        }
      }
    }
  });

  await setMeta("demoLoaded", "1");
  return { households: hhCount, members: memCount };
}
