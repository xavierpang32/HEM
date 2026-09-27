import * as Dialog from "@radix-ui/react-dialog";
import { useRef, useState } from "react";
import { useWardrobe } from "@/lib/wardrobe/store";
import { OptionsEditor } from "./options";
import { useCopy } from "./use-copy";
import { ConfirmDialog } from "./ui";

export function SettingsDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { c } = useCopy();
  const exportBackup = useWardrobe((s) => s.exportBackup);
  const importBackup = useWardrobe((s) => s.importBackup);
  const eraseAll = useWardrobe((s) => s.eraseAll);
  const notice = useWardrobe((s) => s.notice);
  const clearNotice = useWardrobe((s) => s.clearNotice);
  const fileRef = useRef<HTMLInputElement>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [erase, setErase] = useState(false);
  const [editing, setEditing] = useState(false);

  function download() {
    const blob = new Blob([exportBackup()], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    const day = new Date().toISOString().slice(0, 10);
    link.href = url;
    link.download = `hem-wardrobe-${day}.json`;
    link.click();
    URL.revokeObjectURL(url);
  }

  async function onFile(file: File | undefined) {
    if (!file) return;
    const text = await file.text();
    const ok = importBackup(text);
    setMessage(ok ? c.imported : c.importFailed);
    if (ok) clearNotice();
  }

  return (
    <Dialog.Root open={open} onOpenChange={(next) => !next && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-40 bg-black/60" />
        <Dialog.Content
          className={
            editing
              ? "fixed inset-0 z-50 overflow-y-auto bg-paper"
              : "fixed top-1/2 left-1/2 z-50 max-h-[85dvh] w-full max-w-md -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-card bg-sheet p-5"
          }
        >
          {editing ? (
            <>
              <Dialog.Title className="sr-only">{c.choices}</Dialog.Title>
              <OptionsEditor onBack={() => setEditing(false)} />
            </>
          ) : (
            <>
          <Dialog.Title className="font-display text-3xl">{c.settings}</Dialog.Title>
          <Dialog.Description className="sr-only">{c.aboutBody}</Dialog.Description>
          <section className="mt-5">
            <h3 className="text-xs tracking-widest text-muted uppercase">{c.choices}</h3>
            <p className="mt-2 text-sm text-muted">{c.choicesHelp}</p>
            <button type="button" className="mt-3 h-11 rounded-full bg-ink px-4 text-sm text-sheet" onClick={() => setEditing(true)}>
              {c.editChoices}
            </button>
          </section>
          <section className="mt-6">
            <h3 className="text-xs tracking-widest text-muted uppercase">{c.backup}</h3>
            <p className="mt-2 text-sm text-muted">{c.backupHelp}</p>
            <div className="mt-3 flex flex-wrap gap-2">
              <button type="button" className="h-11 rounded-full bg-ink px-4 text-sm text-sheet" onClick={download}>
                {c.export}
              </button>
              <button type="button" className="h-11 rounded-full border border-line px-4 text-sm" onClick={() => fileRef.current?.click()}>
                {c.import}
              </button>
            </div>
            <input
              ref={fileRef}
              className="hidden"
              type="file"
              accept="application/json,.json"
              onChange={(e) => void onFile(e.target.files?.[0])}
            />
            {message || notice === "imported" ? <p className="mt-2 text-sm">{message ?? c.imported}</p> : null}
          </section>
          <section className="mt-6 border-t border-line pt-5">
            <h3 className="font-display text-2xl">{c.about}</h3>
            <p className="mt-2 text-sm leading-relaxed text-muted">{c.aboutBody}</p>
            <p className="mt-2 text-xs tracking-widest text-muted uppercase">{c.version}</p>
          </section>
          <button type="button" className="mt-6 h-11 text-sm text-accent" onClick={() => setErase(true)}>
            {c.erase}
          </button>
          <div className="mt-2 flex justify-end">
            <Dialog.Close className="h-11 rounded-full px-4 text-sm">{c.close}</Dialog.Close>
          </div>
            </>
          )}
        </Dialog.Content>
      </Dialog.Portal>
      <ConfirmDialog
        open={erase}
        title={c.erase}
        body={c.confirmErase}
        confirmLabel={c.erase}
        onClose={() => setErase(false)}
        onConfirm={() => {
          eraseAll();
          setErase(false);
          onClose();
        }}
      />
    </Dialog.Root>
  );
}
