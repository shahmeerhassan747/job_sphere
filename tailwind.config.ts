import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#2563eb",
          hover: "#1d4ed8",
        },
        secondary: "#64748b",
        accent: "#10b981",
        bg: "#f8fafc",
        text: {
          main: "#1e293b",
          muted: "#64748b",
        },
      },
      backgroundImage: {
        "hero-pattern": "linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.5)), url('/assets/hero-bg.png')",
      },
    },
  },
  plugins: [],
};
export default config;
