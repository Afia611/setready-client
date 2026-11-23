export const themeStorageKey = "setready-theme";

export const themeInitializer = `
  (() => {
    let theme = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
    try {
      const saved = window.localStorage.getItem(${JSON.stringify(themeStorageKey)});
      if (saved === "dark" || saved === "light") theme = saved;
    } catch {}
    document.documentElement.dataset.theme = theme;
  })();
`;
