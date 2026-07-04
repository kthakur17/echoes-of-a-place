import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: {
          950: "#0c0a12",
          900: "#141020",
          800: "#1d1830",
          700: "#2a2342",
        },
        parchment: {
          50: "#faf6ee",
          100: "#f1e9d8",
          300: "#d9c9a8",
          400: "#c4ad82",
        },
        ember: {
          300: "#f0c274",
          400: "#e3a94f",
          500: "#d4922f",
          600: "#b57722",
        },
        sage: {
          300: "#9ec5ab",
          400: "#7dab8d",
          500: "#5c8f6f",
        },
      },
      fontFamily: {
        display: ["var(--font-display)", "Georgia", "serif"],
        body: ["var(--font-body)", "system-ui", "sans-serif"],
      },
      animation: {
        "fade-up": "fadeUp 0.5s ease-out both",
        shimmer: "shimmer 1.6s linear infinite",
      },
      keyframes: {
        fadeUp: {
          "0%": { opacity: "0", transform: "translateY(12px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-400px 0" },
          "100%": { backgroundPosition: "400px 0" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
