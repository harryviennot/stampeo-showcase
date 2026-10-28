# Help-center screenshots

One command re-takes any screenshot of a help page when the UI changes. Each help page that has dashboard or sign-up shots has a recipe in `recipes/<slug>.ts`: the viewport, the fixture business and session, the route, the actions that reach the state, the overlays and the element to crop. The PNGs are written to `public/help/<slug>-NN.png`. The specs in `content/help/en/**/<slug>.screenshots.md` say what each shot shows and where it goes.

Rules live in the stampeo-help-docs skill (`references/screenshots.md`): phone first, fictional data, English only, crop to the step.

## Run

```bash
bun scripts/help-shots/run.ts --list                        # every recipe and its shots
bun scripts/help-shots/run.ts set-your-time-zone            # one page
bun scripts/help-shots/run.ts set-your-time-zone --shot 02  # one shot
bun scripts/help-shots/run.ts --all
bun scripts/help-shots/run.ts <slug> --out /tmp/preview     # write elsewhere first, then look at the PNG
bun scripts/help-shots/run.ts <slug> --headed               # watch the browser
```

`--app <url>` (or `HELP_SHOTS_APP_URL`) is the dashboard base URL. It defaults to the deployed dev dashboard, `https://app.dev.stampeo.app`. When that deployment is behind the branch the help pages describe, serve the web repo's dev branch locally (`next dev -p 3100`, with the web repo's `.env.local` and `.env.public` loaded) and pass `--app http://localhost:3100`. The runner then hands the signed-in session to localhost.

Playwright comes from the `playwright-core` devDependency (pinned to 1.61.0). It uses the browsers Playwright already installed on the machine (`~/Library/Caches/ms-playwright`); run `bunx playwright-core install chromium` if one is missing.

## Credentials

Dashboard recipes sign in through `https://showcase.dev.stampeo.app/en/login` as the dev fixture staff accounts listed in `lib/session.ts`. They share one password, `FIXTURE_PASSWORD`, read from the env file `promo-videos/.env.tools` (found by walking up from this folder, or set `HELP_SHOTS_ENV` to its path). The value is never printed, logged or written. Dev only: never point this at production.

## What a capture may change

Overlays act on this browser only and write nothing to a database (`lib/overlays.ts`):

- the profile and dashboard shown in English,
- an admin session shown as the owner for owner-only screens (`asOwner`),
- a fixture business shown as English-speaking (days, card title), the owner row shown under a made-up name, invented scan figures,
- every write request the page attempts is aborted (sign-in and telemetry excepted).

Overlays never change labels or add UI. A recipe's `shows` line and its sidecar say which overlays a shot uses.

## Files

- `run.ts`: the runner.
- `recipes/index.ts`: the list of recipes. `recipes/<slug>.ts`: one page. `team-member-panel.ts` is shared by the Team pages.
- `lib/session.ts`: fixture accounts, sign-in, the public showcase session.
- `lib/overlays.ts`: the overlays. `lib/capture.ts`: crop helpers (`snap`, `snapBand`, `snapClip`, `tall`).
- `lib/devices.ts`: phone 402x874 and desktop 1280x900, both at 2x.

## Add a shot

1. Add a `{ n, shows, run }` entry to the page's recipe (or a new `recipes/<slug>.ts`, registered in `recipes/index.ts`).
2. Run it with `--out`, open the PNG and check it: English only, no spinner, no real name or email, nothing cut off.
3. Run it into `public/help`, write its spec in the page's sidecar, and add the image line to the MDX at the "Goes under" spot.
