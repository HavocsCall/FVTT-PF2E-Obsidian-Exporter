import js from "@eslint/js";
import globals from "globals";

export default [
  {
    ignores: [".git/**", ".github/**", "images/**", "node_modules/**", "src/vendor/**"]
  },
  {
    files: ["**/*.js", "**/*.mjs"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      globals: {
        ...globals.browser,
        ...globals.es2024,
        Hooks: "readonly",
        game: "readonly",
        foundry: "readonly",
        ui: "readonly",
        Dialog: "readonly",
        FilePicker: "readonly",
        Handlebars: "readonly",
        fromUuid: "readonly",
        renderTemplate: "readonly"
      }
    },
    rules: {
      ...js.configs.recommended.rules,
      "no-unused-vars": [
        "warn",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
          caughtErrorsIgnorePattern: "^_"
        }
      ]
    }
  }
];
