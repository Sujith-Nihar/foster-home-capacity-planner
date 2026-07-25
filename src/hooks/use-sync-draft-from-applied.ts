"use client";

import { useEffect, useRef } from "react";

export function useSyncDraftFromApplied<T>(
  applied: T,
  sync: (applied: T) => void,
  serialize: (applied: T) => string = JSON.stringify,
) {
  const isInitialMount = useRef(true);
  const appliedKey = serialize(applied);
  const previousKey = useRef(appliedKey);

  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      previousKey.current = appliedKey;
      return;
    }

    if (previousKey.current === appliedKey) {
      return;
    }

    previousKey.current = appliedKey;
    sync(applied);
  }, [applied, appliedKey, sync]);
}
