import { ChevronDown, ChevronUp, GripVertical, Plus, Search } from "lucide-react";
import { useEffect, useMemo, useRef, useState, type PointerEvent as ReactPointerEvent, type ReactNode } from "react";
import { cn } from "@/lib/cn";
import { optLabel, statusIds } from "@/lib/wardrobe/catalog";
import { filterPieces, formatMm, inLane, pieceLocation, pieceName, sortPieces, spliceOrder } from "@/lib/wardrobe/logic";
import { useWardrobe } from "@/lib/wardrobe/store";
import { SEARCH_FIELDS, SORTS, type Piece, type SearchField } from "@/lib/wardrobe/types";
import { useCopy } from "./use-copy";
import { ConfirmDialog, SwatchFace } from "./ui";

export function ClosetPane({
  activeId,
  category,
  status,
  onCategory,
  onStatus,
  onOpen,
  onAdd,
}: {
  activeId?: string;
  category: string;
  status: string;
  onCategory: (value: string) => void;
  onStatus: (value: string) => void;
  onOpen: (id: string) => void;
  onAdd: () => void;
}) {
  const { c, lang } = useCopy();
  const pieces = useWardrobe((s) => s.pieces);
  const sort = useWardrobe((s) => s.sort);
  const searchField = useWardrobe((s) => s.searchField);
  const setSort = useWardrobe((s) => s.setSort);
  const setSearchField = useWardrobe((s) => s.setSearchField);
  const removePieces = useWardrobe((s) => s.removePieces);
  const commitPieceOrder = useWardrobe((s) => s.commitPieceOrder);
  const catalog = useWardrobe((s) => s.catalog);
  const attentionIds = statusIds(catalog, "attention");

  const [query, setQuery] = useState("");
  const [lane, setLane] = useState("all");
  const [selecting, setSelecting] = useState(false);
  const [picked, setPicked] = useState<string[]>([]);
  const [confirm, setConfirm] = useState(false);
  const [revealed, setRevealed] = useState<string | null>(null);
  const [preview, setPreview] = useState<string[] | null>(null);

  const filtered = useMemo(
    () =>
      sortPieces(
        filterPieces(
          pieces.filter((piece) => inLane(piece.category, lane, catalog)),
          { query, field: searchField, category, status, lang, attentionIds },
        ),
        sort,
        lang,
      ),
    [pieces, query, searchField, category, status, lang, sort, lane, catalog, attentionIds],
  );

  const visible = useMemo(() => {
    if (!preview) return filtered;
    const map = new Map(filtered.map((piece) => [piece.id, piece]));
    return preview.map((id) => map.get(id)).filter((piece): piece is Piece => Boolean(piece));
  }, [filtered, preview]);

  useEffect(() => {
    if (lane !== "all" && !catalog.lanes.some((item) => item.id === lane)) setLane("all");
    if (category !== "all" && !catalog.categories.some((item) => item.id === category)) onCategory("all");
    if (status !== "all" && status !== "attention" && !catalog.statuses.some((item) => item.id === status)) onStatus("all");
  }, [catalog, lane, category, status, onCategory, onStatus]);

  useEffect(() => {
    if (!activeId || visible.some((piece) => piece.id === activeId)) return;
    const next = visible[0];
    if (next) onOpen(next.id);
  }, [activeId, visible, onOpen]);

  function togglePick(id: string) {
    setPicked((curr) => (curr.includes(id) ? curr.filter((item) => item !== id) : [...curr, id]));
  }

  function commitVisible(nextVisible: string[]) {
    const base = sortPieces(pieces, sort, lang).map((piece) => piece.id);
    const before = filtered.map((piece) => piece.id);
    commitPieceOrder(spliceOrder(base, before, nextVisible));
  }

  function shift(index: number, delta: number) {
    const ids = visible.map((piece) => piece.id);
    const next = index + delta;
    if (next < 0 || next >= ids.length) return;
    const copy = ids.slice();
    const [item] = copy.splice(index, 1);
    if (!item) return;
    copy.splice(next, 0, item);
    commitVisible(copy);
  }

  const filtersOn = Boolean(query) || category !== "all" || status !== "all" || lane !== "all";

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="space-y-3 px-4 pt-3">
        <div className="flex gap-2">
          <div className="relative min-w-0 flex-1">
            <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={c.searchPieces}
              className="h-11 w-full rounded-full border border-line bg-sheet pr-3 pl-10 text-sm outline-none placeholder:text-muted"
              aria-label={c.searchPieces}
            />
          </div>
          <select
            value={searchField}
            onChange={(e) => setSearchField(e.target.value as SearchField)}
            aria-label={c.fieldAll}
            className="h-11 max-w-28 rounded-full border border-line bg-sheet px-3 text-sm"
          >
            {SEARCH_FIELDS.map((field) => (
              <option key={field} value={field}>
                {field === "all" ? c.fieldAll : field === "name" ? c.fieldName : field === "brand" ? c.fieldBrand : c.fieldLocation}
              </option>
            ))}
          </select>
        </div>
        <div className="no-scrollbar flex gap-2 overflow-x-auto">
          <Chip active={lane === "all"} onClick={() => setLane("all")}>
            {c.laneAll}
          </Chip>
          {catalog.lanes.map((item) => (
            <Chip
              key={item.id}
              active={lane === item.id}
              onClick={() => {
                setLane(item.id);
                if (category !== "all" && !inLane(category, item.id, catalog)) onCategory("all");
              }}
            >
              {optLabel(item, lang, item.id)}
            </Chip>
          ))}
        </div>
        <div className="no-scrollbar flex gap-2 overflow-x-auto">
          <Chip active={category === "all"} onClick={() => onCategory("all")}>
            {c.allCategories}
          </Chip>
          {catalog.categories
            .filter((item) => inLane(item.id, lane, catalog))
            .map((item) => (
              <Chip key={item.id} active={category === item.id} onClick={() => onCategory(item.id)}>
                {optLabel(item, lang, item.id)}
              </Chip>
            ))}
        </div>
        <div className="flex flex-wrap items-center gap-2 pb-1">
          <select
            value={status}
            onChange={(e) => onStatus(e.target.value)}
            aria-label={c.statusLabel}
            className="h-11 rounded-full border border-line bg-sheet px-3 text-sm"
          >
            <option value="all">{c.allStatuses}</option>
            <option value="attention">{c.attentionFilter}</option>
            {catalog.statuses.map((item) => (
              <option key={item.id} value={item.id}>
                {optLabel(item, lang, item.id)}
              </option>
            ))}
          </select>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as (typeof SORTS)[number])}
            aria-label={c.reorder}
            className="h-11 rounded-full border border-line bg-sheet px-3 text-sm"
          >
            {SORTS.map((item) => (
              <option key={item} value={item}>
                {c.sort[item]}
              </option>
            ))}
          </select>
          {selecting ? (
            <>
              <button
                type="button"
                className="h-11 rounded-full px-3 text-sm text-muted"
                onClick={() => {
                  setSelecting(false);
                  setPicked([]);
                }}
              >
                {c.cancel}
              </button>
              <button
                type="button"
                disabled={picked.length === 0}
                className="h-11 rounded-full bg-accent px-4 text-sm text-sheet disabled:opacity-40"
                onClick={() => setConfirm(true)}
              >
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
            {c.addPiece}
          </button>
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto pb-28 md:pb-6">
        {visible.length === 0 ? (
          <Empty
            title={filtersOn ? c.emptyFilter : c.emptyTitle}
            body={filtersOn ? undefined : c.emptyBody}
            action={
              filtersOn ? (
                <button
                  type="button"
                  className="h-11 rounded-full border border-line px-4 text-sm"
                  onClick={() => {
                    setQuery("");
                    setLane("all");
                    onCategory("all");
                    onStatus("all");
                  }}
                >
                  {c.clearFilters}
                </button>
              ) : (
                <button type="button" className="h-11 rounded-full bg-accent px-4 text-sm text-sheet" onClick={onAdd}>
                  {c.addPiece}
                </button>
              )
            }
          />
        ) : (
          <ul>
            {visible.map((piece, index) => (
              <PieceRow
                key={piece.id}
                piece={piece}
                active={piece.id === activeId}
                selecting={selecting}
                picked={picked.includes(piece.id)}
                revealed={revealed === piece.id || sort === "custom"}
                onOpen={() => {
                  if (selecting) togglePick(piece.id);
                  else onOpen(piece.id);
                }}
                onSwipeRight={() => {
                  setSelecting(true);
                  setPicked((curr) => (curr.includes(piece.id) ? curr : [...curr, piece.id]));
                }}
                onSwipeLeft={() => setRevealed(piece.id)}
                onShift={(delta) => shift(index, delta)}
                onDragIds={(ids) => setPreview(ids)}
                onDragEnd={() => {
                  setPreview((curr) => {
                    if (curr) commitVisible(curr);
                    return null;
                  });
                }}
              />
            ))}
          </ul>
        )}
      </div>

      <ConfirmDialog
        open={confirm}
        title={c.delete}
        body={c.confirmPieces(picked.length)}
        confirmLabel={c.deleteN(picked.length)}
        onClose={() => setConfirm(false)}
        onConfirm={() => {
          removePieces(picked);
          setPicked([]);
          setSelecting(false);
          setConfirm(false);
        }}
      />
    </div>
  );
}

function PieceRow({
  piece,
  active,
  selecting,
  picked,
  revealed,
  onOpen,
  onSwipeLeft,
  onSwipeRight,
  onShift,
  onDragIds,
  onDragEnd,
}: {
  piece: Piece;
  active: boolean;
  selecting: boolean;
  picked: boolean;
  revealed: boolean;
  onOpen: () => void;
  onSwipeLeft: () => void;
  onSwipeRight: () => void;
  onShift: (delta: number) => void;
  onDragIds: (ids: string[]) => void;
  onDragEnd: () => void;
}) {
  const { c, lang } = useCopy();
  const catalog = useWardrobe((s) => s.catalog);
  const status = catalog.statuses.find((item) => item.id === piece.status);
  const attention = Boolean(status?.attention);
  const archived = Boolean(status?.archive);
  const start = useRef<{ x: number; y: number; pointerId: number } | null>(null);
  const locked = useRef<"x" | "y" | null>(null);
  const dx = useRef(0);
  const [offset, setOffset] = useState(0);
  const rowRef = useRef<HTMLLIElement>(null);

  function onPointerDown(e: ReactPointerEvent) {
    if (e.button !== 0) return;
    start.current = { x: e.clientX, y: e.clientY, pointerId: e.pointerId };
    locked.current = null;
    dx.current = 0;
  }

  function onPointerMove(e: ReactPointerEvent) {
    if (!start.current || selecting) return;
    const x = e.clientX - start.current.x;
    const y = e.clientY - start.current.y;
    if (!locked.current) {
      if (Math.abs(x) < 8 && Math.abs(y) < 8) return;
      locked.current = Math.abs(x) > Math.abs(y) ? "x" : "y";
    }
    if (locked.current === "x") {
      dx.current = x;
      setOffset(Math.max(-72, Math.min(72, x)));
    }
  }

  function finish() {
    if (locked.current === "x") {
      if (dx.current > 56) onSwipeRight();
      else if (dx.current < -56) onSwipeLeft();
    } else if (!locked.current && start.current) onOpen();
    start.current = null;
    locked.current = null;
    dx.current = 0;
    setOffset(0);
  }

  function onGripDown(e: ReactPointerEvent) {
    e.stopPropagation();
    e.preventDefault();
    const height = rowRef.current?.getBoundingClientRect().height ?? 84;
    const origin = e.clientY;
    const list = rowRef.current?.parentElement;
    const startIndex = rowRef.current ? Array.prototype.indexOf.call(list?.children ?? [], rowRef.current) : 0;
    const count = list ? list.childElementCount : 1;
    const ids = Array.from(list?.querySelectorAll(":scope > li") ?? []).map((node) => (node as HTMLElement).dataset.id ?? "");
    let last = startIndex;
    const move = (ev: PointerEvent) => {
      const shiftBy = Math.round((ev.clientY - origin) / height);
      const target = Math.max(0, Math.min(count - 1, startIndex + shiftBy));
      if (target === last || !ids[startIndex]) return;
      last = target;
      const copy = ids.slice();
      const [item] = copy.splice(startIndex, 1);
      if (!item) return;
      copy.splice(target, 0, item);
      onDragIds(copy);
    };
    const up = () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
      onDragEnd();
    };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
  }

  return (
    <li ref={rowRef} data-row data-id={piece.id} className={cn("border-b border-line", active && "bg-accent-soft/60")}>
      <div
        className="flex items-center gap-3 px-4 py-3"
        style={{ transform: offset ? `translateX(${offset}px)` : undefined }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={finish}
        onPointerCancel={finish}
      >
        {selecting ? (
          <button
            type="button"
            aria-pressed={picked}
            aria-label={c.select}
            onPointerDown={(e) => e.stopPropagation()}
            onClick={(e) => {
              e.stopPropagation();
              onOpen();
            }}
            className={cn(
              "grid size-11 shrink-0 place-items-center rounded-full border",
              picked ? "border-accent bg-accent text-sheet" : "border-line bg-sheet text-transparent",
            )}
          >
            <span className="size-2 rounded-full bg-current" />
          </button>
        ) : null}
        <SwatchFace piece={piece} labeled className="h-20 w-16 shrink-0 rounded-xl" />
        <div className="min-w-0 flex-1">
          <p className="truncate font-display text-lg leading-tight">{pieceName(piece, lang)}</p>
          <p className="truncate text-sm text-muted">
            {[piece.brand, piece.size, formatMm(piece.thicknessMm)].filter(Boolean).join(" · ") || "—"}
          </p>
          <p className={cn("truncate text-sm", attention ? "text-accent" : "text-muted", archived && "line-through")}>
            {optLabel(status, lang, piece.status)}
            {pieceLocation(piece, lang) ? ` · ${pieceLocation(piece, lang)}` : ""}
          </p>
        </div>
        {revealed && !selecting ? (
          <div className="flex shrink-0 items-center" onPointerDown={(e) => e.stopPropagation()}>
            <button type="button" className="grid size-11 place-items-center text-muted" aria-label={c.moveUp} onClick={() => onShift(-1)}>
              <ChevronUp className="size-5" />
            </button>
            <button
              type="button"
              className="grid size-11 cursor-grab place-items-center text-muted active:cursor-grabbing"
              aria-label={c.grip}
              onPointerDown={onGripDown}
            >
              <GripVertical className="size-5" />
            </button>
            <button type="button" className="grid size-11 place-items-center text-muted" aria-label={c.moveDown} onClick={() => onShift(1)}>
              <ChevronDown className="size-5" />
            </button>
          </div>
        ) : null}
      </div>
    </li>
  );
}

function Chip({ active, onClick, children }: { active: boolean; onClick: () => void; children: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn("h-10 shrink-0 rounded-full px-3 text-sm", active ? "bg-ink text-sheet" : "border border-line bg-sheet text-ink")}
    >
      {children}
    </button>
  );
}

function Empty({ title, body, action }: { title: string; body?: string; action?: ReactNode }) {
  return (
    <div className="px-6 py-16 text-center">
      <p className="font-display text-3xl">{title}</p>
      {body ? <p className="mx-auto mt-2 max-w-xs text-sm text-muted">{body}</p> : null}
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  );
}
