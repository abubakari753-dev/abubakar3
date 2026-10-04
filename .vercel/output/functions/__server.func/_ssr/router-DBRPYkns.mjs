import { i as __toESM } from "../_runtime.mjs";
import { n as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { n as require_jsx_runtime } from "../_libs/radix-ui__react-context+react.mjs";
import { A as searchKey, C as cn, D as newId, S as Button, _ as getMeta, a as Input, b as setMeta, g as getGeo, h as getDb, m as ensureSeededLocations, n as APP_NAME } from "./input-CxFfOybE.mjs";
import { i as prefixForScale, t as formatHouseholdCode } from "./ids-BV64q0mT.mjs";
import { a as searchRegister } from "./queries-BtIcbPJl.mjs";
import { S as useRouter, _ as lazyRouteComponent, b as Link, d as Scripts, f as HeadContent, g as Outlet, h as createRouter, p as useRouterState, v as createFileRoute, x as useNavigate, y as createRootRoute } from "../_libs/@tanstack/react-router+[...].mjs";
import { a as TriangleAlert, c as Settings, d as Plus, h as House, l as Search, n as Users, p as MapPinned, s as Smartphone, t as X } from "../_libs/lucide-react.mjs";
import { a as union, i as string, n as number, r as object, t as literal } from "../_libs/zod.mjs";
import { t as Toaster } from "../_libs/sonner.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/router-DBRPYkns.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var __defProp = Object.defineProperty;
var __exportAll = (all, no_symbols) => {
	let target = {};
	for (var name in all) __defProp(target, name, {
		get: all[name],
		enumerable: true
	});
	if (!no_symbols) __defProp(target, Symbol.toStringTag, { value: "Module" });
	return target;
};
var FALLBACK_MESSAGE = "An unexpected error occurred. Try reloading the page.";
function errorMessage(error) {
	if (error instanceof Error && error.message) return error.message;
	if (typeof error === "string" && error) return error;
	return FALLBACK_MESSAGE;
}
function AppErrorComponent({ error }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
		className: "flex min-h-screen flex-col items-center justify-center gap-3 px-6 text-center bg-zinc-50 text-zinc-900 dark:bg-zinc-950 dark:text-zinc-50",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "text-red-500",
				"aria-hidden": "true",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TriangleAlert, {
					className: "size-10",
					strokeWidth: 2
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "text-lg font-semibold",
				children: "Something went wrong"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "max-w-md text-sm break-words text-zinc-500 dark:text-zinc-400",
				children: errorMessage(error)
			})
		]
	});
}
/**
* App-wide client provider mounted once near the root (in `src/routes/__root.tsx`):
*
*   <AuthProvider><Outlet /></AuthProvider>
*
* Better Auth's React client (`@/lib/auth/client`) needs NO context provider —
* its `useSession()` works standalone — so this is a passthrough today. It's
* kept as the single, stable mount point for any future client-side providers
* (e.g. a toast or theme provider) without churning the root shell.
*/
function AuthProvider({ children }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_jsx_runtime.Fragment, { children });
}
var CONNECTOR_TOKEN_READY_EVENT = "grok:connector-token-ready";
function isGrokEmbedderOrigin(origin) {
	try {
		const url = new URL(origin);
		if (url.protocol !== "https:" && url.protocol !== "http:") return false;
		const host = url.hostname.toLowerCase();
		if (host === "grok.com" || host.endsWith(".grok.com")) return true;
		if (host === "localhost" || host === "127.0.0.1" || host === "[::1]") return true;
		return false;
	} catch {
		return false;
	}
}
function isSandboxPreviewGuestHost(hostname) {
	const host = hostname.toLowerCase();
	return host === "grok-sandbox.com" || host.endsWith(".grok-sandbox.com");
}
function isRemintPreviewPair(guestHost, parentHost) {
	const guest = guestHost.toLowerCase();
	const parent = parentHost.toLowerCase();
	const i = guest.indexOf(".preview.");
	if (i <= 0) return false;
	const label = guest.slice(0, i);
	const rest = guest.slice(i + 9);
	if (label.includes(".") || !rest.includes(".")) return false;
	return parent === rest || parent === `grok.${rest}`;
}
function resolveParentEmbedderOrigin(parentIsSelf, referrer, ancestorOrigin, guestHostname = "") {
	if (parentIsSelf) return null;
	for (const candidate of [referrer, ancestorOrigin ?? ""].filter(Boolean)) try {
		const url = new URL(candidate.includes("://") ? candidate : `https://${candidate}`);
		if (url.protocol !== "https:" && url.protocol !== "http:") continue;
		if (isGrokEmbedderOrigin(url.origin)) return url.origin;
		if (isSandboxPreviewGuestHost(guestHostname) || isRemintPreviewPair(guestHostname, url.hostname)) return url.origin;
	} catch {}
	return null;
}
/**
* Guest side of the grok-web ↔ sandbox preview postMessage bridge.
*
* Activates only when this page is framed by an allowlisted Grok embedder.
* Top-level runs (download/export, local `npm run dev`, deployed sites) noop.
*/
var PREVIEW_BRIDGE_CHANNEL = "grok-preview-bridge";
var EnvelopeSchema = object({
	channel: literal(PREVIEW_BRIDGE_CHANNEL),
	version: number().int().positive(),
	type: string().min(1)
});
var HelloSchema = EnvelopeSchema.extend({ type: literal("hello") });
var NavigateSchema = EnvelopeSchema.extend({
	type: literal("navigate"),
	path: string().min(1)
});
var HistorySchema = EnvelopeSchema.extend({
	type: literal("history"),
	delta: union([literal(-1), literal(1)])
});
var ConnectorTokenReadySchema = EnvelopeSchema.extend({ type: literal("connector-token-ready") });
function isSafeBridgePath(path) {
	if (!path.startsWith("/") || path.startsWith("//") || path.includes("\\")) return false;
	try {
		return new URL(path, "https://preview.invalid").origin === "https://preview.invalid";
	} catch {
		return false;
	}
}
/**
* Origin of the Grok embedder framing this page, or null when the page runs
* top-level (download/export, local `npm run dev`, deployed sites) or under a
* non-Grok parent. Client-only; null during SSR.
*/
function resolveCurrentEmbedderOrigin() {
	if (typeof window === "undefined") return null;
	const ancestorOrigin = typeof location.ancestorOrigins !== "undefined" && location.ancestorOrigins.length > 0 ? location.ancestorOrigins[0] : null;
	return resolveParentEmbedderOrigin(window.parent === window, document.referrer, ancestorOrigin, window.location.hostname);
}
/**
* Install host↔guest messaging. Returns a dispose function.
* Noops (returns a no-op dispose) when not embedded under a Grok parent.
*/
function installPreviewHostBridge(options = {}) {
	const parentOrigin = resolveCurrentEmbedderOrigin();
	if (parentOrigin === null) return () => {};
	const ROOT_STATE_KEY = "__grokPreviewBridgeRoot";
	const originalPushState = window.history.pushState.bind(window.history);
	const originalReplaceState = window.history.replaceState.bind(window.history);
	const isAtHistoryRoot = () => {
		const state = window.history.state;
		return Boolean(state && typeof state === "object" && state[ROOT_STATE_KEY] === true);
	};
	try {
		const current = window.history.state;
		if (!(current !== null && typeof current === "object" && Object.prototype.hasOwnProperty.call(current, ROOT_STATE_KEY))) {
			const isRoot = window.history.length <= 1;
			originalReplaceState(current && typeof current === "object" ? {
				...current,
				[ROOT_STATE_KEY]: isRoot
			} : { [ROOT_STATE_KEY]: isRoot }, "", window.location.href);
		}
	} catch {}
	const post = (message) => {
		window.parent.postMessage(message, parentOrigin);
	};
	const reportLocation = () => {
		post({
			channel: PREVIEW_BRIDGE_CHANNEL,
			version: 1,
			type: "location",
			path: window.location.pathname || "/",
			search: window.location.search,
			hash: window.location.hash
		});
	};
	const reportRoutes = () => {
		const paths = options.getRoutePaths?.() ?? [];
		post({
			channel: PREVIEW_BRIDGE_CHANNEL,
			version: 1,
			type: "routes",
			paths
		});
	};
	const defaultNavigate = (path) => {
		if (!isSafeBridgePath(path)) return;
		try {
			const url = new URL(path, window.location.origin);
			if (url.origin !== window.location.origin) return;
			const next = `${url.pathname}${url.search}${url.hash}`;
			window.history.pushState(window.history.state, "", next);
			window.dispatchEvent(new PopStateEvent("popstate", { state: window.history.state }));
		} catch {}
	};
	const navigate = (path) => {
		if (!isSafeBridgePath(path)) return;
		if (options.navigate) {
			options.navigate(path);
			return;
		}
		defaultNavigate(path);
	};
	const announce = () => {
		reportLocation();
		reportRoutes();
		post({
			channel: PREVIEW_BRIDGE_CHANNEL,
			version: 1,
			type: "ready"
		});
	};
	const onHello = (data) => {
		if (!HelloSchema.safeParse(data).success) return;
		announce();
	};
	const onNavigate = (data) => {
		const parsed = NavigateSchema.safeParse(data);
		if (!parsed.success) return;
		navigate(parsed.data.path);
		queueMicrotask(reportLocation);
	};
	const onHistory = (data) => {
		const parsed = HistorySchema.safeParse(data);
		if (!parsed.success) return;
		if (parsed.data.delta === -1 && isAtHistoryRoot()) return;
		window.history.go(parsed.data.delta);
	};
	const onConnectorTokenReady = (data) => {
		if (!ConnectorTokenReadySchema.safeParse(data).success) return;
		window.dispatchEvent(new Event(CONNECTOR_TOKEN_READY_EVENT));
	};
	const hostMessageHandlers = /* @__PURE__ */ new Map([
		["hello", onHello],
		["navigate", onNavigate],
		["history", onHistory],
		["connector-token-ready", onConnectorTokenReady]
	]);
	const onMessage = (event) => {
		if (event.source !== window.parent) return;
		if (event.origin !== parentOrigin) return;
		const envelope = EnvelopeSchema.safeParse(event.data);
		if (!envelope.success || envelope.data.version !== 1) return;
		hostMessageHandlers.get(envelope.data.type)?.(event.data);
	};
	const onPopState = () => {
		reportLocation();
	};
	const onHashChange = () => {
		reportLocation();
	};
	window.history.pushState = (data, unused, url) => {
		const next = data && typeof data === "object" ? {
			...data,
			[ROOT_STATE_KEY]: false
		} : data;
		originalPushState(next, unused, url);
		reportLocation();
	};
	window.history.replaceState = (data, unused, url) => {
		const next = isAtHistoryRoot() ? {
			...data && typeof data === "object" ? data : {},
			[ROOT_STATE_KEY]: true
		} : data;
		originalReplaceState(next, unused, url);
		reportLocation();
	};
	window.addEventListener("message", onMessage);
	window.addEventListener("popstate", onPopState);
	window.addEventListener("hashchange", onHashChange);
	announce();
	return () => {
		window.removeEventListener("message", onMessage);
		window.removeEventListener("popstate", onPopState);
		window.removeEventListener("hashchange", onHashChange);
		window.history.pushState = originalPushState;
		window.history.replaceState = originalReplaceState;
	};
}
/** Collect static path patterns from a TanStack route tree (best-effort). */
function collectRoutePathsFromTree(routeTree) {
	const paths = /* @__PURE__ */ new Set();
	const walk = (node) => {
		if (!node || typeof node !== "object") return;
		const record = node;
		const full = typeof record.fullPath === "string" ? record.fullPath : typeof record.path === "string" ? record.path : null;
		if (full !== null && full !== "") paths.add(full.startsWith("/") ? full : `/${full}`);
		else if (full === "") paths.add("/");
		const children = record.children;
		if (Array.isArray(children)) for (const child of children) walk(child);
		else if (children && typeof children === "object") for (const child of Object.values(children)) walk(child);
	};
	walk(routeTree);
	return [...paths];
}
/**
* Mount once in `__root.tsx` so the Grok preview chrome can drive navigation
* (and later receive registered routes). Noops when the app is not embedded.
*/
function PreviewHostBridge() {
	const router = useRouter();
	(0, import_react.useEffect)(() => {
		return installPreviewHostBridge({
			navigate: (path) => {
				router.history.push(path);
			},
			getRoutePaths: () => collectRoutePathsFromTree(router.routeTree)
		});
	}, [router]);
	return null;
}
function RegisterServiceWorker() {
	(0, import_react.useEffect)(() => {
		if (!("serviceWorker" in navigator)) return;
		navigator.serviceWorker.register("/sw.js", { scope: "/" }).catch(() => {});
	}, []);
	return null;
}
var listeners = /* @__PURE__ */ new Set();
var deferred = null;
var installed = false;
function notify() {
	for (const fn of listeners) fn();
}
function isStandalone() {
	if (typeof window === "undefined") return false;
	if (window.navigator.standalone) return true;
	return window.matchMedia("(display-mode: standalone)").matches || window.matchMedia("(display-mode: minimal-ui)").matches;
}
function detectPlatform() {
	if (typeof navigator === "undefined") return "other";
	const ua = navigator.userAgent || "";
	if (/Android/i.test(ua)) return "android";
	if (/iPhone|iPad|iPod/i.test(ua) || navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1) return "ios";
	if (/Windows/i.test(ua)) return "windows";
	return "other";
}
function canPromptInstall() {
	return deferred != null && !installed && !isStandalone();
}
async function promptInstall() {
	if (!deferred) return "unavailable";
	const event = deferred;
	deferred = null;
	notify();
	await event.prompt();
	const { outcome } = await event.userChoice;
	if (outcome === "accepted") {
		installed = true;
		notify();
	}
	return outcome;
}
function subscribeInstall(listener) {
	listeners.add(listener);
	return () => listeners.delete(listener);
}
function bindInstallListeners() {
	if (typeof window === "undefined") return () => {};
	if (isStandalone()) installed = true;
	const onPrompt = (event) => {
		event.preventDefault();
		deferred = event;
		notify();
	};
	const onInstalled = () => {
		installed = true;
		deferred = null;
		notify();
	};
	window.addEventListener("beforeinstallprompt", onPrompt);
	window.addEventListener("appinstalled", onInstalled);
	return () => {
		window.removeEventListener("beforeinstallprompt", onPrompt);
		window.removeEventListener("appinstalled", onInstalled);
	};
}
async function requestPersistentStorage() {
	try {
		if (!navigator.storage?.persist) return false;
		return await navigator.storage.persist();
	} catch {
		return false;
	}
}
function InstallHost() {
	const [, setTick] = (0, import_react.useState)(0);
	(0, import_react.useEffect)(() => {
		const unbind = bindInstallListeners();
		const unsub = subscribeInstall(() => setTick((n) => n + 1));
		return () => {
			unbind();
			unsub();
		};
	}, []);
	return null;
}
function useInstallUi() {
	const [, setTick] = (0, import_react.useState)(0);
	(0, import_react.useEffect)(() => subscribeInstall(() => setTick((n) => n + 1)), []);
	return {
		standalone: isStandalone(),
		canPrompt: canPromptInstall(),
		platform: detectPlatform(),
		prompt: promptInstall
	};
}
function InstallBanner() {
	const { standalone, canPrompt, prompt } = useInstallUi();
	const [dismissed, setDismissed] = (0, import_react.useState)(false);
	if (standalone || dismissed) return null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "relative overflow-hidden rounded-xl border border-teal/25 bg-accent px-4 py-3 text-accent-foreground",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
			type: "button",
			"aria-label": "Dismiss",
			className: "absolute top-2 right-2 rounded-md p-1 text-accent-foreground/60 hover:bg-primary/10 hover:text-accent-foreground",
			onClick: () => setDismissed(true),
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "size-4" })
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex items-start gap-3 pr-6",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "mt-0.5 flex size-10 shrink-0 items-center justify-center rounded-md bg-primary text-primary-foreground",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Smartphone, { className: "size-5" })
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "min-w-0 flex-1",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "font-medium",
						children: "Install Shinile CBHI on this device"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-sm text-accent-foreground/80",
						children: "Add it to the Android home screen or the Windows Start menu. After that it opens like an app and keeps working without internet."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "mt-2 flex flex-wrap gap-2",
						children: canPrompt ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							size: "sm",
							onClick: () => {
								prompt();
							},
							children: "Install now"
						}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							size: "sm",
							asChild: true,
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
								to: "/install",
								children: "Show install steps"
							})
						})
					})
				]
			})]
		})]
	});
}
var FIRST = [
	"Hodan",
	"Yusuf",
	"Amina",
	"Farah",
	"Sahra",
	"Abdi",
	"Nimco",
	"Hassan",
	"Khadra",
	"Omar",
	"Fardowsa",
	"Ibrahim",
	"Deqa",
	"Mustafe",
	"Idil",
	"Guled"
];
var SECOND = [
	"Barre",
	"Gedi",
	"Warsame",
	"Roble",
	"Hirsi",
	"Duale",
	"Maydhane",
	"Barkhad",
	"Awl",
	"Samatar",
	"Cigal",
	"Qawdhan",
	"Tahlil",
	"Shire"
];
var THIRD = [
	"Wiil",
	"Fahiye",
	"Nuur",
	"Aden",
	"Jama",
	"Khayre",
	"Bile",
	"Awl"
];
function pick(arr, i) {
	return arr[i % arr.length];
}
function nameFor(i) {
	return `${pick(FIRST, i)} ${pick(SECOND, i * 3)} ${pick(THIRD, i * 7)}`;
}
var REL_CHILD = [
	"Son",
	"Daughter",
	"Son",
	"Daughter",
	"Other"
];
async function loadDemoRegister() {
	await ensureSeededLocations();
	const db = getDb();
	const existing = await db.households.count();
	if (existing > 0) {
		if (!await getMeta("demoLoaded")) await setMeta("demoLoaded", "1");
		return {
			households: existing,
			members: await db.members.count()
		};
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
				const scale = n % 7 === 0 ? "Lower" : n % 3 === 0 ? "Higher" : "Middle";
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
					gote: kebele.ruralTown === "Town" ? pick([
						"01",
						"04",
						"05",
						"06"
					], n) : "",
					slidingScale: scale,
					ruralTown: kebele.ruralTown,
					hasIdCard: n % 4 !== 0,
					fan: n % 6 === 0 ? `FAN${String(1e5 + n).slice(1)}` : "",
					membershipStatus: status,
					enrollmentDay: 3,
					enrollmentMonth: 7,
					enrollmentYear: 2016,
					notes: "",
					createdAt: now,
					updatedAt: now
				});
				hhCount += 1;
				const familySize = 2 + n % 5;
				for (let m = 0; m < familySize; m++) {
					const isHead = m === 0;
					const gender = isHead ? n % 2 === 0 ? "Female" : "Male" : m % 2 === 0 ? "Female" : "Male";
					let relationship;
					if (isHead) relationship = "Household Head";
					else if (m === 1) relationship = gender === "Female" ? "Wife" : "Husband";
					else relationship = REL_CHILD[(m + n) % REL_CHILD.length];
					const profession = isHead ? kebele.ruralTown === "Rural" ? "Pastoralist" : n % 2 === 0 ? "Daily Laborer" : "Merchant" : relationship === "Wife" ? "Housewife" : m > 2 ? "Student" : "Other";
					const year = isHead ? 1968 + n % 20 : relationship === "Wife" || relationship === "Husband" ? 1974 + n % 16 : 2004 + (m + n) % 18;
					const fullName = isHead ? headName : nameFor(n * 17 + m * 5);
					await db.members.add({
						id: newId(),
						householdId: hhId,
						beneficiaryCode: String(m).padStart(2, "0"),
						fullName,
						searchName: searchKey(fullName),
						dobDay: 1 + (n + m) % 28,
						dobMonth: 1 + n * m % 12,
						dobYear: year,
						gender,
						relationship,
						profession,
						photoId: null,
						createdAt: now,
						updatedAt: now
					});
					memCount += 1;
				}
			}
		}
	});
	await setMeta("demoLoaded", "1");
	return {
		households: hhCount,
		members: memCount
	};
}
function CbhiReady({ children }) {
	const [ready, setReady] = (0, import_react.useState)(false);
	const [error, setError] = (0, import_react.useState)(null);
	(0, import_react.useEffect)(() => {
		let cancelled = false;
		(async () => {
			try {
				await ensureSeededLocations();
				requestPersistentStorage();
				if (!cancelled) setReady(true);
				loadDemoRegister();
			} catch (err) {
				if (!cancelled) setError(err instanceof Error ? err.message : "Could not open the local register.");
			}
		})();
		return () => {
			cancelled = true;
		};
	}, []);
	if (error) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
		className: "flex min-h-dvh flex-col items-center justify-center gap-3 px-6 text-center",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
			className: "font-display text-xl font-semibold",
			children: "Register could not open"
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "max-w-sm text-sm text-muted-foreground",
			children: error
		})]
	});
	if (!ready) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
		className: "flex min-h-dvh flex-col items-center justify-center gap-3 px-6",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "size-10 animate-pulse rounded-full bg-primary/20" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "text-sm text-muted-foreground",
			children: "Opening Shinile CBHI register…"
		})]
	});
	return children;
}
function SearchOmni({ autoFocus = false, tone = "page" }) {
	const [q, setQ] = (0, import_react.useState)("");
	const [hits, setHits] = (0, import_react.useState)([]);
	const [open, setOpen] = (0, import_react.useState)(false);
	const nav = useNavigate();
	const box = (0, import_react.useRef)(null);
	(0, import_react.useEffect)(() => {
		const t = setTimeout(() => {
			if (q.trim().length < 1) {
				setHits([]);
				return;
			}
			searchRegister(q, 30).then((rows) => {
				setHits(rows);
				setOpen(true);
			});
		}, 80);
		return () => clearTimeout(t);
	}, [q]);
	(0, import_react.useEffect)(() => {
		function onDoc(e) {
			if (!box.current?.contains(e.target)) setOpen(false);
		}
		document.addEventListener("mousedown", onDoc);
		return () => document.removeEventListener("mousedown", onDoc);
	}, []);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		ref: box,
		className: "relative",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Search, { className: cn("pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2", tone === "header" ? "text-primary-foreground/55 md:text-faint" : "text-faint") }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
				value: q,
				onChange: (e) => setQ(e.target.value),
				onFocus: () => hits.length && setOpen(true),
				autoFocus,
				placeholder: "Search name, CBHI code, FAN…",
				className: cn("h-11 pl-9", tone === "header" ? "border-primary-foreground/15 bg-primary-foreground/10 text-primary-foreground placeholder:text-primary-foreground/55 md:border-input md:bg-card md:text-foreground md:placeholder:text-faint" : ""),
				"aria-label": "Search register"
			}),
			open && hits.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
				className: "absolute top-[calc(100%+6px)] right-0 left-0 z-40 max-h-80 overflow-auto rounded-lg border border-border bg-card py-1 text-foreground shadow-lg",
				children: hits.map((h) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					type: "button",
					className: "flex w-full flex-col items-start gap-0.5 px-3 py-2.5 text-left hover:bg-muted",
					onClick: () => {
						setOpen(false);
						setQ("");
						nav({
							to: "/households/$id",
							params: { id: h.householdId }
						});
					},
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "text-sm font-medium",
						children: h.fullName
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "font-mono text-[11px] text-muted-foreground",
						children: [
							h.householdCode,
							"/",
							h.beneficiaryCode,
							" · ",
							h.relationship,
							" · ",
							h.kebeleName
						]
					})]
				}) }, h.memberId))
			}) : null,
			open && q.trim() && hits.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "absolute top-[calc(100%+6px)] right-0 left-0 z-40 rounded-lg border border-border bg-card px-3 py-3 text-sm text-muted-foreground shadow-lg",
				children: [
					"No members match “",
					q,
					"”."
				]
			}) : null
		]
	});
}
var NAV = [
	{
		to: "/",
		label: "Dashboard",
		icon: House
	},
	{
		to: "/households",
		label: "Households",
		icon: Users
	},
	{
		to: "/locations",
		label: "Kebeles",
		icon: MapPinned
	},
	{
		to: "/settings",
		label: "Settings",
		icon: Settings
	}
];
function AppShell({ children }) {
	const pathname = useRouterState({ select: (s) => s.location.pathname });
	const [installed, setInstalled] = (0, import_react.useState)(false);
	(0, import_react.useEffect)(() => {
		setInstalled(isStandalone());
	}, []);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "min-h-dvh bg-background text-foreground",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("header", {
				className: "sticky top-0 z-30 border-b border-teal-dim/40 bg-primary text-primary-foreground",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mx-auto flex max-w-6xl items-center gap-3 px-4 py-3",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
							to: "/",
							className: "flex min-w-0 items-center gap-2.5",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "flex size-9 items-center justify-center rounded-md bg-primary-foreground/10 ring-1 ring-primary-foreground/15",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("svg", {
									viewBox: "0 0 24 24",
									className: "size-5",
									"aria-hidden": true,
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("rect", {
										x: "10",
										y: "4",
										width: "4",
										height: "16",
										rx: "1",
										fill: "currentColor"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("rect", {
										x: "4",
										y: "10",
										width: "16",
										height: "4",
										rx: "1",
										fill: "currentColor"
									})]
								})
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "min-w-0",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "block font-display text-base leading-tight font-semibold tracking-tight",
									children: APP_NAME
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "block truncate text-[11px] text-primary-foreground/70",
									children: "Sitti · Shinile Woreda"
								})]
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "ml-auto hidden flex-1 justify-end md:flex",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "w-full max-w-md",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SearchOmni, { tone: "header" })
							})
						}),
						!installed ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
							to: "/install",
							className: "ml-auto flex size-11 shrink-0 items-center justify-center rounded-md bg-primary-foreground/10 text-primary-foreground md:hidden",
							"aria-label": "Install on this phone",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Smartphone, { className: "size-5" })
						}) : null
					]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mx-auto flex max-w-6xl",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("aside", {
					className: "sticky top-[61px] hidden h-[calc(100dvh-61px)] w-56 shrink-0 flex-col gap-1 border-r border-border p-3 md:flex",
					children: [
						NAV.map((item) => {
							const active = item.to === "/" ? pathname === "/" : pathname.startsWith(item.to);
							const Icon = item.icon;
							return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
								to: item.to,
								className: cn("flex min-h-11 items-center gap-2 rounded-md px-3 text-sm font-medium", active ? "bg-accent text-accent-foreground" : "text-muted-foreground hover:bg-muted hover:text-foreground"),
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { className: "size-4" }), item.label]
							}, item.to);
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
							to: "/households/new",
							className: "mt-2 flex min-h-11 items-center justify-center gap-2 rounded-md bg-primary px-3 text-sm font-medium text-primary-foreground hover:bg-teal-dim",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "size-4" }), "New household"]
						}),
						!installed ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
							to: "/install",
							className: "flex min-h-11 items-center gap-2 rounded-md px-3 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Smartphone, { className: "size-4" }), "Install app"]
						}) : null
					]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("main", {
					className: "min-w-0 flex-1 px-4 pt-4 pb-24 md:px-6 md:pt-6 md:pb-10",
					children
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("nav", {
				className: "fixed inset-x-0 bottom-0 z-30 border-t border-border bg-card/95 backdrop-blur md:hidden",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("ul", {
					className: "grid grid-cols-5 px-1 pb-[env(safe-area-inset-bottom)]",
					children: [NAV.map((item) => {
						const active = item.to === "/" ? pathname === "/" : pathname.startsWith(item.to);
						const Icon = item.icon;
						return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
							to: item.to,
							className: cn("flex min-h-14 flex-col items-center justify-center gap-0.5 text-[10px] font-medium", active ? "text-primary" : "text-muted-foreground"),
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { className: "size-5" }), item.label]
						}) }, item.to);
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
						to: "/households/new",
						className: "flex min-h-14 flex-col items-center justify-center gap-0.5 text-[10px] font-medium text-primary",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "flex size-8 items-center justify-center rounded-full bg-primary text-primary-foreground",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "size-4" })
						}), "Add"]
					}) })]
				})
			})
		]
	});
}
var styles_default = "/assets/styles-JSNTd1mk.css";
var Route$7 = createRootRoute({
	head: () => ({
		meta: [
			{ charSet: "utf-8" },
			{
				name: "viewport",
				content: "width=device-width, initial-scale=1, viewport-fit=cover"
			},
			{ title: APP_NAME },
			{
				name: "theme-color",
				content: "#0B5F4B"
			},
			{
				name: "description",
				content: "Offline Community Based Health Insurance registrar for Shinile Woreda — household and beneficiary registration on this device."
			},
			{
				name: "apple-mobile-web-app-capable",
				content: "yes"
			},
			{
				name: "mobile-web-app-capable",
				content: "yes"
			},
			{
				name: "apple-mobile-web-app-title",
				content: APP_NAME
			},
			{
				name: "apple-mobile-web-app-status-bar-style",
				content: "black-translucent"
			}
		],
		links: [
			{
				rel: "icon",
				type: "image/svg+xml",
				href: "/favicon.svg"
			},
			{
				rel: "apple-touch-icon",
				href: "/apple-touch-icon.png"
			},
			{
				rel: "stylesheet",
				href: styles_default
			},
			{
				rel: "manifest",
				href: "/manifest.webmanifest"
			},
			{
				rel: "manifest",
				href: "/__grok/manifest.webmanifest"
			}
		]
	}),
	component: RootLayout
});
function RootLayout() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("html", {
		lang: "en",
		className: "antialiased",
		suppressHydrationWarning: true,
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("head", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(HeadContent, {}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("body", { children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PreviewHostBridge, {}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AuthProvider, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CbhiReady, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AppShell, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Outlet, {}) }) }) }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Toaster, {
				position: "top-center",
				richColors: true,
				closeButton: true
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(InstallHost, {}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RegisterServiceWorker, {}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Scripts, {})
		] })]
	});
}
var $$splitComponentImporter$6 = () => import("./routes-CDmiNvTk.mjs");
var Route$6 = createFileRoute("/")({
	ssr: false,
	component: lazyRouteComponent($$splitComponentImporter$6, "component")
});
var $$splitComponentImporter$5 = () => import("./install-DOG_yr4j.mjs");
var Route$5 = createFileRoute("/install")({
	ssr: false,
	component: lazyRouteComponent($$splitComponentImporter$5, "component")
});
var $$splitComponentImporter$4 = () => import("./locations-CSUh9i2p.mjs");
var Route$4 = createFileRoute("/locations")({
	ssr: false,
	component: lazyRouteComponent($$splitComponentImporter$4, "component")
});
var $$splitComponentImporter$3 = () => import("./settings-BGqwa1BM.mjs");
var Route$3 = createFileRoute("/settings")({
	ssr: false,
	component: lazyRouteComponent($$splitComponentImporter$3, "component")
});
var $$splitComponentImporter$2 = () => import("./households-CY7Gyan8.mjs");
var Route$2 = createFileRoute("/households/")({
	ssr: false,
	component: lazyRouteComponent($$splitComponentImporter$2, "component")
});
var $$splitComponentImporter$1 = () => import("../_id-EIhdARKm.mjs");
var Route$1 = createFileRoute("/households/$id")({
	ssr: false,
	component: lazyRouteComponent($$splitComponentImporter$1, "component")
});
var $$splitComponentImporter = () => import("./new-DFzmj-XX.mjs");
var Route = createFileRoute("/households/new")({
	ssr: false,
	component: lazyRouteComponent($$splitComponentImporter, "component")
});
var IndexRoute = Route$6.update({
	id: "/",
	path: "/",
	getParentRoute: () => Route$7
});
var InstallRoute = Route$5.update({
	id: "/install",
	path: "/install",
	getParentRoute: () => Route$7
});
var LocationsRoute = Route$4.update({
	id: "/locations",
	path: "/locations",
	getParentRoute: () => Route$7
});
var SettingsRoute = Route$3.update({
	id: "/settings",
	path: "/settings",
	getParentRoute: () => Route$7
});
var HouseholdsIndexRoute = Route$2.update({
	id: "/households/",
	path: "/households/",
	getParentRoute: () => Route$7
});
var rootRouteChildren = {
	IndexRoute,
	InstallRoute,
	LocationsRoute,
	SettingsRoute,
	HouseholdsIdRoute: Route$1.update({
		id: "/households/$id",
		path: "/households/$id",
		getParentRoute: () => Route$7
	}),
	HouseholdsNewRoute: Route.update({
		id: "/households/new",
		path: "/households/new",
		getParentRoute: () => Route$7
	}),
	HouseholdsIndexRoute
};
var routeTree = Route$7._addFileChildren(rootRouteChildren)._addFileTypes();
var router_exports = /* @__PURE__ */ __exportAll({ getRouter: () => getRouter });
function getRouter() {
	return createRouter({
		routeTree,
		defaultErrorComponent: AppErrorComponent
	});
}
//#endregion
export { InstallBanner as a, loadDemoRegister as i, Route$1 as n, useInstallUi as o, SearchOmni as r, router_exports as t };
