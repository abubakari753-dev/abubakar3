import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { toast } from "sonner";
import { ArrowLeft, Trash2 } from "lucide-react";
import { getDb } from "@/lib/cbhi/db";
import { householdViews, membersForHousehold } from "@/lib/cbhi/queries";
import { deleteHousehold, deleteMember, upsertHousehold, upsertMember } from "@/lib/cbhi/actions";
import { prefixForScale } from "@/lib/cbhi/ids";
import {
  AMHARIC,
  GENDERS,
  MEMBERSHIP_STATUSES,
  PROFESSIONS,
  RELATIONSHIPS,
  RURAL_TOWN,
  SLIDING_SCALE_META,
  SLIDING_SCALES,
  type Gender,
  type Profession,
  type Relationship,
} from "@/lib/cbhi/constants";
import { formatBirr, formatRecordedDate } from "@/lib/utils";
import type { HouseholdView, MemberRow } from "@/lib/cbhi/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Field, Input, NativeSelect } from "@/components/ui/field";
import { PhotoBox } from "@/components/photo-box";
import { ScaleBadge, StatusBadge } from "@/components/scale-badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export const Route = createFileRoute("/households/$id")({
  ssr: false,
  component: HouseholdDetail,
});

function HouseholdDetail() {
  const { id } = Route.useParams();
  const nav = useNavigate();
  const views = useLiveQuery(() => householdViews(), []) ?? [];
  const hh = views.find((h) => h.id === id);
  const members = useLiveQuery(() => membersForHousehold(id), [id]) ?? [];
  const kebeles = useLiveQuery(() => getDb().kebeles.orderBy("code").toArray(), []) ?? [];
  const [tick, setTick] = useState(0);
  const [editing, setEditing] = useState<MemberRow | "new" | null>(null);

  if (!hh) {
    return (
      <div className="py-16 text-center text-sm text-muted-foreground">
        Household not found.{" "}
        <Link to="/households" className="text-primary">
          Back to list
        </Link>
      </div>
    );
  }

  return (
    <HouseholdBody
      hh={hh}
      members={members}
      kebeles={kebeles}
      tick={tick}
      setTick={setTick}
      editing={editing}
      setEditing={setEditing}
      nav={nav}
    />
  );
}

function HouseholdBody({
  hh,
  members,
  kebeles,
  tick,
  setTick,
  editing,
  setEditing,
  nav,
}: {
  hh: HouseholdView;
  members: MemberRow[];
  kebeles: { id: string; name: string; code: string }[];
  tick: number;
  setTick: (fn: (t: number) => number) => void;
  editing: MemberRow | "new" | null;
  setEditing: (v: MemberRow | "new" | null) => void;
  nav: ReturnType<typeof useNavigate>;
}) {
  async function saveHousehold(patch: Partial<HouseholdView>) {
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
        notes: hh.notes,
      });
      toast.success("Household updated");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not save");
    }
  }

  return (
    <div className="cbhi-enter mx-auto flex max-w-3xl flex-col gap-4">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" asChild>
          <Link to="/households">
            <ArrowLeft />
          </Link>
        </Button>
        <div className="min-w-0 flex-1">
          <h1 className="font-display truncate text-2xl font-semibold">{hh.headName}</h1>
          <p className="font-mono text-xs text-muted-foreground">{hh.householdCode}</p>
        </div>
        <Button
          variant="destructive"
          size="sm"
          onClick={async () => {
            if (!confirm("Delete this household and all members from this device?")) return;
            await deleteHousehold(hh.id);
            toast.success("Household removed");
            void nav({ to: "/households" });
          }}
        >
          <Trash2 className="size-4" />
          Delete
        </Button>
      </div>

      <div className="flex flex-wrap gap-1.5">
        <ScaleBadge scale={hh.slidingScale} />
        <StatusBadge status={hh.membershipStatus} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Household</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-2">
          <Field label="Kebele" hint={AMHARIC.kebele}>
            <NativeSelect value={hh.kebeleId} onChange={(e) => void saveHousehold({ kebeleId: e.target.value })}>
              {kebeles.map((k) => (
                <option key={k.id} value={k.id}>
                  {k.code} · {k.name}
                </option>
              ))}
            </NativeSelect>
          </Field>
          <Field label="Gote">
            <Input defaultValue={hh.gote} onBlur={(e) => void saveHousehold({ gote: e.target.value })} />
          </Field>
          <Field label="Sliding scale">
            <NativeSelect
              value={hh.slidingScale}
              onChange={(e) => void saveHousehold({ slidingScale: e.target.value as typeof hh.slidingScale })}
            >
              {SLIDING_SCALES.map((s) => (
                <option key={s} value={s}>
                  {s} — {formatBirr(SLIDING_SCALE_META[s].amount)}
                </option>
              ))}
            </NativeSelect>
          </Field>
          <Field label="Rural / Town">
            <NativeSelect
              value={hh.ruralTown}
              onChange={(e) => void saveHousehold({ ruralTown: e.target.value as typeof hh.ruralTown })}
            >
              {RURAL_TOWN.map((v) => (
                <option key={v} value={v}>
                  {v}
                </option>
              ))}
            </NativeSelect>
          </Field>
          <Field label="Membership status">
            <NativeSelect
              value={hh.membershipStatus}
              onChange={(e) =>
                void saveHousehold({ membershipStatus: e.target.value as typeof hh.membershipStatus })
              }
            >
              {MEMBERSHIP_STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </NativeSelect>
          </Field>
          <Field label="Has CBHI ID card">
            <NativeSelect
              value={hh.hasIdCard ? "Yes" : "No"}
              onChange={(e) => void saveHousehold({ hasIdCard: e.target.value === "Yes" })}
            >
              <option>Yes</option>
              <option>No</option>
            </NativeSelect>
          </Field>
          <Field label="Household CBHI ID" className="sm:col-span-2">
            <Input
              defaultValue={hh.householdCode}
              className="font-mono"
              onBlur={(e) => void saveHousehold({ householdCode: e.target.value })}
            />
          </Field>
          <Field label="Head FAN / FIN" hint={AMHARIC.fan} className="sm:col-span-2">
            <Input defaultValue={hh.fan} onBlur={(e) => void saveHousehold({ fan: e.target.value })} />
          </Field>
        </CardContent>
      </Card>

      <div className="flex items-center justify-between">
        <h2 className="font-display text-lg font-semibold">Members ({members.length})</h2>
        <Button size="sm" onClick={() => setEditing("new")}>
          Add member
        </Button>
      </div>

      <div className="flex flex-col gap-2">
        {members.map((m) => (
          <Card key={`${m.id}-${tick}`}>
            <CardContent className="flex gap-3 py-4">
              <PhotoBox
                memberId={m.id}
                photoId={m.photoId}
                name={m.fullName}
                onChanged={() => setTick((t) => t + 1)}
              />
              <div className="min-w-0 flex-1">
                <p className="font-medium">{m.fullName}</p>
                <p className="font-mono text-xs text-muted-foreground">
                  {hh.householdCode}/{m.beneficiaryCode}
                </p>
                <p className="text-xs text-muted-foreground">
                  {m.relationship} · {m.gender} · {m.profession} · DOB{" "}
                  {formatRecordedDate(m.dobDay, m.dobMonth, m.dobYear)}
                </p>
                <div className="mt-2 flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => setEditing(m)}>
                    Edit
                  </Button>
                  {m.relationship !== "Household Head" ? (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={async () => {
                        if (!confirm(`Remove ${m.fullName}?`)) return;
                        await deleteMember(m.id);
                        toast.success("Member removed");
                      }}
                    >
                      Remove
                    </Button>
                  ) : null}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <MemberDialog
        open={editing !== null}
        householdId={hh.id}
        initial={editing === "new" ? null : editing}
        onClose={() => setEditing(null)}
      />
    </div>
  );
}

function MemberDialog({
  open,
  householdId,
  initial,
  onClose,
}: {
  open: boolean;
  householdId: string;
  initial: MemberRow | null;
  onClose: () => void;
}) {
  const [fullName, setFullName] = useState("");
  const [gender, setGender] = useState<Gender>("Female");
  const [rel, setRel] = useState<Relationship>("Son");
  const [prof, setProf] = useState<Profession>("Student");
  const [code, setCode] = useState("");
  const [d, setD] = useState("");
  const [m, setM] = useState("");
  const [y, setY] = useState("");

  useEffect(() => {
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

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{initial ? "Edit member" : "Add member"}</DialogTitle>
          <DialogDescription>Beneficiary sub-code is assigned automatically if left blank.</DialogDescription>
        </DialogHeader>
        <form
          className="grid gap-3"
          onSubmit={async (e) => {
            e.preventDefault();
            try {
              await upsertMember({
                id: initial?.id,
                householdId,
                beneficiaryCode: code || undefined,
                fullName,
                dobDay: Number(d) || null,
                dobMonth: Number(m) || null,
                dobYear: Number(y) || null,
                gender,
                relationship: rel,
                profession: prof,
              });
              toast.success("Member saved");
              onClose();
            } catch (err) {
              toast.error(err instanceof Error ? err.message : "Could not save member");
            }
          }}
        >
          <Field label="Full name" hint={AMHARIC.fullName} required>
            <Input value={fullName} onChange={(e) => setFullName(e.target.value)} required />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Gender">
              <NativeSelect value={gender} onChange={(e) => setGender(e.target.value as Gender)}>
                {GENDERS.map((g) => (
                  <option key={g}>{g}</option>
                ))}
              </NativeSelect>
            </Field>
            <Field label="Relationship">
              <NativeSelect value={rel} onChange={(e) => setRel(e.target.value as Relationship)}>
                {RELATIONSHIPS.map((r) => (
                  <option key={r}>{r}</option>
                ))}
              </NativeSelect>
            </Field>
          </div>
          <Field label="Profession">
            <NativeSelect value={prof} onChange={(e) => setProf(e.target.value as Profession)}>
              {PROFESSIONS.map((p) => (
                <option key={p}>{p}</option>
              ))}
            </NativeSelect>
          </Field>
          <Field label="Beneficiary code" hint={AMHARIC.beneficiaryId}>
            <Input value={code} onChange={(e) => setCode(e.target.value)} placeholder="00, 01, 02…" className="font-mono" />
          </Field>
          <Field label="Date of birth">
            <div className="grid grid-cols-3 gap-2">
              <Input inputMode="numeric" placeholder="DD" value={d} onChange={(e) => setD(e.target.value)} />
              <Input inputMode="numeric" placeholder="MM" value={m} onChange={(e) => setM(e.target.value)} />
              <Input inputMode="numeric" placeholder="YYYY" value={y} onChange={(e) => setY(e.target.value)} />
            </div>
          </Field>
          <Button type="submit">{initial ? "Save changes" : "Add member"}</Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
