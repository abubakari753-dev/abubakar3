import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState, type FormEvent } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { toast } from "sonner";
import { getDb, getGeo } from "@/lib/cbhi/db";
import { suggestHouseholdCode } from "@/lib/cbhi/import-export";
import { prefixForScale } from "@/lib/cbhi/ids";
import { upsertHousehold, upsertMember } from "@/lib/cbhi/actions";
import {
  AMHARIC,
  GENDERS,
  MEMBERSHIP_STATUSES,
  PROFESSIONS,
  RURAL_TOWN,
  SLIDING_SCALE_META,
  SLIDING_SCALES,
} from "@/lib/cbhi/constants";
import { formatBirr } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Field, Input, NativeSelect } from "@/components/ui/field";

export const Route = createFileRoute("/households/new")({
  ssr: false,
  component: NewHousehold,
});

function NewHousehold() {
  const nav = useNavigate();
  const clusters = useLiveQuery(() => getDb().clusters.orderBy("sort").toArray(), []) ?? [];
  const phcus = useLiveQuery(() => getDb().phcus.orderBy("sort").toArray(), []) ?? [];
  const kebeles = useLiveQuery(() => getDb().kebeles.orderBy("code").toArray(), []) ?? [];

  const [clusterId, setClusterId] = useState("");
  const [phcuId, setPhcuId] = useState("");
  const [kebeleId, setKebeleId] = useState("");
  const [gote, setGote] = useState("");
  const [scale, setScale] = useState<(typeof SLIDING_SCALES)[number]>("Middle");
  const [rural, setRural] = useState<(typeof RURAL_TOWN)[number]>("Rural");
  const [status, setStatus] = useState<(typeof MEMBERSHIP_STATUSES)[number]>("Renewed");
  const [hasCard, setHasCard] = useState(true);
  const [enDay, setEnDay] = useState("3");
  const [enMonth, setEnMonth] = useState("7");
  const [enYear, setEnYear] = useState("2016");
  const [code, setCode] = useState("");
  const [fan, setFan] = useState("");
  const [headName, setHeadName] = useState("");
  const [gender, setGender] = useState<(typeof GENDERS)[number]>("Male");
  const [profession, setProfession] = useState<(typeof PROFESSIONS)[number]>("Pastoralist");
  const [dobD, setDobD] = useState("");
  const [dobM, setDobM] = useState("");
  const [dobY, setDobY] = useState("");
  const [busy, setBusy] = useState(false);

  const clusterPhcus = useMemo(() => phcus.filter((p) => p.clusterId === clusterId), [phcus, clusterId]);
  const phcuKebeles = useMemo(() => kebeles.filter((k) => k.phcuId === phcuId), [kebeles, phcuId]);
  const kebele = kebeles.find((k) => k.id === kebeleId);

  useEffect(() => {
    if (!clusterId && clusters[0]) setClusterId(clusters[0].id);
  }, [clusters, clusterId]);
  useEffect(() => {
    if (clusterPhcus.length && !clusterPhcus.some((p) => p.id === phcuId)) {
      setPhcuId(clusterPhcus[0]!.id);
    }
  }, [clusterPhcus, phcuId]);
  useEffect(() => {
    if (phcuKebeles.length && !phcuKebeles.some((k) => k.id === kebeleId)) {
      setKebeleId(phcuKebeles[0]!.id);
    }
  }, [phcuKebeles, kebeleId]);
  useEffect(() => {
    if (kebele) setRural(kebele.ruralTown);
  }, [kebele]);
  useEffect(() => {
    if (!kebele) return;
    void (async () => {
      const geo = await getGeo();
      const next = await suggestHouseholdCode(kebele.code, scale, geo);
      setCode(next);
    })();
  }, [kebele, scale]);

  async function onSubmit(e: FormEvent) {
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
        notes: "",
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
        profession,
      });
      toast.success("Household registered on this device");
      await nav({ to: "/households/$id", params: { id: hhId } });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not save household");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="cbhi-enter mx-auto flex max-w-2xl flex-col gap-4">
      <div>
        <h1 className="font-display text-3xl font-semibold tracking-tight">New household</h1>
        <p className="text-sm text-muted-foreground">
          Location first, then the household head. Add other members on the next screen.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Location</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-2">
          <Field label="Cluster" required>
            <NativeSelect value={clusterId} onChange={(e) => setClusterId(e.target.value)}>
              {clusters.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </NativeSelect>
          </Field>
          <Field label="PHCU" required>
            <NativeSelect value={phcuId} onChange={(e) => setPhcuId(e.target.value)}>
              {clusterPhcus.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </NativeSelect>
          </Field>
          <Field label="Kebele" hint={AMHARIC.kebele} required>
            <NativeSelect value={kebeleId} onChange={(e) => setKebeleId(e.target.value)}>
              {phcuKebeles.map((k) => (
                <option key={k.id} value={k.id}>
                  {k.code} · {k.name}
                </option>
              ))}
            </NativeSelect>
          </Field>
          <Field label="Gote" hint={AMHARIC.gote}>
            <Input value={gote} onChange={(e) => setGote(e.target.value)} placeholder="Optional village / gote" />
          </Field>
          <Field label="Rural / Town" hint={AMHARIC.ruralTown} required>
            <NativeSelect value={rural} onChange={(e) => setRural(e.target.value as typeof rural)}>
              {RURAL_TOWN.map((v) => (
                <option key={v} value={v}>
                  {v}
                </option>
              ))}
            </NativeSelect>
          </Field>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Coverage</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-2">
          <Field label="Sliding scale" hint={AMHARIC.sliding} required className="sm:col-span-2">
            <NativeSelect value={scale} onChange={(e) => setScale(e.target.value as typeof scale)}>
              {SLIDING_SCALES.map((s) => (
                <option key={s} value={s}>
                  {s} — {formatBirr(SLIDING_SCALE_META[s].amount)}
                  {s === "Lower" ? " (government subsidy)" : ""}
                </option>
              ))}
            </NativeSelect>
          </Field>
          <Field label="Membership status" required>
            <NativeSelect value={status} onChange={(e) => setStatus(e.target.value as typeof status)}>
              {MEMBERSHIP_STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </NativeSelect>
          </Field>
          <Field label="Has CBHI ID card" hint={AMHARIC.hasCard}>
            <NativeSelect value={hasCard ? "Yes" : "No"} onChange={(e) => setHasCard(e.target.value === "Yes")}>
              <option>Yes</option>
              <option>No</option>
            </NativeSelect>
          </Field>
          <Field label="Enrollment date" hint={`${AMHARIC.enrollment} · DD / MM / YYYY`} className="sm:col-span-2">
            <div className="grid grid-cols-3 gap-2">
              <Input inputMode="numeric" placeholder="DD" value={enDay} onChange={(e) => setEnDay(e.target.value)} />
              <Input inputMode="numeric" placeholder="MM" value={enMonth} onChange={(e) => setEnMonth(e.target.value)} />
              <Input inputMode="numeric" placeholder="YYYY" value={enYear} onChange={(e) => setEnYear(e.target.value)} />
            </div>
          </Field>
          <Field label="Household CBHI ID" hint={`${AMHARIC.householdId} · auto from kebele + scale`} className="sm:col-span-2">
            <Input value={code} onChange={(e) => setCode(e.target.value)} className="font-mono" required />
          </Field>
          <Field label="Head National ID (FAN / FIN)" hint={AMHARIC.fan} className="sm:col-span-2">
            <Input value={fan} onChange={(e) => setFan(e.target.value)} placeholder="Optional" />
          </Field>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Household head</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-2">
          <Field label="Full name" hint={AMHARIC.fullName} required className="sm:col-span-2">
            <Input value={headName} onChange={(e) => setHeadName(e.target.value)} required />
          </Field>
          <Field label="Gender" hint={AMHARIC.gender}>
            <NativeSelect value={gender} onChange={(e) => setGender(e.target.value as typeof gender)}>
              {GENDERS.map((g) => (
                <option key={g} value={g}>
                  {g}
                </option>
              ))}
            </NativeSelect>
          </Field>
          <Field label="Profession" hint={AMHARIC.profession}>
            <NativeSelect value={profession} onChange={(e) => setProfession(e.target.value as typeof profession)}>
              {PROFESSIONS.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </NativeSelect>
          </Field>
          <Field label="Date of birth" hint={`${AMHARIC.dob} · DD / MM / YYYY`} className="sm:col-span-2">
            <div className="grid grid-cols-3 gap-2">
              <Input inputMode="numeric" placeholder="DD" value={dobD} onChange={(e) => setDobD(e.target.value)} />
              <Input inputMode="numeric" placeholder="MM" value={dobM} onChange={(e) => setDobM(e.target.value)} />
              <Input inputMode="numeric" placeholder="YYYY" value={dobY} onChange={(e) => setDobY(e.target.value)} />
            </div>
          </Field>
        </CardContent>
      </Card>

      <Button type="submit" size="lg" disabled={busy}>
        {busy ? "Saving…" : "Save household"}
      </Button>
    </form>
  );
}
