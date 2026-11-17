# PassEntry homepage teardown (passentry.com, read 12 Nov 2026)

This is the reference for the fourth page (`/us/landing-pages/platform`). We copy PassEntry's
**structure, layout and interaction patterns**. We do not copy its words, images, logos or brand:
those are theirs. Everything on our page is Stampeo's copy, Stampeo's visuals, and the showcase's
terracotta tokens and type scale.

Captures (git-excluded):
- desktop: `shots/passentry/desktop-00..12.png` (1440x900, one per scroll screen);
- phone: `shots/passentry/phone-00..17.png` (390x844);
- full page text: `shots/passentry/desktop-text.txt`.

## Visual language

- Light grey page (#f7f7f7) with dark slate headings.
- One accent, an orange-red, used for eyebrows, stat figures, the filled button and one full-bleed band.
- Every section header is centred and has three parts:
  - an **eyebrow** in accent small caps with wide letter-spacing (`HOW IT WORKS`, `PASS TYPES`…);
  - a big H2;
  - a one-line sub.
- Generous vertical space. Thin full-width hairline dividers between some sections.
- Buttons come in pairs: outline (secondary) and filled (primary), rectangular with a small radius.
- The header is a floating, rounded white card inset from the page edges. **We keep the site header**: it is shared site-wide, a non-goal.

## Sections, top to bottom

1. **Hero**
   - Centred two-line H1: "The leading platform for digital wallet passes".
   - A wide, slightly arched fan of 7 tilted passes from different brands and uses. They overlap and run past both edges.
   - The CTA pair sits under the fan: "Book a demo" (outline) and "Start free trial" (filled).
2. **Logo marquee**: a scrolling strip of customer logos (AT&T, Mastercard, Universal, Fairmont, Oxford…).
3. **"YOUR END-TO-END WALLET SOLUTION" / "Deliver passes directly to Apple and Google Wallet"**
   - Two phones side by side: an iPhone Wallet stack and an Android Google Wallet list.
   - Three floating glass cards around them, each with a mini visual:
     - "Analytics & insights" (a donut and a chart);
     - "Push notifications" (a notification);
     - "Real-time updates" (a sync icon).
   - The official **Add to Apple Wallet / Add to Google Wallet** badges sit under the phones.
   - A hairline divider follows.
4. **"BY THE NUMBERS" / "Performance you can count on"**
   - Three big accent figures with a label each: 172 / Companies on board, 92% / Pass retention rate, <5mins / Onboarding time.
   - The CTA pair follows ("Book a demo" + "Start building now"), then a divider.
5. **"HOW IT WORKS" / "Build, deliver and manage passes effortlessly"** + sub
   - Two phones showing the front of one pass and the back of another.
   - The phones sink behind a 3-column bordered table that overlaps their lower half:
     - **Create**: "Create branded passes tailored to any use…";
     - **Distribute**: "Share passes your way – via SMS, email or QR code. No app downloads…";
     - **Update**: "…real-time pass updates, push and geo-triggered notifications."
   - Text link "See the full process →".
6. **"PASS TYPES" / "Designed for every use"** + sub
   - A stacked list of rows (Ticketing, Transit, Loyalty, Membership), separated by hairlines.
   - Each row shows a big title on the left and the pass image on the right.
   - The **active row expands**: an accent eyebrow (e.g. "ACQUIRE AND REWARD LOYAL CUSTOMERS"), the title, then a 2-line description.
   - Collapsed rows show the title only. The active row follows scroll.
   - A full-width bordered button closes the list: "SEE MORE PASS TYPES".
7. **"THE PASSENTRY PLATFORM" / "Build your way"** + sub
   - A segmented toggle: **Dashboard UI | API**.
   - Below it, a big white rounded card:
     - left: layered product captures (the analytics dashboard, plus the pass builder with a live phone preview);
     - right: H3 "Everything you need, all in one place", a paragraph, and the link "See how it works →".
   - The API tab swaps in the API text plus "View API docs →".
8. **"Works with the tools you already use"** + sub
   - A tree diagram: their logo at the top.
   - Curved lines fan out to six integration logos (Zapier, HubSpot, Shopify, Salesforce, Stripe, Ticketmaster).
   - The upper part of each line is drawn in accent, the rest in grey (animated).
   - Link "Learn more on integrations →".
9. **Full-bleed accent band** (rounded, inset)
   - "Start your free trial today" + sub "Design, test and add your first pass … in minutes".
   - One white button, "Start free trial".
10. **"TESTIMONIALS" / "What leading brands achieve with PassEntry"** + sub
    - Three cards, each with a photo on top, a round logo overlapping the photo edge, the brand name in letter-spaced caps, and a quote.
11. **"BLOG" / "Keep up to date"** + sub + "View all"
    - Three post cards: image, a "N Mins Read" chip, the title, an excerpt, and tag chips.
12. **Footer**: a dark rounded panel (we keep the site footer).

## How each section maps to Stampeo (the honest substitutions)

| PassEntry | Stampeo's version | Why |
|---|---|---|
| Fan of 7 brand passes | `HeroCardFan`: 7 live sample cards, already built | Same object, ours |
| Customer logo marquee | Marquee of **business types** (coffee shops, bakeries, barbershops, salons…) | We have no customer logos we may show; fictional brands must never pass as customers |
| Two phones + floating feature cards + wallet badges | iPhone (Apple Wallet) + Android (Google Wallet) with Aurevo's card; floating cards "Lock-screen notifications", "Analytics", "Updates on every scan"; the official badges | Same claims, all live |
| By the numbers | 120+ active businesses / 20,000+ stamps issued / 25+ countries (`variant.metrics`) | Our approved numbers |
| Create / Distribute / Update | Create / Share / Stamp | Same three verbs, our product; no SMS, no geofencing |
| Pass types | **Program types: Stamps / Points / Levels** (Harry: levels shown as live) | Our "types" |
| Dashboard UI / API toggle | **Dashboard / Scanner app** toggle: desktop dashboard captures / the Scanner on a phone | We have no public API; the two real surfaces |
| Integrations tree | "Share it everywhere your customers are": tree from Stampeo to counter flyer, Instagram, Facebook, website, Google Business Profile, email | We have no integrations (no POS, never claim one); the sharing channels are real |
| Accent CTA band | Same, terracotta, "{trialDays} days free · Cancel anytime" | — |
| (none) | **Our pricing block**, before the CTA band (Harry, 12 Nov) | Our price is an argument |
| Testimonials | **"Stampeo adapts to your business"** sector carousel (Harry wants it kept) | We have no testimonials and never invent them |
| Blog | Three latest English posts from our blog | Real |
