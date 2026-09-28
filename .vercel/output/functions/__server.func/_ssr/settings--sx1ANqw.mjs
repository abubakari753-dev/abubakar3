import { i as __toESM } from "../_runtime.mjs";
import { n as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { n as require_jsx_runtime } from "../_libs/radix-ui__react-context+react.mjs";
import { D as setGeo, a as Input, b as getGeo, k as wipeRegister, r as DEFAULT_GEO, y as getDb } from "./input-CbEkyqtb.mjs";
import { h as Download, i as Upload, s as Smartphone } from "../_libs/lucide-react.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { i as loadDemoRegister } from "./router-CcXfc9Cn.mjs";
import { a as CardHeader, i as CardDescription, n as Card, o as CardTitle, r as CardContent, t as Button } from "./card-VA2v8bax.mjs";
import { n as NativeSelect, t as Field } from "./field-CSr7gl1-.mjs";
import { r as saveMemberPhoto, t as matchPhotoFilename } from "./photos-BSQtpJ78.mjs";
import { t as useLiveQuery } from "../_libs/dexie-react-hooks.mjs";
import { i as importWorkbook, n as exportCsv, r as exportWorkbook, t as downloadBlob } from "./import-export-Bb6Jp1oc.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/settings--sx1ANqw.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function SettingsPage() {
	const counts = useLiveQuery(async () => {
		const db = getDb();
		return {
			households: await db.households.count(),
			members: await db.members.count(),
			photos: await db.photos.count(),
			kebeles: await db.kebeles.count()
		};
	}, []);
	const [geo, setGeoState] = (0, import_react.useState)(DEFAULT_GEO);
	const [storage, setStorage] = (0, import_react.useState)("Calculating…");
	const [importing, setImporting] = (0, import_react.useState)(null);
	const [installEvent, setInstallEvent] = (0, import_react.useState)(null);
	(0, import_react.useEffect)(() => {
		getGeo().then(setGeoState);
		(async () => {
			if (navigator.storage?.estimate) {
				const est = await navigator.storage.estimate();
				const used = ((est.usage ?? 0) / 1048576).toFixed(1);
				const quota = ((est.quota ?? 0) / 1073741824).toFixed(1);
				setStorage(`${used} MB used of ${quota} GB on this device`);
			} else setStorage("Storage estimate not available on this browser");
		})();
	}, [counts?.photos, counts?.members]);
	(0, import_react.useEffect)(() => {
		const handler = (e) => {
			e.preventDefault();
			setInstallEvent(e);
		};
		window.addEventListener("beforeinstallprompt", handler);
		return () => window.removeEventListener("beforeinstallprompt", handler);
	}, []);
	async function onImportFile(file, mode) {
		setImporting("Reading file…");
		try {
			const buf = await file.arrayBuffer();
			const result = await importWorkbook(buf, { mode }, (p) => {
				setImporting(`${p.stage}: ${p.households} households, ${p.members} members`);
			});
			toast.success(`Imported ${result.households} households and ${result.members} members` + (result.skipped ? ` (${result.skipped} rows skipped)` : ""));
			if (result.errors[0]) toast.message(result.errors[0]);
		} catch (err) {
			toast.error(err instanceof Error ? err.message : "Import failed");
		} finally {
			setImporting(null);
		}
	}
	async function onPhotos(files) {
		const db = getDb();
		const members = await db.members.toArray();
		const households = await db.households.toArray();
		const hhById = new Map(households.map((h) => [h.id, h]));
		let matched = 0;
		for (const file of Array.from(files)) {
			const member = members.find((m) => {
				const hh = hhById.get(m.householdId);
				if (!hh) return false;
				return matchPhotoFilename(file.name, hh.householdCode, m.beneficiaryCode, m.fullName);
			});
			if (!member) continue;
			await saveMemberPhoto(member.id, file);
			matched += 1;
		}
		toast.success(`Attached ${matched} of ${files.length} photos`);
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "cbhi-enter mx-auto flex max-w-2xl flex-col gap-4",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "font-display text-3xl font-semibold tracking-tight",
				children: "Settings"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm text-muted-foreground",
				children: "Everything stays on this phone or computer. No internet is required after the app is opened once."
			})] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, { children: "On this device" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardDescription, { children: storage })] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
				className: "grid grid-cols-2 gap-3 text-sm",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "tabular block font-display text-2xl font-semibold",
						children: counts?.households ?? "—"
					}), "Households"] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "tabular block font-display text-2xl font-semibold",
						children: counts?.members ?? "—"
					}), "Members"] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "tabular block font-display text-2xl font-semibold",
						children: counts?.photos ?? "—"
					}), "Photos"] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "tabular block font-display text-2xl font-semibold",
						children: counts?.kebeles ?? "—"
					}), "Kebeles"] })
				]
			})] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardTitle, {
				className: "flex items-center gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Smartphone, { className: "size-4" }), "Install for Android & Windows"]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardDescription, { children: "Add this registrar to the home screen. It then opens like an app and keeps working offline." })] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardContent, {
				className: "flex flex-col gap-3 text-sm text-muted-foreground",
				children: installEvent ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					onClick: async () => {
						await installEvent.prompt();
						setInstallEvent(null);
					},
					children: "Install on this device"
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("ul", {
					className: "list-disc space-y-1 pl-4",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: "Android Chrome: menu → Add to Home screen / Install app." }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: "Windows Edge or Chrome: install icon in the address bar, or menu → Install Shinile CBHI." }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: "After install, open from the icon. The register stays in this device’s storage." })
					]
				})
			})] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, { children: "Woreda identity" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardDescription, { children: "Used when generating household CBHI codes." })] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
				className: "grid gap-3 sm:grid-cols-2",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
						label: "Region",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							value: geo.region,
							onChange: (e) => setGeoState({
								...geo,
								region: e.target.value
							})
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
						label: "Region code",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							value: geo.regionCode,
							onChange: (e) => setGeoState({
								...geo,
								regionCode: e.target.value
							}),
							className: "font-mono"
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
						label: "Zone",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							value: geo.zone,
							onChange: (e) => setGeoState({
								...geo,
								zone: e.target.value
							})
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
						label: "Zone code",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							value: geo.zoneCode,
							onChange: (e) => setGeoState({
								...geo,
								zoneCode: e.target.value
							}),
							className: "font-mono"
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
						label: "Woreda",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							value: geo.woreda,
							onChange: (e) => setGeoState({
								...geo,
								woreda: e.target.value
							})
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
						label: "Woreda code",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							value: geo.woredaCode,
							onChange: (e) => setGeoState({
								...geo,
								woredaCode: e.target.value
							}),
							className: "font-mono"
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						className: "sm:col-span-2",
						variant: "secondary",
						onClick: async () => {
							await setGeo(geo);
							toast.success("Woreda settings saved on this device");
						},
						children: "Save woreda settings"
					})
				]
			})] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardTitle, {
				className: "flex items-center gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Upload, { className: "size-4" }), "Import Excel or CSV"]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardDescription, { children: "Use the official CBHI Members & Beneficiaries workbook (Full Name, DOB, Household CBHI Id…). Photos are not inside Excel — import them separately below." })] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
				className: "flex flex-col gap-3",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
						label: "How to apply the file",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(NativeSelect, {
							id: "import-mode",
							defaultValue: "merge",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
								value: "merge",
								children: "Merge — keep existing, add new household codes"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
								value: "replace",
								children: "Replace — clear households then load the file"
							})]
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
						className: "flex min-h-11 cursor-pointer items-center justify-center rounded-md border border-dashed border-border bg-muted/50 px-3 text-sm",
						children: ["Choose .xlsx or .csv from this device", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							type: "file",
							accept: ".xlsx,.xls,.csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,text/csv",
							className: "sr-only",
							onChange: (e) => {
								const file = e.target.files?.[0];
								e.target.value = "";
								if (!file) return;
								onImportFile(file, document.getElementById("import-mode")?.value === "replace" ? "replace" : "merge");
							}
						})]
					}),
					importing ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-sm text-primary",
						children: importing
					}) : null
				]
			})] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, { children: "Import member photos" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardDescription, { children: [
				"Name files like ",
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "font-mono",
					children: "P_05_04_09_02_0001_00.jpg"
				}),
				" or the member’s full name."
			] })] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardContent, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
				className: "flex min-h-11 cursor-pointer items-center justify-center rounded-md border border-dashed border-border bg-muted/50 px-3 text-sm",
				children: ["Choose photos from this device", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
					type: "file",
					accept: "image/*",
					multiple: true,
					className: "sr-only",
					onChange: (e) => {
						const files = e.target.files;
						e.target.value = "";
						if (files?.length) onPhotos(files);
					}
				})]
			}) })] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardTitle, {
				className: "flex items-center gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Download, { className: "size-4" }), "Export"]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardDescription, { children: "Files download to this device (Downloads folder on Windows, Files app on Android)." })] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
				className: "flex flex-wrap gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					onClick: async () => {
						const { blob, filename } = await exportWorkbook();
						downloadBlob(blob, filename);
						toast.success(`Saved ${filename}`);
					},
					children: "Export Excel (.xlsx)"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					variant: "outline",
					onClick: async () => {
						const { blob, filename } = await exportCsv();
						downloadBlob(blob, filename);
						toast.success(`Saved ${filename}`);
					},
					children: "Export CSV"
				})]
			})] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, { children: "Sample data & reset" }) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
				className: "flex flex-col gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					variant: "outline",
					onClick: async () => {
						const r = await loadDemoRegister();
						toast.success(`Demo register: ${r.households} households, ${r.members} members`);
					},
					children: "Load demo Shinile sample"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					variant: "destructive",
					onClick: async () => {
						if (!confirm("Erase all households, members and photos on this device? Kebeles stay.")) return;
						await wipeRegister(true);
						toast.success("Register cleared on this device");
					},
					children: "Clear households"
				})]
			})] })
		]
	});
}
//#endregion
export { SettingsPage as component };
