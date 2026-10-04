import { i as __toESM } from "../_runtime.mjs";
import { n as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { n as require_jsx_runtime } from "../_libs/radix-ui__react-context+react.mjs";
import { S as Button, T as formatBirr, a as Input, c as MEMBERSHIP_STATUSES, d as RURAL_TOWN, f as SLIDING_SCALES, g as getGeo, h as getDb, i as GENDERS, l as PROFESSIONS, p as SLIDING_SCALE_META, t as AMHARIC } from "./input-CxFfOybE.mjs";
import { i as prefixForScale } from "./ids-BV64q0mT.mjs";
import { x as useNavigate } from "../_libs/@tanstack/react-router+[...].mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { l as upsertMember, s as upsertHousehold } from "./actions-aBg_x2bu.mjs";
import { a as CardTitle, i as CardHeader, n as CardContent, t as Card } from "./card-BAQwLtcV.mjs";
import { n as NativeSelect, t as Field } from "./field-BlD46EBv.mjs";
import { t as useLiveQuery } from "../_libs/dexie-react-hooks.mjs";
import { a as suggestHouseholdCode } from "./import-export-BKY0q1F0.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/new-DFzmj-XX.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function NewHousehold() {
	const nav = useNavigate();
	const clusters = useLiveQuery(() => getDb().clusters.orderBy("sort").toArray(), []) ?? [];
	const phcus = useLiveQuery(() => getDb().phcus.orderBy("sort").toArray(), []) ?? [];
	const kebeles = useLiveQuery(() => getDb().kebeles.orderBy("code").toArray(), []) ?? [];
	const [clusterId, setClusterId] = (0, import_react.useState)("");
	const [phcuId, setPhcuId] = (0, import_react.useState)("");
	const [kebeleId, setKebeleId] = (0, import_react.useState)("");
	const [gote, setGote] = (0, import_react.useState)("");
	const [scale, setScale] = (0, import_react.useState)("Middle");
	const [rural, setRural] = (0, import_react.useState)("Rural");
	const [status, setStatus] = (0, import_react.useState)("Renewed");
	const [hasCard, setHasCard] = (0, import_react.useState)(true);
	const [enDay, setEnDay] = (0, import_react.useState)("3");
	const [enMonth, setEnMonth] = (0, import_react.useState)("7");
	const [enYear, setEnYear] = (0, import_react.useState)("2016");
	const [code, setCode] = (0, import_react.useState)("");
	const [fan, setFan] = (0, import_react.useState)("");
	const [headName, setHeadName] = (0, import_react.useState)("");
	const [gender, setGender] = (0, import_react.useState)("Male");
	const [profession, setProfession] = (0, import_react.useState)("Pastoralist");
	const [dobD, setDobD] = (0, import_react.useState)("");
	const [dobM, setDobM] = (0, import_react.useState)("");
	const [dobY, setDobY] = (0, import_react.useState)("");
	const [busy, setBusy] = (0, import_react.useState)(false);
	const clusterPhcus = (0, import_react.useMemo)(() => phcus.filter((p) => p.clusterId === clusterId), [phcus, clusterId]);
	const phcuKebeles = (0, import_react.useMemo)(() => kebeles.filter((k) => k.phcuId === phcuId), [kebeles, phcuId]);
	const kebele = kebeles.find((k) => k.id === kebeleId);
	(0, import_react.useEffect)(() => {
		if (!clusterId && clusters[0]) setClusterId(clusters[0].id);
	}, [clusters, clusterId]);
	(0, import_react.useEffect)(() => {
		if (clusterPhcus.length && !clusterPhcus.some((p) => p.id === phcuId)) setPhcuId(clusterPhcus[0].id);
	}, [clusterPhcus, phcuId]);
	(0, import_react.useEffect)(() => {
		if (phcuKebeles.length && !phcuKebeles.some((k) => k.id === kebeleId)) setKebeleId(phcuKebeles[0].id);
	}, [phcuKebeles, kebeleId]);
	(0, import_react.useEffect)(() => {
		if (kebele) setRural(kebele.ruralTown);
	}, [kebele]);
	(0, import_react.useEffect)(() => {
		if (!kebele) return;
		(async () => {
			const geo = await getGeo();
			const next = await suggestHouseholdCode(kebele.code, scale, geo);
			setCode(next);
		})();
	}, [kebele, scale]);
	async function onSubmit(e) {
		e.preventDefault();
		if (!kebeleId || !headName.trim()) {
			toast.error("Kebele and household head name are required.");
			return;
		}
		setBusy(true);
		try {
			const hhId = await upsertHousehold({
				householdCode: code.trim(),
				paymentPrefix: prefixForScale(scale),
				kebeleId,
				gote,
				slidingScale: scale,
				ruralTown: rural,
				hasIdCard: hasCard,
				fan,
				membershipStatus: status,
				enrollmentDay: Number(enDay) || null,
				enrollmentMonth: Number(enMonth) || null,
				enrollmentYear: Number(enYear) || null,
				notes: ""
			});
			await upsertMember({
				householdId: hhId,
				beneficiaryCode: "00",
				fullName: headName,
				dobDay: Number(dobD) || null,
				dobMonth: Number(dobM) || null,
				dobYear: Number(dobY) || null,
				gender,
				relationship: "Household Head",
				profession
			});
			toast.success("Household registered on this device");
			await nav({
				to: "/households/$id",
				params: { id: hhId }
			});
		} catch (err) {
			toast.error(err instanceof Error ? err.message : "Could not save household");
		} finally {
			setBusy(false);
		}
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
		onSubmit,
		className: "cbhi-enter mx-auto flex max-w-2xl flex-col gap-4",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "font-display text-3xl font-semibold tracking-tight",
				children: "New household"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm text-muted-foreground",
				children: "Location first, then the household head. Add other members on the next screen."
			})] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, { children: "Location" }) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
				className: "grid gap-3 sm:grid-cols-2",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
						label: "Cluster",
						required: true,
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(NativeSelect, {
							value: clusterId,
							onChange: (e) => setClusterId(e.target.value),
							children: clusters.map((c) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
								value: c.id,
								children: c.name
							}, c.id))
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
						label: "PHCU",
						required: true,
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(NativeSelect, {
							value: phcuId,
							onChange: (e) => setPhcuId(e.target.value),
							children: clusterPhcus.map((p) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
								value: p.id,
								children: p.name
							}, p.id))
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
						label: "Kebele",
						hint: AMHARIC.kebele,
						required: true,
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(NativeSelect, {
							value: kebeleId,
							onChange: (e) => setKebeleId(e.target.value),
							children: phcuKebeles.map((k) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("option", {
								value: k.id,
								children: [
									k.code,
									" · ",
									k.name
								]
							}, k.id))
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
						label: "Gote",
						hint: AMHARIC.gote,
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							value: gote,
							onChange: (e) => setGote(e.target.value),
							placeholder: "Optional village / gote"
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
						label: "Rural / Town",
						hint: AMHARIC.ruralTown,
						required: true,
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(NativeSelect, {
							value: rural,
							onChange: (e) => setRural(e.target.value),
							children: RURAL_TOWN.map((v) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
								value: v,
								children: v
							}, v))
						})
					})
				]
			})] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, { children: "Coverage" }) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
				className: "grid gap-3 sm:grid-cols-2",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
						label: "Sliding scale",
						hint: AMHARIC.sliding,
						required: true,
						className: "sm:col-span-2",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(NativeSelect, {
							value: scale,
							onChange: (e) => setScale(e.target.value),
							children: SLIDING_SCALES.map((s) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("option", {
								value: s,
								children: [
									s,
									" — ",
									formatBirr(SLIDING_SCALE_META[s].amount),
									s === "Lower" ? " (government subsidy)" : ""
								]
							}, s))
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
						label: "Membership status",
						required: true,
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(NativeSelect, {
							value: status,
							onChange: (e) => setStatus(e.target.value),
							children: MEMBERSHIP_STATUSES.map((s) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
								value: s,
								children: s
							}, s))
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
						label: "Has CBHI ID card",
						hint: AMHARIC.hasCard,
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(NativeSelect, {
							value: hasCard ? "Yes" : "No",
							onChange: (e) => setHasCard(e.target.value === "Yes"),
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", { children: "Yes" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", { children: "No" })]
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
						label: "Enrollment date",
						hint: `${AMHARIC.enrollment} · DD / MM / YYYY`,
						className: "sm:col-span-2",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "grid grid-cols-3 gap-2",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
									inputMode: "numeric",
									placeholder: "DD",
									value: enDay,
									onChange: (e) => setEnDay(e.target.value)
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
									inputMode: "numeric",
									placeholder: "MM",
									value: enMonth,
									onChange: (e) => setEnMonth(e.target.value)
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
									inputMode: "numeric",
									placeholder: "YYYY",
									value: enYear,
									onChange: (e) => setEnYear(e.target.value)
								})
							]
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
						label: "Household CBHI ID",
						hint: `${AMHARIC.householdId} · auto-generated from kebele + scale, you can still edit`,
						className: "sm:col-span-2",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							value: code,
							onChange: (e) => setCode(e.target.value),
							className: "font-mono",
							required: true
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
						label: "Head National ID (FAN / FIN)",
						hint: AMHARIC.fan,
						className: "sm:col-span-2",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							value: fan,
							onChange: (e) => setFan(e.target.value),
							placeholder: "Optional"
						})
					})
				]
			})] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, { children: "Household head" }) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
				className: "grid gap-3 sm:grid-cols-2",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
						label: "Full name",
						hint: AMHARIC.fullName,
						required: true,
						className: "sm:col-span-2",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							value: headName,
							onChange: (e) => setHeadName(e.target.value),
							required: true
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
						label: "Gender",
						hint: AMHARIC.gender,
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(NativeSelect, {
							value: gender,
							onChange: (e) => setGender(e.target.value),
							children: GENDERS.map((g) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
								value: g,
								children: g
							}, g))
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
						label: "Profession",
						hint: AMHARIC.profession,
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(NativeSelect, {
							value: profession,
							onChange: (e) => setProfession(e.target.value),
							children: PROFESSIONS.map((p) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
								value: p,
								children: p
							}, p))
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
						label: "Date of birth",
						hint: `${AMHARIC.dob} · DD / MM / YYYY`,
						className: "sm:col-span-2",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "grid grid-cols-3 gap-2",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
									inputMode: "numeric",
									placeholder: "DD",
									value: dobD,
									onChange: (e) => setDobD(e.target.value)
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
									inputMode: "numeric",
									placeholder: "MM",
									value: dobM,
									onChange: (e) => setDobM(e.target.value)
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
									inputMode: "numeric",
									placeholder: "YYYY",
									value: dobY,
									onChange: (e) => setDobY(e.target.value)
								})
							]
						})
					})
				]
			})] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				type: "submit",
				size: "lg",
				disabled: busy,
				children: busy ? "Saving…" : "Save household"
			})
		]
	});
}
//#endregion
export { NewHousehold as component };
