import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "hsl(181 100% 9%)",
        "background-light": "hsl(180 88% 90%)",
        "background-dark": "hsl(185 100% 4%)",
        "text-main": "hsl(185 100% 1%)",
      },
      fontFamily: {
        display: ["Be Vietnam Pro", "sans-serif"],
        sans: ["Be Vietnam Pro", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
