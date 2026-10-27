/** Help-center URLs as a browser shows them: the rewrite keeps the address bar locale-free. */
export const HELP_PATHS = ["/help", "/help/add-a-team-member", "/help/a/b"] as const;

/** Shop slugs that merely start with "help": enrollment pages, not the help center. */
export const HELP_LOOKALIKE_SLUGS = ["helpful-cafe", "help-me-coffee", "helpdesk-bar", "helping-hands", "helpers"] as const;
