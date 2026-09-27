import type { Finish, Lang, Tone } from "./types";

export type NamedOption = { id: string; label: string; labelZh: string };

export type LaneOption = NamedOption;

export type CategoryOption = NamedOption & { laneId: string };

export type StatusOption = NamedOption & {
  attention: boolean;
  blocksLook: boolean;
  archive: boolean;
  wearing: boolean;
};

export type MaterialOption = NamedOption & { latex: boolean };

export type SwatchOption = NamedOption & { hex: string; tone: Tone; finish: Finish };

export type Catalog = {
  lanes: LaneOption[];
  categories: CategoryOption[];
  statuses: StatusOption[];
  conditions: NamedOption[];
  materials: MaterialOption[];
  swatches: SwatchOption[];
  thicknesses: number[];
  care: NamedOption[];
};

const DEFAULT: Catalog = {
  lanes: [
    { id: "latex", label: "Latex", labelZh: "乳胶" },
    { id: "muslimah", label: "Muslimah", labelZh: "穆斯林女装" },
  ],
  categories: [
    { id: "catsuit", label: "Catsuit", labelZh: "连体衣", laneId: "latex" },
    { id: "bodysuit", label: "Bodysuit", labelZh: "紧身衣", laneId: "latex" },
    { id: "maid", label: "Maid", labelZh: "女仆装", laneId: "latex" },
    { id: "mask", label: "Mask", labelZh: "头套", laneId: "latex" },
    { id: "gloves", label: "Gloves", labelZh: "手套", laneId: "latex" },
    { id: "boots", label: "Boots", labelZh: "靴子", laneId: "latex" },
    { id: "hijab", label: "Hijab", labelZh: "头巾", laneId: "muslimah" },
    { id: "khimar", label: "Khimar", labelZh: "希马尔", laneId: "muslimah" },
    { id: "niqab", label: "Niqab", labelZh: "面纱", laneId: "muslimah" },
    { id: "burqa", label: "Burqa", labelZh: "罩袍", laneId: "muslimah" },
    { id: "abaya", label: "Abaya", labelZh: "阿巴亚", laneId: "muslimah" },
    { id: "undercap", label: "Undercap", labelZh: "内帽", laneId: "muslimah" },
  ],
  statuses: [
    { id: "closet", label: "In closet", labelZh: "在柜", attention: false, blocksLook: false, archive: false, wearing: false },
    { id: "wearing", label: "Wearing", labelZh: "穿着", attention: false, blocksLook: false, archive: false, wearing: true },
    { id: "loan", label: "On loan", labelZh: "借出", attention: true, blocksLook: true, archive: false, wearing: false },
    { id: "cleaner", label: "At the cleaner", labelZh: "送洗", attention: true, blocksLook: true, archive: false, wearing: false },
    { id: "repair", label: "In repair", labelZh: "修补中", attention: true, blocksLook: true, archive: false, wearing: false },
    { id: "retired", label: "Donated / sold", labelZh: "送出 / 卖出", attention: false, blocksLook: true, archive: true, wearing: false },
  ],
  conditions: [
    { id: "excellent", label: "Excellent", labelZh: "极好" },
    { id: "good", label: "Good", labelZh: "良好" },
    { id: "fair", label: "Fair", labelZh: "一般" },
    { id: "worn", label: "Worn", labelZh: "旧" },
  ],
  materials: [
    { id: "Latex", label: "Latex", labelZh: "乳胶", latex: true },
    { id: "Chlorinated latex", label: "Chlorinated latex", labelZh: "氯化乳胶", latex: true },
    { id: "Metallic latex", label: "Metallic latex", labelZh: "金属乳胶", latex: true },
    { id: "Transparent latex", label: "Transparent latex", labelZh: "透明乳胶", latex: true },
    { id: "Silicone", label: "Silicone", labelZh: "硅胶", latex: true },
    { id: "Chiffon", label: "Chiffon", labelZh: "雪纺", latex: false },
    { id: "Jersey", label: "Jersey", labelZh: "针织", latex: false },
    { id: "Nida", label: "Nida", labelZh: "尼达", latex: false },
    { id: "Crepe", label: "Crepe", labelZh: "绉纱", latex: false },
    { id: "Cotton", label: "Cotton", labelZh: "棉", latex: false },
  ],
  swatches: [
    { id: "transparent", label: "Transparent", labelZh: "透明", hex: "#d5e6ee", tone: "ink", finish: "clear" },
    { id: "sheer-black", label: "Sheer black", labelZh: "透黑", hex: "#1a1918", tone: "sheet", finish: "sheer" },
    { id: "sheer-red", label: "Sheer red", labelZh: "透红", hex: "#8c2f2f", tone: "sheet", finish: "sheer" },
    { id: "black", label: "Black", labelZh: "黑色", hex: "#1a1918", tone: "sheet", finish: "solid" },
    { id: "red", label: "Red", labelZh: "红色", hex: "#8c2a2a", tone: "sheet", finish: "solid" },
    { id: "white", label: "White", labelZh: "白色", hex: "#f4f1ea", tone: "ink", finish: "solid" },
    { id: "pink", label: "Pink", labelZh: "粉色", hex: "#d98aa6", tone: "ink", finish: "solid" },
    { id: "purple", label: "Purple", labelZh: "紫色", hex: "#5c3d6e", tone: "sheet", finish: "solid" },
    { id: "navy", label: "Navy", labelZh: "藏青", hex: "#243044", tone: "sheet", finish: "solid" },
    { id: "emerald", label: "Emerald", labelZh: "翠绿", hex: "#1f6b52", tone: "sheet", finish: "solid" },
    { id: "silver", label: "Silver", labelZh: "银色", hex: "#c5c8ce", tone: "ink", finish: "solid" },
    { id: "natural", label: "Natural", labelZh: "本色", hex: "#e4c7a8", tone: "ink", finish: "solid" },
  ],
  thicknesses: [0.25, 0.4, 0.6, 0.8, 1],
  care: [
    { id: "wash", label: "Wash", labelZh: "水洗" },
    { id: "shine", label: "Shine", labelZh: "上光" },
    { id: "chlorinate", label: "Chlorinate", labelZh: "氯化" },
    { id: "patch", label: "Patch", labelZh: "补片" },
    { id: "dry-clean", label: "Dry clean", labelZh: "干洗" },
    { id: "alter", label: "Alteration", labelZh: "修改" },
    { id: "repair", label: "Repair", labelZh: "修补" },
    { id: "polish", label: "Polish", labelZh: "护理上光" },
    { id: "restitch", label: "Restitch", labelZh: "重新缝线" },
  ],
};

export function defaultCatalog(): Catalog {
  return structuredClone(DEFAULT);
}

export function freshId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) return crypto.randomUUID().slice(0, 8);
  return `x${Date.now().toString(16).slice(-6)}${Math.random().toString(16).slice(2, 4)}`;
}

export function optLabel(item: { label: string; labelZh: string } | undefined, _lang: Lang, fallback = ""): string {
  if (!item) return fallback;
  return item.label.trim() || fallback;
}

export function namedLabel(list: NamedOption[], id: string, lang: Lang): string {
  return optLabel(list.find((item) => item.id === id), lang, id);
}

export function toneFor(hex: string, finish: Finish): Tone {
  if (finish !== "solid") return "ink";
  const n = hex.replace("#", "");
  if (n.length < 6) return "ink";
  const r = Number.parseInt(n.slice(0, 2), 16);
  const g = Number.parseInt(n.slice(2, 4), 16);
  const b = Number.parseInt(n.slice(4, 6), 16);
  if ([r, g, b].some((v) => Number.isNaN(v))) return "ink";
  const l = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return l > 0.62 ? "ink" : "sheet";
}

export function isLatexMaterial(material: string, catalog: Catalog): boolean {
  const hit = catalog.materials.find((item) => item.id === material);
  if (hit) return hit.latex;
  return /latex|乳胶|silicone|硅胶/i.test(material);
}

export function statusIds(catalog: Catalog, flag: "attention" | "blocksLook" | "archive" | "wearing"): string[] {
  return catalog.statuses.filter((item) => item[flag]).map((item) => item.id);
}

function asNamed(value: unknown): NamedOption | null {
  if (!value || typeof value !== "object") return null;
  const row = value as Record<string, unknown>;
  if (typeof row.id !== "string" || !row.id.trim() || row.id === "all") return null;
  return {
    id: row.id.trim(),
    label: typeof row.label === "string" ? row.label : row.id,
    labelZh: typeof row.labelZh === "string" ? row.labelZh : "",
  };
}

function uniqueNamed<T extends NamedOption>(rows: T[]): T[] {
  const seen = new Set<string>();
  const out: T[] = [];
  for (const row of rows) {
    if (seen.has(row.id)) continue;
    seen.add(row.id);
    out.push(row);
  }
  return out;
}

function hexOf(value: unknown): string {
  return typeof value === "string" && /^#[0-9a-fA-F]{6}$/.test(value) ? value.toLowerCase() : "#1a1918";
}

function finishOf(value: unknown): Finish {
  return value === "clear" || value === "sheer" || value === "solid" ? value : "solid";
}

export function normalizeCatalog(input: unknown): Catalog {
  const base = defaultCatalog();
  if (!input || typeof input !== "object") return base;
  const raw = input as Record<string, unknown>;

  const lanes = uniqueNamed(
    (Array.isArray(raw.lanes) ? raw.lanes : []).map(asNamed).filter((item): item is NamedOption => Boolean(item)),
  );
  const laneList = lanes.length > 0 ? lanes : base.lanes;
  const laneIds = new Set(laneList.map((item) => item.id));
  const fallbackLane = laneList[0]?.id ?? "latex";

  const categories = uniqueNamed(
    (Array.isArray(raw.categories) ? raw.categories : [])
      .map((item) => {
        const named = asNamed(item);
        if (!named || !item || typeof item !== "object") return null;
        const laneId = (item as { laneId?: unknown }).laneId;
        return { ...named, laneId: typeof laneId === "string" && laneIds.has(laneId) ? laneId : fallbackLane };
      })
      .filter((item): item is CategoryOption => Boolean(item)),
  );

  const statuses = uniqueNamed(
    (Array.isArray(raw.statuses) ? raw.statuses : [])
      .map((item) => {
        const named = asNamed(item);
        if (!named || !item || typeof item !== "object") return null;
        const row = item as Record<string, unknown>;
        return {
          ...named,
          attention: row.attention === true,
          blocksLook: row.blocksLook === true,
          archive: row.archive === true,
          wearing: row.wearing === true,
        };
      })
      .filter((item): item is StatusOption => Boolean(item)),
  );

  const conditions = uniqueNamed(
    (Array.isArray(raw.conditions) ? raw.conditions : []).map(asNamed).filter((item): item is NamedOption => Boolean(item)),
  );

  const materials = uniqueNamed(
    (Array.isArray(raw.materials) ? raw.materials : [])
      .map((item) => {
        const named = asNamed(item);
        if (!named || !item || typeof item !== "object") return null;
        return { ...named, latex: (item as { latex?: unknown }).latex === true };
      })
      .filter((item): item is MaterialOption => Boolean(item)),
  );

  const swatches = uniqueNamed(
    (Array.isArray(raw.swatches) ? raw.swatches : [])
      .map((item) => {
        const named = asNamed(item);
        if (!named || !item || typeof item !== "object") return null;
        const finish = finishOf((item as { finish?: unknown }).finish);
        const hex = hexOf((item as { hex?: unknown }).hex);
        return { ...named, hex, finish, tone: toneFor(hex, finish) };
      })
      .filter((item): item is SwatchOption => Boolean(item)),
  );

  const care = uniqueNamed(
    (Array.isArray(raw.care) ? raw.care : []).map(asNamed).filter((item): item is NamedOption => Boolean(item)),
  );

  const thicknesses = Array.from(
    new Set(
      (Array.isArray(raw.thicknesses) ? raw.thicknesses : [])
        .map((item) => (typeof item === "number" ? item : Number(item)))
        .filter((item) => Number.isFinite(item) && item > 0)
        .map((item) => Math.round(item * 100) / 100),
    ),
  ).sort((a, b) => a - b);

  return {
    lanes: laneList,
    categories: categories.length > 0 ? categories : base.categories.map((item) => ({ ...item, laneId: laneIds.has(item.laneId) ? item.laneId : fallbackLane })),
    statuses: statuses.length > 0 ? statuses : base.statuses,
    conditions: conditions.length > 0 ? conditions : base.conditions,
    materials,
    swatches,
    thicknesses,
    care,
  };
}
