import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { toast } from "sonner";
import { ChevronRight, Plus, Trash2 } from "lucide-react";
import { getDb } from "@/lib/cbhi/db";
import {
  deleteCluster,
  deleteKebele,
  deletePhcu,
  upsertCluster,
  upsertKebele,
  upsertPhcu,
} from "@/lib/cbhi/actions";
import { RURAL_TOWN } from "@/lib/cbhi/constants";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Field, Input, NativeSelect } from "@/components/ui/field";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export const Route = createFileRoute("/locations")({
  ssr: false,
  component: LocationsPage,
});

function LocationsPage() {
  const clusters = useLiveQuery(() => getDb().clusters.orderBy("sort").toArray(), []) ?? [];
  const phcus = useLiveQuery(() => getDb().phcus.orderBy("sort").toArray(), []) ?? [];
  const kebeles = useLiveQuery(() => getDb().kebeles.orderBy("code").toArray(), []) ?? [];
  const [open, setOpen] = useState<"cluster" | "phcu" | "kebele" | null>(null);
  const [parentCluster, setParentCluster] = useState("");
  const [parentPhcu, setParentPhcu] = useState("");

  return (
    <div className="cbhi-enter flex flex-col gap-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl font-semibold tracking-tight">Kebeles</h1>
          <p className="max-w-xl text-sm text-muted-foreground">
            Cluster → PHCU → Kebele. Households attach to a kebele. Gote is captured on each household.
          </p>
        </div>
        <Button onClick={() => setOpen("cluster")}>
          <Plus className="size-4" />
          Add cluster
        </Button>
      </div>

      <div className="flex flex-col gap-3">
        {clusters.map((c) => {
          const cPhcus = phcus.filter((p) => p.clusterId === c.id);
          return (
            <Card key={c.id}>
              <CardContent className="flex flex-col gap-3 pt-5">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-xs font-medium tracking-wide text-primary uppercase">Cluster</p>
                    <h2 className="font-display text-lg font-semibold">{c.name}</h2>
                  </div>
                  <div className="flex gap-1">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setParentCluster(c.id);
                        setOpen("phcu");
                      }}
                    >
                      Add PHCU
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={async () => {
                        try {
                          await deleteCluster(c.id);
                        } catch (err) {
                          toast.error(err instanceof Error ? err.message : "Cannot delete");
                        }
                      }}
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </div>
                </div>
                {cPhcus.map((p) => {
                  const pKebeles = kebeles.filter((k) => k.phcuId === p.id);
                  return (
                    <div key={p.id} className="rounded-lg bg-muted/60 p-3">
                      <div className="mb-2 flex items-center justify-between gap-2">
                        <p className="flex items-center gap-1 text-sm font-medium">
                          <ChevronRight className="size-3.5 text-faint" />
                          {p.name}
                        </p>
                        <div className="flex gap-1">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => {
                              setParentPhcu(p.id);
                              setOpen("kebele");
                            }}
                          >
                            Add kebele
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={async () => {
                              try {
                                await deletePhcu(p.id);
                              } catch (err) {
                                toast.error(err instanceof Error ? err.message : "Cannot delete");
                              }
                            }}
                          >
                            <Trash2 className="size-4" />
                          </Button>
                        </div>
                      </div>
                      <ul className="flex flex-col gap-1">
                        {pKebeles.map((k) => (
                          <li
                            key={k.id}
                            className="flex items-center justify-between rounded-md bg-card px-3 py-2 text-sm"
                          >
                            <span>
                              <span className="font-mono text-xs text-muted-foreground">{k.code}</span>{" "}
                              {k.name}{" "}
                              <span className="text-xs text-faint">· {k.ruralTown}</span>
                            </span>
                            <button
                              type="button"
                              className="text-muted-foreground hover:text-destructive"
                              onClick={async () => {
                                try {
                                  await deleteKebele(k.id);
                                } catch (err) {
                                  toast.error(err instanceof Error ? err.message : "Cannot delete");
                                }
                              }}
                            >
                              <Trash2 className="size-4" />
                            </button>
                          </li>
                        ))}
                      </ul>
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Dialog open={open !== null} onOpenChange={(v) => !v && setOpen(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {open === "cluster" ? "New cluster" : open === "phcu" ? "New PHCU" : "New kebele"}
            </DialogTitle>
          </DialogHeader>
          {open === "cluster" ? (
            <NameForm
              label="Cluster name"
              onSave={async (name) => {
                await upsertCluster(name);
                setOpen(null);
              }}
            />
          ) : null}
          {open === "phcu" ? (
            <NameForm
              label="PHCU name"
              onSave={async (name) => {
                await upsertPhcu(parentCluster, name);
                setOpen(null);
              }}
            />
          ) : null}
          {open === "kebele" ? <KebeleForm phcuId={parentPhcu} onDone={() => setOpen(null)} /> : null}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function NameForm({ label, onSave }: { label: string; onSave: (name: string) => Promise<void> }) {
  const [name, setName] = useState("");
  return (
    <form
      className="flex flex-col gap-3"
      onSubmit={async (e) => {
        e.preventDefault();
        if (!name.trim()) return;
        await onSave(name);
        toast.success("Saved");
      }}
    >
      <Field label={label} required>
        <Input value={name} onChange={(e) => setName(e.target.value)} autoFocus />
      </Field>
      <Button type="submit">Save</Button>
    </form>
  );
}

function KebeleForm({ phcuId, onDone }: { phcuId: string; onDone: () => void }) {
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [rural, setRural] = useState<(typeof RURAL_TOWN)[number]>("Rural");
  return (
    <form
      className="flex flex-col gap-3"
      onSubmit={async (e) => {
        e.preventDefault();
        try {
          await upsertKebele({ phcuId, name, code, ruralTown: rural });
          toast.success("Kebele added");
          onDone();
        } catch (err) {
          toast.error(err instanceof Error ? err.message : "Could not add kebele");
        }
      }}
    >
      <Field label="Kebele name" required>
        <Input value={name} onChange={(e) => setName(e.target.value)} autoFocus />
      </Field>
      <Field label="Kebele code" hint="Used in CBHI IDs, e.g. 02" required>
        <Input value={code} onChange={(e) => setCode(e.target.value)} className="font-mono" />
      </Field>
      <Field label="Rural / Town">
        <NativeSelect value={rural} onChange={(e) => setRural(e.target.value as typeof rural)}>
          {RURAL_TOWN.map((v) => (
            <option key={v}>{v}</option>
          ))}
        </NativeSelect>
      </Field>
      <Button type="submit">Save kebele</Button>
    </form>
  );
}
