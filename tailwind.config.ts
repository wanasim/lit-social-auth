/* eslint-disable @typescript-eslint/no-unused-vars */
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
import { nextui } from "@nextui-org/theme";
import type { Config } from "tailwindcss";
import defaultTheme from "tailwindcss/defaultTheme";
import colors from "tailwindcss/colors";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./node_modules/@nextui-org/theme/dist/components/(button|card|input|snippet|ripple|spinner|popover).js"
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
      },
    },
  },
  plugins: [nextui(), addVariablesForColors],
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function addVariablesForColors({ addBase, theme }: any) {
  const allColors = flattenColorPalette(theme("colors"));
  const newVars = Object.fromEntries(
    Object.entries(allColors).map(([key, val]) => [
      `--${key}`,
      val,
    ])
  );

  addBase({
    ":root": newVars,
  });
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const flattenColorPalette = (colors: any): any =>
  Object.assign(
    {},
    ...Object.entries(
      colors !== null && colors !== void 0 ? colors : {}
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ).flatMap(([color, values]: [any, any]) =>
      typeof values == "object"
        ? Object.entries(flattenColorPalette(values)).map(
            ([number, hex]) => ({
              [color +
              (number === "DEFAULT" ? "" : `-${number}`)]:
                hex,
            })
          )
        : [
            {
              [`${color}`]: values,
            },
          ]
    )
  );

export default config;
