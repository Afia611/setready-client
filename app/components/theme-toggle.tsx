"use client";

import { useEffect } from "react";

import { themeStorageKey } from "@/lib/theme";

export default function ThemeToggle() {
  useEffect(() => {
    function syncTheme(event: StorageEvent) {
      if (event.key === themeStorageKey) {
        document.documentElement.dataset.theme =
          event.newValue === "dark" ? "dark" : "light";
      }
    }

    window.addEventListener("storage", syncTheme);
    return () => window.removeEventListener("storage", syncTheme);
  }, []);

  function toggleTheme() {
    const root = document.documentElement;
    const theme = root.dataset.theme === "dark" ? "light" : "dark";
    root.dataset.theme = theme;
    try {
      window.localStorage.setItem(themeStorageKey, theme);
    } catch {
      // The toggle still works for this page if storage is unavailable.
    }
  }

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className="fixed right-4 bottom-4 z-30 rounded-full border border-stone-300 bg-white px-4 py-2 text-sm font-semibold text-zinc-950 shadow-md hover:border-amber-500 focus-visible:outline-2 focus-visible:outline-offset-2"
    >
      <span className="dark:hidden">Dark mode</span>
      <span className="hidden dark:inline">Light mode</span>
    </button>
  );
}
