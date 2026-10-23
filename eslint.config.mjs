import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    rules: {
      // supabase.auth.signOut() defaults to the global scope, which revokes the
      // user's sessions on every device, the scanner phone included.
      "no-restricted-syntax": [
        "error",
        {
          selector:
            "CallExpression[callee.property.name='signOut'][callee.object.property.name='auth'][arguments.length=0]",
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
