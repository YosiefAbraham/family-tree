"use client";

import { useMemo } from "react";
import { DEMO_CURRENT_USER, DEMO_STORE } from "./demoFamily";
import { StoreContext, type StoreApi } from "./store";

const LOOK_ONLY = "This is a sample tree — you can look around, not edit it.";

function reject(): Promise<never> {
  return Promise.reject(new Error(LOOK_ONLY));
}

export function DemoStoreProvider({ children }: { children: React.ReactNode }) {
  const api = useMemo<StoreApi>(
    () => ({
      readOnly: true,
      state: DEMO_STORE,
      hydrated: true,
      loadError: null,
      currentUser: DEMO_CURRENT_USER,
      refresh: async () => {},
      signOut: async () => {},
      createFamily: reject,
      createPersonInvite: reject,
      peekPersonInvite: async () => null,
      acceptPersonInvite: async () => ({ ok: false, error: LOOK_ONLY }),
      addPerson: reject,
      updatePerson: reject,
      deletePerson: reject,
      addChildren: reject,
      addRelationship: async () => ({ ok: false, error: LOOK_ONLY }),
      updateRelationship: reject,
      deleteRelationship: reject,
      removeMember: reject,
      claimPerson: reject,
      unclaimPerson: reject,
      setPersonLineage: reject,
      setReaction: reject,
      setPersonDetail: reject,
      setPersonVoice: reject,
      setPersonPhoto: reject,
      addPhoto: reject,
      removePhoto: reject,
      addComment: reject,
      removeComment: reject,
      dismissSuggestion: reject,
      editsFor: (entityId) => DEMO_STORE.edits.filter((e) => e.entityId === entityId),
      ensureEdits: () => {},
    }),
    []
  );

  return <StoreContext.Provider value={api}>{children}</StoreContext.Provider>;
}
