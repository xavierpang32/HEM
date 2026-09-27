import { ChevronDown, ChevronUp, GripVertical, Plus, Search } from "lucide-react";
import { useMemo, useRef, useState } from "react";
import { cn } from "@/lib/cn";
import { namedLabel, statusIds } from "@/lib/wardrobe/catalog";
import { lookHealth, lookName, lookNotes, pieceName, sortLooks, sortPieces, spliceOrder } from "@/lib/wardrobe/logic";
import { useWardrobe } from "@/lib/wardrobe/store";
import { SORTS, type Look } from "@/lib/wardrobe/types";
import { useCopy } from "./use-copy";
import { ConfirmDialog, Field, ScreenHeader, SwatchFace, fieldClass } from "./ui";

export function LooksPane({
  activeId,
  onOpen,
  onAdd,
}: {
  activeId?: string;
  onOpen: (id: string) => void;
  onAdd: () => void;
}) {
  const { c, lang } = useCopy();
  const looks = useWardrobe((s) => s.looks);
  const pieces = useWardrobe((s) => s.pieces);
  const sort = useWardrobe((s) => s.lookSort);
  const setSort = useWardrobe((s) => s.setLookSort);
  const removeLooks = useWardrobe((s) => s.removeLooks);
  const commitLookOrder = useWardrobe((s) => s.commitLookOrder);
  const blockedIds = statusIds(useWardrobe((s) => s.catalog), "blocksLook");
  const [query, setQuery] = useState("");
  const [selecting, setSelecting] = useState(false);
  const [picked, setPicked] = useState<string[]>([]);
  const [confirm, setConfirm] = useState(false);
  const [preview, setPreview] = useState<string[] | null>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const base = sortLooks(looks, sort, lang).filter((look) => {
      if (!q) return true;
      return `${look.name} ${look.nameZh ?? ""} ${look.notes}`.toLowerCase().includes(q);
    });
    return base;
  }, [looks, sort, lang, query]);

  const visible = useMemo(() => {
    if (!preview) return filtered;
    const map = new Map(filtered.map((look) => [look.id, look]));
    return preview.map((id) => map.get(id)).filter((look): look is Look => Boolean(look));
  }, [filtered, preview]);

  function commitVisible(nextVisible: string[]) {
    const base = sortLooks(looks, sort, lang).map((look) => look.id);
    const before = filtered.map((look) => look.id);
    commitLookOrder(spliceOrder(base, before, nextVisible));
  }

  function shift(index: number, delta: number) {
    const ids = visible.map((look) => look.id);
    const next = index + delta;
    if (next < 0 || next >= ids.length) return;
    const copy = ids.slice();
    const [item] = copy.splice(index, 1);
    if (!item) return;
    copy.splice(next, 0, item);
    commitVisible(copy);
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="flex flex-wrap items-center gap-2 px-4 pt-3 pb-2">
        <div className="relative min-w-40 flex-1">
          <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={c.searchLooks}
            aria-label={c.searchLooks}
            className="h-11 w-full rounded-full border border-line bg-sheet pr-3 pl-10 text-sm outline-none placeholder:text-muted"
          />
        </div>
        <select
          value={sort}
          aria-label={c.reorder}
          onChange={(e) => setSort(e.target.value as (typeof SORTS)[number])}
          className="h-11 rounded-full border border-line bg-sheet px-3 text-sm"
        >
          {SORTS.map((item) => (
            <option key={item} value={item}>{c.sort[item]}</option>
          ))}
        </select>
        {selecting ? (
          <>
            <button type="button" className="h-11 rounded-full px-3 text-sm text-muted" onClick={() => { setSelecting(false); setPicked([]); }}>
              {c.cancel}
            </button>
            <button type="button" disabled={!picked.length} className="h-11 rounded-full bg-accent px-4 text-sm text-sheet disabled:opacity-40" onClick={() => setConfirm(true)}>
              {c.deleteN(picked.length)}
            </button>
          </>
        ) : (
          <button type="button" className="h-11 rounded-full border border-line px-4 text-sm" onClick={() => setSelecting(true)}>
            {c.select}
          </button>
        )}
        <button type="button" className="ml-auto hidden h-11 items-center gap-1 rounded-full bg-accent px-4 text-sm text-sheet md:inline-flex" onClick={onAdd}>
          <Plus className="size-4" />
          {c.addLook}
        </button>
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto pb-28 md:pb-6">
        {visible.length === 0 ? (
          <div className="px-6 py-16 text-center">
            <p className="font-display text-3xl">{query ? c.emptyFilter : c.emptyLooksTitle}</p>
            {!query ? <p className="mx-auto mt-2 max-w-xs text-sm text-muted">{c.emptyLooksBody}</p> : null}
            <button type="button" className="mt-5 h-11 rounded-full bg-accent px-4 text-sm text-sheet" onClick={onAdd}>
              {c.addLook}
            </button>
          </div>
        ) : (
          <ul>
            {visible.map((look, index) => {
              const health = lookHealth(look, pieces, blockedIds);
              return (
                <li key={look.id} className={cn("border-b border-line", look.id === activeId && "bg-accent-soft/60")}>
                  <div className="flex items-center gap-3 px-4 py-3">
                    {selecting ? (
                      <button
                        type="button"
                        aria-pressed={picked.includes(look.id)}
                        className={cn(
                          "grid size-11 shrink-0 place-items-center rounded-full border",
                          picked.includes(look.id) ? "border-accent bg-accent text-sheet" : "border-line",
                        )}
                        onClick={() => setPicked((curr) => (curr.includes(look.id) ? curr.filter((id) => id !== look.id) : [...curr, look.id]))}
                      >
                        <span className="size-2 rounded-full bg-current" />
                      </button>
                    ) : null}
                    <button type="button" className="min-w-0 flex-1 text-left" onClick={() => (selecting ? setPicked((curr) => (curr.includes(look.id) ? curr.filter((id) => id !== look.id) : [...curr, look.id])) : onOpen(look.id))}>
                      <div className="flex items-center gap-2">
                        <span className={cn("text-xs tracking-widest uppercase", health.ready ? "text-ink" : "text-accent")}>
                          {health.ready ? c.ready : c.check}
                        </span>
                        <span className="text-xs text-muted">{c.lookCount(look.pieceIds.length)}</span>
                      </div>
                      <p className="truncate font-display text-xl leading-tight">{lookName(look, lang)}</p>
                      {lookNotes(look, lang) ? <p className="truncate text-sm text-muted">{lookNotes(look, lang)}</p> : null}
                    </button>
                    {!selecting ? (
                      <div className="flex shrink-0">
                        <button type="button" className="grid size-11 place-items-center text-muted" aria-label={c.moveUp} onClick={() => shift(index, -1)}>
                          <ChevronUp className="size-5" />
                        </button>
                        <button
                          type="button"
                          className="grid size-11 place-items-center text-muted"
                          aria-label={c.grip}
                          onPointerDown={(e) => {
                            e.preventDefault();
                            const height = 76;
                            const origin = e.clientY;
                            const start = index;
                            const ids = visible.map((item) => item.id);
                            let last = start;
                            const move = (ev: PointerEvent) => {
                              const shiftBy = Math.round((ev.clientY - origin) / height);
                              const target = Math.max(0, Math.min(ids.length - 1, start + shiftBy));
                              if (target === last) return;
                              last = target;
                              const copy = ids.slice();
                              const [item] = copy.splice(start, 1);
                              if (!item) return;
                              copy.splice(target, 0, item);
                              setPreview(copy);
                            };
                            const up = () => {
                              window.removeEventListener("pointermove", move);
                              window.removeEventListener("pointerup", up);
                              setPreview((curr) => {
                                if (curr) commitVisible(curr);
                                return null;
                              });
                            };
                            window.addEventListener("pointermove", move);
                            window.addEventListener("pointerup", up);
                          }}
                        >
                          <GripVertical className="size-5" />
                        </button>
                        <button type="button" className="grid size-11 place-items-center text-muted" aria-label={c.moveDown} onClick={() => shift(index, 1)}>
                          <ChevronDown className="size-5" />
                        </button>
                      </div>
                    ) : null}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
      <ConfirmDialog
        open={confirm}
        title={c.delete}
        body={c.confirmLooks(picked.length)}
        confirmLabel={c.deleteN(picked.length)}
        onClose={() => setConfirm(false)}
        onConfirm={() => {
          removeLooks(picked);
          setPicked([]);
          setSelecting(false);
          setConfirm(false);
        }}
      />
    </div>
  );
}

export function LookDetail({
  id,
  onBack,
  onEdit,
  onOpenPiece,
  wide,
}: {
  id: string;
  onBack: () => void;
  onEdit: () => void;
  onOpenPiece: (id: string) => void;
  wide?: boolean;
}) {
  const { c, lang } = useCopy();
  const look = useWardrobe((s) => s.looks.find((item) => item.id === id));
  const pieces = useWardrobe((s) => s.pieces);
  const catalog = useWardrobe((s) => s.catalog);
  const removeLooks = useWardrobe((s) => s.removeLooks);
  const [confirm, setConfirm] = useState(false);
  if (!look) {
    return (
      <div className="p-6">
        <button type="button" className="h-11 text-sm" onClick={onBack}>{c.back}</button>
        <p className="mt-6 text-muted">{c.notFound}</p>
      </div>
    );
  }
  const health = lookHealth(look, pieces, statusIds(catalog, "blocksLook"));
  return (
    <article className="min-h-full bg-paper pb-16">
      {!wide ? (
        <ScreenHeader
          title={lookName(look, lang)}
          onBack={onBack}
          backLabel={c.back}
          action={<button type="button" className="h-11 rounded-full bg-ink px-4 text-sm text-sheet" onClick={onEdit}>{c.edit}</button>}
        />
      ) : (
        <div className="flex justify-end gap-2 px-6 pt-5">
          <button type="button" className="h-11 px-3 text-sm text-muted" onClick={() => setConfirm(true)}>{c.deleteLook}</button>
          <button type="button" className="h-11 rounded-full bg-ink px-4 text-sm text-sheet" onClick={onEdit}>{c.edit}</button>
        </div>
      )}
      <div className="mx-auto max-w-xl px-4 py-5 md:px-8">
        <p className={cn("text-xs tracking-widest uppercase", health.ready ? "text-ink" : "text-accent")}>
          {health.ready ? c.ready : c.check}
        </p>
        <h2 className="font-display text-4xl leading-tight">{lookName(look, lang)}</h2>
        <p className="mt-2 text-sm text-muted">{health.ready ? c.readyBody : c.blockedBody}</p>
        {health.missing ? <p className="mt-1 text-sm text-accent">{c.missing(health.missing)}</p> : null}
        {lookNotes(look, lang) ? <p className="mt-4 text-sm">{lookNotes(look, lang)}</p> : null}
        <h3 className="mt-8 font-display text-2xl">{c.inThisLook}</h3>
        <ul className="mt-3">
          {look.pieceIds.map((pieceId) => {
            const piece = pieces.find((item) => item.id === pieceId);
            if (!piece) return null;
            const blocked = health.blocked.some((item) => item.id === piece.id);
            return (
              <li key={piece.id} className="border-t border-line">
                <button type="button" className="flex w-full items-center gap-3 py-3 text-left" onClick={() => onOpenPiece(piece.id)}>
                  <SwatchFace piece={piece} className="h-14 w-11 rounded-lg" />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate">{pieceName(piece, lang)}</span>
                    <span className={cn("text-sm", blocked ? "text-accent" : "text-muted")}>{namedLabel(catalog.statuses, piece.status, lang)}</span>
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
        {!wide ? (
          <button type="button" className="mt-6 h-11 text-sm text-accent" onClick={() => setConfirm(true)}>{c.deleteLook}</button>
        ) : null}
      </div>
      <ConfirmDialog
        open={confirm}
        title={c.deleteLook}
        body={c.confirmLooks(1)}
        confirmLabel={c.delete}
        onClose={() => setConfirm(false)}
        onConfirm={() => {
          removeLooks([look.id]);
          setConfirm(false);
          onBack();
        }}
      />
    </article>
  );
}

export function LookForm({
  id,
  onClose,
  onSaved,
}: {
  id: string | null;
  onClose: () => void;
  onSaved: (id: string) => void;
}) {
  const { c, lang } = useCopy();
  const existing = useWardrobe((s) => (id ? s.looks.find((item) => item.id === id) : undefined));
  const pieces = useWardrobe((s) => s.pieces);
  const catalog = useWardrobe((s) => s.catalog);
  const addLook = useWardrobe((s) => s.addLook);
  const updateLook = useWardrobe((s) => s.updateLook);
  const [name, setName] = useState(existing?.name ?? "");
  const [notes, setNotes] = useState(existing?.notes ?? "");
  const [ids, setIds] = useState<string[]>(existing?.pieceIds ?? []);
  const [error, setError] = useState(false);
  const [query, setQuery] = useState("");
  const ordered = sortPieces(pieces, "az", lang).filter((piece) => {
    const q = query.trim().toLowerCase();
    if (!q) return true;
    return `${piece.name} ${piece.nameZh ?? ""} ${piece.brand}`.toLowerCase().includes(q);
  });

  function save() {
    if (!name.trim()) {
      setError(true);
      return;
    }
    if (id && existing) {
      updateLook(id, { name, notes, pieceIds: ids });
      onSaved(id);
    } else {
      onSaved(addLook({ name, notes, pieceIds: ids }));
    }
  }

  return (
    <div className="fixed inset-0 z-30 overflow-y-auto bg-paper">
      <ScreenHeader
        title={id ? c.edit : c.addLook}
        onBack={onClose}
        backLabel={c.cancel}
        action={<button type="button" className="h-11 rounded-full bg-accent px-4 text-sm text-sheet" onClick={save}>{c.saveLook}</button>}
      />
      <div className="mx-auto grid max-w-xl gap-4 px-4 py-5">
        <Field label={c.name}>
          <input className={`${fieldClass} h-11`} value={name} onChange={(e) => { setError(false); setName(e.target.value); }} />
          {error ? <span className="mt-1 block text-sm text-accent">{c.required}</span> : null}
        </Field>
        <Field label={c.occasion}>
          <textarea className={`${fieldClass} min-h-20 py-2`} value={notes} onChange={(e) => setNotes(e.target.value)} />
        </Field>
        <Field label={c.choosePieces}>
          <input className={`${fieldClass} h-11`} value={query} placeholder={c.searchPieces} onChange={(e) => setQuery(e.target.value)} />
        </Field>
        <ul className="pb-16">
          {ordered.map((piece) => {
            const on = ids.includes(piece.id);
            return (
              <li key={piece.id} className="border-b border-line">
                <button
                  type="button"
                  aria-pressed={on}
                  className="flex w-full items-center gap-3 py-2 text-left"
                  onClick={() => setIds((curr) => (on ? curr.filter((item) => item !== piece.id) : [...curr, piece.id]))}
                >
                  <SwatchFace piece={piece} className="h-12 w-10 rounded-lg" />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate">{pieceName(piece, lang)}</span>
                    <span className="text-sm text-muted">{namedLabel(catalog.statuses, piece.status, lang)}</span>
                  </span>
                  <span className={cn("grid size-6 place-items-center rounded-full border", on ? "border-accent bg-accent text-sheet" : "border-line")}>
                    {on ? "·" : ""}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
