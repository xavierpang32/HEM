import type { Catalog } from "./catalog";
import { ATTENTION, LOOK_BLOCK, type Lang, type Look, type Piece, type SearchField, type SortKey } from "./types";

export function pieceName(piece: Piece, lang: Lang): string {
  return lang === "zh" && piece.nameZh ? piece.nameZh : piece.name;
}

export function pieceLocation(piece: Piece, lang: Lang): string {
  return lang === "zh" && piece.locationZh ? piece.locationZh : piece.location;
}

export function pieceColor(piece: Piece, lang: Lang): string {
  return lang === "zh" && piece.colorZh ? piece.colorZh : piece.color;
}

export function pieceMaterial(piece: Piece, lang: Lang): string {
  return lang === "zh" && piece.materialZh ? piece.materialZh : piece.material;
}

export function isLatexMaterial(material: string, catalog?: Catalog): boolean {
  const hit = catalog?.materials.find((item) => item.id === material);
  if (hit) return hit.latex;
  return /latex|乳胶|silicone|硅胶/i.test(material);
}

export function inLane(categoryId: string, lane: string, catalog: Catalog): boolean {
  if (lane === "all") return true;
  return catalog.categories.find((item) => item.id === categoryId)?.laneId === lane;
}

export function formatMm(mm: number | null): string {
  if (mm == null || Number.isNaN(mm)) return "";
  return `${mm} mm`;
}

export function pieceNotes(piece: Piece, lang: Lang): string {
  return lang === "zh" && piece.notesZh ? piece.notesZh : piece.notes;
}

export function lookName(look: Look, lang: Lang): string {
  return lang === "zh" && look.nameZh ? look.nameZh : look.name;
}

export function lookNotes(look: Look, lang: Lang): string {
  return lang === "zh" && look.notesZh ? look.notesZh : look.notes;
}

export function money(value: number | null, lang: Lang): string {
  if (value == null || Number.isNaN(value)) return "—";
  return new Intl.NumberFormat(lang === "zh" ? "zh-CN" : "en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatDay(iso: string, lang: Lang): string {
  if (!iso) return "—";
  const [y, m, d] = iso.split("-").map(Number);
  if (!y || !m || !d) return iso;
  return new Intl.DateTimeFormat(lang === "zh" ? "zh-CN" : "en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(new Date(y, m - 1, d));
}

function fuzzyScore(query: string, text: string): number {
  const q = query.trim().toLowerCase();
  if (!q) return 1;
  const t = text.toLowerCase();
  if (t.includes(q)) return t.startsWith(q) ? 3 : 2;
  const collapsed = q.replace(/\s+/g, "");
  let i = 0;
  for (const ch of t) {
    if (ch === collapsed[i]) i += 1;
    if (i === collapsed.length) return 1;
  }
  return 0;
}

function pieceHaystack(piece: Piece, field: SearchField, lang: Lang): string {
  const name = `${piece.name} ${piece.nameZh ?? ""}`;
  const brand = piece.brand;
  const location = `${piece.location} ${piece.locationZh ?? ""}`;
  if (field === "name") return name;
  if (field === "brand") return brand;
  if (field === "location") return location;
  return [name, brand, location, piece.color, piece.colorZh ?? "", piece.size, piece.material].join(" ");
}

export function filterPieces(
  pieces: Piece[],
  opts: {
    query: string;
    field: SearchField;
    category: string;
    status: string;
    lang: Lang;
    attentionIds: string[];
  },
): Piece[] {
  return pieces.filter((piece) => {
    if (opts.category !== "all" && piece.category !== opts.category) return false;
    if (opts.status === "attention") {
      if (!opts.attentionIds.includes(piece.status)) return false;
    } else if (opts.status !== "all" && piece.status !== opts.status) {
      return false;
    }
    return fuzzyScore(opts.query, pieceHaystack(piece, opts.field, opts.lang)) > 0;
  });
}

export function sortPieces(pieces: Piece[], sort: SortKey, lang: Lang): Piece[] {
  const arr = pieces.slice();
  const label = (piece: Piece) => pieceName(piece, lang);
  const locale = lang === "zh" ? "zh-CN" : "en";
  if (sort === "newest") arr.sort((a, b) => b.createdAt - a.createdAt || a.order - b.order);
  else if (sort === "oldest") arr.sort((a, b) => a.createdAt - b.createdAt || a.order - b.order);
  else if (sort === "az") arr.sort((a, b) => label(a).localeCompare(label(b), locale));
  else if (sort === "za") arr.sort((a, b) => label(b).localeCompare(label(a), locale));
  else arr.sort((a, b) => a.order - b.order || a.createdAt - b.createdAt);
  return arr;
}

export function sortLooks(looks: Look[], sort: SortKey, lang: Lang): Look[] {
  const arr = looks.slice();
  const label = (look: Look) => lookName(look, lang);
  const locale = lang === "zh" ? "zh-CN" : "en";
  if (sort === "newest") arr.sort((a, b) => b.createdAt - a.createdAt || a.order - b.order);
  else if (sort === "oldest") arr.sort((a, b) => a.createdAt - b.createdAt || a.order - b.order);
  else if (sort === "az") arr.sort((a, b) => label(a).localeCompare(label(b), locale));
  else if (sort === "za") arr.sort((a, b) => label(b).localeCompare(label(a), locale));
  else arr.sort((a, b) => a.order - b.order || a.createdAt - b.createdAt);
  return arr;
}

export function spliceOrder(baseIds: string[], visibleBefore: string[], visibleAfter: string[]): string[] {
  const visible = new Set(visibleBefore);
  const queue = visibleAfter.slice();
  return baseIds.map((id) => (visible.has(id) ? (queue.shift() ?? id) : id));
}

export function pieceValue(piece: Piece): number {
  return piece.estimatedValue ?? piece.purchasePrice ?? 0;
}

export function isAttention(status: string, attentionIds: readonly string[] = ATTENTION): boolean {
  return attentionIds.includes(status);
}

export type LookHealth = {
  ready: boolean;
  blocked: Piece[];
  missing: number;
};

export function lookHealth(look: Look, pieces: Piece[], blockedIds: readonly string[] = LOOK_BLOCK): LookHealth {
  const blocked: Piece[] = [];
  let missing = 0;
  for (const id of look.pieceIds) {
    const piece = pieces.find((item) => item.id === id);
    if (!piece) {
      missing += 1;
      continue;
    }
    if (blockedIds.includes(piece.status)) blocked.push(piece);
  }
  return { ready: blocked.length === 0 && missing === 0, blocked, missing };
}
