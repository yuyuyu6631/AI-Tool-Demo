export const theme = {
  colors: {
    home: {
      bg: "#F4F2EE",
      panel: "rgba(255,255,255,0.76)",
      radarPanel: "rgba(250,250,248,0.92)",
      textPrimary: "#171717",
      textSecondary: "#444444",
      textMuted: "#85827A",
      accent: "#3B7BF0",
      gold: "#E8B94A",
      goldText: "#8B6210",
    },
    surface: {
      bg: "rgba(255,255,255,0.045)",
      mutedBg: "rgba(255,255,255,0.075)",
      tagBg: "rgba(255,255,255,0.075)",
      priceBg: "rgba(232,184,109,0.13)",
      priceBorder: "rgba(232,184,109,0.32)",
      border: "rgba(255,255,255,0.10)",
      borderSoft: "rgba(255,255,255,0.07)",
      textPrimary: "#F5F5F7",
      textSecondary: "#C7CBD4",
      textMuted: "#8E94A3",
      accent: "#8FB2FF",
      gold: "#E8B86D",
    },
  },
  radius: {
    sm: "8px",
    md: "12px",
    lg: "16px",
    xl: "24px",
  },
  shadow: {
    homePanel: "0 12px 40px rgba(0,0,0,0.28), inset 0 1px 0 rgba(255,255,255,0.05)",
    card: "0 12px 40px rgba(0,0,0,0.28), inset 0 1px 0 rgba(255,255,255,0.05)",
  },
  transition: {
    fast: "160ms ease",
    normal: "220ms ease",
  },
} as const;
