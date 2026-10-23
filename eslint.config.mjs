import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    rules: {
      // supabase.auth.signOut() defaults to the global scope, which revokes the
      // user's sessions on every device, the scanner phone included. Every
      // sign-out passes { scope: "local" } explicitly.
      "no-restricted-syntax": [
        "error",
        {
          selector:
            "CallExpression[callee.property.name='signOut'][callee.object.property.name='auth']:not(:has(Property[key.name='scope'][value.value='local']))",
          message:
            'Pass { scope: "local" } so signing out here leaves the user\'s other devices signed in.',
        },
      ],
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
