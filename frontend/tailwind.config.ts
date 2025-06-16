import type { Config } from "tailwindcss";
import defaultTheme from "tailwindcss/defaultTheme";
const { fontFamily } = defaultTheme;

const config: Config = {
  darkMode: "class",
  content: [
    "./index.html",
    "./src/**/*.{ts,tsx,js,jsx,mdx}",
    // shadcn/ui components
    "./components.json",
    "./src/components/**/*.{ts,tsx,js,jsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", ...fontFamily.sans],
      },
      colors: {
        primary: {
          DEFAULT: "#38bdf8", // pleasant blue/aqua
          foreground: "#ffffff",
        },
      },
      borderRadius: {
        xl: "1rem", // rounded-xl
      },
      maxWidth: {
        content: "800px",
      },
      spacing: {
        8: "2rem",
        16: "4rem",
        24: "6rem",
        32: "8rem",
        40: "10rem",
      },
    },
  },
  plugins: [
    // @ts-ignore
    require("tailwindcss-animate"),
    // shadcn/ui preset (if installed)
  ],
};

export default config;
