import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        panel: "var(--panel-bg)",
        "panel-raised": "var(--panel-raised)",
        border: "var(--border)",
        "border-soft": "var(--border-soft)",
        bg: "var(--bg-dark)",
        "text-primary": "var(--text-primary)",
        "text-dim": "var(--text-dim)",
        "text-faint": "var(--text-faint)",
        success: "var(--color-success)",
        "success-dim": "var(--color-success-dim)",
        warning: "var(--color-warning)",
        "warning-dim": "var(--color-warning-dim)",
        danger: "var(--color-danger)",
        "danger-dim": "var(--color-danger-dim)",
      },
      fontFamily: {
        serif: ["'Source Serif 4'", "Georgia", "serif"],
        mono: ["'IBM Plex Mono'", "monospace"],
      },
    },
  },
  plugins: [],
};

export default config;
