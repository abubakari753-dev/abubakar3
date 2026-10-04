import { i as __toESM } from "../_runtime.mjs";
import { n as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { n as require_jsx_runtime } from "../_libs/radix-ui__react-context+react.mjs";
import { S as Button, a as Input, g as getGeo, h as getDb, r as DEFAULT_GEO, x as wipeRegister, y as setGeo } from "./input-CxFfOybE.mjs";
import { b as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { g as Download, i as Upload, s as Smartphone, x as Archive } from "../_libs/lucide-react.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { i as loadDemoRegister, o as useInstallUi } from "./router-DBRPYkns.mjs";
import { a as CardTitle, i as CardHeader, n as CardContent, r as CardDescription, t as Card } from "./card-BAQwLtcV.mjs";
import { n as NativeSelect, t as Field } from "./field-BlD46EBv.mjs";
import { r as saveMemberPhoto, t as matchPhotoFilename } from "./photos-DXprH90-.mjs";
import { t as useLiveQuery } from "../_libs/dexie-react-hooks.mjs";
import { i as importWorkbook, n as exportCsv, r as exportWorkbook, t as downloadBlob } from "./import-export-BKY0q1F0.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/settings-BGqwa1BM.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var BACKUP_KIND = "shinile-cbhi-backup";
async function blobToDataUrl(blob) {
	return await new Promise((resolve, reject) => {
		const reader = new FileReader();
		reader.onload = () => resolve(String(reader.result));
		reader.onerror = () => reject(reader.error);
		reader.readAsDataURL(blob);
	});
}
async function dataUrlToBlob(dataUrl) {
	return await (await fetch(dataUrl)).blob();
}
async function exportBackup() {
	const db = getDb();
	const photosRaw = await db.photos.toArray();
	const photos = [];
	for (const row of photosRaw) {
		if (!row.blob) continue;
		photos.push({
			id: row.id,
			memberId: row.memberId,
			mime: row.mime || row.blob.type || "image/jpeg",
			createdAt: row.createdAt,
			dataUrl: await blobToDataUrl(row.blob)
		});
	}
	const payload = {
		kind: BACKUP_KIND,
		version: 1,
		exportedAt: (/* @__PURE__ */ new Date()).toISOString(),
		clusters: await db.clusters.toArray(),
		phcus: await db.phcus.toArray(),
		kebeles: await db.kebeles.toArray(),
		households: await db.households.toArray(),
		members: await db.members.toArray(),
		meta: await db.meta.toArray(),
		photos
	};
	return {
		blob: new Blob([JSON.stringify(payload)], { type: "application/json" }),
		filename: `Shinile_CBHI_Backup_${(/* @__PURE__ */ new Date()).toISOString().slice(0, 16).replace(/[:T]/g, "")}.json`
	};
}
async function importBackup(buf) {
	const text = new TextDecoder().decode(buf);
	const data = JSON.parse(text);
	if (data.kind !== BACKUP_KIND) throw new Error("This file is not a Shinile CBHI backup.");
	const db = getDb();
	const tables = [
		db.clusters,
		db.phcus,
		db.kebeles,
		db.households,
		db.members,
		db.photos,
		db.meta
	];
	await db.transaction("rw", tables, async () => {
		await Promise.all([
			db.clusters.clear(),
			db.phcus.clear(),
			db.kebeles.clear(),
			db.households.clear(),
			db.members.clear(),
			db.photos.clear(),
			db.meta.clear()
		]);
		if (data.clusters?.length) await db.clusters.bulkPut(data.clusters);
		if (data.phcus?.length) await db.phcus.bulkPut(data.phcus);
		if (data.kebeles?.length) await db.kebeles.bulkPut(data.kebeles);
		if (data.households?.length) await db.households.bulkPut(data.households);
		if (data.members?.length) await db.members.bulkPut(data.members);
		if (data.meta?.length) await db.meta.bulkPut(data.meta);
		for (const photo of data.photos ?? []) {
			const blob = await dataUrlToBlob(photo.dataUrl);
			const row = {
				id: photo.id,
				memberId: photo.memberId,
				blob,
				mime: photo.mime || blob.type || "image/jpeg",
				createdAt: photo.createdAt ?? Date.now()
			};
			await db.photos.put(row);
		}
	});
	return {
		households: data.households?.length ?? 0,
		members: data.members?.length ?? 0,
		photos: data.photos?.length ?? 0
	};
}
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
	const { standalone, canPrompt, platform, prompt } = useInstallUi();
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
	async function saveExport(kind) {
		const { blob, filename } = kind === "xlsx" ? await exportWorkbook() : await exportCsv();
		const result = await downloadBlob(blob, filename);
		if (result.picked) toast.success(`Saved ${result.savedAs} to the folder you chose`);
		else toast.success(`Saved ${filename} to this device’s Downloads folder`);
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
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Smartphone, { className: "size-4" }), "Install on Android & Windows"]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardDescription, { children: standalone ? "This copy is already installed. The register stays in this device’s storage." : platform === "android" ? "Add Shinile CBHI to the Android home screen so it opens like a phone app, even offline." : "Install on this computer or phone. After install it works without internet." })] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardContent, {
				className: "flex flex-col gap-3",
				children: standalone ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm text-muted-foreground",
					children: "You are using the installed app."
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex flex-wrap gap-2",
					children: [canPrompt ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						onClick: async () => {
							if (await prompt() === "accepted") toast.success("Installed on this device");
						},
						children: "Install on this device"
					}) : null, /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						variant: canPrompt ? "outline" : "default",
						asChild: true,
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
							to: "/install",
							children: "How to install on a phone"
						})
					})]
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
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardDescription, { children: "On Windows, Chrome/Edge lets you pick the folder. On Android the file is saved in Downloads, then you can move it in the Files app." })] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
				className: "flex flex-wrap gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					onClick: () => void saveExport("xlsx"),
					children: "Export Excel (.xlsx)"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					variant: "outline",
					onClick: () => void saveExport("csv"),
					children: "Export CSV"
				})]
			})] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardTitle, {
				className: "flex items-center gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Archive, { className: "size-4" }), "Backup this device"]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardDescription, { children: "Full local copy of households, members, kebeles and photos. Restore it on the same phone or another device that has Shinile CBHI installed." })] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
				className: "flex flex-col gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					variant: "secondary",
					onClick: async () => {
						const { blob, filename } = await exportBackup();
						const result = await downloadBlob(blob, filename);
						toast.success(result.picked ? `Backup saved as ${result.savedAs}` : `Backup saved: ${filename}`);
					},
					children: "Save backup file"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
					className: "flex min-h-11 cursor-pointer items-center justify-center rounded-md border border-dashed border-border bg-muted/50 px-3 text-sm",
					children: ["Restore from backup", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						type: "file",
						accept: "application/json,.json",
						className: "sr-only",
						onChange: async (e) => {
							const file = e.target.files?.[0];
							e.target.value = "";
							if (!file) return;
							if (!confirm("Replace the register on this device with the backup file?")) return;
							try {
								const result = await importBackup(await file.arrayBuffer());
								toast.success(`Restored ${result.households} households, ${result.members} members`);
							} catch (err) {
								toast.error(err instanceof Error ? err.message : "Restore failed");
							}
						}
					})]
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
