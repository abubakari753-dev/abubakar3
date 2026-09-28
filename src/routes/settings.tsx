import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { toast } from "sonner";
import { Download, Smartphone, Upload } from "lucide-react";
import { getDb, getGeo, setGeo, wipeRegister } from "@/lib/cbhi/db";
import { loadDemoRegister } from "@/lib/cbhi/demo";
import { downloadBlob, exportCsv, exportWorkbook, importWorkbook } from "@/lib/cbhi/import-export";
import { matchPhotoFilename, saveMemberPhoto } from "@/lib/cbhi/photos";
import { DEFAULT_GEO } from "@/lib/cbhi/constants";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Field, Input, NativeSelect } from "@/components/ui/field";
import type { GeoSettings } from "@/lib/cbhi/types";

export const Route = createFileRoute("/settings")({
  ssr: false,
  component: SettingsPage,
});

function SettingsPage() {
  const counts = useLiveQuery(async () => {
    const db = getDb();
    return {
      households: await db.households.count(),
      members: await db.members.count(),
      photos: await db.photos.count(),
      kebeles: await db.kebeles.count(),
    };
  }, []);
  const [geo, setGeoState] = useState<GeoSettings>(DEFAULT_GEO);
  const [storage, setStorage] = useState<string>("Calculating…");
  const [importing, setImporting] = useState<string | null>(null);
  const [installEvent, setInstallEvent] = useState<{ prompt: () => Promise<void> } | null>(null);

  useEffect(() => {
    void getGeo().then(setGeoState);
    void (async () => {
      if (navigator.storage?.estimate) {
        const est = await navigator.storage.estimate();
        const used = ((est.usage ?? 0) / (1024 * 1024)).toFixed(1);
        const quota = ((est.quota ?? 0) / (1024 * 1024 * 1024)).toFixed(1);
        setStorage(`${used} MB used of ${quota} GB on this device`);
      } else {
        setStorage("Storage estimate not available on this browser");
      }
    })();
  }, [counts?.photos, counts?.members]);

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      const ev = e as Event & { prompt: () => Promise<void> };
      setInstallEvent(ev);
    };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  async function onImportFile(file: File, mode: "merge" | "replace") {
    setImporting("Reading file…");
    try {
      const buf = await file.arrayBuffer();
      const result = await importWorkbook(buf, { mode }, (p) => {
        setImporting(`${p.stage}: ${p.households} households, ${p.members} members`);
      });
      toast.success(
        `Imported ${result.households} households and ${result.members} members` +
          (result.skipped ? ` (${result.skipped} rows skipped)` : ""),
      );
      if (result.errors[0]) toast.message(result.errors[0]);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Import failed");
    } finally {
      setImporting(null);
    }
  }

  async function onPhotos(files: FileList) {
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

  return (
    <div className="cbhi-enter mx-auto flex max-w-2xl flex-col gap-4">
      <div>
        <h1 className="font-display text-3xl font-semibold tracking-tight">Settings</h1>
        <p className="text-sm text-muted-foreground">
          Everything stays on this phone or computer. No internet is required after the app is opened once.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>On this device</CardTitle>
          <CardDescription>{storage}</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-3 text-sm">
          <p>
            <span className="tabular block font-display text-2xl font-semibold">{counts?.households ?? "—"}</span>
            Households
          </p>
          <p>
            <span className="tabular block font-display text-2xl font-semibold">{counts?.members ?? "—"}</span>
            Members
          </p>
          <p>
            <span className="tabular block font-display text-2xl font-semibold">{counts?.photos ?? "—"}</span>
            Photos
          </p>
          <p>
            <span className="tabular block font-display text-2xl font-semibold">{counts?.kebeles ?? "—"}</span>
            Kebeles
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Smartphone className="size-4" />
            Install for Android & Windows
          </CardTitle>
          <CardDescription>
            Add this registrar to the home screen. It then opens like an app and keeps working offline.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-3 text-sm text-muted-foreground">
          {installEvent ? (
            <Button
              onClick={async () => {
                await installEvent.prompt();
                setInstallEvent(null);
              }}
            >
              Install on this device
            </Button>
          ) : (
            <ul className="list-disc space-y-1 pl-4">
              <li>Android Chrome: menu → Add to Home screen / Install app.</li>
              <li>Windows Edge or Chrome: install icon in the address bar, or menu → Install Shinile CBHI.</li>
              <li>After install, open from the icon. The register stays in this device’s storage.</li>
            </ul>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Woreda identity</CardTitle>
          <CardDescription>Used when generating household CBHI codes.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-2">
          <Field label="Region">
            <Input value={geo.region} onChange={(e) => setGeoState({ ...geo, region: e.target.value })} />
          </Field>
          <Field label="Region code">
            <Input value={geo.regionCode} onChange={(e) => setGeoState({ ...geo, regionCode: e.target.value })} className="font-mono" />
          </Field>
          <Field label="Zone">
            <Input value={geo.zone} onChange={(e) => setGeoState({ ...geo, zone: e.target.value })} />
          </Field>
          <Field label="Zone code">
            <Input value={geo.zoneCode} onChange={(e) => setGeoState({ ...geo, zoneCode: e.target.value })} className="font-mono" />
          </Field>
          <Field label="Woreda">
            <Input value={geo.woreda} onChange={(e) => setGeoState({ ...geo, woreda: e.target.value })} />
          </Field>
          <Field label="Woreda code">
            <Input value={geo.woredaCode} onChange={(e) => setGeoState({ ...geo, woredaCode: e.target.value })} className="font-mono" />
          </Field>
          <Button
            className="sm:col-span-2"
            variant="secondary"
            onClick={async () => {
              await setGeo(geo);
              toast.success("Woreda settings saved on this device");
            }}
          >
            Save woreda settings
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="size-4" />
            Import Excel or CSV
          </CardTitle>
          <CardDescription>
            Use the official CBHI Members & Beneficiaries workbook (Full Name, DOB, Household CBHI Id…). Photos are not inside Excel — import them separately below.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          <Field label="How to apply the file">
            <NativeSelect id="import-mode" defaultValue="merge">
              <option value="merge">Merge — keep existing, add new household codes</option>
              <option value="replace">Replace — clear households then load the file</option>
            </NativeSelect>
          </Field>
          <label className="flex min-h-11 cursor-pointer items-center justify-center rounded-md border border-dashed border-border bg-muted/50 px-3 text-sm">
            Choose .xlsx or .csv from this device
            <input
              type="file"
              accept=".xlsx,.xls,.csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,text/csv"
              className="sr-only"
              onChange={(e) => {
                const file = e.target.files?.[0];
                e.target.value = "";
                if (!file) return;
                const mode = (document.getElementById("import-mode") as HTMLSelectElement)?.value === "replace" ? "replace" : "merge";
                void onImportFile(file, mode);
              }}
            />
          </label>
          {importing ? <p className="text-sm text-primary">{importing}</p> : null}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Import member photos</CardTitle>
          <CardDescription>
            Name files like <span className="font-mono">P_05_04_09_02_0001_00.jpg</span> or the member’s full name.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <label className="flex min-h-11 cursor-pointer items-center justify-center rounded-md border border-dashed border-border bg-muted/50 px-3 text-sm">
            Choose photos from this device
            <input
              type="file"
              accept="image/*"
              multiple
              className="sr-only"
              onChange={(e) => {
                const files = e.target.files;
                e.target.value = "";
                if (files?.length) void onPhotos(files);
              }}
            />
          </label>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Download className="size-4" />
            Export
          </CardTitle>
          <CardDescription>
            Files download to this device (Downloads folder on Windows, Files app on Android).
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          <Button
            onClick={async () => {
              const { blob, filename } = await exportWorkbook();
              downloadBlob(blob, filename);
              toast.success(`Saved ${filename}`);
            }}
          >
            Export Excel (.xlsx)
          </Button>
          <Button
            variant="outline"
            onClick={async () => {
              const { blob, filename } = await exportCsv();
              downloadBlob(blob, filename);
              toast.success(`Saved ${filename}`);
            }}
          >
            Export CSV
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Sample data & reset</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-2">
          <Button
            variant="outline"
            onClick={async () => {
              const r = await loadDemoRegister();
              toast.success(`Demo register: ${r.households} households, ${r.members} members`);
            }}
          >
            Load demo Shinile sample
          </Button>
          <Button
            variant="destructive"
            onClick={async () => {
              if (!confirm("Erase all households, members and photos on this device? Kebeles stay.")) return;
              await wipeRegister(true);
              toast.success("Register cleared on this device");
            }}
          >
            Clear households
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
