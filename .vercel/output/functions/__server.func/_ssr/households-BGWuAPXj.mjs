import { i as __toESM } from "../_runtime.mjs";
import { n as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { n as require_jsx_runtime } from "../_libs/radix-ui__react-context+react.mjs";
import { a as Input, c as MEMBERSHIP_STATUSES, f as SLIDING_SCALES, y as getDb } from "./input-CbEkyqtb.mjs";
import { r as householdViews } from "./queries-fFKowjbL.mjs";
import { b as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { n as Card, r as CardContent, t as Button } from "./card-VA2v8bax.mjs";
import { n as NativeSelect } from "./field-CSr7gl1-.mjs";
import { n as StatusBadge, t as ScaleBadge } from "./scale-badge-B9WP7wmJ.mjs";
import { t as useLiveQuery } from "../_libs/dexie-react-hooks.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/households-BGWuAPXj.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function HouseholdsPage() {
	const rows = useLiveQuery(() => householdViews(), []) ?? [];
	const kebeles = useLiveQuery(() => getDb().kebeles.orderBy("code").toArray(), []) ?? [];
	const [q, setQ] = (0, import_react.useState)("");
	const [kebele, setKebele] = (0, import_react.useState)("all");
	const [scale, setScale] = (0, import_react.useState)("all");
	const [status, setStatus] = (0, import_react.useState)("all");
	const filtered = (0, import_react.useMemo)(() => {
		const needle = q.trim().toLowerCase();
		return rows.filter((r) => {
			if (kebele !== "all" && r.kebeleId !== kebele) return false;
			if (scale !== "all" && r.slidingScale !== scale) return false;
			if (status !== "all" && r.membershipStatus !== status) return false;
			if (!needle) return true;
			return `${r.headName} ${r.householdCode} ${r.fan} ${r.kebeleName} ${r.gote}`.toLowerCase().includes(needle);
		});
	}, [
		rows,
		q,
		kebele,
		scale,
		status
	]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "cbhi-enter flex flex-col gap-4",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-wrap items-end justify-between gap-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "font-display text-3xl font-semibold tracking-tight",
					children: "Households"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "text-sm text-muted-foreground",
					children: [
						filtered.length.toLocaleString(),
						" of ",
						rows.length.toLocaleString(),
						" households"
					]
				})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					asChild: true,
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						to: "/households/new",
						children: "Add household"
					})
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid gap-2 sm:grid-cols-2 lg:grid-cols-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						value: q,
						onChange: (e) => setQ(e.target.value),
						placeholder: "Filter by name, code, FAN…"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(NativeSelect, {
						value: kebele,
						onChange: (e) => setKebele(e.target.value),
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
							value: "all",
							children: "All kebeles"
						}), kebeles.map((k) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("option", {
							value: k.id,
							children: [
								k.code,
								" · ",
								k.name
							]
						}, k.id))]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(NativeSelect, {
						value: scale,
						onChange: (e) => setScale(e.target.value),
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
							value: "all",
							children: "All sliding scales"
						}), SLIDING_SCALES.map((s) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
							value: s,
							children: s
						}, s))]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(NativeSelect, {
						value: status,
						onChange: (e) => setStatus(e.target.value),
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
							value: "all",
							children: "All statuses"
						}), MEMBERSHIP_STATUSES.map((s) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
							value: s,
							children: s
						}, s))]
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-col gap-2",
				children: [filtered.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardContent, {
					className: "py-10 text-center text-sm text-muted-foreground",
					children: "No households match these filters. Import an Excel register in Settings or add a household."
				}) }) : filtered.slice(0, 200).map((hh) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
					to: "/households/$id",
					params: { id: hh.id },
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, {
						className: "transition-[box-shadow] hover:shadow-md",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
							className: "flex flex-col gap-2 py-4 sm:flex-row sm:items-center sm:justify-between",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "min-w-0",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "truncate font-medium",
										children: hh.headName
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "font-mono text-xs text-muted-foreground",
										children: hh.householdCode
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
										className: "text-xs text-muted-foreground",
										children: [
											hh.clusterName,
											" · ",
											hh.kebeleName,
											hh.gote ? ` · Gote ${hh.gote}` : "",
											" · ",
											hh.memberCount,
											" members"
										]
									})
								]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex flex-wrap gap-1.5",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ScaleBadge, { scale: hh.slidingScale }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatusBadge, { status: hh.membershipStatus })]
							})]
						})
					})
				}, hh.id)), filtered.length > 200 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-center text-xs text-muted-foreground",
					children: "Showing the first 200. Narrow the search to see the rest."
				}) : null]
			})
		]
	});
}
//#endregion
export { HouseholdsPage as component };
