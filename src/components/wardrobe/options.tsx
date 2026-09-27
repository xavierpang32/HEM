import { ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";
import { freshId, optLabel, type Catalog, type CategoryOption, type MaterialOption, type NamedOption, type StatusOption, type SwatchOption } from "@/lib/wardrobe/catalog";
import { formatMm } from "@/lib/wardrobe/logic";
import { useWardrobe } from "@/lib/wardrobe/store";
import type { Finish } from "@/lib/wardrobe/types";
import { useCopy } from "./use-copy";
import { ConfirmDialog, Field, ScreenHeader, fieldClass } from "./ui";

export function OptionsEditor({ onBack }: { onBack: () => void }) {
  const { c, lang } = useCopy();
  const catalog = useWardrobe((s) => s.catalog);
  const setCatalog = useWardrobe((s) => s.setCatalog);
  const resetCatalog = useWardrobe((s) => s.resetCatalog);
  const [reset, setReset] = useState(false);
  const [mm, setMm] = useState("");

  function commit(next: Catalog) {
    setCatalog(next);
  }

  return (
    <div className="min-h-full bg-paper pb-16">
      <ScreenHeader title={c.choices} onBack={onBack} backLabel={c.choicesDone} />
      <div className="mx-auto grid max-w-xl gap-8 px-4 py-5">
        <p className="text-sm leading-relaxed text-muted">{c.choicesHelp}</p>

        <NamedList
          title={c.laneGroup}
          rows={catalog.lanes}
          min={1}
          onChange={(lanes) => commit({ ...catalog, lanes })}
        />

        <section>
          <h3 className="font-display text-2xl">{c.categoryGroup}</h3>
          <ul className="mt-3 space-y-3">
            {catalog.categories.map((row, index) => (
              <li key={row.id} className="rounded-card border border-line bg-sheet p-3">
                <NamedFields
                  row={row}
                  onChange={(next) => commit({ ...catalog, categories: replace(catalog.categories, index, { ...row, ...next }) })}
                />
                <label className="mt-2 block">
                  <span className="mb-1 block text-xs tracking-widest text-muted uppercase">{c.laneGroup}</span>
                  <select
                    className={`${fieldClass} h-11`}
                    value={row.laneId}
                    onChange={(e) =>
                      commit({
                        ...catalog,
                        categories: replace(catalog.categories, index, { ...row, laneId: e.target.value }),
                      })
                    }
                  >
                    {catalog.lanes.map((lane) => (
                      <option key={lane.id} value={lane.id}>
                        {optLabel(lane, lang, lane.id)}
                      </option>
                    ))}
                  </select>
                </label>
                <RowTools
                  index={index}
                  total={catalog.categories.length}
                  min={1}
                  onMove={(delta) => commit({ ...catalog, categories: move(catalog.categories, index, delta) })}
                  onRemove={() => commit({ ...catalog, categories: catalog.categories.filter((_, i) => i !== index) })}
                />
              </li>
            ))}
          </ul>
          <AddButton
            label={c.addChoice}
            onClick={() =>
              commit({
                ...catalog,
                categories: [
                  ...catalog.categories,
                  { id: freshId(), label: "", labelZh: "", laneId: catalog.lanes[0]?.id ?? "latex" } satisfies CategoryOption,
                ],
              })
            }
          />
        </section>

        <section>
          <h3 className="font-display text-2xl">{c.statusGroup}</h3>
          <ul className="mt-3 space-y-3">
            {catalog.statuses.map((row, index) => (
              <li key={row.id} className="rounded-card border border-line bg-sheet p-3">
                <NamedFields
                  row={row}
                  onChange={(next) => commit({ ...catalog, statuses: replace(catalog.statuses, index, { ...row, ...next }) })}
                />
                <div className="mt-2 grid grid-cols-2 gap-2">
                  <Flag
                    label={c.flagAttention}
                    checked={row.attention}
                    onChange={(attention) => commit({ ...catalog, statuses: replace(catalog.statuses, index, { ...row, attention }) })}
                  />
                  <Flag
                    label={c.flagBlocks}
                    checked={row.blocksLook}
                    onChange={(blocksLook) => commit({ ...catalog, statuses: replace(catalog.statuses, index, { ...row, blocksLook }) })}
                  />
                  <Flag
                    label={c.flagArchive}
                    checked={row.archive}
                    onChange={(archive) => commit({ ...catalog, statuses: replace(catalog.statuses, index, { ...row, archive }) })}
                  />
                  <Flag
                    label={c.flagWearing}
                    checked={row.wearing}
                    onChange={(wearing) => commit({ ...catalog, statuses: replace(catalog.statuses, index, { ...row, wearing }) })}
                  />
                </div>
                <RowTools
                  index={index}
                  total={catalog.statuses.length}
                  min={1}
                  onMove={(delta) => commit({ ...catalog, statuses: move(catalog.statuses, index, delta) })}
                  onRemove={() => commit({ ...catalog, statuses: catalog.statuses.filter((_, i) => i !== index) })}
                />
              </li>
            ))}
          </ul>
          <AddButton
            label={c.addChoice}
            onClick={() =>
              commit({
                ...catalog,
                statuses: [
                  ...catalog.statuses,
                  { id: freshId(), label: "", labelZh: "", attention: false, blocksLook: false, archive: false, wearing: false } satisfies StatusOption,
                ],
              })
            }
          />
        </section>

        <NamedList
          title={c.conditionGroup}
          rows={catalog.conditions}
          min={1}
          onChange={(conditions) => commit({ ...catalog, conditions })}
        />

        <section>
          <h3 className="font-display text-2xl">{c.materialGroup}</h3>
          <ul className="mt-3 space-y-3">
            {catalog.materials.map((row, index) => (
              <li key={row.id} className="rounded-card border border-line bg-sheet p-3">
                <NamedFields
                  row={row}
                  onChange={(next) => commit({ ...catalog, materials: replace(catalog.materials, index, { ...row, ...next }) })}
                />
                <Flag
                  label={c.flagLatex}
                  checked={row.latex}
                  onChange={(latex) => commit({ ...catalog, materials: replace(catalog.materials, index, { ...row, latex }) })}
                />
                <RowTools
                  index={index}
                  total={catalog.materials.length}
                  min={0}
                  onMove={(delta) => commit({ ...catalog, materials: move(catalog.materials, index, delta) })}
                  onRemove={() => commit({ ...catalog, materials: catalog.materials.filter((_, i) => i !== index) })}
                />
              </li>
            ))}
          </ul>
          <AddButton
            label={c.addChoice}
            onClick={() =>
              commit({
                ...catalog,
                materials: [...catalog.materials, { id: freshId(), label: "", labelZh: "", latex: false } satisfies MaterialOption],
              })
            }
          />
        </section>

        <section>
          <h3 className="font-display text-2xl">{c.colorGroup}</h3>
          <ul className="mt-3 space-y-3">
            {catalog.swatches.map((row, index) => (
              <li key={row.id} className="rounded-card border border-line bg-sheet p-3">
                <NamedFields
                  row={row}
                  onChange={(next) => commit({ ...catalog, swatches: replace(catalog.swatches, index, { ...row, ...next }) })}
                />
                <div className="mt-2 grid grid-cols-[4.5rem_1fr] gap-2">
                  <input
                    type="color"
                    aria-label={c.color}
                    className="h-11 w-full cursor-pointer rounded-xl border border-line bg-sheet"
                    value={row.hex}
                    onChange={(e) =>
                      commit({ ...catalog, swatches: replace(catalog.swatches, index, { ...row, hex: e.target.value }) })
                    }
                  />
                  <select
                    className={`${fieldClass} h-11`}
                    value={row.finish}
                    onChange={(e) =>
                      commit({
                        ...catalog,
                        swatches: replace(catalog.swatches, index, { ...row, finish: e.target.value as Finish }),
                      })
                    }
                  >
                    <option value="solid">{c.finishSolid}</option>
                    <option value="clear">{c.finishClear}</option>
                    <option value="sheer">{c.finishSheer}</option>
                  </select>
                </div>
                <RowTools
                  index={index}
                  total={catalog.swatches.length}
                  min={0}
                  onMove={(delta) => commit({ ...catalog, swatches: move(catalog.swatches, index, delta) })}
                  onRemove={() => commit({ ...catalog, swatches: catalog.swatches.filter((_, i) => i !== index) })}
                />
              </li>
            ))}
          </ul>
          <AddButton
            label={c.addChoice}
            onClick={() =>
              commit({
                ...catalog,
                swatches: [
                  ...catalog.swatches,
                  { id: freshId(), label: "", labelZh: "", hex: "#1a1918", tone: "sheet", finish: "solid" } satisfies SwatchOption,
                ],
              })
            }
          />
        </section>

        <section>
          <h3 className="font-display text-2xl">{c.thicknessGroup}</h3>
          <ul className="mt-3 space-y-2">
            {catalog.thicknesses.map((value) => (
              <li key={value} className="flex items-center justify-between rounded-xl border border-line bg-sheet px-3">
                <span>{formatMm(value)}</span>
                <button
                  type="button"
                  className="h-11 text-sm text-muted"
                  onClick={() => commit({ ...catalog, thicknesses: catalog.thicknesses.filter((item) => item !== value) })}
                >
                  {c.remove}
                </button>
              </li>
            ))}
          </ul>
          <form
            className="mt-3 flex gap-2"
            onSubmit={(e) => {
              e.preventDefault();
              const next = Number(mm);
              if (!Number.isFinite(next) || next <= 0) return;
              commit({ ...catalog, thicknesses: [...catalog.thicknesses, Math.round(next * 100) / 100] });
              setMm("");
            }}
          >
            <input
              inputMode="decimal"
              className={`${fieldClass} h-11`}
              placeholder="0.35"
              value={mm}
              onChange={(e) => setMm(e.target.value)}
              aria-label={c.thickness}
            />
            <button type="submit" className="h-11 shrink-0 rounded-full border border-line px-4 text-sm">
              {c.addChoice}
            </button>
          </form>
        </section>

        <NamedList title={c.careGroup} rows={catalog.care} min={0} onChange={(care) => commit({ ...catalog, care })} />

        <button type="button" className="h-11 text-left text-sm text-accent" onClick={() => setReset(true)}>
          {c.resetChoices}
        </button>
      </div>
      <ConfirmDialog
        open={reset}
        title={c.resetChoices}
        body={c.confirmResetChoices}
        confirmLabel={c.resetChoices}
        onClose={() => setReset(false)}
        onConfirm={() => {
          resetCatalog();
          setReset(false);
        }}
      />
    </div>
  );
}

function NamedList({
  title,
  rows,
  min,
  onChange,
}: {
  title: string;
  rows: NamedOption[];
  min: number;
  onChange: (rows: NamedOption[]) => void;
}) {
  const { c } = useCopy();
  return (
    <section>
      <h3 className="font-display text-2xl">{title}</h3>
      <ul className="mt-3 space-y-3">
        {rows.map((row, index) => (
          <li key={row.id} className="rounded-card border border-line bg-sheet p-3">
            <NamedFields row={row} onChange={(next) => onChange(replace(rows, index, { ...row, ...next }))} />
            <RowTools
              index={index}
              total={rows.length}
              min={min}
              onMove={(delta) => onChange(move(rows, index, delta))}
              onRemove={() => onChange(rows.filter((_, i) => i !== index))}
            />
          </li>
        ))}
      </ul>
      <AddButton label={c.addChoice} onClick={() => onChange([...rows, { id: freshId(), label: "", labelZh: "" }])} />
    </section>
  );
}

function NamedFields({
  row,
  onChange,
}: {
  row: NamedOption;
  onChange: (next: Pick<NamedOption, "label" | "labelZh">) => void;
}) {
  const { c } = useCopy();
  return (
    <Field label={c.name}>
      <input className={`${fieldClass} h-11`} value={row.label} onChange={(e) => onChange({ label: e.target.value, labelZh: "" })} />
    </Field>
  );
}

function Flag({ label, checked, onChange }: { label: string; checked: boolean; onChange: (next: boolean) => void }) {
  return (
    <label className="flex h-11 items-center gap-2 text-sm">
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} />
      {label}
    </label>
  );
}

function RowTools({
  index,
  total,
  min,
  onMove,
  onRemove,
}: {
  index: number;
  total: number;
  min: number;
  onMove: (delta: number) => void;
  onRemove: () => void;
}) {
  const { c } = useCopy();
  return (
    <div className="mt-1 flex items-center justify-end gap-1">
      <button type="button" className="grid size-11 place-items-center text-muted disabled:opacity-30" aria-label={c.moveUp} disabled={index === 0} onClick={() => onMove(-1)}>
        <ChevronUp className="size-5" />
      </button>
      <button type="button" className="grid size-11 place-items-center text-muted disabled:opacity-30" aria-label={c.moveDown} disabled={index === total - 1} onClick={() => onMove(1)}>
        <ChevronDown className="size-5" />
      </button>
      <button type="button" className="h-11 px-2 text-sm text-accent disabled:opacity-30" disabled={total <= min} onClick={onRemove}>
        {c.remove}
      </button>
    </div>
  );
}

function AddButton({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button type="button" className="mt-3 h-11 rounded-full border border-line px-4 text-sm" onClick={onClick}>
      {label}
    </button>
  );
}

function replace<T>(rows: T[], index: number, next: T): T[] {
  return rows.map((row, i) => (i === index ? next : row));
}

function move<T>(rows: T[], index: number, delta: number): T[] {
  const next = rows.slice();
  const to = index + delta;
  if (to < 0 || to >= next.length) return rows;
  const [item] = next.splice(index, 1);
  if (item === undefined) return rows;
  next.splice(to, 0, item);
  return next;
}
