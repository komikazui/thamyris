// prettier.config.js
/** @type {import("prettier").Config} */
export const semi = true;
export const singleQuote = false;
export const printWidth = 120;
export const tabWidth = 1;
export const useTabs = true;
export const quoteProps = "as-needed";
export const jsxSingleQuote = false;
export const bracketSpacing = true;
export const bracketSameLine = false;
export const arrowParens = "always";
export const endOfLine = "lf";
export const trailingComma = "es5";
export const plugins = [
  "@trivago/prettier-plugin-sort-imports",
  "prettier-plugin-tailwindcss",
];
export const importOrder = [
  "^(react|next?/?([a-zA-Z/]*))$",
  "<THIRD_PARTY_MODULES>",
  "^@/(.*)$",
  "^[./]",
];
export const importOrderSeparation = true;
export const importOrderSortSpecifiers = true;
