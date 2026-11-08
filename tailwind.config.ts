import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#f5f3ff",
          100: "#ede9fe",
          200: "#ddd6fe",
          300: "#c4b5fd",
          400: "#a78bfa",
          500: "#8b5cf6",
          600: "#7c3aed",
          700: "#6d28d9",
          800: "#5b21b6",
          900: "#4c1d95",
          950: "#2e1065",
        },
        accent: {
          cyan: "#06b6d4",
          violet: "#8b5cf6",
          fuchsia: "#d946ef",
          emerald: "#10b981",
        },
      },
      animation: {
        "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "ping-slow": "ping 2.5s cubic-bezier(0, 0, 0.2, 1) infinite",
        "spin-slow": "spin 8s linear infinite",
        "bounce-subtle": "bounce 2s infinite",
        "glow": "glow 2s ease-in-out infinite alternate",
        "wave": "wave 1.2s ease-in-out infinite",
      },
      keyframes: {
        glow: {
          "0%": {
            boxShadow: "0 0 25px rgba(139, 92, 246, 0.4), 0 0 50px rgba(6, 182, 212, 0.3)",
          },
          "100%": {
            boxShadow: "0 0 50px rgba(139, 92, 246, 0.8), 0 0 90px rgba(6, 182, 212, 0.6)",
          },
        },
        wave: {
          "0%, 100%": { height: "15%" },
          "50%": { height: "90%" },
        },
      },
      backgroundImage: {
        "radial-gradient": "radial-gradient(var(--tw-gradient-stops))",
      },
    },
  },
  plugins: [],
};

export default config;
