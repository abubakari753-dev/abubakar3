export const APP_NAME = "Shinile CBHI";
export const APP_FULL_NAME = "Community Based Health Insurance Registrar";

export const DEFAULT_GEO = {
  region: "Somali",
  zone: "Sitti",
  woreda: "Shinile",
  regionCode: "05",
  zoneCode: "04",
  woredaCode: "09",
} as const;

export const GENDERS = ["Male", "Female"] as const;
export type Gender = (typeof GENDERS)[number];

export const RELATIONSHIPS = [
  "Household Head",
  "Parent",
  "Husband",
  "Wife",
  "Son",
  "Daughter",
  "Other",
] as const;
export type Relationship = (typeof RELATIONSHIPS)[number];

export const PROFESSIONS = [
  "Farmer",
  "Pastoralist",
  "Merchant",
  "Job Seeker",
  "Housewife",
  "Stay at home Husband",
  "Daily Laborer",
  "Student",
  "Disabled",
  "Other",
] as const;
export type Profession = (typeof PROFESSIONS)[number];

export const SLIDING_SCALES = ["Higher", "Middle", "Lower"] as const;
export type SlidingScale = (typeof SLIDING_SCALES)[number];

export const SLIDING_SCALE_META: Record<
  SlidingScale,
  { amount: number; prefix: "P" | "I"; note: string }
> = {
  Higher: {
    amount: 1930,
    prefix: "P",
    note: "Higher class households — 1,930 birr",
  },
  Middle: {
    amount: 1310,
    prefix: "P",
    note: "Middle class households — 1,310 birr",
  },
  Lower: {
    amount: 720,
    prefix: "I",
    note: "Lower class — 720 birr, subsidy covered by government",
  },
};

export const MEMBERSHIP_STATUSES = ["Renewed", "Un-renewed"] as const;
export type MembershipStatus = (typeof MEMBERSHIP_STATUSES)[number];

export const RURAL_TOWN = ["Rural", "Town"] as const;
export type RuralTown = (typeof RURAL_TOWN)[number];

export const PAYMENT_PREFIXES = ["P", "I"] as const;
export type PaymentPrefix = (typeof PAYMENT_PREFIXES)[number];

export const AMHARIC: Record<string, string> = {
  fullName: "ሙሉ ስም",
  dob: "የትውልድ ቀን",
  gender: "ፆታ",
  householdId: "የማአጤመ ቁጥር",
  beneficiaryId: "የአባሉ መለያ ቁጥር",
  kebele: "ቀበሌ",
  gote: "ጎጥ",
  relationship: "የአባሉ ዝምድና",
  profession: "የስራ ዘርፍ",
  enrollment: "የአባልነት ምዝገባ ቀን",
  sliding: "የመዋጮ መደብ",
  ruralTown: "ገጠር / ከተማ",
  hasCard: "የማአጤመ መታወቂያ አለው?",
  fan: "የዲጂታል መታወቂያ ካርድ ቁጥር",
  region: "ክልል",
  zone: "ዞን",
  woreda: "ወረዳ",
};

export const KEBELE_CATALOG: { name: string; code: string; ruralTown: RuralTown }[] = [
  { name: "Shinile 01", code: "01", ruralTown: "Town" },
  { name: "Shinile 02", code: "02", ruralTown: "Town" },
  { name: "Toome", code: "03", ruralTown: "Rural" },
  { name: "Marmaarsa", code: "04", ruralTown: "Rural" },
  { name: "Dinlay", code: "05", ruralTown: "Rural" },
  { name: "Jeedane", code: "06", ruralTown: "Rural" },
  { name: "Lasdheere", code: "07", ruralTown: "Rural" },
  { name: "Dhagaxjabis", code: "08", ruralTown: "Rural" },
  { name: "Kalabaydh", code: "09", ruralTown: "Rural" },
  { name: "Baraaq", code: "10", ruralTown: "Rural" },
  { name: "Gaad", code: "11", ruralTown: "Rural" },
  { name: "Harawe", code: "12", ruralTown: "Rural" },
  { name: "Miile", code: "13", ruralTown: "Rural" },
  { name: "Cayiliso", code: "14", ruralTown: "Rural" },
  { name: "Bisle", code: "15", ruralTown: "Rural" },
  { name: "Xaaray", code: "16", ruralTown: "Rural" },
  { name: "Xadhkalay", code: "17", ruralTown: "Rural" },
  { name: "Meete", code: "18", ruralTown: "Rural" },
  { name: "Fandhale", code: "19", ruralTown: "Rural" },
];

export const DEFAULT_CLUSTERS: {
  name: string;
  phcus: { name: string; kebeleCodes: string[] }[];
}[] = [
  {
    name: "Shinile Town Cluster",
    phcus: [{ name: "Shinile PHCU", kebeleCodes: ["01", "02"] }],
  },
  {
    name: "North Cluster",
    phcus: [
      { name: "Toome PHCU", kebeleCodes: ["03", "04", "05"] },
      { name: "Jeedane PHCU", kebeleCodes: ["06", "07"] },
    ],
  },
  {
    name: "Central Cluster",
    phcus: [
      { name: "Dhagaxjabis PHCU", kebeleCodes: ["08", "09"] },
      { name: "Baraaq PHCU", kebeleCodes: ["10", "11"] },
    ],
  },
  {
    name: "East Cluster",
    phcus: [{ name: "Harawe PHCU", kebeleCodes: ["12", "13", "14"] }],
  },
  {
    name: "South Cluster",
    phcus: [
      { name: "Bisle PHCU", kebeleCodes: ["15", "16"] },
      { name: "Xadhkalay PHCU", kebeleCodes: ["17", "18", "19"] },
    ],
  },
];

export const KEBELE_ALIASES: Record<string, string> = {
  mile: "Miile",
  miile: "Miile",
  lasdhere: "Lasdheere",
  lasdheere: "Lasdheere",
  "dhagax jabis": "Dhagaxjabis",
  dhagaxjabis: "Dhagaxjabis",
  "shinile 1": "Shinile 01",
  "shinile 2": "Shinile 02",
  "shinile01": "Shinile 01",
  "shinile02": "Shinile 02",
};

export const LABEL = {
  gender: { Male: "Male / Lab", Female: "Female / Dhedig" },
};
