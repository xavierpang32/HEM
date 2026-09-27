import { Plus, Settings } from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";
import { cn } from "@/lib/cn";
import { sortLooks, sortPieces } from "@/lib/wardrobe/logic";
import { flagStorageFull, useWardrobe } from "@/lib/wardrobe/store";
import { ClosetPane } from "./closet";
import { LookDetail, LookForm, LooksPane } from "./looks";
import { Overview } from "./overview";
import { PieceDetail, PieceForm } from "./piece-view";
import { SettingsDialog } from "./settings";
import { useCopy } from "./use-copy";

type Tab = "closet" | "looks" | "overview";
type View =
  | { kind: "browse" }
  | { kind: "piece"; id: string }
  | { kind: "piece-form"; id: string | null; returnTo?: string }
  | { kind: "look"; id: string }
  | { kind: "look-form"; id: string | null; returnTo?: string };

function useWide() {
  const [wide, setWide] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 768px)");
    const apply = () => setWide(mq.matches);
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, []);
  return wide;
}

export function WardrobeApp() {
  const { c, lang } = useCopy();
  const wide = useWide();
  const pieces = useWardrobe((s) => s.pieces);
  const looks = useWardrobe((s) => s.looks);
  const sort = useWardrobe((s) => s.sort);
  const lookSort = useWardrobe((s) => s.lookSort);
  const storageError = useWardrobe((s) => s.storageError);
  const clearNotice = useWardrobe((s) => s.clearNotice);

  const [tab, setTab] = useState<Tab>("closet");
  const [view, setView] = useState<View>({ kind: "browse" });
  const [settings, setSettings] = useState(false);
  const [category, setCategory] = useState("all");
  const [status, setStatus] = useState("all");

  useEffect(() => {
    const persistApi = useWardrobe.persist;
    const finish = () => {
      document.documentElement.lang = "en";
    };
    const unsub = persistApi.onFinishHydration(finish);
    if (persistApi.hasHydrated()) finish();
    else void persistApi.rehydrate();
    const onFull = () => flagStorageFull();
    window.addEventListener("hem-storage-full", onFull);
    return () => {
      unsub();
      window.removeEventListener("hem-storage-full", onFull);
    };
  }, []);

  useEffect(() => {
    document.documentElement.lang = "en";
  }, [lang]);

  useEffect(() => {
    if (!wide) return;
    if (tab === "closet") {
      if (view.kind === "piece" && pieces.some((piece) => piece.id === view.id)) return;
      if (view.kind !== "browse") return;
      const first = sortPieces(pieces, sort, lang)[0];
      if (first) setView({ kind: "piece", id: first.id });
    }
    if (tab === "looks") {
      if (view.kind === "look" && looks.some((look) => look.id === view.id)) return;
      if (view.kind !== "browse") return;
      const first = sortLooks(looks, lookSort, lang)[0];
      if (first) setView({ kind: "look", id: first.id });
    }
  }, [wide, tab, pieces, looks, sort, lookSort, lang, view]);

  const mobileStack = !wide && (view.kind === "piece" || view.kind === "look");
  const showAdd = tab !== "overview" && !mobileStack;

  function changeTab(next: Tab) {
    setTab(next);
    setView({ kind: "browse" });
  }

  function openPiece(id: string) {
    setTab("closet");
    setView({ kind: "piece", id });
  }

  return (
    <div className="min-h-dvh bg-paper text-ink">
      <div className={cn("min-h-dvh", tab !== "overview" && "md:flex")}>
        <section
          className={cn(
            "flex min-h-dvh flex-col",
            tab !== "overview" && "md:sticky md:top-0 md:h-dvh md:max-h-dvh md:w-rail md:shrink-0 md:border-r md:border-line",
            mobileStack && "hidden",
          )}
        >
          <header className="px-4 pt-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-display text-4xl leading-none tracking-tight">Hem</p>
                <p className="mt-1 text-sm text-muted">
                  {tab === "looks" ? c.looks : tab === "overview" ? c.tagline : c.pieces(pieces.length)}
                </p>
              </div>
              <button type="button" className="grid size-11 place-items-center rounded-full border border-line" aria-label={c.settings} onClick={() => setSettings(true)}>
                <Settings className="size-5" />
              </button>
            </div>
            {storageError ? (
              <button type="button" className="mt-3 w-full rounded-2xl bg-accent-soft px-3 py-2 text-left text-sm" onClick={clearNotice}>
                {c.storageFull}
              </button>
            ) : null}
            <div className="mt-4 hidden gap-2 md:flex">
              <TabButton active={tab === "closet"} onClick={() => changeTab("closet")}>{c.closet}</TabButton>
              <TabButton active={tab === "looks"} onClick={() => changeTab("looks")}>{c.looks}</TabButton>
              <TabButton active={tab === "overview"} onClick={() => changeTab("overview")}>{c.overview}</TabButton>
            </div>
          </header>

          {tab === "closet" ? (
            <ClosetPane
              activeId={view.kind === "piece" ? view.id : undefined}
              category={category}
              status={status}
              onCategory={setCategory}
              onStatus={setStatus}
              onOpen={(id) => setView({ kind: "piece", id })}
              onAdd={() => setView({ kind: "piece-form", id: null })}
            />
          ) : null}
          {tab === "looks" ? (
            <LooksPane
              activeId={view.kind === "look" ? view.id : undefined}
              onOpen={(id) => setView({ kind: "look", id })}
              onAdd={() => setView({ kind: "look-form", id: null })}
            />
          ) : null}
          {tab === "overview" ? (
            <Overview
              onOpenPiece={openPiece}
              onSeeAttention={() => {
                setStatus("attention");
                setCategory("all");
                setTab("closet");
                const first = pieces.find(
                  (piece) => piece.status === "loan" || piece.status === "cleaner" || piece.status === "repair",
                );
                setView(first ? { kind: "piece", id: first.id } : { kind: "browse" });
              }}
            />
          ) : null}
        </section>

        {tab !== "overview" ? (
          <aside className="hidden min-w-0 flex-1 bg-paper md:block">
            {view.kind === "piece" ? (
              <PieceDetail
                id={view.id}
                wide
                onBack={() => setView({ kind: "browse" })}
                onEdit={() => setView({ kind: "piece-form", id: view.id, returnTo: view.id })}
              />
            ) : null}
            {view.kind === "look" ? (
              <LookDetail
                id={view.id}
                wide
                onBack={() => setView({ kind: "browse" })}
                onEdit={() => setView({ kind: "look-form", id: view.id, returnTo: view.id })}
                onOpenPiece={openPiece}
              />
            ) : null}
            {view.kind === "browse" ? (
              <div className="flex h-full items-center justify-center px-10">
                <p className="max-w-xs text-center font-display text-3xl text-muted">{c.tagline}</p>
              </div>
            ) : null}
          </aside>
        ) : null}
      </div>

      {mobileStack && view.kind === "piece" ? (
        <div className="fixed inset-0 z-20 overflow-y-auto bg-paper">
          <PieceDetail
            id={view.id}
            onBack={() => setView({ kind: "browse" })}
            onEdit={() => setView({ kind: "piece-form", id: view.id, returnTo: view.id })}
          />
        </div>
      ) : null}
      {mobileStack && view.kind === "look" ? (
        <div className="fixed inset-0 z-20 overflow-y-auto bg-paper">
          <LookDetail
            id={view.id}
            onBack={() => setView({ kind: "browse" })}
            onEdit={() => setView({ kind: "look-form", id: view.id, returnTo: view.id })}
            onOpenPiece={openPiece}
          />
        </div>
      ) : null}

      {view.kind === "piece-form" ? (
        <PieceForm
          id={view.id}
          onClose={() => setView(view.returnTo ? { kind: "piece", id: view.returnTo } : { kind: "browse" })}
          onSaved={(id) => setView({ kind: "piece", id })}
        />
      ) : null}
      {view.kind === "look-form" ? (
        <LookForm
          id={view.id}
          onClose={() => setView(view.returnTo ? { kind: "look", id: view.returnTo } : { kind: "browse" })}
          onSaved={(id) => {
            setTab("looks");
            setView({ kind: "look", id });
          }}
        />
      ) : null}

      {showAdd ? (
        <button
          type="button"
          className="fixed right-4 bottom-24 z-20 grid size-14 place-items-center rounded-full bg-accent text-sheet shadow-md md:hidden"
          aria-label={tab === "looks" ? c.addLook : c.addPiece}
          onClick={() => setView(tab === "looks" ? { kind: "look-form", id: null } : { kind: "piece-form", id: null })}
        >
          <Plus className="size-6" />
        </button>
      ) : null}

      <nav className={cn("fixed inset-x-0 bottom-0 z-20 border-t border-line bg-sheet md:hidden", mobileStack && "hidden")}>
        <div className="mx-auto grid h-16 max-w-lg grid-cols-3">
          <NavButton active={tab === "closet"} onClick={() => changeTab("closet")}>{c.closet}</NavButton>
          <NavButton active={tab === "looks"} onClick={() => changeTab("looks")}>{c.looks}</NavButton>
          <NavButton active={tab === "overview"} onClick={() => changeTab("overview")}>{c.overview}</NavButton>
        </div>
      </nav>

      <SettingsDialog open={settings} onClose={() => setSettings(false)} />
    </div>
  );
}

function TabButton({ active, onClick, children }: { active: boolean; onClick: () => void; children: ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn("h-10 rounded-full px-4 text-sm", active ? "bg-ink text-sheet" : "text-muted")}
    >
      {children}
    </button>
  );
}

function NavButton({ active, onClick, children }: { active: boolean; onClick: () => void; children: ReactNode }) {
  return (
    <button type="button" onClick={onClick} className={cn("text-sm", active ? "text-ink" : "text-muted")}>
      {children}
    </button>
  );
}
