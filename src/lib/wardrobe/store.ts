import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { z } from "zod";
import { defaultCatalog, normalizeCatalog, type Catalog } from "./catalog";
import {
  SEARCH_FIELDS,
  SORTS,
  type CareEntry,
  type Category,
  type Condition,
  type Finish,
  type Lang,
  type Look,
  type Piece,
  type SearchField,
  type SortKey,
  type Status,
  type Tone,
} from "./types";

export type PieceInput = {
  name: string;
  category: Category;
  brand: string;
  size: string;
  color: string;
  material: string;
  thicknessMm: number | null;
  condition: Condition;
  status: Status;
  location: string;
  swatch: string;
  swatchId: string;
  finish: Finish;
  tone: Tone;
  photos: string[];
  purchaseDate: string;
  purchasePrice: number | null;
  estimatedValue: number | null;
  notes: string;
  care: CareEntry[];
};

type Persisted = {
  pieces: Piece[];
  looks: Look[];
  lang: Lang;
  sort: SortKey;
  lookSort: SortKey;
  searchField: SearchField;
  catalog: Catalog;
};

type WardrobeState = Persisted & {
  storageError: boolean;
  notice: string | null;
  setLang: (lang: Lang) => void;
  setSort: (sort: SortKey) => void;
  setLookSort: (sort: SortKey) => void;
  setSearchField: (field: SearchField) => void;
  clearNotice: () => void;
  addPiece: (input: PieceInput) => string;
  updatePiece: (id: string, input: PieceInput) => void;
  removePieces: (ids: string[]) => void;
  commitPieceOrder: (ids: string[]) => void;
  addLook: (input: { name: string; notes: string; pieceIds: string[] }) => string;
  updateLook: (id: string, input: { name: string; notes: string; pieceIds: string[] }) => void;
  removeLooks: (ids: string[]) => void;
  commitLookOrder: (ids: string[]) => void;
  eraseAll: () => void;
  exportBackup: () => string;
  importBackup: (raw: string) => boolean;
  setCatalog: (catalog: Catalog) => void;
  resetCatalog: () => void;
};

function uid(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) return crypto.randomUUID();
  return `id-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function nextOrder(items: { order: number }[]): number {
  return items.reduce((min, item) => Math.min(min, item.order), 0) - 1;
}

const safeStorage = {
  getItem: (name: string) => {
    if (typeof window === "undefined") return null;
    return window.localStorage.getItem(name);
  },
  setItem: (name: string, value: string) => {
    if (typeof window === "undefined") return;
    try {
      window.localStorage.setItem(name, value);
    } catch {
      window.dispatchEvent(new Event("hem-storage-full"));
    }
  },
  removeItem: (name: string) => {
    if (typeof window === "undefined") return;
    window.localStorage.removeItem(name);
  },
};

const careSchema = z.object({
  id: z.string(),
  date: z.string(),
  action: z.string(),
  cost: z.number().nullable(),
  notes: z.string(),
});

const pieceSchema = z.object({
  id: z.string(),
  name: z.string().min(1),
  nameZh: z.string().optional(),
  category: z.string().min(1),
  brand: z.string(),
  size: z.string(),
  color: z.string(),
  colorZh: z.string().optional(),
  material: z.string(),
  materialZh: z.string().optional(),
  thicknessMm: z.number().nullable().optional(),
  condition: z.string().min(1),
  status: z.string().min(1),
  location: z.string(),
  locationZh: z.string().optional(),
  swatch: z.string(),
  swatchId: z.string().optional(),
  finish: z.enum(["solid", "clear", "sheer"]).optional(),
  tone: z.enum(["ink", "sheet"]),
  photos: z.array(z.string()),
  purchaseDate: z.string(),
  purchasePrice: z.number().nullable(),
  estimatedValue: z.number().nullable(),
  notes: z.string(),
  notesZh: z.string().optional(),
  care: z.array(careSchema),
  createdAt: z.number(),
  order: z.number(),
});

const lookSchema = z.object({
  id: z.string(),
  name: z.string().min(1),
  nameZh: z.string().optional(),
  notes: z.string(),
  notesZh: z.string().optional(),
  pieceIds: z.array(z.string()),
  createdAt: z.number(),
  order: z.number(),
});

const backupSchema = z.object({
  pieces: z.array(pieceSchema),
  looks: z.array(lookSchema),
  lang: z.enum(["en", "zh"]).optional(),
  sort: z.enum(SORTS).optional(),
  lookSort: z.enum(SORTS).optional(),
  searchField: z.enum(SEARCH_FIELDS).optional(),
  catalog: z.unknown().optional(),
});

function owned<T extends { name: string; notes: string; nameZh?: string; notesZh?: string }>(
  prev: T | undefined,
  name: string,
  notes: string,
): Pick<T, "nameZh" | "notesZh"> {
  if (!prev) return {};
  const sameName = name === prev.name || (prev.nameZh != null && name === prev.nameZh);
  const sameNotes = notes === prev.notes || (prev.notesZh != null && notes === prev.notesZh);
  return {
    nameZh: sameName ? prev.nameZh : undefined,
    notesZh: sameNotes ? prev.notesZh : undefined,
  };
}

const SAMPLE_IDS = new Set([
  "p-catsuit",
  "p-mask",
  "p-gloves",
  "p-maid",
  "p-boots",
  "p-sheer",
  "p-hijab",
  "p-burqa",
  "p-abaya",
  "p-khimar",
  "p-cap",
  "p-niqab",
  "l-black",
  "l-maid",
  "l-covered",
  "l-day",
]);

function withoutSamples(pieces: Piece[] | undefined, looks: Look[] | undefined) {
  return {
    pieces: (pieces ?? []).filter((piece) => !SAMPLE_IDS.has(piece.id)),
    looks: (looks ?? [])
      .filter((look) => !SAMPLE_IDS.has(look.id))
      .map((look) => ({ ...look, pieceIds: look.pieceIds.filter((id) => !SAMPLE_IDS.has(id)) })),
  };
}

export const useWardrobe = create<WardrobeState>()(
  persist(
    (set, get) => ({
      pieces: [],
      looks: [],
      lang: "en",
      sort: "newest",
      lookSort: "newest",
      searchField: "all",
      catalog: defaultCatalog(),
      storageError: false,
      notice: null,
      setLang: () => {
        set({ lang: "en" });
        if (typeof document !== "undefined") document.documentElement.lang = "en";
      },
      setSort: (sort) => set({ sort }),
      setLookSort: (lookSort) => set({ lookSort }),
      setSearchField: (searchField) => set({ searchField }),
      clearNotice: () => set({ notice: null, storageError: false }),
      addPiece: (input) => {
        const id = uid();
        const piece: Piece = {
          ...input,
          id,
          name: input.name.trim(),
          care: input.care,
          createdAt: Date.now(),
          order: nextOrder(get().pieces),
        };
        set({ pieces: [piece, ...get().pieces] });
        return id;
      },
      updatePiece: (id, input) => {
        set({
          pieces: get().pieces.map((piece) => {
            if (piece.id !== id) return piece;
            const kept = owned(piece, input.name.trim(), input.notes);
            return {
              ...piece,
              ...input,
              ...kept,
              name: input.name.trim(),
              colorZh: input.color === piece.color ? piece.colorZh : undefined,
              materialZh: input.material === piece.material ? piece.materialZh : undefined,
              locationZh: input.location === piece.location ? piece.locationZh : undefined,
            };
          }),
        });
      },
      removePieces: (ids) => {
        const drop = new Set(ids);
        set({
          pieces: get().pieces.filter((piece) => !drop.has(piece.id)),
          looks: get().looks.map((look) => ({
            ...look,
            pieceIds: look.pieceIds.filter((id) => !drop.has(id)),
          })),
        });
      },
      commitPieceOrder: (ids) => {
        const rank = new Map(ids.map((id, index) => [id, index]));
        set({
          sort: "custom",
          pieces: get().pieces.map((piece) =>
            rank.has(piece.id) ? { ...piece, order: rank.get(piece.id) ?? piece.order } : piece,
          ),
        });
      },
      addLook: (input) => {
        const id = uid();
        const look: Look = {
          id,
          name: input.name.trim(),
          notes: input.notes,
          pieceIds: input.pieceIds,
          createdAt: Date.now(),
          order: nextOrder(get().looks),
        };
        set({ looks: [look, ...get().looks] });
        return id;
      },
      updateLook: (id, input) => {
        set({
          looks: get().looks.map((look) => {
            if (look.id !== id) return look;
            const kept = owned(look, input.name.trim(), input.notes);
            return { ...look, ...kept, name: input.name.trim(), notes: input.notes, pieceIds: input.pieceIds };
          }),
        });
      },
      removeLooks: (ids) => {
        const drop = new Set(ids);
        set({ looks: get().looks.filter((look) => !drop.has(look.id)) });
      },
      commitLookOrder: (ids) => {
        const rank = new Map(ids.map((id, index) => [id, index]));
        set({
          lookSort: "custom",
          looks: get().looks.map((look) =>
            rank.has(look.id) ? { ...look, order: rank.get(look.id) ?? look.order } : look,
          ),
        });
      },
      eraseAll: () => set({ pieces: [], looks: [] }),
      setCatalog: (catalog) => set({ catalog: normalizeCatalog(catalog) }),
      resetCatalog: () => set({ catalog: defaultCatalog() }),
      exportBackup: () => {
        const { pieces, looks, lang, sort, lookSort, searchField, catalog } = get();
        return JSON.stringify(
          { app: "hem", version: 2, exportedAt: new Date().toISOString(), pieces, looks, lang, sort, lookSort, searchField, catalog },
          null,
          2,
        );
      },
      importBackup: (raw) => {
        let json: unknown;
        try {
          json = JSON.parse(raw);
        } catch {
          return false;
        }
        const parsed = backupSchema.safeParse(json);
        if (!parsed.success) return false;
        set({
          pieces: parsed.data.pieces.map((piece) => ({
            ...piece,
            thicknessMm: piece.thicknessMm ?? null,
            swatchId: piece.swatchId ?? "",
            finish: piece.finish ?? "solid",
          })),
          looks: parsed.data.looks,
          lang: "en",
          sort: parsed.data.sort ?? "custom",
          lookSort: parsed.data.lookSort ?? "custom",
          searchField: parsed.data.searchField ?? get().searchField,
          catalog: parsed.data.catalog ? normalizeCatalog(parsed.data.catalog) : get().catalog,
          notice: "imported",
        });
        return true;
      },
    }),
    {
      name: "hem-wardrobe-v2",
      storage: createJSONStorage(() => safeStorage),
      skipHydration: true,
      partialize: (state): Persisted => ({
        pieces: state.pieces,
        looks: state.looks,
        lang: "en",
        sort: state.sort,
        lookSort: state.lookSort,
        searchField: state.searchField,
        catalog: state.catalog,
      }),
      merge: (persisted, current) => {
        if (!persisted || typeof persisted !== "object") return current;
        const saved = persisted as Partial<Persisted> & { isSample?: boolean };
        delete saved.isSample;
        const cleaned = withoutSamples(saved.pieces ?? current.pieces, saved.looks ?? current.looks);
        return {
          ...current,
          ...saved,
          ...cleaned,
          lang: "en",
          catalog: normalizeCatalog(saved.catalog ?? current.catalog),
        };
      },
    },
  ),
);

export function flagStorageFull() {
  useWardrobe.setState({ storageError: true });
}

