export const LATEX_CATEGORIES = ["catsuit", "bodysuit", "maid", "mask", "gloves", "boots"] as const;

export const MODEST_CATEGORIES = ["hijab", "khimar", "niqab", "burqa", "abaya", "undercap"] as const;

export const CATEGORIES = [...LATEX_CATEGORIES, ...MODEST_CATEGORIES] as const;

export const LANES = ["all", "latex", "muslimah"] as const;

export const STATUSES = ["closet", "wearing", "loan", "cleaner", "repair", "retired"] as const;

export const CONDITIONS = ["excellent", "good", "fair", "worn"] as const;

export const SORTS = ["newest", "oldest", "custom", "az", "za"] as const;

export const SEARCH_FIELDS = ["all", "name", "brand", "location"] as const;

export const CARE_PRESETS = ["wash", "shine", "chlorinate", "patch", "dry-clean", "alter", "repair", "polish", "restitch"] as const;

export const MATERIALS = [
  "Latex",
  "Chlorinated latex",
  "Metallic latex",
  "Transparent latex",
  "Silicone",
  "Chiffon",
  "Jersey",
  "Nida",
  "Crepe",
  "Cotton",
] as const;

export const THICKNESS_MM = [0.25, 0.4, 0.6, 0.8, 1] as const;

export const ATTENTION: Status[] = ["loan", "cleaner", "repair"];

export const LOOK_BLOCK: Status[] = ["loan", "cleaner", "repair", "retired"];

export type Category = string;
export type Status = string;
export type Condition = string;
export type SortKey = (typeof SORTS)[number];
export type SearchField = (typeof SEARCH_FIELDS)[number];
export type Lang = "en" | "zh";
export type Tone = "ink" | "sheet";
export type Finish = "solid" | "clear" | "sheer";
export type Lane = string;

export type CareEntry = {
  id: string;
  date: string;
  action: string;
  cost: number | null;
  notes: string;
};

export type Piece = {
  id: string;
  name: string;
  nameZh?: string;
  category: Category;
  brand: string;
  size: string;
  color: string;
  colorZh?: string;
  material: string;
  materialZh?: string;
  thicknessMm: number | null;
  condition: Condition;
  status: Status;
  location: string;
  locationZh?: string;
  swatch: string;
  swatchId: string;
  finish: Finish;
  tone: Tone;
  photos: string[];
  purchaseDate: string;
  purchasePrice: number | null;
  estimatedValue: number | null;
  notes: string;
  notesZh?: string;
  care: CareEntry[];
  createdAt: number;
  order: number;
};

export type Look = {
  id: string;
  name: string;
  nameZh?: string;
  notes: string;
  notesZh?: string;
  pieceIds: string[];
  createdAt: number;
  order: number;
};

export type Swatch = { id: string; hex: string; tone: Tone; finish: Finish };

export const SWATCHES = [
  { id: "transparent", hex: "#d5e6ee", tone: "ink", finish: "clear" },
  { id: "sheer-black", hex: "#1a1918", tone: "sheet", finish: "sheer" },
  { id: "sheer-red", hex: "#8c2f2f", tone: "sheet", finish: "sheer" },
  { id: "black", hex: "#1a1918", tone: "sheet", finish: "solid" },
  { id: "red", hex: "#8c2a2a", tone: "sheet", finish: "solid" },
  { id: "white", hex: "#f4f1ea", tone: "ink", finish: "solid" },
  { id: "pink", hex: "#d98aa6", tone: "ink", finish: "solid" },
  { id: "purple", hex: "#5c3d6e", tone: "sheet", finish: "solid" },
  { id: "navy", hex: "#243044", tone: "sheet", finish: "solid" },
  { id: "emerald", hex: "#1f6b52", tone: "sheet", finish: "solid" },
  { id: "silver", hex: "#c5c8ce", tone: "ink", finish: "solid" },
  { id: "natural", hex: "#e4c7a8", tone: "ink", finish: "solid" },
] as const;
