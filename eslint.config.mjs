import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
import noSecrets from "eslint-plugin-no-secrets";
import security from "eslint-plugin-security";
import simpleImportSort from "eslint-plugin-simple-import-sort";
import sonarjs from "eslint-plugin-sonarjs";
import tailwindcss from "eslint-plugin-tailwindcss";
import unicorn from "eslint-plugin-unicorn";
import unusedImports from "eslint-plugin-unused-imports";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  tailwindcss.configs.recommended,
  unicorn.configs["flat/recommended"],
  sonarjs.configs.recommended,
  security.configs.recommended,
  {
    plugins: {
      "no-secrets": noSecrets,
      "unused-imports": unusedImports,
      "simple-import-sort": simpleImportSort,
    },
    rules: {
      // Semantic/alphabetical import order, auto-fixable.
      "simple-import-sort/imports": "error",
      "simple-import-sort/exports": "error",
      // Flag AND auto-remove unused imports (stricter than the bare unused-vars check).
      "unused-imports/no-unused-imports": "error",
      // Catch accidentally committed API keys/tokens (relevant: this repo talks to Gemini + Neon).
      // Default tolerance (4) flags ordinary camelCase identifiers as "secrets"; 4.5 cuts that noise
      // while still catching real high-entropy tokens/keys.
      "no-secrets/no-secrets": ["error", { tolerance: 4.5 }],
      // `sonarjs/unused-import` detects the same issue; keep one owner with autofix support.
      "sonarjs/unused-import": "off",
      // This rule is intentionally broad and syntactic. Known safe computed accesses are
      // suppressed at the line after audit; any new access must be reviewed explicitly.
      "security/detect-object-injection": "error",
    },
  },
  {
    files: ["**/*.{ts,tsx,mts,cts}"],
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      // High-signal async correctness checks omitted by the non-type-aware Next preset.
      "@typescript-eslint/await-thenable": "error",
      "@typescript-eslint/no-floating-promises": "error",
      "@typescript-eslint/no-misused-promises": [
        "error",
        { checksVoidReturn: { attributes: false } },
      ],
      // Enabling parser services also wakes type-aware Sonar rules from its broad preset.
      // These are too opinionated/noisy for this codebase and are not part of this focused gate.
      "sonarjs/deprecation": "off",
      "sonarjs/function-return-type": "off",
      "sonarjs/prefer-read-only-props": "off",
    },
  },
  {
    settings: {
      tailwindcss: {
        cssConfigPath: "./src/app/globals.css",
      },
    },
  },
  {
    // Rules that fight this project's own deliberate conventions rather than catching real bugs.
    rules: {
      "unicorn/prevent-abbreviations": "off",
      "unicorn/filename-case": "off",
      "unicorn/no-null": "off",
      "unicorn/no-array-reduce": "off",
      // CUBE CSS (engineering-guidelines.md) intentionally uses custom Block classes (.btn, .modal-form,
      // .tab, ...) defined via @layer components — that's the point of the methodology, not a mistake.
      "tailwindcss/no-custom-classname": "off",
      // prettier-plugin-tailwindcss already sorts classes on every save/commit; its ordering
      // occasionally disagrees with this rule's, which would just make the two tools fight forever.
      // One tool owns ordering (Prettier); this plugin keeps the checks Prettier can't do
      // (no-contradicting-classname, no-unnecessary-arbitrary-value, etc).
      "tailwindcss/classnames-order": "off",
      // Math.random() here is for game/shuffle logic (see src/lib/draw.ts's injectable-random design),
      // never for anything security-sensitive — auth.ts already uses node:crypto correctly.
      "sonarjs/pseudo-random": "off",
      // Autofix was stripping a required `undefined` argument from calls like
      // parseSessionCookie(undefined) in tests, where the parameter type is `T | undefined`
      // (not optional) — that's a real call, not a useless one. Only check variable initializers.
      "unicorn/no-useless-undefined": ["error", { checkArguments: false }],
    },
  },
  {
    files: ["scripts/**/*.mjs"],
    rules: {
      // These are one-shot CLI scripts (see database-guidelines.md) — exiting with a status code is the point.
      "unicorn/no-process-exit": "off",
    },
  },
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
]);

export default eslintConfig;
