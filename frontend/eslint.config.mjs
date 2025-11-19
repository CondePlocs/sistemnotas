import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    ignores: [
      "node_modules/**",
      ".next/**",
      "out/**",
      "build/**",
      "next-env.d.ts",
    ],
  },
  {
    rules: {
      // Desactivar reglas muy estrictas que no afectan seguridad
      "@typescript-eslint/no-explicit-any": "off", // Permitir 'any' en casos específicos
      "@typescript-eslint/no-unused-vars": "warn", // Advertencia en lugar de error
      "react-hooks/exhaustive-deps": "warn", // Advertencia en lugar de error
      "react/no-unescaped-entities": "warn", // Advertencia para caracteres sin escapar
      "react-hooks/rules-of-hooks": "error", // Mantener como error (crítico)
    },
  },
];

export default eslintConfig;
