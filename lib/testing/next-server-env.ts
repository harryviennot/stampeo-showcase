/**
 * Preloaded before every test file (bunfig.toml).
 *
 * Next's server modules choose a real or a stub AsyncLocalStorage the first
 * time they load, and every test file shares one module cache. Installing the
 * real one up front keeps tests that run Next's router or route handlers from
 * depending on which file happened to load Next first.
 */
import "next/dist/server/node-environment-baseline";

/**
 * One Supabase project for every test file, whatever the shell or CI sets. `use-has-session` reads the project ref
 * once, when it loads, and a page test that renders the header can load it before the hook's own test does.
 */
process.env.NEXT_PUBLIC_SUPABASE_URL = "https://ysdpjxzldqwlmhlwzdaq.supabase.co";
