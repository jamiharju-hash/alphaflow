import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{js,ts,jsx,tsx,mdx}", "./components/**/*.{js,ts,jsx,tsx,mdx}", "./lib/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        background: "#0F1115",
        panel: "#171A21",
        line: "#2B303B",
        copper: "#B66E3F",
        graphite: "#2B2B2B"
      }
    }
  },
  plugins: []
};

export default config;
