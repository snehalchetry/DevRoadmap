import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
    "./types/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--bg)",
        surface: "var(--surface)",
        border: "var(--border)",
        accent: "var(--accent)",
        success: "var(--success)",
        warning: "var(--warning)",
        danger: "var(--danger)",
        foreground: "var(--text-primary)",
        muted: "var(--text-secondary)"
      },
      boxShadow: {
        glass: "0 20px 80px rgba(0, 0, 0, 0.35)",
        glow: "0 0 40px rgba(88, 166, 255, 0.12)"
      },
      backgroundImage: {
        mesh:
          "radial-gradient(ellipse at 20% 50%, rgba(88,166,255,0.08) 0%, transparent 50%), radial-gradient(ellipse at 80% 20%, rgba(63,185,80,0.06) 0%, transparent 50%), radial-gradient(ellipse at 50% 80%, rgba(240,136,62,0.04) 0%, transparent 50%)"
      },
      keyframes: {
        drift: {
          "0%, 100%": { transform: "translate3d(0, 0, 0)" },
          "50%": { transform: "translate3d(14px, -18px, 0)" }
        },
        pulseRing: {
          "0%": { transform: "scale(0.88)", opacity: "0.55" },
          "70%": { transform: "scale(1.18)", opacity: "0" },
          "100%": { transform: "scale(1.18)", opacity: "0" }
        }
      },
      animation: {
        drift: "drift 18s ease-in-out infinite",
        "pulse-ring": "pulseRing 2.4s ease-out infinite"
      }
    }
  },
  plugins: []
};

export default config;
