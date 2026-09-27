import { Camera, ImagePlus, Trash2 } from "lucide-react";
import { useRef, useState } from "react";
import { namedLabel, optLabel, type Catalog } from "@/lib/wardrobe/catalog";
import {
  formatDay,
  formatMm,
  isLatexMaterial,
  money,
  pieceColor,
  pieceLocation,
  pieceMaterial,
  pieceName,
  pieceNotes,
} from "@/lib/wardrobe/logic";
import { compressImage } from "@/lib/wardrobe/photos";
import { useWardrobe, type PieceInput } from "@/lib/wardrobe/store";
import {
  type CareEntry,
  type Piece,
} from "@/lib/wardrobe/types";
import { useCopy } from "./use-copy";
import { ConfirmDialog, Field, ScreenHeader, SwatchDot, SwatchFace, fieldClass } from "./ui";

export function PieceDetail({
  id,
  onBack,
  onEdit,
  wide,
}: {
  id: string;
  onBack: () => void;
  onEdit: () => void;
  wide?: boolean;
}) {
  const { c, lang } = useCopy();
  const piece = useWardrobe((s) => s.pieces.find((item) => item.id === id));
  const catalog = useWardrobe((s) => s.catalog);
  const removePieces = useWardrobe((s) => s.removePieces);
  const [confirm, setConfirm] = useState(false);
  const [photo, setPhoto] = useState(0);
  if (!piece) {
    return (
      <div className="p-6">
        <button type="button" className="h-11 text-sm" onClick={onBack}>
          {c.back}
        </button>
        <p className="mt-6 text-muted">{c.notFound}</p>
      </div>
    );
  }
  const shown = piece.photos[photo] ?? piece.photos[0];
  const careCost = piece.care.reduce((sum, entry) => sum + (entry.cost ?? 0), 0);
  const attention = catalog.statuses.some((item) => item.id === piece.status && item.attention);

  return (
    <article className="min-h-full bg-paper pb-16">
      {!wide ? (
        <ScreenHeader
          title={pieceName(piece, lang)}
          onBack={onBack}
          backLabel={c.back}
          action={
            <button type="button" className="h-11 rounded-full bg-ink px-4 text-sm text-sheet" onClick={onEdit}>
              {c.edit}
            </button>
          }
        />
      ) : (
        <div className="flex items-center justify-end gap-2 px-6 pt-5">
          <button type="button" className="h-11 rounded-full px-3 text-sm text-muted" onClick={() => setConfirm(true)}>
            {c.deletePiece}
          </button>
          <button type="button" className="h-11 rounded-full bg-ink px-4 text-sm text-sheet" onClick={onEdit}>
            {c.edit}
          </button>
        </div>
      )}
      <div className="mx-auto max-w-xl px-4 pt-4 md:px-8">
        <div className="overflow-hidden rounded-card">
          {shown ? (
            <img src={shown} alt={pieceName(piece, lang)} className="aspect-portrait w-full object-cover" />
          ) : (
            <SwatchFace piece={piece} labeled className="aspect-portrait w-full" />
          )}
        </div>
        {piece.photos.length > 1 ? (
          <div className="mt-3 flex gap-2">
            {piece.photos.map((src, index) => (
              <button key={src.slice(0, 24) + index} type="button" onClick={() => setPhoto(index)} className="h-14 w-12 overflow-hidden rounded-lg">
                <img src={src} alt="" className="h-full w-full object-cover" />
              </button>
            ))}
          </div>
        ) : null}
        <p className={`mt-5 text-sm tracking-widest uppercase ${attention ? "text-accent" : "text-muted"}`}>
          {namedLabel(catalog.statuses, piece.status, lang)}
        </p>
        <h2 className="font-display text-4xl leading-tight">{pieceName(piece, lang)}</h2>
        <p className="mt-1 text-muted">
          {[piece.brand, piece.size, formatMm(piece.thicknessMm)].filter(Boolean).join(" · ")}
        </p>
        <dl className="mt-6 grid grid-cols-2 gap-x-4 gap-y-4 text-sm">
          <Meta k={c.categoryLabel} v={namedLabel(catalog.categories, piece.category, lang)} />
          <Meta k={c.color} v={pieceColor(piece, lang) || "—"} />
          <Meta k={c.material} v={namedLabel(catalog.materials, piece.material, lang) || pieceMaterial(piece, lang) || "—"} />
          {piece.thicknessMm != null ? <Meta k={c.thickness} v={formatMm(piece.thicknessMm)} /> : null}
          <Meta k={c.conditionLabel} v={namedLabel(catalog.conditions, piece.condition, lang)} />
          <Meta k={c.place} v={pieceLocation(piece, lang) || "—"} />
          <Meta k={c.value} v={money(piece.estimatedValue, lang)} />
          <Meta k={c.price} v={money(piece.purchasePrice, lang)} />
          <Meta k={c.purchased} v={formatDay(piece.purchaseDate, lang)} />
        </dl>
        {pieceNotes(piece, lang) ? <p className="mt-6 text-sm leading-relaxed">{pieceNotes(piece, lang)}</p> : null}
        <section className="mt-8">
          <div className="flex items-baseline justify-between">
            <h3 className="font-display text-2xl">{c.careLog}</h3>
            <p className="text-sm text-muted">
              {c.costToDate} {money(careCost, lang)}
            </p>
          </div>
          {piece.care.length === 0 ? (
            <p className="mt-2 text-sm text-muted">{c.noCare}</p>
          ) : (
            <ol className="mt-3 space-y-3">
              {[...piece.care].sort((a, b) => b.date.localeCompare(a.date)).map((entry) => (
                <li key={entry.id} className="border-t border-line pt-3">
                  <p className="text-sm text-muted">{formatDay(entry.date, lang)}</p>
                  <p>
                    {actionLabel(catalog, entry.action, lang)}
                    {entry.cost ? ` · ${money(entry.cost, lang)}` : ""}
                  </p>
                  {entry.notes ? <p className="text-sm text-muted">{entry.notes}</p> : null}
                </li>
              ))}
            </ol>
          )}
        </section>
        {!wide ? (
          <button type="button" className="mt-8 h-11 text-sm text-accent" onClick={() => setConfirm(true)}>
            {c.deletePiece}
          </button>
        ) : null}
      </div>
      <ConfirmDialog
        open={confirm}
        title={c.deletePiece}
        body={c.confirmPieces(1)}
        confirmLabel={c.delete}
        onClose={() => setConfirm(false)}
        onConfirm={() => {
          removePieces([piece.id]);
          setConfirm(false);
          onBack();
        }}
      />
    </article>
  );
}

function Meta({ k, v }: { k: string; v: string }) {
  return (
    <div>
      <dt className="text-xs tracking-widest text-muted uppercase">{k}</dt>
      <dd className="mt-1">{v}</dd>
    </div>
  );
}

function blankInput(catalog: Catalog): PieceInput {
  const category = catalog.categories[0]?.id ?? "catsuit";
  const material = catalog.materials.find((item) => item.latex)?.id ?? catalog.materials[0]?.id ?? "Latex";
  const swatch = catalog.swatches.find((item) => item.id === "black") ?? catalog.swatches[0];
  const latex = isLatexMaterial(material, catalog);
  return {
    name: "",
    category,
    brand: "",
    size: "",
    color: swatch ? optLabel(swatch, "en", "Black") : "Black",
    material,
    thicknessMm: latex ? (catalog.thicknesses[1] ?? catalog.thicknesses[0] ?? 0.4) : null,
    condition: catalog.conditions.find((item) => item.id === "good")?.id ?? catalog.conditions[0]?.id ?? "good",
    status: catalog.statuses.find((item) => item.id === "closet")?.id ?? catalog.statuses[0]?.id ?? "closet",
    location: "",
    swatch: swatch?.hex ?? "#1a1918",
    swatchId: swatch?.id ?? "black",
    finish: swatch?.finish ?? "solid",
    tone: swatch?.tone ?? "sheet",
    photos: [],
    purchaseDate: "",
    purchasePrice: null,
    estimatedValue: null,
    notes: "",
    care: [],
  };
}

function actionLabel(catalog: Catalog, action: string, lang: "en" | "zh"): string {
  const hit = catalog.care.find((item) => item.id === action);
  return hit ? optLabel(hit, lang, action) : action;
}

function fromPiece(piece: Piece): PieceInput {
  return {
    name: piece.name,
    category: piece.category,
    brand: piece.brand,
    size: piece.size,
    color: piece.color,
    material: piece.material,
    thicknessMm: piece.thicknessMm,
    condition: piece.condition,
    status: piece.status,
    location: piece.location,
    swatch: piece.swatch,
    swatchId: piece.swatchId,
    finish: piece.finish,
    tone: piece.tone,
    photos: piece.photos,
    purchaseDate: piece.purchaseDate,
    purchasePrice: piece.purchasePrice,
    estimatedValue: piece.estimatedValue,
    notes: piece.notes,
    care: piece.care,
  };
}

export function PieceForm({
  id,
  onClose,
  onSaved,
}: {
  id: string | null;
  onClose: () => void;
  onSaved: (id: string) => void;
}) {
  const { c, lang } = useCopy();
  const existing = useWardrobe((s) => (id ? s.pieces.find((item) => item.id === id) : undefined));
  const catalog = useWardrobe((s) => s.catalog);
  const addPiece = useWardrobe((s) => s.addPiece);
  const updatePiece = useWardrobe((s) => s.updatePiece);
  const [draft, setDraft] = useState<PieceInput>(() => (existing ? fromPiece(existing) : blankInput(catalog)));
  const [error, setError] = useState(false);
  const [care, setCare] = useState({ date: "", action: "wash", cost: "", notes: "" });
  const cameraRef = useRef<HTMLInputElement>(null);
  const libraryRef = useRef<HTMLInputElement>(null);

  function patch(partial: Partial<PieceInput>) {
    setDraft((curr) => ({ ...curr, ...partial }));
  }

  async function onFiles(files: FileList | null) {
    if (!files?.length) return;
    const next = draft.photos.slice();
    for (const file of Array.from(files)) {
      if (next.length >= 6) break;
      try {
        next.push(await compressImage(file));
      } catch {
        /* skip unreadable files */
      }
    }
    patch({ photos: next });
  }

  function addCare() {
    if (!care.date && !care.action) return;
    const entry: CareEntry = {
      id: crypto.randomUUID(),
      date: care.date || new Date().toISOString().slice(0, 10),
      action: care.action.trim() || "wash",
      cost: care.cost.trim() ? Number(care.cost) : null,
      notes: care.notes.trim(),
    };
    if (entry.cost != null && Number.isNaN(entry.cost)) entry.cost = null;
    patch({ care: [entry, ...draft.care] });
    setCare({ date: "", action: "wash", cost: "", notes: "" });
  }

  function save() {
    if (!draft.name.trim()) {
      setError(true);
      return;
    }
    const input: PieceInput = {
      ...draft,
      purchasePrice: draft.purchasePrice,
      estimatedValue: draft.estimatedValue,
    };
    if (id && existing) {
      updatePiece(id, input);
      onSaved(id);
    } else {
      onSaved(addPiece(input));
    }
  }

  return (
    <div className="fixed inset-0 z-30 overflow-y-auto bg-paper">
      <ScreenHeader
        title={id ? c.edit : c.addPiece}
        onBack={onClose}
        backLabel={c.cancel}
        action={
          <button type="button" className="h-11 rounded-full bg-accent px-4 text-sm text-sheet" onClick={save}>
            {c.save}
          </button>
        }
      />
      <form
        className="mx-auto grid max-w-xl gap-4 px-4 py-5"
        onSubmit={(e) => {
          e.preventDefault();
          save();
        }}
      >
        <Field label={c.name}>
          <input className={`${fieldClass} h-11`} value={draft.name} onChange={(e) => { setError(false); patch({ name: e.target.value }); }} />
          {error ? <span className="mt-1 block text-sm text-accent">{c.required}</span> : null}
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label={c.categoryLabel}>
            <select
              className={`${fieldClass} h-11`}
              value={draft.category}
              onChange={(e) => patch({ category: e.target.value })}
            >
              {!catalog.categories.some((item) => item.id === draft.category) && draft.category ? (
                <option value={draft.category}>{draft.category}</option>
              ) : null}
              {catalog.categories.map((item) => (
                <option key={item.id} value={item.id}>{optLabel(item, lang, item.id)}</option>
              ))}
            </select>
          </Field>
          <Field label={c.statusLabel}>
            <select className={`${fieldClass} h-11`} value={draft.status} onChange={(e) => patch({ status: e.target.value })}>
              {!catalog.statuses.some((item) => item.id === draft.status) && draft.status ? (
                <option value={draft.status}>{draft.status}</option>
              ) : null}
              {catalog.statuses.map((item) => (
                <option key={item.id} value={item.id}>{optLabel(item, lang, item.id)}</option>
              ))}
            </select>
          </Field>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Field label={c.brand}>
            <input className={`${fieldClass} h-11`} value={draft.brand} onChange={(e) => patch({ brand: e.target.value })} />
          </Field>
          <Field label={c.size}>
            <input className={`${fieldClass} h-11`} value={draft.size} onChange={(e) => patch({ size: e.target.value })} />
          </Field>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Field label={c.colorName}>
            <input className={`${fieldClass} h-11`} value={draft.color} onChange={(e) => patch({ color: e.target.value })} />
          </Field>
          <Field label={c.material}>
            <select
              className={`${fieldClass} h-11`}
              value={draft.material}
              onChange={(e) => {
                const material = e.target.value;
                const latex = isLatexMaterial(material, catalog);
                patch({
                  material,
                  thicknessMm: latex ? (draft.thicknessMm ?? catalog.thicknesses[0] ?? 0.4) : null,
                });
              }}
            >
              {!catalog.materials.some((item) => item.id === draft.material) && draft.material ? (
                <option value={draft.material}>{pieceMaterial({ ...draft, materialZh: undefined } as Piece, lang) || draft.material}</option>
              ) : null}
              {catalog.materials.map((item) => (
                <option key={item.id} value={item.id}>{optLabel(item, lang, item.id)}</option>
              ))}
            </select>
          </Field>
        </div>
        <Field label={c.place}>
          <input className={`${fieldClass} h-11`} value={draft.location} onChange={(e) => patch({ location: e.target.value })} />
        </Field>
        <Field label={c.conditionLabel}>
          <select className={`${fieldClass} h-11`} value={draft.condition} onChange={(e) => patch({ condition: e.target.value })}>
            {!catalog.conditions.some((item) => item.id === draft.condition) && draft.condition ? (
              <option value={draft.condition}>{draft.condition}</option>
            ) : null}
            {catalog.conditions.map((item) => (
              <option key={item.id} value={item.id}>{optLabel(item, lang, item.id)}</option>
            ))}
          </select>
        </Field>
        <Field label={c.swatch}>
          <div className="flex flex-wrap gap-2">
            {catalog.swatches.map((swatch) => (
              <SwatchDot
                key={swatch.id}
                swatch={swatch}
                label={optLabel(swatch, lang, swatch.id)}
                selected={draft.swatchId === swatch.id}
                onClick={() =>
                  patch({
                    swatch: swatch.hex,
                    swatchId: swatch.id,
                    tone: swatch.tone,
                    finish: swatch.finish,
                    color: optLabel(swatch, lang, swatch.id),
                  })
                }
              />
            ))}
          </div>
        </Field>
        {isLatexMaterial(draft.material) ? (
          <Field label={c.thickness}>
            <div className="flex flex-wrap gap-2">
              {catalog.thicknesses.map((mm) => (
                <button
                  key={mm}
                  type="button"
                  aria-pressed={draft.thicknessMm === mm}
                  onClick={() => patch({ thicknessMm: mm })}
                  className={`h-11 rounded-full border px-3 text-sm ${draft.thicknessMm === mm ? "border-ink bg-ink text-sheet" : "border-line bg-sheet"}`}
                >
                  {formatMm(mm)}
                </button>
              ))}
            </div>
            <input
              inputMode="decimal"
              className={`${fieldClass} mt-2 h-11`}
              value={draft.thicknessMm ?? ""}
              onChange={(e) => patch({ thicknessMm: e.target.value.trim() ? Number(e.target.value) : null })}
            />
            <p className="mt-2 text-xs text-muted">{c.thicknessHint}</p>
          </Field>
        ) : null}
        <Field label={c.photos}>
          <div className="flex flex-wrap gap-2">
            {draft.photos.map((src, index) => (
              <div key={src.slice(-16) + index} className="relative h-20 w-16 overflow-hidden rounded-lg">
                <img src={src} alt="" className="h-full w-full object-cover" />
                <button
                  type="button"
                  aria-label={c.remove}
                  className="absolute top-1 right-1 grid size-6 place-items-center rounded-full bg-ink text-sheet"
                  onClick={() => patch({ photos: draft.photos.filter((_, i) => i !== index) })}
                >
                  <Trash2 className="size-3" />
                </button>
              </div>
            ))}
          </div>
          <div className="mt-2 flex gap-2">
            <button type="button" className="inline-flex h-11 items-center gap-2 rounded-full border border-line px-4 text-sm" onClick={() => cameraRef.current?.click()}>
              <Camera className="size-4" />
              {c.camera}
            </button>
            <button type="button" className="inline-flex h-11 items-center gap-2 rounded-full border border-line px-4 text-sm" onClick={() => libraryRef.current?.click()}>
              <ImagePlus className="size-4" />
              {c.library}
            </button>
          </div>
          <p className="mt-2 text-xs text-muted">{c.photoHint}</p>
          <input ref={cameraRef} className="hidden" type="file" accept="image/*" capture="environment" onChange={(e) => void onFiles(e.target.files)} />
          <input ref={libraryRef} className="hidden" type="file" accept="image/*" multiple onChange={(e) => void onFiles(e.target.files)} />
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label={c.purchased}>
            <input type="date" className={`${fieldClass} h-11`} value={draft.purchaseDate} onChange={(e) => patch({ purchaseDate: e.target.value })} />
          </Field>
          <Field label={c.price}>
            <input inputMode="decimal" className={`${fieldClass} h-11`} value={draft.purchasePrice ?? ""} onChange={(e) => patch({ purchasePrice: e.target.value.trim() ? Number(e.target.value) : null })} />
          </Field>
        </div>
        <Field label={c.value}>
          <input inputMode="decimal" className={`${fieldClass} h-11`} value={draft.estimatedValue ?? ""} onChange={(e) => patch({ estimatedValue: e.target.value.trim() ? Number(e.target.value) : null })} />
        </Field>
        <Field label={c.notes}>
          <textarea className={`${fieldClass} min-h-24 py-2`} value={draft.notes} onChange={(e) => patch({ notes: e.target.value })} />
        </Field>
        <section className="rounded-card border border-line p-4">
          <h3 className="font-display text-2xl">{c.careLog}</h3>
          <div className="mt-3 grid gap-3">
            <div className="grid grid-cols-2 gap-3">
              <Field label={c.careDate}>
                <input type="date" className={`${fieldClass} h-11`} value={care.date} onChange={(e) => setCare({ ...care, date: e.target.value })} />
              </Field>
              <Field label={c.careCost}>
                <input inputMode="decimal" className={`${fieldClass} h-11`} value={care.cost} onChange={(e) => setCare({ ...care, cost: e.target.value })} />
              </Field>
            </div>
            <Field label={c.careAction}>
              <input className={`${fieldClass} h-11`} value={care.action} onChange={(e) => setCare({ ...care, action: e.target.value })} />
            </Field>
            <div className="flex flex-wrap gap-2">
              {catalog.care.map((preset) => (
                <button key={preset.id} type="button" className="h-9 rounded-full border border-line px-3 text-xs" onClick={() => setCare({ ...care, action: preset.id })}>
                  {optLabel(preset, lang, preset.id)}
                </button>
              ))}
            </div>
            <Field label={c.careNotes}>
              <input className={`${fieldClass} h-11`} value={care.notes} onChange={(e) => setCare({ ...care, notes: e.target.value })} />
            </Field>
            <button type="button" className="h-11 rounded-full border border-line text-sm" onClick={addCare}>
              {c.addCare}
            </button>
          </div>
          <ul className="mt-4 space-y-2">
            {draft.care.map((entry) => (
              <li key={entry.id} className="flex items-start justify-between gap-3 border-t border-line pt-2 text-sm">
                <span>
                  {formatDay(entry.date, lang)} · {actionLabel(catalog, entry.action, lang)}
                  {entry.notes ? ` — ${entry.notes}` : ""}
                </span>
                <button type="button" className="shrink-0 text-muted" onClick={() => patch({ care: draft.care.filter((item) => item.id !== entry.id) })}>
                  {c.remove}
                </button>
              </li>
            ))}
          </ul>
        </section>
      </form>
    </div>
  );
}
