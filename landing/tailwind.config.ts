import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        "bg-void": "#0A0E13",
        "bg-panel": "#10151C",
        "bg-card": "#131A22",
        border: "#1E2733",
        "border-soft": "#1A222C",
        lime: "#9AFF3D",
        "lime-dim": "#6FCB1F",
        blue: "#3B82F6",
        "blue-dim": "#2563EB",
        "text-1": "#F5F7FA",
        "text-2": "#9AA6B2",
        "text-3": "#5C6A78",
      },
      fontFamily: {
        display: ["var(--font-space-grotesk)", "sans-serif"],
        body: ["var(--font-inter)", "sans-serif"],
        mono: ["var(--font-jetbrains-mono)", "monospace"],
      },
      borderRadius: {
        card: "16px",
      },
    },
  },
  plugins: [],
};

export default config;
