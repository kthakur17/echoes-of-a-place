import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  {
    ignores: [
      "node_modules/**",
      ".next/**",
      "out/**",
      "coverage/**",
      "next-env.d.ts",
    ],
  },
  // next/core-web-vitals already registers eslint-plugin-jsx-a11y with a
  // baseline rule set; the block below turns on additional a11y rules.
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    rules: {
      "jsx-a11y/anchor-is-valid": "error",
      "jsx-a11y/click-events-have-key-events": "error",
      "jsx-a11y/no-static-element-interactions": "error",
      "jsx-a11y/label-has-associated-control": "error",
      "jsx-a11y/no-autofocus": "error",
      "jsx-a11y/media-has-caption": "error",
      "jsx-a11y/no-noninteractive-element-interactions": "error",
      "jsx-a11y/tabindex-no-positive": "error",
    },
  },
];

export default eslintConfig;
