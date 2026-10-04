import { i as __toESM } from "../_runtime.mjs";
import { n as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { n as require_jsx_runtime } from "../_libs/radix-ui__react-context+react.mjs";
import { l as Slot } from "../_libs/@radix-ui/react-dialog+[...].mjs";
import { n as clsx, t as cva } from "../_libs/class-variance-authority+clsx.mjs";
import { t as twMerge } from "../_libs/tailwind-merge.mjs";
import { t as Dexie } from "../_libs/dexie.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/button-CGs3ckad.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function cn(...inputs) {
	return twMerge(clsx(inputs));
}
function formatBirr(amount) {
	return `${amount.toLocaleString("en-ET")} ETB`;
}
function padCode(n, width = 2) {
	return String(n).replace(/\.0$/, "").padStart(width, "0");
}
function normalizeName(value) {
	return value.trim().replace(/\s+/g, " ");
}
function searchKey(value) {
	return normalizeName(value).toLowerCase();
}
function newId() {
	if (typeof crypto !== "undefined" && crypto.randomUUID) return crypto.randomUUID();
	return `id_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`;
}
function formatRecordedDate(day, month, year) {
	if (!day && !month && !year) return "—";
	return `${day ? padCode(day) : "??"}/${month ? padCode(month) : "??"}/${year ? String(year) : "????"}`;
}
function fileStamp() {
	const d = /* @__PURE__ */ new Date();
	const p = (n) => String(n).padStart(2, "0");
	return `${d.getFullYear()}${p(d.getMonth() + 1)}${p(d.getDate())}-${p(d.getHours())}${p(d.getMinutes())}`;
}
var buttonVariants = cva("inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-[background-color,box-shadow,transform,opacity] duration-150 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/70 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98] [&_svg]:size-4 [&_svg]:shrink-0 min-h-11", {
	variants: {
		variant: {
			default: "bg-primary text-primary-foreground shadow-sm hover:bg-teal-dim",
			secondary: "bg-secondary text-secondary-foreground hover:bg-border",
			outline: "border border-border bg-card text-foreground hover:bg-muted",
			ghost: "text-foreground hover:bg-muted",
			destructive: "bg-destructive text-destructive-foreground hover:opacity-90",
			link: "text-primary underline-offset-4 hover:underline min-h-0"
		},
		size: {
			default: "px-4 py-2",
			sm: "h-9 min-h-9 px-3 text-xs",
			lg: "h-12 px-5",
			icon: "size-11 p-0"
		}
	},
	defaultVariants: {
		variant: "default",
		size: "default"
	}
});
var Button = import_react.forwardRef(({ className, variant, size, asChild = false, ...props }, ref) => {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(asChild ? Slot : "button", {
		className: cn(buttonVariants({
			variant,
			size,
			className
		})),
		ref,
		...props
	});
});
Button.displayName = "Button";
//#endregion
//#region node_modules/.nitro/vite/services/ssr/assets/input-CxFfOybE.js
var APP_NAME = "Shinile CBHI";
var DEFAULT_GEO = {
	region: "Somali",
	zone: "Sitti",
	woreda: "Shinile",
	regionCode: "05",
	zoneCode: "04",
	woredaCode: "09"
};
var GENDERS = ["Male", "Female"];
var RELATIONSHIPS = [
	"Household Head",
	"Parent",
	"Husband",
	"Wife",
	"Son",
	"Daughter",
	"Other"
];
var PROFESSIONS = [
	"Farmer",
	"Pastoralist",
	"Merchant",
	"Job Seeker",
	"Housewife",
	"Stay at home Husband",
	"Daily Laborer",
	"Student",
	"Disabled",
	"Other"
];
var SLIDING_SCALES = [
	"Higher",
	"Middle",
	"Lower"
];
var SLIDING_SCALE_META = {
	Higher: {
		amount: 1930,
		prefix: "P",
		note: "Higher class households — 1,930 birr"
	},
	Middle: {
		amount: 1310,
		prefix: "P",
		note: "Middle class households — 1,310 birr"
	},
	Lower: {
		amount: 720,
		prefix: "I",
		note: "Lower class — 720 birr, subsidy covered by government"
	}
};
var MEMBERSHIP_STATUSES = ["Renewed", "Un-renewed"];
var RURAL_TOWN = ["Rural", "Town"];
var AMHARIC = {
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
	woreda: "ወረዳ"
};
var KEBELE_CATALOG = [
	{
		name: "Shinile 01",
		code: "01",
		ruralTown: "Town"
	},
	{
		name: "Shinile 02",
		code: "02",
		ruralTown: "Town"
	},
	{
		name: "Toome",
		code: "03",
		ruralTown: "Rural"
	},
	{
		name: "Marmaarsa",
		code: "04",
		ruralTown: "Rural"
	},
	{
		name: "Dinlay",
		code: "05",
		ruralTown: "Rural"
	},
	{
		name: "Jeedane",
		code: "06",
		ruralTown: "Rural"
	},
	{
		name: "Lasdheere",
		code: "07",
		ruralTown: "Rural"
	},
	{
		name: "Dhagaxjabis",
		code: "08",
		ruralTown: "Rural"
	},
	{
		name: "Kalabaydh",
		code: "09",
		ruralTown: "Rural"
	},
	{
		name: "Baraaq",
		code: "10",
		ruralTown: "Rural"
	},
	{
		name: "Gaad",
		code: "11",
		ruralTown: "Rural"
	},
	{
		name: "Harawe",
		code: "12",
		ruralTown: "Rural"
	},
	{
		name: "Miile",
		code: "13",
		ruralTown: "Rural"
	},
	{
		name: "Cayiliso",
		code: "14",
		ruralTown: "Rural"
	},
	{
		name: "Bisle",
		code: "15",
		ruralTown: "Rural"
	},
	{
		name: "Xaaray",
		code: "16",
		ruralTown: "Rural"
	},
	{
		name: "Xadhkalay",
		code: "17",
		ruralTown: "Rural"
	},
	{
		name: "Meete",
		code: "18",
		ruralTown: "Rural"
	},
	{
		name: "Fandhale",
		code: "19",
		ruralTown: "Rural"
	}
];
var DEFAULT_CLUSTERS = [
	{
		name: "Shinile Town Cluster",
		phcus: [{
			name: "Shinile PHCU",
			kebeleCodes: ["01", "02"]
		}]
	},
	{
		name: "North Cluster",
		phcus: [{
			name: "Toome PHCU",
			kebeleCodes: [
				"03",
				"04",
				"05"
			]
		}, {
			name: "Jeedane PHCU",
			kebeleCodes: ["06", "07"]
		}]
	},
	{
		name: "Central Cluster",
		phcus: [{
			name: "Dhagaxjabis PHCU",
			kebeleCodes: ["08", "09"]
		}, {
			name: "Baraaq PHCU",
			kebeleCodes: ["10", "11"]
		}]
	},
	{
		name: "East Cluster",
		phcus: [{
			name: "Harawe PHCU",
			kebeleCodes: [
				"12",
				"13",
				"14"
			]
		}]
	},
	{
		name: "South Cluster",
		phcus: [{
			name: "Bisle PHCU",
			kebeleCodes: ["15", "16"]
		}, {
			name: "Xadhkalay PHCU",
			kebeleCodes: [
				"17",
				"18",
				"19"
			]
		}]
	}
];
var KEBELE_ALIASES = {
	mile: "Miile",
	miile: "Miile",
	lasdhere: "Lasdheere",
	lasdheere: "Lasdheere",
	"dhagax jabis": "Dhagaxjabis",
	dhagaxjabis: "Dhagaxjabis",
	"shinile 1": "Shinile 01",
	"shinile 2": "Shinile 02",
	"shinile01": "Shinile 01",
	"shinile02": "Shinile 02"
};
var DB_NAME = "shinile-cbhi";
var CBHIDatabase = class extends Dexie {
	clusters;
	phcus;
	kebeles;
	households;
	members;
	photos;
	meta;
	constructor() {
		super(DB_NAME);
		this.version(1).stores({
			clusters: "id, name, sort",
			phcus: "id, clusterId, name, sort",
			kebeles: "id, phcuId, name, code, sort",
			households: "id, householdCode, kebeleId, slidingScale, membershipStatus, paymentPrefix, updatedAt, fan",
			members: "id, householdId, beneficiaryCode, searchName, relationship, photoId",
			photos: "id, memberId",
			meta: "key"
		});
	}
};
var _db = null;
function getDb() {
	if (typeof indexedDB === "undefined") throw new Error("IndexedDB is not available in this environment.");
	if (!_db) _db = new CBHIDatabase();
	return _db;
}
async function getMeta(key) {
	return (await getDb().meta.get(key))?.value ?? null;
}
async function setMeta(key, value) {
	await getDb().meta.put({
		key,
		value
	});
}
async function getGeo() {
	const raw = await getMeta("geo");
	if (!raw) return { ...DEFAULT_GEO };
	try {
		return {
			...DEFAULT_GEO,
			...JSON.parse(raw)
		};
	} catch {
		return { ...DEFAULT_GEO };
	}
}
async function setGeo(geo) {
	await setMeta("geo", JSON.stringify(geo));
}
async function ensureSeededLocations() {
	const db = getDb();
	if (await db.kebeles.count() > 0) {
		if (await getMeta("locationsSeeded")) return;
	}
	await db.transaction("rw", db.clusters, db.phcus, db.kebeles, db.meta, async () => {
		if (await db.kebeles.count() > 0) {
			await db.meta.put({
				key: "locationsSeeded",
				value: "1"
			});
			return;
		}
		const kebeleByCode = new Map(KEBELE_CATALOG.map((k) => [k.code, k]));
		let clusterSort = 0;
		for (const cluster of DEFAULT_CLUSTERS) {
			const clusterId = newId();
			await db.clusters.add({
				id: clusterId,
				name: cluster.name,
				sort: clusterSort++
			});
			let phcuSort = 0;
			for (const phcu of cluster.phcus) {
				const phcuId = newId();
				await db.phcus.add({
					id: phcuId,
					clusterId,
					name: phcu.name,
					sort: phcuSort++
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
						sort: kebeleSort++
					});
				}
			}
		}
		await db.meta.put({
			key: "locationsSeeded",
			value: "1"
		});
		await db.meta.put({
			key: "geo",
			value: JSON.stringify(DEFAULT_GEO)
		});
	});
}
async function nextHouseholdSequence(kebeleCode, geo) {
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
async function wipeRegister(keepLocations = true) {
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
var Input = import_react.forwardRef(({ className, type, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
	type,
	className: cn("flex h-11 w-full rounded-md border border-input bg-card px-3 py-2 text-base text-foreground shadow-none transition-[box-shadow,border-color] placeholder:text-faint focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/60 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm", className),
	ref,
	...props
}));
Input.displayName = "Input";
//#endregion
export { searchKey as A, cn as C, newId as D, formatRecordedDate as E, normalizeName as O, Button as S, formatBirr as T, getMeta as _, Input as a, setMeta as b, MEMBERSHIP_STATUSES as c, RURAL_TOWN as d, SLIDING_SCALES as f, getGeo as g, getDb as h, GENDERS as i, padCode as k, PROFESSIONS as l, ensureSeededLocations as m, APP_NAME as n, KEBELE_ALIASES as o, SLIDING_SCALE_META as p, DEFAULT_GEO as r, KEBELE_CATALOG as s, AMHARIC as t, RELATIONSHIPS as u, nextHouseholdSequence as v, fileStamp as w, wipeRegister as x, setGeo as y };
