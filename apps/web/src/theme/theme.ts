export const theme = {
  colors: {
    home: {
      bg: "#02050b",
      panel: "#071320",
      radarPanel: "#06111d",
      textPrimary: "#f1f5f9",
      textSecondary: "#bfdbfe",
      textMuted: "rgba(224,242,254,0.66)",
      accent: "#38bdf8",
      gold: "#f6c768",
      goldText: "#ffe6a6",
    },
    surface: {
      bg: "#ffffff",
      mutedBg: "#f8fafc",
      tagBg: "#f1f5f9",
      priceBg: "#fffbeb",
      priceBorder: "#fde68a",
      border: "#e2e8f0",
      borderSoft: "#eef2f7",
      textPrimary: "#0f172a",
      textSecondary: "#475569",
      textMuted: "#64748b",
      accent: "#0284c7",
      gold: "#b45309",
    },
  },
  radius: {
    sm: "8px",
    md: "12px",
    lg: "16px",
    xl: "24px",
  },
  shadow: {
    homePanel: "0 34px 110px rgba(0,0,0,0.48)",
    card: "0 10px 30px rgba(15,23,42,0.08)",
  },
  transition: {
    fast: "160ms ease",
    normal: "220ms ease",
  },
} as const;
