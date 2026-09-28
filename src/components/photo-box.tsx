import { useEffect, useState } from "react";
import { Camera, User } from "lucide-react";
import { photoUrl, saveMemberPhoto } from "@/lib/cbhi/photos";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export function PhotoBox({
  memberId,
  photoId,
  name,
  onChanged,
  size = "md",
}: {
  memberId: string;
  photoId: string | null;
  name: string;
  onChanged?: () => void;
  size?: "sm" | "md" | "lg";
}) {
  const [url, setUrl] = useState<string | null>(null);

  useEffect(() => {
    let revoked: string | null = null;
    let alive = true;
    void photoUrl(photoId).then((u) => {
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

  return (
    <label className={cn("relative block shrink-0 cursor-pointer", dim)}>
      <span
        className={cn(
          "flex size-full items-center justify-center overflow-hidden rounded-lg bg-muted outline outline-1 -outline-offset-1 outline-black/10",
          dim,
        )}
      >
        {url ? (
          <img src={url} alt={name} className="size-full object-cover" />
        ) : (
          <User className="size-1/2 text-faint" />
        )}
      </span>
      <span className="absolute -right-1 -bottom-1 flex size-8 items-center justify-center rounded-full bg-primary text-primary-foreground shadow">
        <Camera className="size-3.5" />
      </span>
      <input
        type="file"
        accept="image/*"
        capture="environment"
        className="sr-only"
        onChange={async (e) => {
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
        }}
      />
    </label>
  );
}
