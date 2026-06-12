import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Discord/Notion-inspired neutral palette
        ink: {
          950: "#0b0b0f",
          900: "#111118",
          850: "#16161f",
          800: "#1c1c26",
          750: "#22222e",
          700: "#2a2a37",
          600: "#36374a",
          500: "#4b4d63",
          400: "#6b6d85",
          300: "#9395ad",
        },
        brand: {
          DEFAULT: "#5b6cff",
          50: "#eef0ff",
          400: "#7c89ff",
          500: "#5b6cff",
          600: "#4453e6",
          700: "#3640b8",
        },
        accent: {
          green: "#3ecf8e",
          amber: "#f5a623",
          rose: "#f2557d",
          violet: "#a855f7",
          cyan: "#22d3ee",
        },
      },
      fontFamily: {
        sans: ["var(--font-sans)", "ui-sans-serif", "system-ui", "sans-serif"],
      },
      borderRadius: {
        xl: "0.875rem",
        "2xl": "1.125rem",
      },
      boxShadow: {
        card: "0 1px 2px rgba(0,0,0,0.4), 0 8px 24px -12px rgba(0,0,0,0.5)",
        glow: "0 0 0 1px rgba(91,108,255,0.4), 0 8px 32px -8px rgba(91,108,255,0.5)",
      },
      keyframes: {
        "fade-in": {
          from: { opacity: "0", transform: "translateY(4px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        "fade-in": "fade-in 0.25s ease-out",
      },
    },
  },
  plugins: [],
};

export default config;
