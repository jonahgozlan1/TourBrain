"use client";

import { useEffect, useState } from "react";
import { THEME_STORAGE_KEY, type ThemePreference } from "@/lib/theme-boot";

function resolveTheme(preference: ThemePreference): "light" | "dark" {
  if (preference === "system") {
    return window.matchMedia("(prefers-color-scheme: light)").matches
      ? "light"
      : "dark";
  }
  return preference;
}

export function applyTheme(preference: ThemePreference) {
  const resolved = resolveTheme(preference);
  document.documentElement.dataset.theme = resolved;
  document.documentElement.style.colorScheme = resolved;
}

export function readStoredTheme(): ThemePreference {
  const stored = localStorage.getItem(THEME_STORAGE_KEY);
  if (stored === "light" || stored === "dark" || stored === "system") {
    return stored;
  }
  return "dark";
}

export function useTheme() {
  const [preference, setPreferenceState] = useState<ThemePreference>("dark");

  useEffect(() => {
    const stored = readStoredTheme();
    setPreferenceState(stored);
    applyTheme(stored);

    const media = window.matchMedia("(prefers-color-scheme: light)");
    function onSystemChange() {
      const current = readStoredTheme();
      if (current === "system") applyTheme("system");
    }
    media.addEventListener("change", onSystemChange);
    return () => media.removeEventListener("change", onSystemChange);
  }, []);

  function setPreference(next: ThemePreference) {
    localStorage.setItem(THEME_STORAGE_KEY, next);
    setPreferenceState(next);
    applyTheme(next);
  }

  return { preference, setPreference };
}
