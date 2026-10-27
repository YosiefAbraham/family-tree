"use client";

import Link from "next/link";
import { useDeferredValue, useMemo, useState } from "react";
import { DemoStoreProvider } from "@/lib/demoStore";
import { DEMO_FAMILY_ID } from "@/lib/demoFamily";
import { useStore } from "@/lib/store";
import { findPath, personMatch, personMatches } from "@/lib/helpers";
import { useNarrow } from "@/lib/useNarrow";
import {
  TreeCanvas,
  type PathHighlight,
  type Selection,
  type ViewMode,
} from "@/components/TreeCanvas";
import { DetailPanel } from "@/components/DetailPanel";
import { RelationshipModal } from "@/components/RelationshipModal";
import { Avatar } from "@/components/ui";
import dynamic from "next/dynamic";
import { CLUSTER_OPTIONS, isAssignedToCluster, type ClusterKey } from "@/lib/cluster";

const GlobeView = dynamic(
  () => import("@/components/GlobeView").then((m) => m.GlobeView),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-full items-center justify-center bg-stone-50">
        <span
          className="h-6 w-6 animate-spin rounded-full border-2 border-stone-300 border-t-teal-800"
          aria-hidden
        />
      </div>
    ),
  }
);

const VIEWS = [
  { key: "tree", label: "Tree" },
  { key: "clusters", label: "Clusters" },
  { key: "map", label: "Map" },
] as const;

const noop = () => {};

export function DemoTree() {
  return (
    <DemoStoreProvider>
      <DemoTreeInner />
    </DemoStoreProvider>
  );
}

function DemoTreeInner() {
  const { state, currentUser } = useStore();
  const familyId = DEMO_FAMILY_ID;
  const family = state.families[0];
  const people = state.people;
  const members = state.memberships;
  const narrow = useNarrow();

  const [selection, setSelection] = useState<Selection | null>(null);
  const [meMode, setMeMode] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>("tree");
  const [isolatedId, setIsolatedId] = useState<string | null>(null);
  const [clusterKey, setClusterKey] = useState<ClusterKey>("currentCity");
  const [search, setSearch] = useState("");
  const [searchFocused, setSearchFocused] = useState(false);
  const [mobileSearch, setMobileSearch] = useState(false);
  const [focusPersonId, setFocusPersonId] = useState<string | null>(null);
  const [focusNonce, setFocusNonce] = useState(0);
  const [tracedPath, setTracedPath] = useState<PathHighlight | null>(null);
  const [compareOpen, setCompareOpen] = useState(false);
  const [compareAId, setCompareAId] = useState<string | null>(null);
  const [compareBId, setCompareBId] = useState<string | null>(null);
  const [pickingFor, setPickingFor] = useState<"a" | "b" | null>(null);

  const deferredSearch = useDeferredValue(search);
  const disputedCount = useMemo(() => {
    const disputed = new Set(
      state.confirmations.filter((c) => c.type === "DISPUTE").map((c) => c.relationshipId)
    );
    return state.relationships.filter((r) => disputed.has(r.id)).length;
  }, [state.confirmations, state.relationships]);

  const q = search.trim();
  const searchResults = useMemo(() => {
    if (!q) return [];
    return people
      .filter((p) => personMatches(p, q))
      .map((p) => ({ person: p, hint: personMatch(p, q) }));
  }, [search, people, q]);

  const mePersonId = useMemo(
    () => people.find((p) => p.accountUserId === currentUser?.id)?.id ?? null,
    [people, currentUser?.id]
  );

  const pathHighlight: PathHighlight | null = useMemo(() => {
    if (tracedPath) return tracedPath;
    if (!meMode || !mePersonId) return null;
    if (selection?.kind !== "person" || selection.id === mePersonId) return null;
    const path = findPath(state.relationships, mePersonId, selection.id);
    return path ? { personIds: path.personIds, relationshipIds: path.relationshipIds } : null;
  }, [meMode, mePersonId, selection, state.relationships, tracedPath]);

  const selectPerson = (id: string) => {
    setSelection({ kind: "person", id });
    setFocusPersonId(id);
    setFocusNonce((n) => n + 1);
  };

  return (
    <div className="flex h-[100dvh] flex-col bg-stone-50">
      <div className="z-20 border-b border-amber-200 bg-amber-50 px-4 py-2 text-center text-xs text-amber-950 sm:text-sm">
        This is a sample tree. You can look around — nothing is saved.{" "}
        <Link href="/signup" className="font-semibold underline underline-offset-2">
          Start your own
        </Link>
      </div>

      <header className="z-20 flex shrink-0 items-center gap-2 border-b border-stone-200 bg-white px-3 py-2 sm:gap-3 sm:px-4">
        <Link
          href="/"
          aria-label="Back to Dynasty"
          className="shrink-0 rounded-lg p-1.5 text-stone-500 transition hover:bg-stone-100 hover:text-stone-700"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
        </Link>

        <div className="min-w-0 flex-1">
          <h1 className="font-display truncate text-base font-semibold leading-tight text-stone-900 sm:text-lg">
            {family.name}
          </h1>
          <p className="truncate text-xs text-stone-500">
            Sample · {people.length} people · {members.length} members
            {disputedCount > 0 && (
              <span className="text-red-500">
                {" "}
                · {disputedCount} disputed {disputedCount === 1 ? "branch" : "branches"}
              </span>
            )}
          </p>
        </div>

        <div className="hidden shrink-0 items-center rounded-xl bg-stone-100 p-0.5 sm:flex">
          {VIEWS.map((v) => (
            <button
              key={v.key}
              onClick={() => setViewMode(v.key)}
              className={`rounded-[10px] px-3 py-1.5 text-xs font-semibold transition ${
                viewMode === v.key
                  ? "bg-white text-teal-900 shadow-sm ring-1 ring-stone-900/5"
                  : "text-stone-500 hover:text-stone-700"
              }`}
            >
              {v.label}
            </button>
          ))}
        </div>

        <div className="relative hidden w-56 md:block">
          <svg
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-stone-500"
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          >
            <circle cx="11" cy="11" r="7" />
            <path d="m21 21-4.3-4.3" />
          </svg>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setTimeout(() => setSearchFocused(false), 150)}
            placeholder="Find someone…"
            className="w-full rounded-xl border border-stone-200 bg-stone-50 py-2 pl-9 pr-3 text-sm outline-none transition placeholder:text-stone-500 focus:border-teal-600 focus:bg-white focus:ring-2 focus:ring-teal-600/15"
          />
          {searchFocused && searchResults.length > 0 && (
            <ul className="absolute left-0 right-0 top-full z-30 mt-1.5 overflow-hidden rounded-xl border border-stone-200 bg-white py-1 shadow-lg">
              {searchResults.map(({ person: p, hint }) => (
                <li key={p.id}>
                  <button
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => {
                      selectPerson(p.id);
                      setSearch("");
                    }}
                    className="flex w-full items-center gap-2.5 px-3 py-2 text-left transition hover:bg-stone-50"
                  >
                    <Avatar name={p.name} id={p.name} size={24} src={p.photoUrl} />
                    <span className="min-w-0">
                      <span className="block truncate text-sm text-stone-700">{p.name}</span>
                      {hint && (
                        <span className="block truncate text-[11px] text-stone-500">{hint}</span>
                      )}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <button
          onClick={() => setMobileSearch((v) => !v)}
          aria-label="Search"
          className="shrink-0 rounded-lg p-2 text-stone-500 transition hover:bg-stone-100 md:hidden"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <circle cx="11" cy="11" r="7" />
            <path d="m21 21-4.3-4.3" />
          </svg>
        </button>

        <Link
          href="/signup"
          className="hidden rounded-xl bg-teal-800 px-3 py-2 text-xs font-semibold text-white transition hover:bg-teal-700 sm:inline-flex"
        >
          Start your tree
        </Link>
      </header>

      {mobileSearch && (
        <div className="fixed inset-0 z-50 flex flex-col bg-white pt-[env(safe-area-inset-top)] md:hidden">
          <div className="flex items-center gap-2 border-b border-stone-100 px-3 py-2">
            <input
              autoFocus
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Find someone by name, city, college…"
              className="min-w-0 flex-1 rounded-xl border border-stone-200 bg-stone-50 px-3.5 py-2.5 text-base outline-none"
            />
            <button
              type="button"
              onClick={() => {
                setMobileSearch(false);
                setSearch("");
              }}
              className="shrink-0 px-2 py-2 text-sm font-semibold text-teal-800"
            >
              Cancel
            </button>
          </div>
          <ul className="min-h-0 flex-1 overflow-y-auto">
            {search.trim() && searchResults.length === 0 && (
              <li className="px-5 py-8 text-sm text-stone-500">No one matches that.</li>
            )}
            {searchResults.map(({ person: p, hint }) => (
              <li key={p.id}>
                <button
                  onClick={() => {
                    selectPerson(p.id);
                    setSearch("");
                    setMobileSearch(false);
                  }}
                  className="flex w-full items-center gap-3 px-5 py-3 text-left transition hover:bg-stone-50"
                >
                  <Avatar name={p.name} id={p.name} size={36} src={p.photoUrl} />
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-medium text-stone-800">{p.name}</span>
                    {hint && <span className="block truncate text-xs text-stone-500">{hint}</span>}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="relative min-h-0 flex-1">
        {viewMode === "map" ? (
          <GlobeView people={people} onSelectPerson={selectPerson} />
        ) : (
          <TreeCanvas
            familyId={familyId}
            selection={selection}
            onSelect={(s) => {
              if (pickingFor && s?.kind === "person") {
                if (pickingFor === "a") setCompareAId(s.id);
                else setCompareBId(s.id);
                setPickingFor(null);
                setCompareOpen(true);
                return;
              }
              setSelection(s);
            }}
            searchQuery={deferredSearch}
            focusPersonId={focusPersonId}
            focusNonce={focusNonce}
            highlight={pathHighlight}
            mode={viewMode}
            clusterKey={clusterKey}
            isolateId={isolatedId}
            rightInset={selection && !narrow ? 356 : 0}
            onQuickAdd={noop}
          />
        )}

        {viewMode === "clusters" && (
          <div className="pointer-events-none absolute inset-x-3 top-3 z-10 flex flex-col items-start gap-2 sm:inset-x-4 sm:top-4">
            <div className="pointer-events-auto flex max-w-full flex-wrap items-center gap-2 rounded-xl border border-stone-200/80 bg-white/95 px-2.5 py-1.5 shadow-sm backdrop-blur">
              <span className="hidden text-xs font-semibold uppercase tracking-wider text-stone-500 sm:inline">
                Cluster by
              </span>
              <select
                value={clusterKey}
                onChange={(e) => setClusterKey(e.target.value as ClusterKey)}
                className="rounded-lg border border-stone-200 bg-white px-2.5 py-1.5 text-sm font-medium text-stone-800 outline-none"
              >
                {CLUSTER_OPTIONS.map((o) => (
                  <option key={o.key} value={o.key}>
                    {o.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}

        {viewMode === "clusters" &&
          people.every((p) => !isAssignedToCluster(p, clusterKey)) && (
            <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center">
              <p className="rounded-2xl border border-stone-200 bg-white px-6 py-4 text-sm text-stone-500 shadow">
                Nobody has a {CLUSTER_OPTIONS.find((o) => o.key === clusterKey)?.label.toLowerCase()} yet.
              </p>
            </div>
          )}

        {isolatedId && !tracedPath && !pickingFor && viewMode === "tree" && (
          <div className="absolute left-1/2 top-3 z-10 flex -translate-x-1/2 items-center gap-2 rounded-full border border-teal-700/25 bg-white/95 py-1.5 pl-4 pr-1.5 shadow-md">
            <span className="text-xs text-stone-600 sm:text-sm">
              <span className="font-semibold text-stone-900">
                {people.find((p) => p.id === isolatedId)?.name}
              </span>
              &apos;s family
            </span>
            <button
              onClick={() => setIsolatedId(null)}
              className="rounded-full bg-stone-100 px-3 py-1 text-xs font-semibold text-stone-600"
            >
              Show all
            </button>
          </div>
        )}

        {tracedPath && viewMode === "tree" && (
          <div className="absolute left-1/2 top-3 z-10 flex -translate-x-1/2 items-center gap-2 rounded-full border border-teal-700/25 bg-white/95 py-1.5 pl-4 pr-1.5 shadow-md">
            <span className="text-xs text-stone-600 sm:text-sm">
              Path on the tree
            </span>
            <button
              onClick={() => setTracedPath(null)}
              className="rounded-full bg-stone-100 px-3 py-1 text-xs font-semibold text-stone-600"
            >
              Clear
            </button>
          </div>
        )}

        {viewMode === "tree" && (
          <div className="pointer-events-none absolute bottom-4 left-4 z-10 hidden rounded-xl border border-stone-200/80 bg-white/90 px-3.5 py-2.5 text-[11px] text-stone-500 shadow-sm sm:block">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1.5">
                <span className="h-3.5 w-1.5 rounded-sm bg-teal-700" />
                blood
              </span>
              <span className="flex items-center gap-1.5">
                <span className="h-3.5 w-1.5 rounded-sm" style={{ background: "#c2620c" }} />
                married in
              </span>
              <span className="flex items-center gap-1.5">
                <span className="h-3.5 w-px bg-stone-200" />
                dashed red = disputed
              </span>
            </div>
          </div>
        )}

        {selection && (
          <div className="absolute inset-x-0 bottom-0 z-20 flex h-[72%] max-h-full flex-col overflow-hidden sm:inset-x-auto sm:bottom-4 sm:right-4 sm:top-4 sm:h-auto sm:max-h-none">
            <DetailPanel
              selection={selection}
              onClose={() => setSelection(null)}
              onSelectPerson={selectPerson}
              onSelectRelationship={(id) => setSelection({ kind: "relationship", id })}
              onInvite={noop}
              mePersonId={mePersonId}
              meModeOn={meMode}
              onToggleMeMode={() => setMeMode((m) => !m)}
              pathFound={!!pathHighlight}
              isolatedId={isolatedId}
              onToggleIsolate={(id) => {
                setIsolatedId((cur) => (cur === id ? null : id));
                setViewMode("tree");
              }}
              onCompare={(id) => {
                setCompareAId(id);
                setCompareBId(null);
                setCompareOpen(true);
              }}
              onAddRelative={noop}
              onAddChildren={noop}
              onConnectFrom={noop}
            />
          </div>
        )}
      </div>

      <nav
        aria-label="Views"
        className="z-20 shrink-0 border-t border-stone-200 bg-white pb-[env(safe-area-inset-bottom)] sm:hidden"
      >
        <div className="grid grid-cols-3">
          {VIEWS.map((v) => (
            <button
              key={v.key}
              type="button"
              onClick={() => setViewMode(v.key)}
              className={`flex min-h-11 items-center justify-center px-2 text-sm font-semibold ${
                viewMode === v.key ? "text-teal-800" : "text-stone-500"
              }`}
            >
              {v.label}
            </button>
          ))}
        </div>
      </nav>

      <RelationshipModal
        open={compareOpen}
        onClose={() => {
          setCompareOpen(false);
          setPickingFor(null);
        }}
        people={people}
        aId={compareAId}
        bId={compareBId}
        mePersonId={mePersonId}
        onChangeA={setCompareAId}
        onChangeB={setCompareBId}
        onSwap={() => {
          setCompareAId(compareBId);
          setCompareBId(compareAId);
        }}
        onPickFromTree={(which) => {
          setPickingFor(which);
          setCompareOpen(false);
        }}
        onShowPath={(path) => {
          setTracedPath(path);
          setCompareOpen(false);
          setViewMode("tree");
        }}
        onSelectPerson={selectPerson}
      />

    </div>
  );
}
