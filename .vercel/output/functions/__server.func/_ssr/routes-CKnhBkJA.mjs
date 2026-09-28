import { n as require_jsx_runtime } from "../_libs/radix-ui__react-context+react.mjs";
import { _ as formatBirr, p as SLIDING_SCALE_META } from "./input-CbEkyqtb.mjs";
import { n as emptyStats, r as householdViews, t as dashboardStats } from "./queries-fFKowjbL.mjs";
import { b as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { _ as Camera, m as House, n as Users, p as Landmark, u as RefreshCw } from "../_libs/lucide-react.mjs";
import { r as SearchOmni } from "./router-CcXfc9Cn.mjs";
import { a as CardHeader, n as Card, o as CardTitle, r as CardContent, t as Button } from "./card-VA2v8bax.mjs";
import { n as StatusBadge, t as ScaleBadge } from "./scale-badge-B9WP7wmJ.mjs";
import { t as useLiveQuery } from "../_libs/dexie-react-hooks.mjs";
import { a as Bar, c as ResponsiveContainer, i as XAxis, l as Tooltip, n as BarChart, o as Pie, r as YAxis, s as Cell, t as PieChart } from "../_libs/recharts+[...].mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/routes-CKnhBkJA.js
var import_jsx_runtime = require_jsx_runtime();
var PIE_COLORS = {
	Higher: "#b45309",
	Middle: "#0b5f4b",
	Lower: "#1e3a5f"
};
function Dashboard() {
	const stats = useLiveQuery(() => dashboardStats(), []) ?? emptyStats();
	const recent = useLiveQuery(async () => {
		return (await householdViews()).sort((a, b) => b.updatedAt - a.updatedAt).slice(0, 6);
	}, []) ?? [];
	const scaleData = [
		"Higher",
		"Middle",
		"Lower"
	].map((k) => ({
		name: k,
		value: stats.byScale[k].households,
		premium: stats.byScale[k].premium
	}));
	const kebeleData = stats.byKebele.filter((k) => k.households > 0).slice(0, 10);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "cbhi-enter flex flex-col gap-5",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "md:hidden",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SearchOmni, {})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-wrap items-end justify-between gap-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-xs font-medium tracking-wide text-primary uppercase",
						children: "Shinile Woreda register"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
						className: "font-display text-3xl leading-tight font-semibold tracking-tight",
						children: "Coverage at a glance"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-1 max-w-xl text-sm text-muted-foreground",
						children: "Households, beneficiaries and contributions stored only on this device. Works without internet."
					})
				] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					asChild: true,
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						to: "/households/new",
						children: "Register household"
					})
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "grid grid-cols-2 gap-3 lg:grid-cols-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatCard, {
						icon: House,
						label: "Households",
						value: stats.households
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatCard, {
						icon: Users,
						label: "Members",
						value: stats.members
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatCard, {
						icon: RefreshCw,
						label: "Renewed",
						value: stats.renewed,
						hint: `${stats.unrenewed} un-renewed`
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatCard, {
						icon: Camera,
						label: "Photos on device",
						value: stats.photos
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "grid gap-3 md:grid-cols-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, {
					className: "text-base",
					children: "Sliding scale"
				}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
					className: "flex flex-col gap-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "h-44",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ResponsiveContainer, {
							width: "100%",
							height: "100%",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(PieChart, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pie, {
								data: scaleData,
								dataKey: "value",
								nameKey: "name",
								innerRadius: 42,
								outerRadius: 68,
								paddingAngle: 3,
								children: scaleData.map((d) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Cell, { fill: PIE_COLORS[d.name] }, d.name))
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tooltip, {})] })
						})
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
						className: "space-y-1.5 text-sm",
						children: scaleData.map((d) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
							className: "flex items-center justify-between gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "text-muted-foreground",
								children: [
									d.name,
									" · ",
									formatBirr(SLIDING_SCALE_META[d.name].amount)
								]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "tabular font-medium",
								children: [
									d.value,
									" HH · ",
									formatBirr(d.premium)
								]
							})]
						}, d.name))
					})]
				})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
					className: "md:col-span-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, {
						className: "text-base",
						children: "Households by kebele"
					}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardContent, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "h-64",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ResponsiveContainer, {
							width: "100%",
							height: "100%",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(BarChart, {
								data: kebeleData,
								layout: "vertical",
								margin: {
									left: 16,
									right: 8,
									top: 4,
									bottom: 4
								},
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(XAxis, {
										type: "number",
										hide: true
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(YAxis, {
										type: "category",
										dataKey: "name",
										width: 88,
										tick: { fontSize: 11 }
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tooltip, {}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Bar, {
										dataKey: "households",
										fill: "#0b5f4b",
										radius: [
											0,
											6,
											6,
											0
										]
									})
								]
							})
						})
					}) })]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "grid gap-3 sm:grid-cols-2 lg:grid-cols-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Mini, {
						label: "Town admin",
						value: stats.byRural.Town
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Mini, {
						label: "Rural",
						value: stats.byRural.Rural
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Mini, {
						label: "Paying (P)",
						value: stats.paying
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Mini, {
						label: "Indigent (I)",
						value: stats.indigent,
						hint: "Lower class, government subsidy"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Mini, {
						label: "Female members",
						value: stats.byGender.Female
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Mini, {
						label: "Male members",
						value: stats.byGender.Male
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Mini, {
						label: "Expected contribution",
						value: formatBirr(stats.byScale.Higher.premium + stats.byScale.Middle.premium + stats.byScale.Lower.premium)
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Mini, {
						label: "Top profession",
						value: stats.byProfession[0]?.name ?? "—",
						hint: stats.byProfession[0] ? `${stats.byProfession[0].count} members` : ""
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mb-3 flex items-center justify-between",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "font-display text-lg font-semibold",
					children: "Recently updated"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
					to: "/households",
					className: "text-sm font-medium text-primary",
					children: "View all"
				})]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "grid gap-3 md:grid-cols-2",
				children: recent.map((hh) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
					to: "/households/$id",
					params: { id: hh.id },
					className: "block",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, {
						className: "transition-[box-shadow] hover:shadow-md",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
							className: "flex flex-col gap-2 pt-5",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex items-start justify-between gap-2",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "font-medium",
										children: hh.headName
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "font-mono text-xs text-muted-foreground",
										children: hh.householdCode
									})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Landmark, { className: "size-4 text-faint" })]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex flex-wrap gap-1.5",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ScaleBadge, { scale: hh.slidingScale }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatusBadge, { status: hh.membershipStatus })]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
									className: "text-xs text-muted-foreground",
									children: [
										hh.kebeleName,
										" · ",
										hh.memberCount,
										" members · ",
										hh.ruralTown
									]
								})
							]
						})
					})
				}, hh.id))
			})] })
		]
	});
}
function StatCard({ icon: Icon, label, value, hint }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
		className: "flex flex-col gap-1 pt-5",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { className: "size-4 text-primary" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "tabular font-display text-2xl font-semibold",
				children: value.toLocaleString()
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-xs text-muted-foreground",
				children: label
			}),
			hint ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-[11px] text-faint",
				children: hint
			}) : null
		]
	}) });
}
function Mini({ label, value, hint }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
		className: "pt-4",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-xs text-muted-foreground",
				children: label
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "tabular mt-1 font-display text-xl font-semibold",
				children: value
			}),
			hint ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-[11px] text-faint",
				children: hint
			}) : null
		]
	}) });
}
//#endregion
export { Dashboard as component };
