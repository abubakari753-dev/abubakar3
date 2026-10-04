import { i as __toESM } from "./_runtime.mjs";
import { n as require_react } from "./_libs/@radix-ui/react-compose-refs+[...].mjs";
import { n as require_jsx_runtime } from "./_libs/radix-ui__react-context+react.mjs";
import { C as cn, E as formatRecordedDate, S as Button, T as formatBirr, a as Input, c as MEMBERSHIP_STATUSES, d as RURAL_TOWN, f as SLIDING_SCALES, h as getDb, i as GENDERS, l as PROFESSIONS, p as SLIDING_SCALE_META, t as AMHARIC, u as RELATIONSHIPS } from "./_ssr/input-CxFfOybE.mjs";
import { i as prefixForScale } from "./_ssr/ids-BV64q0mT.mjs";
import { i as membersForHousehold, r as householdViews } from "./_ssr/queries-BtIcbPJl.mjs";
import { b as Link, x as useNavigate } from "./_libs/@tanstack/react-router+[...].mjs";
import { b as ArrowLeft, o as Trash2, r as User, y as Camera } from "./_libs/lucide-react.mjs";
import { n as toast } from "./_libs/sonner.mjs";
import { n as Route$1 } from "./_ssr/router-DBRPYkns.mjs";
import { i as deleteMember, l as upsertMember, n as deleteHousehold, s as upsertHousehold } from "./_ssr/actions-aBg_x2bu.mjs";
import { a as CardTitle, i as CardHeader, n as CardContent, t as Card } from "./_ssr/card-BAQwLtcV.mjs";
import { n as NativeSelect, t as Field } from "./_ssr/field-BlD46EBv.mjs";
import { n as photoUrl, r as saveMemberPhoto } from "./_ssr/photos-DXprH90-.mjs";
import { n as StatusBadge, t as ScaleBadge } from "./_ssr/scale-badge-DNUZxFvg.mjs";
import { a as DialogTitle, i as DialogHeader, n as DialogContent, r as DialogDescription, t as Dialog } from "./_ssr/dialog-Db5GTAZY.mjs";
import { t as useLiveQuery } from "./_libs/dexie-react-hooks.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/_id-EIhdARKm.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function PhotoBox({ memberId, photoId, name, onChanged, size = "md" }) {
	const [url, setUrl] = (0, import_react.useState)(null);
	(0, import_react.useEffect)(() => {
		let revoked = null;
		let alive = true;
		photoUrl(photoId).then((u) => {
			if (!alive) {
				if (u) URL.revokeObjectURL(u);
				return;
			}
			revoked = u;
			setUrl(u);
		});
		return () => {
			alive = false;
			if (revoked) URL.revokeObjectURL(revoked);
		};
	}, [photoId]);
	const dim = size === "lg" ? "size-28" : size === "sm" ? "size-12" : "size-20";
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
		className: cn("relative block shrink-0 cursor-pointer", dim),
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: cn("flex size-full items-center justify-center overflow-hidden rounded-lg bg-muted outline outline-1 -outline-offset-1 outline-black/10", dim),
				children: url ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
					src: url,
					alt: name,
					className: "size-full object-cover"
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(User, { className: "size-1/2 text-faint" })
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "absolute -right-1 -bottom-1 flex size-8 items-center justify-center rounded-full bg-primary text-primary-foreground shadow",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Camera, { className: "size-3.5" })
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
				type: "file",
				accept: "image/*",
				capture: "environment",
				className: "sr-only",
				onChange: async (e) => {
					const file = e.target.files?.[0];
					e.target.value = "";
					if (!file) return;
					try {
						await saveMemberPhoto(memberId, file);
						toast.success("Photo saved on this device");
						onChanged?.();
					} catch (err) {
						toast.error(err instanceof Error ? err.message : "Could not save photo");
					}
				}
			})
		]
	});
}
function HouseholdDetail() {
	const { id } = Route$1.useParams();
	const nav = useNavigate();
	const hh = (useLiveQuery(() => householdViews(), []) ?? []).find((h) => h.id === id);
	const members = useLiveQuery(() => membersForHousehold(id), [id]) ?? [];
	const kebeles = useLiveQuery(() => getDb().kebeles.orderBy("code").toArray(), []) ?? [];
	const [tick, setTick] = (0, import_react.useState)(0);
	const [editing, setEditing] = (0, import_react.useState)(null);
	if (!hh) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "py-16 text-center text-sm text-muted-foreground",
		children: [
			"Household not found.",
			" ",
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
				to: "/households",
				className: "text-primary",
				children: "Back to list"
			})
		]
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(HouseholdBody, {
		hh,
		members,
		kebeles,
		tick,
		setTick,
		editing,
		setEditing,
		nav
	});
}
function HouseholdBody({ hh, members, kebeles, tick, setTick, editing, setEditing, nav }) {
	async function saveHousehold(patch) {
		try {
			const nextScale = patch.slidingScale ?? hh.slidingScale;
			await upsertHousehold({
				id: hh.id,
				householdCode: patch.householdCode ?? hh.householdCode,
				paymentPrefix: prefixForScale(nextScale),
				kebeleId: patch.kebeleId ?? hh.kebeleId,
				gote: patch.gote ?? hh.gote,
				slidingScale: nextScale,
				ruralTown: patch.ruralTown ?? hh.ruralTown,
				hasIdCard: patch.hasIdCard ?? hh.hasIdCard,
				fan: patch.fan ?? hh.fan,
				membershipStatus: patch.membershipStatus ?? hh.membershipStatus,
				enrollmentDay: hh.enrollmentDay,
				enrollmentMonth: hh.enrollmentMonth,
				enrollmentYear: hh.enrollmentYear,
				notes: hh.notes
			});
			toast.success("Household updated");
		} catch (err) {
			toast.error(err instanceof Error ? err.message : "Could not save");
		}
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "cbhi-enter mx-auto flex max-w-3xl flex-col gap-4",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center gap-2",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						variant: "ghost",
						size: "icon",
						asChild: true,
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
							to: "/households",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowLeft, {})
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "min-w-0 flex-1",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
							className: "font-display truncate text-2xl font-semibold",
							children: hh.headName
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "font-mono text-xs text-muted-foreground",
							children: hh.householdCode
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						variant: "destructive",
						size: "sm",
						onClick: async () => {
							if (!confirm("Delete this household and all members from this device?")) return;
							await deleteHousehold(hh.id);
							toast.success("Household removed");
							nav({ to: "/households" });
						},
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { className: "size-4" }), "Delete"]
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-wrap gap-1.5",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ScaleBadge, { scale: hh.slidingScale }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatusBadge, { status: hh.membershipStatus })]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, { children: "Household" }) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
				className: "grid gap-3 sm:grid-cols-2",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
						label: "Kebele",
						hint: AMHARIC.kebele,
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(NativeSelect, {
							value: hh.kebeleId,
							onChange: (e) => void saveHousehold({ kebeleId: e.target.value }),
							children: kebeles.map((k) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("option", {
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
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							defaultValue: hh.gote,
							onBlur: (e) => void saveHousehold({ gote: e.target.value })
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
						label: "Sliding scale",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(NativeSelect, {
							value: hh.slidingScale,
							onChange: (e) => void saveHousehold({ slidingScale: e.target.value }),
							children: SLIDING_SCALES.map((s) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("option", {
								value: s,
								children: [
									s,
									" — ",
									formatBirr(SLIDING_SCALE_META[s].amount)
								]
							}, s))
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
						label: "Rural / Town",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(NativeSelect, {
							value: hh.ruralTown,
							onChange: (e) => void saveHousehold({ ruralTown: e.target.value }),
							children: RURAL_TOWN.map((v) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
								value: v,
								children: v
							}, v))
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
						label: "Membership status",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(NativeSelect, {
							value: hh.membershipStatus,
							onChange: (e) => void saveHousehold({ membershipStatus: e.target.value }),
							children: MEMBERSHIP_STATUSES.map((s) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
								value: s,
								children: s
							}, s))
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
						label: "Has CBHI ID card",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(NativeSelect, {
							value: hh.hasIdCard ? "Yes" : "No",
							onChange: (e) => void saveHousehold({ hasIdCard: e.target.value === "Yes" }),
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", { children: "Yes" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", { children: "No" })]
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
						label: "Household CBHI ID",
						className: "sm:col-span-2",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							defaultValue: hh.householdCode,
							className: "font-mono",
							onBlur: (e) => void saveHousehold({ householdCode: e.target.value })
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
						label: "Head FAN / FIN",
						hint: AMHARIC.fan,
						className: "sm:col-span-2",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							defaultValue: hh.fan,
							onBlur: (e) => void saveHousehold({ fan: e.target.value })
						})
					})
				]
			})] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center justify-between",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h2", {
					className: "font-display text-lg font-semibold",
					children: [
						"Members (",
						members.length,
						")"
					]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					size: "sm",
					onClick: () => setEditing("new"),
					children: "Add member"
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "flex flex-col gap-2",
				children: members.map((m) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
					className: "flex gap-3 py-4",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PhotoBox, {
						memberId: m.id,
						photoId: m.photoId,
						name: m.fullName,
						onChanged: () => setTick((t) => t + 1)
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "min-w-0 flex-1",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "font-medium",
								children: m.fullName
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "font-mono text-xs text-muted-foreground",
								children: [
									hh.householdCode,
									"/",
									m.beneficiaryCode
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "text-xs text-muted-foreground",
								children: [
									m.relationship,
									" · ",
									m.gender,
									" · ",
									m.profession,
									" · DOB",
									" ",
									formatRecordedDate(m.dobDay, m.dobMonth, m.dobYear)
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "mt-2 flex gap-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									size: "sm",
									variant: "outline",
									onClick: () => setEditing(m),
									children: "Edit"
								}), m.relationship !== "Household Head" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									size: "sm",
									variant: "ghost",
									onClick: async () => {
										if (!confirm(`Remove ${m.fullName}?`)) return;
										await deleteMember(m.id);
										toast.success("Member removed");
									},
									children: "Remove"
								}) : null]
							})
						]
					})]
				}) }, `${m.id}-${tick}`))
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MemberDialog, {
				open: editing !== null,
				householdId: hh.id,
				initial: editing === "new" ? null : editing,
				onClose: () => setEditing(null)
			})
		]
	});
}
function MemberDialog({ open, householdId, initial, onClose }) {
	const [fullName, setFullName] = (0, import_react.useState)("");
	const [gender, setGender] = (0, import_react.useState)("Female");
	const [rel, setRel] = (0, import_react.useState)("Son");
	const [prof, setProf] = (0, import_react.useState)("Student");
	const [code, setCode] = (0, import_react.useState)("");
	const [d, setD] = (0, import_react.useState)("");
	const [m, setM] = (0, import_react.useState)("");
	const [y, setY] = (0, import_react.useState)("");
	(0, import_react.useEffect)(() => {
		if (!open) return;
		setFullName(initial?.fullName ?? "");
		setGender(initial?.gender ?? "Female");
		setRel(initial?.relationship ?? "Son");
		setProf(initial?.profession ?? "Student");
		setCode(initial?.beneficiaryCode ?? "");
		setD(initial?.dobDay?.toString() ?? "");
		setM(initial?.dobMonth?.toString() ?? "");
		setY(initial?.dobYear?.toString() ?? "");
	}, [open, initial]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
		open,
		onOpenChange: (v) => !v && onClose(),
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle, { children: initial ? "Edit member" : "Add member" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogDescription, { children: "Beneficiary sub-code is assigned automatically if left blank." })] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
			className: "grid gap-3",
			onSubmit: async (e) => {
				e.preventDefault();
				try {
					await upsertMember({
						id: initial?.id,
						householdId,
						beneficiaryCode: code || void 0,
						fullName,
						dobDay: Number(d) || null,
						dobMonth: Number(m) || null,
						dobYear: Number(y) || null,
						gender,
						relationship: rel,
						profession: prof
					});
					toast.success("Member saved");
					onClose();
				} catch (err) {
					toast.error(err instanceof Error ? err.message : "Could not save member");
				}
			},
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
					label: "Full name",
					hint: AMHARIC.fullName,
					required: true,
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						value: fullName,
						onChange: (e) => setFullName(e.target.value),
						required: true
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "grid grid-cols-2 gap-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
						label: "Gender",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(NativeSelect, {
							value: gender,
							onChange: (e) => setGender(e.target.value),
							children: GENDERS.map((g) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", { children: g }, g))
						})
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
						label: "Relationship",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(NativeSelect, {
							value: rel,
							onChange: (e) => setRel(e.target.value),
							children: RELATIONSHIPS.map((r) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", { children: r }, r))
						})
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
					label: "Profession",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(NativeSelect, {
						value: prof,
						onChange: (e) => setProf(e.target.value),
						children: PROFESSIONS.map((p) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", { children: p }, p))
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
					label: "Beneficiary code",
					hint: AMHARIC.beneficiaryId,
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						value: code,
						onChange: (e) => setCode(e.target.value),
						placeholder: "00, 01, 02…",
						className: "font-mono"
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
					label: "Date of birth",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "grid grid-cols-3 gap-2",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								inputMode: "numeric",
								placeholder: "DD",
								value: d,
								onChange: (e) => setD(e.target.value)
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								inputMode: "numeric",
								placeholder: "MM",
								value: m,
								onChange: (e) => setM(e.target.value)
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								inputMode: "numeric",
								placeholder: "YYYY",
								value: y,
								onChange: (e) => setY(e.target.value)
							})
						]
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					type: "submit",
					children: initial ? "Save changes" : "Add member"
				})
			]
		})] })
	});
}
//#endregion
export { HouseholdDetail as component };
