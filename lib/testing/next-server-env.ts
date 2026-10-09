/**
 * Preloaded before every test file (bunfig.toml).
 *
 * Next's server modules choose a real or a stub AsyncLocalStorage the first
 * time they load, and every test file shares one module cache. Installing the
 * real one up front keeps tests that run Next's router or route handlers from
 * depending on which file happened to load Next first.
 */
import "next/dist/server/node-environment-baseline";
