# STA-565 review (sketch harden, both repos)

One review, fresh context, 17 Nov 2026: backend `origin/dev..f68fe85c`, showcase `origin/dev..5ab7873`. No security
review: the diff touches no auth, billing, Stripe, webhook or migration.

## Quality (code-quality-reviewer): 3 BLOCKs → fixed
- `scripts/demo/build_demo_stickers.py` (backend): the run instructions used the dev container, which mounts only `app/`;
  now a throwaway `docker run` that mounts the checkout (6a6540bf).
- `lib/demo/card.test.ts` (showcase): the doc comment claimed every panel string; now "the reward and completion strings"
  (f18eff1).
- `lib/demo/card.test.ts`: the guard test's name and variable told history; now "the guard catches free months,
  discounts and trial lengths" (f18eff1). Also trimmed a misleading comment in `HeroDemo.tsx`.
NOTEs (PR description): duplicated and constant-pinning tests on both sides, `tests/demo` vs `tests/test_demo_points.py`
split, hero uploader scripts outside `scripts/demo/`.

## Coverage (coverage-auditor): NOTES only
- **Release step:** the Google heroes live in Supabase storage at fixed paths; run
  `python -m scripts.generate_demo_heroes && python -m scripts.generate_demo_points_heroes` in the PROD backend container
  right after the backend deploys (check `settings.supabase_url` first), or Android keeps the old strip with the percent
  marker. Dev storage is already updated.
- The page's reward words (showcase catalogs) and the pass's (`app/demo/rewards.py`) match today in all four languages, but
  nothing ties them: a swap must touch both repos. `msg_reached_60/120` repeat the reward names outside `REWARD_STRINGS`.
- `stickers.py` `total_stamps=8` is separate from `DEMO_TOTAL_STAMPS`; the discount guard catches `%` but not words like
  "off"; empty slots are grey at 55% (accepted from the screenshots).

## Waivers
None.
