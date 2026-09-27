import * as Dialog from "@radix-ui/react-dialog";
import type { ReactNode } from "react";
import { cn } from "@/lib/cn";
import { pieceColor } from "@/lib/wardrobe/logic";
import type { Piece, Swatch } from "@/lib/wardrobe/types";
import { useCopy } from "./use-copy";

export const fieldClass =
  "w-full rounded-xl border border-line bg-sheet px-3 text-sm text-ink outline-none placeholder:text-muted";

export function SwatchFace({
  piece,
  className,
  labeled = false,
}: {
  piece: Pick<Piece, "swatch" | "tone" | "photos" | "color" | "colorZh" | "name" | "finish">;
  className?: string;
  labeled?: boolean;
}) {
  const { lang } = useCopy();
  const photo = piece.photos[0];
  const clear = piece.finish === "clear" || piece.finish === "sheer";
  return (
    <div
      className={cn("relative overflow-hidden bg-line", !photo && clear && "swatch-clear", className)}
      style={{
        background: photo || clear ? undefined : piece.swatch,
        color: piece.tone === "ink" ? "#1c1916" : "#f3eee6",
      }}
    >
      {!photo && clear ? (
        <span
          className="absolute inset-0"
          style={{ background: piece.swatch, opacity: piece.finish === "clear" ? 0.28 : 0.62 }}
        />
      ) : null}
      {photo ? (
        <img src={photo} alt={piece.name} className="relative h-full w-full object-cover" />
      ) : labeled ? (
        <span className="absolute inset-x-2 bottom-2 truncate font-display text-sm leading-none">
          {pieceColor(piece as Piece, lang)}
        </span>
      ) : null}
    </div>
  );
}

export function SwatchDot({
  swatch,
  selected,
  label,
  onClick,
}: {
  swatch: Swatch;
  selected: boolean;
  label: string;
  onClick: () => void;
}) {
  const clear = swatch.finish !== "solid";
  return (
    <button
      type="button"
      aria-label={label}
      aria-pressed={selected}
      onClick={onClick}
      className={cn(
        "relative size-11 overflow-hidden rounded-full border-2",
        clear && "swatch-clear",
        selected ? "border-ink" : "border-transparent",
      )}
      style={clear ? undefined : { background: swatch.hex }}
    >
      {clear ? (
        <span
          className="absolute inset-0"
          style={{ background: swatch.hex, opacity: swatch.finish === "clear" ? 0.28 : 0.62 }}
        />
      ) : null}
    </button>
  );
}

export function Field({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs tracking-widest text-muted uppercase">{label}</span>
      {children}
    </label>
  );
}

export function ConfirmDialog({
  open,
  title,
  body,
  confirmLabel,
  onConfirm,
  onClose,
}: {
  open: boolean;
  title: string;
  body: string;
  confirmLabel: string;
  onConfirm: () => void;
  onClose: () => void;
}) {
  const { c } = useCopy();
  return (
    <Dialog.Root open={open} onOpenChange={(next) => !next && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-40 bg-black/60" />
        <Dialog.Content className="fixed top-1/2 left-1/2 z-50 w-full max-w-sm -translate-x-1/2 -translate-y-1/2 rounded-card bg-sheet p-5 shadow-lg">
          <Dialog.Title className="font-display text-2xl leading-tight">{title}</Dialog.Title>
          <Dialog.Description className="mt-2 text-sm text-muted">{body}</Dialog.Description>
          <div className="mt-5 flex justify-end gap-2">
            <button type="button" className="h-11 rounded-full px-4 text-sm text-muted" onClick={onClose}>
              {c.cancel}
            </button>
            <button
              type="button"
              className="h-11 rounded-full bg-accent px-4 text-sm text-sheet"
              onClick={onConfirm}
            >
              {confirmLabel}
            </button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

export function ScreenHeader({
  title,
  onBack,
  backLabel,
  action,
}: {
  title: string;
  onBack: () => void;
  backLabel: string;
  action?: ReactNode;
}) {
  return (
    <header className="sticky top-0 z-10 flex items-center gap-2 border-b border-line bg-paper/95 px-3 py-2 backdrop-blur">
      <button type="button" className="h-11 rounded-full px-3 text-sm" onClick={onBack}>
        {backLabel}
      </button>
      <h1 className="min-w-0 flex-1 truncate font-display text-xl">{title}</h1>
      {action}
    </header>
  );
}
