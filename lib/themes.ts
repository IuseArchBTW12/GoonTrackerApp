// Theme definitions with color schemes
export const THEMES = {
  dark: {
    name: "Dark Mode",
    icon: "🌙",
    description: "Classic dark theme",
    colors: {
      primary: "#6366f1",
      secondary: "#8b5cf6",
      accent: "#06b6d4",
      background: "#0f0f23",
      surface: "#1a1a2e",
    },
  },
  light: {
    name: "Light Mode",
    icon: "☀️",
    description: "Clean light theme",
    colors: {
      primary: "#6366f1",
      secondary: "#8b5cf6",
      accent: "#06b6d4",
      background: "#ffffff",
      surface: "#f5f5f5",
    },
  },
  original: {
    name: "Original",
    icon: "⚡",
    description: "Default GoonTracker theme",
    colors: {
      primary: "#6366f1",
      secondary: "#8b5cf6",
      accent: "#06b6d4",
      background: "#0f0f23",
      surface: "#1a1a2e",
    },
  },
  gay: {
    name: "Gay Pride",
    icon: "🏳️‍🌈",
    description: "Rainbow pride colors",
    colors: {
      primary: "#e40303",
      secondary: "#ff8c00",
      accent: "#008026",
      background: "#1a0a2e",
      surface: "#2d1b4e",
    },
  },
  lesbian: {
    name: "Lesbian Pride",
    icon: "💖",
    description: "Sunset lesbian flag colors",
    colors: {
      primary: "#d62900",
      secondary: "#ff9a56",
      accent: "#d462a6",
      background: "#1a0e1f",
      surface: "#2d1a2e",
    },
  },
  trans: {
    name: "Trans Pride",
    icon: "🏳️‍⚧️",
    description: "Trans flag colors",
    colors: {
      primary: "#5bcefa",
      secondary: "#f5a9b8",
      accent: "#ffffff",
      background: "#1a1a2e",
      surface: "#252541",
    },
  },
  femboy: {
    name: "Femboy",
    icon: "💕",
    description: "Soft pink & blue aesthetic",
    colors: {
      primary: "#ff69b4",
      secondary: "#ff85c1",
      accent: "#87ceeb",
      background: "#1f1425",
      surface: "#2d1a35",
    },
  },
  bi: {
    name: "Bi Pride",
    icon: "💜",
    description: "Bisexual flag colors",
    colors: {
      primary: "#d60270",
      secondary: "#9b4f96",
      accent: "#0038a8",
      background: "#1a0e2e",
      surface: "#2d1a4e",
    },
  },
  pan: {
    name: "Pan Pride",
    icon: "💗",
    description: "Pansexual flag colors",
    colors: {
      primary: "#ff218c",
      secondary: "#ffd800",
      accent: "#21b1ff",
      background: "#1a1a2e",
      surface: "#2d2541",
    },
  },
  ace: {
    name: "Ace Pride",
    icon: "🖤",
    description: "Asexual flag colors",
    colors: {
      primary: "#a3a3a3",
      secondary: "#ffffff",
      accent: "#800080",
      background: "#0f0f0f",
      surface: "#1f1f1f",
    },
  },
} as const;

export type ThemeName = keyof typeof THEMES;

// Apply theme to document
export function applyTheme(themeName: ThemeName) {
  const theme = THEMES[themeName];
  if (!theme) return;

  const root = document.documentElement;
  
  // Set CSS variables
  root.style.setProperty("--color-primary", theme.colors.primary);
  root.style.setProperty("--color-secondary", theme.colors.secondary);
  root.style.setProperty("--color-accent", theme.colors.accent);
  root.style.setProperty("--color-background", theme.colors.background);
  root.style.setProperty("--color-surface", theme.colors.surface);

  // Set data attribute for theme-specific styles
  root.setAttribute("data-theme", themeName);
  
  // Update localStorage
  localStorage.setItem("theme", themeName);
}

// Get current theme from localStorage
export function getCurrentTheme(): ThemeName {
  if (typeof window === "undefined") return "dark";
  return (localStorage.getItem("theme") as ThemeName) || "dark";
}
