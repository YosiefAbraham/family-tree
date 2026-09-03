"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

/**
 * Simple mode.
 *
 * Most of this app is built for someone who wants to explore: compare two
 * people, isolate a branch, cluster by city, argue about a connection. That is
 * a lot of surface for a relative in their seventies who was sent a link and
 * wants to see the family and add their sister.
 *
 * Simple mode keeps four things — look at the tree, open a person, add a
 * relative, find someone by name — and puts everything else away. It also
 * scales type and touch targets up, because the same person who is defeated by
 * choice is usually also squinting.
 *
 * It is a display preference, not a permission: nothing is forbidden, only
 * hidden, and turning it off restores the full app instantly. Kept in
 * localStorage so it survives reloads without waiting on the network — the
 * cost is that it does not follow them to a second device, which is a fair
 * trade for a setting most people will set once on the device they own.
 */

const STORAGE_KEY = "dynasty.simpleMode";

interface ElderApi {
  /** True when the pared-back interface is showing. */
  simple: boolean;
  setSimple: (on: boolean) => void;
  /** Null until localStorage has been read, so nothing flashes the wrong way. */
  ready: boolean;
}

const ElderContext = createContext<ElderApi>({
  simple: false,
  setSimple: () => {},
  ready: false,
});

export function ElderProvider({ children }: { children: React.ReactNode }) {
  const [simple, setSimpleState] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const on = window.localStorage.getItem(STORAGE_KEY) === "1";
    setSimpleState(on);
    setReady(true);
  }, []);

  // The attribute is what the stylesheet keys off, so the type scale and hit
  // areas change in one place rather than component by component.
  useEffect(() => {
    if (!ready) return;
    document.documentElement.dataset.simple = simple ? "on" : "off";
  }, [simple, ready]);

  const setSimple = useCallback((on: boolean) => {
    setSimpleState(on);
    window.localStorage.setItem(STORAGE_KEY, on ? "1" : "0");
  }, []);

  return (
    <ElderContext.Provider value={{ simple, setSimple, ready }}>
      {children}
    </ElderContext.Provider>
  );
}

export function useSimpleMode() {
  return useContext(ElderContext);
}
