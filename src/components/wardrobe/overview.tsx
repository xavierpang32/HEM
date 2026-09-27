import { namedLabel, statusIds } from "@/lib/wardrobe/catalog";
import { isAttention, money, pieceName, pieceValue } from "@/lib/wardrobe/logic";
import { useWardrobe } from "@/lib/wardrobe/store";
import { useCopy } from "./use-copy";
import { SwatchFace } from "./ui";

export function Overview({
  onOpenPiece,
  onSeeAttention,
}: {
  onOpenPiece: (id: string) => void;
  onSeeAttention: () => void;
}) {
  const { c, lang } = useCopy();
  const pieces = useWardrobe((s) => s.pieces);
  const catalog = useWardrobe((s) => s.catalog);
  const archiveIds = statusIds(catalog, "archive");
  const attentionIds = statusIds(catalog, "attention");
  const wearingIds = statusIds(catalog, "wearing");
  const active = pieces.filter((piece) => !archiveIds.includes(piece.status));
  const retired = pieces.length - active.length;
  const attention = pieces.filter((piece) => isAttention(piece.status, attentionIds));
  const wearing = pieces.filter((piece) => wearingIds.includes(piece.status));
  const value = active.reduce((sum, piece) => sum + pieceValue(piece), 0);
  const counts = catalog.categories.map((cat) => active.filter((piece) => piece.category === cat.id).length);
  const max = Math.max(1, ...counts);

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-6 pb-28 md:px-10 md:pb-10">
      <p className="text-xs tracking-widest text-muted uppercase">{c.tagline}</p>
      <h2 className="font-display text-4xl">{c.overview}</h2>
      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        <Stat label={c.totalPieces} value={String(active.length)} hint={retired ? c.retiredCount(retired) : undefined} />
        <Stat label={c.estValue} value={money(value, lang)} />
      </div>
      <section className="mt-8">
        <h3 className="font-display text-2xl">{c.byCategory}</h3>
        <ul className="mt-3 space-y-3">
          {catalog.categories.map((cat) => {
            const count = active.filter((piece) => piece.category === cat.id).length;
            if (!count) return null;
            return (
              <li key={cat.id}>
                <div className="mb-1 flex justify-between text-sm">
                  <span>{namedLabel(catalog.categories, cat.id, lang)}</span>
                  <span className="text-muted">{count}</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-line">
                  <div className="h-full rounded-full bg-ink" style={{ width: `${(count / max) * 100}%` }} />
                </div>
              </li>
            );
          })}
        </ul>
      </section>
      <section className="mt-8">
        <div className="flex items-baseline justify-between">
          <h3 className="font-display text-2xl">{c.attention}</h3>
          {attention.length > 0 ? (
            <button type="button" className="text-sm text-accent" onClick={onSeeAttention}>
              {c.open}
            </button>
          ) : null}
        </div>
        {attention.length === 0 ? (
          <p className="mt-2 text-sm text-muted">{c.attentionNone}</p>
        ) : (
          <ul className="mt-2">
            {attention.map((piece) => (
              <li key={piece.id} className="border-b border-line">
                <button type="button" className="flex w-full items-center gap-3 py-3 text-left" onClick={() => onOpenPiece(piece.id)}>
                  <SwatchFace piece={piece} className="h-12 w-10 rounded-lg" />
                  <span className="min-w-0 flex-1 truncate">{pieceName(piece, lang)}</span>
                  <span className="text-sm text-accent">{namedLabel(catalog.statuses, piece.status, lang)}</span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>
      <section className="mt-8">
        <h3 className="font-display text-2xl">{c.wearingNow}</h3>
        {wearing.length === 0 ? (
          <p className="mt-2 text-sm text-muted">{c.wearingNone}</p>
        ) : (
          <ul className="mt-2">
            {wearing.map((piece) => (
              <li key={piece.id} className="border-b border-line">
                <button type="button" className="flex w-full items-center gap-3 py-3 text-left" onClick={() => onOpenPiece(piece.id)}>
                  <SwatchFace piece={piece} className="h-12 w-10 rounded-lg" />
                  <span className="truncate">{pieceName(piece, lang)}</span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

function Stat({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div className="rounded-card border border-line bg-sheet px-4 py-4">
      <p className="text-xs tracking-widest text-muted uppercase">{label}</p>
      <p className="mt-1 font-display text-4xl leading-none">{value}</p>
      {hint ? <p className="mt-2 text-sm text-muted">{hint}</p> : null}
    </div>
  );
}
