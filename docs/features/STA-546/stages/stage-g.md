# STA-546 Stages G1–G4: the four v2 pages

Four stages run in parallel, one page each, in separate worktrees branched from Stage F's last commit:

| Stage | Page |
|---|---|
| G1 | How-to |
| G2 | Features |
| G3 | Outcomes |
| G4 | Platform |

Your prompt's first line says which stage you are and gives your worktree and branch.
- Work only there.
- Never push or merge, and never touch Supabase.
- Commit with no Co-Authored-By trailer.

## Read first, fully

1. `docs/features/STA-546/plan.md`: the v2 sections, the v2 ACs (AC1v2 to AC25), and the claims rules that still hold.
2. `docs/features/STA-546/ux-brief-v2.md`:
   - your page's section in §1 (A, B, C or D);
   - for G4, also §3 "Platform in detail", and `research-passentry.md` with the PassEntry shots in `shots/passentry/`;
   - §2 Shared, §5 Length and CTAs, §6 Claims.
3. `docs/features/STA-546/stages/stage-f.md` and Stage F's report (in the commit messages, and `git log`). These tell you what is shared and how to use it.
4. Your page's copy, `lib/landing-pages/copy/<page>.ts`, plus `shared.ts` and `program-types.ts`.
   - Don't reword any string.
   - You may add accessibility text or non-copy data (hrefs). Say so in your report.
5. The shared kit in `components/landing-pages/shared/`.
   - **Use it, don't fork it.**
   - If a shared component truly needs a new optional prop, add it additively and say so; another stage may be adding one too.
   - Never change a shared component's default behaviour.

## Rules

- **Your files:**
  - your page's folder: `components/landing-pages/<page>/`;
  - your page file: `app/[locale]/us/landing-pages/<slug>/page.tsx`;
  - your block in the test files: your `describe`, plus your `STAGED` entry, which you delete to arm your section-order test.
  - Nothing else unless unavoidable. List it if you touch anything else.
- **Sections:** every section is `<LpSection section="<id>">` or a component forwarding a literal `section="<id>"`, in exactly the registry order.
- **"Start my free trial"** is always `CTAButton`:
  - repeats inside the page: `variant="outline"`, `trackAs="feature_cta"`;
  - the last one: `final_cta`;
  - the demo link is the plain `#demo` anchor, or `LpCtaPair` on Platform.
- **Claims** (ux-brief-v2 §6):
  - only live claims;
  - every plan-gated thing carries its chip: "Growth and Pro" or "Pro";
  - "Sample data" under every dashboard capture;
  - notification banners via `lpBanner`, never from "Stampeo";
  - no REC or timing on the scanner (`chrome="minimal"`);
  - fictional brands never called customers, testimonials or stories.
- **Mobile first:**
  - design the 390 layout first;
  - tap targets ≥44px on everything new;
  - nothing hover-only;
  - honour reduced motion for every animation you add;
  - no horizontal scroll.

## Tests

Delete your `STAGED` entry, then add pins for your page's own behaviour, taken from the ACs and the brief:

- **G1:**
  - the steps map anchors jump to the step sections;
  - `CardDesignPlayground compact`;
  - the stamp step uses `ScanDemo chrome="minimal"` plus `lpBanner`;
  - the first-day items render through `RegionText`.
- **G2:**
  - the program-types tabs render all three of `PROGRAM_TYPES`;
  - the messages moments are fed by `lpBanner`, and the broadcast moment carries its chip;
  - `ScanDemo minimal`;
  - every tile carries its plan chip.
- **G3:**
  - the head-start toggle drives the card and the highlighted bar from the two sourced figures, and prints the source;
  - `LevelCards` with the level-up banner;
  - the segments row;
  - the `slowDays` PlanLine.
- **G4:**
  - every section header uses the eyebrow pattern;
  - the program rows render all open on the server (AC21);
  - the share tree channels come from the copy, and nothing says integration;
  - the blog block reads the 3 latest English posts and links to each;
  - the band uses `CTAButton variant="inverse"` and `final_cta`.

Each pin fails first, against a deliberately broken copy, then passes.

## Verify and report

Run `bun test lib scripts`, `bun run type-check` and `bun run lint`, all green.

Then check the page visually:
- Run a dev server on your own port: G1 3021, G2 3022, G3 3023, G4 3024.
- Shoot your page at 390x844 and 1440x900:
  - the full page, after scrolling through it so ScrollReveal content renders;
  - each section;
  - the hero at 1024.
- Use headless Chromium from `/Users/harryviennot/LocalDocuments/fidelity/promo-videos/node_modules/playwright`, with timezoneId America/New_York. Wait for "load" + 2.5s.
- Save the shots under `docs/features/STA-546/shots/stage-g<n>/` (git-excluded) and LOOK at every one.
- Fix what you see: overlap, wrapping, sizes, contrast, empty space, anything that looks unfinished. Harry rejected v1 for looking "made really quickly".
- Measure the page length at 390 against brief §5.

Afterwards, stop dev and restore AGENTS.md. Don't run `bun run build`.

**Report:**
- what you built, section by section;
- the diff stat;
- the test counts;
- the shots, and what you saw and fixed;
- the length at 390;
- any shared file you touched;
- any copy you could not place.
