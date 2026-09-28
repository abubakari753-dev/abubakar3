import { i as __toESM } from "../_runtime.mjs";
import { n as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { n as require_jsx_runtime } from "../_libs/radix-ui__react-context+react.mjs";
import { a as Input, d as RURAL_TOWN, y as getDb } from "./input-CbEkyqtb.mjs";
import { d as Plus, g as ChevronRight, o as Trash2 } from "../_libs/lucide-react.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { a as deletePhcu, c as upsertKebele, o as upsertCluster, r as deleteKebele, t as deleteCluster, u as upsertPhcu } from "./actions-CFvWZvsb.mjs";
import { n as Card, r as CardContent, t as Button } from "./card-VA2v8bax.mjs";
import { n as NativeSelect, t as Field } from "./field-CSr7gl1-.mjs";
import { a as DialogTitle, i as DialogHeader, n as DialogContent, t as Dialog } from "./dialog-CY45GPdi.mjs";
import { t as useLiveQuery } from "../_libs/dexie-react-hooks.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/locations-BDY7MJct.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function LocationsPage() {
	const clusters = useLiveQuery(() => getDb().clusters.orderBy("sort").toArray(), []) ?? [];
	const phcus = useLiveQuery(() => getDb().phcus.orderBy("sort").toArray(), []) ?? [];
	const kebeles = useLiveQuery(() => getDb().kebeles.orderBy("code").toArray(), []) ?? [];
	const [open, setOpen] = (0, import_react.useState)(null);
	const [parentCluster, setParentCluster] = (0, import_react.useState)("");
	const [parentPhcu, setParentPhcu] = (0, import_react.useState)("");
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "cbhi-enter flex flex-col gap-4",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-wrap items-end justify-between gap-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "font-display text-3xl font-semibold tracking-tight",
					children: "Kebeles"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "max-w-xl text-sm text-muted-foreground",
					children: "Cluster → PHCU → Kebele. Households attach to a kebele. Gote is captured on each household."
				})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
					onClick: () => setOpen("cluster"),
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "size-4" }), "Add cluster"]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "flex flex-col gap-3",
				children: clusters.map((c) => {
					const cPhcus = phcus.filter((p) => p.clusterId === c.id);
					return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
						className: "flex flex-col gap-3 pt-5",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-start justify-between gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-xs font-medium tracking-wide text-primary uppercase",
								children: "Cluster"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
								className: "font-display text-lg font-semibold",
								children: c.name
							})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex gap-1",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									size: "sm",
									variant: "outline",
									onClick: () => {
										setParentCluster(c.id);
										setOpen("phcu");
									},
									children: "Add PHCU"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									size: "icon",
									variant: "ghost",
									onClick: async () => {
										try {
											await deleteCluster(c.id);
										} catch (err) {
											toast.error(err instanceof Error ? err.message : "Cannot delete");
										}
									},
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { className: "size-4" })
								})]
							})]
						}), cPhcus.map((p) => {
							const pKebeles = kebeles.filter((k) => k.phcuId === p.id);
							return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "rounded-lg bg-muted/60 p-3",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "mb-2 flex items-center justify-between gap-2",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
										className: "flex items-center gap-1 text-sm font-medium",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronRight, { className: "size-3.5 text-faint" }), p.name]
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "flex gap-1",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
											size: "sm",
											variant: "ghost",
											onClick: () => {
												setParentPhcu(p.id);
												setOpen("kebele");
											},
											children: "Add kebele"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
											size: "icon",
											variant: "ghost",
											onClick: async () => {
												try {
													await deletePhcu(p.id);
												} catch (err) {
													toast.error(err instanceof Error ? err.message : "Cannot delete");
												}
											},
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { className: "size-4" })
										})]
									})]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
									className: "flex flex-col gap-1",
									children: pKebeles.map((k) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
										className: "flex items-center justify-between rounded-md bg-card px-3 py-2 text-sm",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "font-mono text-xs text-muted-foreground",
												children: k.code
											}),
											" ",
											k.name,
											" ",
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
												className: "text-xs text-faint",
												children: ["· ", k.ruralTown]
											})
										] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
											type: "button",
											className: "text-muted-foreground hover:text-destructive",
											onClick: async () => {
												try {
													await deleteKebele(k.id);
												} catch (err) {
													toast.error(err instanceof Error ? err.message : "Cannot delete");
												}
											},
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { className: "size-4" })
										})]
									}, k.id))
								})]
							}, p.id);
						})]
					}) }, c.id);
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
				open: open !== null,
				onOpenChange: (v) => !v && setOpen(null),
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle, { children: open === "cluster" ? "New cluster" : open === "phcu" ? "New PHCU" : "New kebele" }) }),
					open === "cluster" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(NameForm, {
						label: "Cluster name",
						onSave: async (name) => {
							await upsertCluster(name);
							setOpen(null);
						}
					}) : null,
					open === "phcu" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(NameForm, {
						label: "PHCU name",
						onSave: async (name) => {
							await upsertPhcu(parentCluster, name);
							setOpen(null);
						}
					}) : null,
					open === "kebele" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(KebeleForm, {
						phcuId: parentPhcu,
						onDone: () => setOpen(null)
					}) : null
				] })
			})
		]
	});
}
function NameForm({ label, onSave }) {
	const [name, setName] = (0, import_react.useState)("");
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
		className: "flex flex-col gap-3",
		onSubmit: async (e) => {
			e.preventDefault();
			if (!name.trim()) return;
			await onSave(name);
			toast.success("Saved");
		},
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
			label,
			required: true,
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
				value: name,
				onChange: (e) => setName(e.target.value),
				autoFocus: true
			})
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
			type: "submit",
			children: "Save"
		})]
	});
}
function KebeleForm({ phcuId, onDone }) {
	const [name, setName] = (0, import_react.useState)("");
	const [code, setCode] = (0, import_react.useState)("");
	const [rural, setRural] = (0, import_react.useState)("Rural");
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
		className: "flex flex-col gap-3",
		onSubmit: async (e) => {
			e.preventDefault();
			try {
				await upsertKebele({
					phcuId,
					name,
					code,
					ruralTown: rural
				});
				toast.success("Kebele added");
				onDone();
			} catch (err) {
				toast.error(err instanceof Error ? err.message : "Could not add kebele");
			}
		},
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
				label: "Kebele name",
				required: true,
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
					value: name,
					onChange: (e) => setName(e.target.value),
					autoFocus: true
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
				label: "Kebele code",
				hint: "Used in CBHI IDs, e.g. 02",
				required: true,
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
					value: code,
					onChange: (e) => setCode(e.target.value),
					className: "font-mono"
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
				label: "Rural / Town",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(NativeSelect, {
					value: rural,
					onChange: (e) => setRural(e.target.value),
					children: RURAL_TOWN.map((v) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", { children: v }, v))
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				type: "submit",
				children: "Save kebele"
			})
		]
	});
}
//#endregion
export { LocationsPage as component };
