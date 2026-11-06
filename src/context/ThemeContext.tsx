import React, { createContext, useContext, useState, useEffect } from "react";
import { ThemeMode, UserSettings } from "../types";

interface ThemeContextType {
  theme: ThemeMode;
  resolvedTheme: "dark" | "light";
  setTheme: (theme: ThemeMode) => void;
  toggleTheme: () => void;
  settings: UserSettings;
  updateSettings: (newSettings: Partial<UserSettings>) => void;
}

const DEFAULT_SETTINGS: UserSettings = {
  theme: "dark",
  fontDensity: "standard",
  telemetryRefreshRate: "30s",
  notifyOnCompressionComplete: true,
  notifyOnLosslessVerified: true,
  highContrastCode: false,
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<UserSettings>(() => {
    try {
      const saved = localStorage.getItem("cloud_optima_settings");
      if (saved) {
        return { ...DEFAULT_SETTINGS, ...JSON.parse(saved) };
      }
      const savedTheme = localStorage.getItem("cloud_optima_theme") as ThemeMode | null;
      if (savedTheme) {
        return { ...DEFAULT_SETTINGS, theme: savedTheme };
      }
    } catch (e) {
      console.error(e);
    }
    return DEFAULT_SETTINGS;
  });

  const [resolvedTheme, setResolvedTheme] = useState<"dark" | "light">("dark");

  // Determine resolved theme based on settings.theme and system preference
  useEffect(() => {
    const computeTheme = (): "dark" | "light" => {
      if (settings.theme === "system") {
        return window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches
          ? "dark"
          : "light";
      }
      return settings.theme;
    };

    const currentResolved = computeTheme();
    setResolvedTheme(currentResolved);

    // Apply classes to root element and body
    const root = document.documentElement;
    const body = document.body;

    if (currentResolved === "light") {
      root.classList.remove("dark");
      root.classList.add("light");
      root.classList.add("theme-light");
      root.classList.remove("theme-dark");
      body.classList.remove("dark");
      body.classList.add("light");
      body.classList.add("theme-light");
      body.classList.remove("theme-dark");
    } else {
      root.classList.remove("light");
      root.classList.add("dark");
      root.classList.add("theme-dark");
      root.classList.remove("theme-light");
      body.classList.remove("light");
      body.classList.add("dark");
      body.classList.add("theme-dark");
      body.classList.remove("theme-light");
    }

    // Listener for system theme change
    if (settings.theme === "system") {
      const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
      const handleChange = () => {
        const newResolved = mediaQuery.matches ? "dark" : "light";
        setResolvedTheme(newResolved);
        if (newResolved === "light") {
          root.classList.remove("dark");
          root.classList.add("light", "theme-light");
          body.classList.remove("dark");
          body.classList.add("light", "theme-light");
        } else {
          root.classList.remove("light", "theme-light");
          root.classList.add("dark", "theme-dark");
          body.classList.remove("light", "theme-light");
          body.classList.add("dark", "theme-dark");
        }
      };

      mediaQuery.addEventListener("change", handleChange);
      return () => mediaQuery.removeEventListener("change", handleChange);
    }
  }, [settings.theme]);

  const setTheme = (newTheme: ThemeMode) => {
    updateSettings({ theme: newTheme });
    try {
      localStorage.setItem("cloud_optima_theme", newTheme);
    } catch (e) {
      console.error(e);
    }
  };

  const toggleTheme = () => {
    const next = resolvedTheme === "dark" ? "light" : "dark";
    setTheme(next);
  };

  const updateSettings = (newSettings: Partial<UserSettings>) => {
    setSettings((prev) => {
      const updated = { ...prev, ...newSettings };
      try {
        localStorage.setItem("cloud_optima_settings", JSON.stringify(updated));
        if (newSettings.theme) {
          localStorage.setItem("cloud_optima_theme", newSettings.theme);
        }
      } catch (e) {
        console.error(e);
      }
      return updated;
    });
  };

  return (
    <ThemeContext.Provider
      value={{
        theme: settings.theme,
        resolvedTheme,
        setTheme,
        toggleTheme,
        settings,
        updateSettings,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};
