BRANCH: `feat/sta-456-in-app-signup` (showcase)
SCOPES: showcase (`/onboarding` steps 1–2, `/reset-password` password rule)
ENVIRONMENT: dev only. No migration, no backend change. Codes come from the dev Supabase project (or the STA-416 hook when it is on).

# Onboarding signup test pass

The two-step signup a business owner goes through after a landing CTA, step 1
(name, phone) and step 2 (account: email + code, or Google / Apple). The pass
covers both real browsers and the Instagram / Facebook in-app browsers that Meta
ads open, and resuming the code screen after leaving for the mail app.

Work top to bottom: the real-browser cases first (they prove nothing regressed),
then in-app, then resume, then password rules. Cases marked **(device)** need a
real phone; the others can run with a user-agent override in a desktop browser.

---

## SETUP: Before you start

Everything runs against dev. Nothing touches production.

### Where things live

| Surface | URL / Command | Notes |
|---|---|---|
| Showcase | `https://showcase.dev.stampeo.app` | `bun run publicdev` from this worktree. Phones reach it through the tunnel; `localhost:3001` is desktop-only. |
| Landing with ad params | `https://showcase.dev.stampeo.app/us?utm_source=ig&utm_medium=paid&utm_campaign=qa456&utm_content=adA&fbclid=QA456test` | Use this as the entry for every in-app case, so attribution can be checked. |
| Signup | `https://showcase.dev.stampeo.app/en/onboarding` | Step 1 → Continue → step 2. |
| Open in the Instagram browser **(device)** | Send the landing link to yourself in an Instagram DM (or post it in a story link) and tap it. | Facebook: send it in Messenger or post it in a private Facebook post. The page must open INSIDE the app, not in Safari/Chrome. |
| In-app emulation (desktop) | Chrome DevTools → Network conditions → User agent → custom. | iOS Instagram: `Mozilla/5.0 (iPhone; CPU iPhone OS 18_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Instagram 389.0.0.29.87 (iPhone15,3; iOS 18_5; en_US; en; scale=3.00; 1290x2796; 735467318)`. Android Facebook: `Mozilla/5.0 (Linux; Android 14; Pixel 8 Build/AP2A.240805.005; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/127.0.6533.103 Mobile Safari/537.36 [FB_IAB/FB4A;FBAV/478.0.0.48.110;]`. Set a 390x844 viewport. Emulation proves layout and the escape URL, NOT whether the phone actually switches browser. |

### Accounts

A plus-alias of your own inbox per run (the code email must arrive), e.g.
`you+sta456-01@…`. All accounts created here are dev throwaways; delete them
with R1. Existing-account cases use an alias you already created and confirmed
in OS-07. Never use a real customer's address.

### Reset recipes

All SQL runs on the **dev** Supabase project (`ysdpjxzldqwlmhlwzdaq`).

**R1: delete a test account** (after any case that created one)

```sql
delete from auth.users where email = '<alias>';
```

**R2: clean browser state** (before a case that says "fresh visitor")

In the browser console on the showcase origin:

```js
Object.keys(localStorage).filter(k => k.startsWith("stampeo_onboarding")).forEach(k => localStorage.removeItem(k));
Object.keys(sessionStorage).filter(k => k.startsWith("stampeo_onboarding")).forEach(k => sessionStorage.removeItem(k));
```

Or use a fresh private window. **(device)**: Instagram's browser keeps its own
storage, so use R2 from the in-app page if possible, otherwise accept that the
previous record may still be there and note it.

**R3: age the resume record past 60 minutes** (for OS-10)

```js
const k = Object.keys(localStorage).find(k => k.startsWith("stampeo_onboarding_resume"));
const r = JSON.parse(localStorage.getItem(k)); r.sentAt -= 61 * 60 * 1000; localStorage.setItem(k, JSON.stringify(r));
```

(If the record stores `sentAt` in seconds, subtract `61 * 60` instead. Check the shape first: `localStorage.getItem(k)`.)

### Known state before you start

- **First pass.** No case has run yet. Unit tests cover the classifier, escape URL, escape timing, resume record and password rule; nothing below has been seen in a browser.
- **The iOS browser switch is not guaranteed.** Apple offers no reliable way for a page to open Safari from Instagram, and Meta blocks the known tricks inconsistently. OS-04 records WHICH outcome you got. Both "Safari opened" and "the fallback appeared within ~2 s" are passes; "nothing visible happened and no fallback" is a failure.
- **Dev showcase has no PostHog key**, so OS-17 (analytics) can only be checked after release, read-only, in PostHog.
- **A web screenshot proves nothing about a real phone switching browsers.** OS-04, OS-05 and OS-09 need a device.

---

## RB: Real browsers (nothing changed)

Run first. If these fail, the change leaked outside the in-app browsers.

### RB-01: The chooser in Safari / Chrome is today's [BLOCKER]

| Field | Content |
|---|---|
| WHY | Real browsers have the saved Google/Apple login and 291 successful returns in 60 days; the in-app treatment must not touch them (AC3). |
| DEPENDS | none |
| ACCOUNT | No session at all (R2). |
| STEPS | 1. In mobile Safari (or Chrome, or desktop) open the landing with ad params, tap the hero CTA. 2. Fill step 1, Continue. |
| EXPECT | Step 2 shows Google, then Apple, then Email, exactly as before. Tapping Google goes straight to `accounts.google.com`. You do NOT see an instruction about "Open in browser" or a "Continue with Google here" button. |
| RESET | R2. |

### RB-02: The sign-in page is unchanged everywhere [CORE]

| Field | Content |
|---|---|
| WHY | Google-only and Apple-only owners have no password; changing `/login` in-app could lock them out (AC3). |
| DEPENDS | none |
| ACCOUNT | No session. |
| STEPS | Open `/en/login` in a real browser, then with the iOS Instagram user agent. |
| EXPECT | Both show the same chooser (Google, Apple, Email); Google goes straight to Google. You do NOT see the in-app order or the fallback. |
| RESET | None. |

---

## IA: In-app browsers

### IA-01: Email comes first in the in-app chooser [BLOCKER]

| Field | Content |
|---|---|
| WHY | Email is the one path that always works inside Instagram/Facebook (AC2). |
| DEPENDS | RB-01 |
| ACCOUNT | No session (R2). |
| STEPS | 1. With the iOS Instagram user agent (or on a device, in Instagram), open the landing with ad params, tap the CTA. 2. Fill step 1, Continue. 3. Repeat with the Android Facebook user agent. |
| EXPECT | Step 2 lists Email, then Google, then Apple, as full-width rows that fit at 390px with no clipped labels. You do NOT see Google listed first. |
| RESET | R2. |

### IA-02: Tapping Google tries the phone's browser, with only ad parameters [CORE]

| Field | Content |
|---|---|
| WHY | The escape link is how Safari/Chrome can credit the ad and is the one URL that leaves the page; it must carry the click and never personal data (AC4). |
| DEPENDS | IA-01 |
| ACCOUNT | No session (R2). |
| STEPS | 1. Desktop, iOS Instagram user agent, DevTools open on the Network tab with "Preserve log". 2. Landing with ad params → CTA → step 1 with a real-looking name and phone → Continue. 3. Tap Google. 4. Repeat with the Android Facebook user agent. |
| EXPECT | iOS: the page tries to open `x-safari-https://showcase.dev.stampeo.app/en/onboarding?…`. Android: `intent://showcase.dev.stampeo.app/en/onboarding?…#Intent;scheme=https;package=com.android.chrome;S.browser_fallback_url=…;end`. The query holds `utm_source=ig`, `utm_medium=paid`, `utm_campaign=qa456`, `utm_content=adA` and `fbclid=QA456test`. You do NOT see the name, phone or any email in it, and the page does NOT go to `accounts.google.com` on that tap. |
| RESET | R2. |

### IA-03: When nothing opens, the fallback appears and works [CORE]

| Field | Content |
|---|---|
| WHY | On iPhone the switch often fails; the visitor must get the manual instruction and still be able to use Google/Apple here (AC5). |
| DEPENDS | IA-02 |
| ACCOUNT | No session (R2). |
| STEPS | 1. Desktop, iOS Instagram user agent (the custom scheme does nothing on desktop, so the page stays visible). 2. Reach step 2, tap Apple. 3. Wait 2 seconds. 4. Tap "Continue with Apple here". |
| EXPECT | Within about 1.5 s, under the Apple row, a short instruction ("Tap ••• then Open in browser" or the agreed copy) and a "Continue with Apple here" button appear. Step 4 goes to `appleid.apple.com`. You do NOT see the fallback under the Google row, and it does NOT appear before the 1.5 s wait. |
| RESET | R2. |

### IA-04: iPhone inside Instagram — what really happens (device) [CORE]

| Field | Content |
|---|---|
| WHY | Only a real phone shows whether Safari opens; this decides how much the escape helps the 75% of ad traffic on iOS (AC4, AC5). |
| DEPENDS | IA-01 |
| ACCOUNT | No session. |
| STEPS | 1. iPhone, open the landing link from an Instagram DM. 2. CTA → step 1 → Continue. 3. Tap Google. 4. Repeat from Facebook (Messenger link). |
| EXPECT | One of: (a) Safari opens on `/en/onboarding` step 1 (record "SAFARI OPENED"), or (b) within ~2 s the fallback appears and "Continue with Google here" opens Google's sign-in inside Instagram (record "FALLBACK"). Write which one happened for each app and the iOS version. You do NOT see the page sitting unchanged with no fallback. |
| RESET | None. |

### IA-05: Android inside Instagram opens Chrome (device) [CORE]

| Field | Content |
|---|---|
| WHY | Android's intent link is the reliable half of the escape (AC4). |
| DEPENDS | IA-01 |
| ACCOUNT | No session. |
| STEPS | 1. Android phone with Chrome, open the landing link from an Instagram DM. 2. CTA → step 1 → Continue. 3. Tap Google. |
| EXPECT | Chrome opens on `/en/onboarding` (step 1), and there Google is listed first (real-browser chooser) and signs in with the phone's account. You do NOT stay in Instagram's browser. |
| RESET | R1 if an account was created. |

### IA-06: Safari/Chrome credits the ad after the switch [CORE]

| Field | Content |
|---|---|
| WHY | Without this, an escaped signup counts as "direct" and Meta never learns from it. |
| DEPENDS | IA-02 |
| ACCOUNT | No session, a browser that never visited the dev showcase (fresh private window). |
| STEPS | 1. Copy the https form of the escape URL from IA-02 (`https://showcase.dev.stampeo.app/en/onboarding?utm_…&fbclid=QA456test`). 2. Open it in the fresh window; accept cookies if a banner shows. 3. DevTools → Application → Cookies. |
| EXPECT | `stampeo_src` holds source `ig`, medium `paid`, campaign `qa456`; `stampeo_ad` holds the Meta click `QA456test`. You do NOT see the cookies empty or `direct`. |
| RESET | Close the private window. |

---

## RS: Resuming the code screen

### RS-01: Email signup in-app, with a simple 8-character password [BLOCKER]

| Field | Content |
|---|---|
| WHY | The happy path the fix is for: email + an easy password + the code, inside the in-app browser (AC2, AC12). |
| DEPENDS | IA-01 |
| ACCOUNT | New alias. |
| STEPS | 1. iOS Instagram user agent (or device). 2. Landing → CTA → step 1 → Continue → Email. 3. Alias + password `abcdefgh`. 4. Enter the code from the email. |
| EXPECT | The form accepts `abcdefgh` (one requirement line, "at least 8 characters", ticked). The code screen names the alias. After the code you land on the app's first onboarding screen. You do NOT see a lowercase/uppercase/number/symbol checklist. |
| RESET | R1. |

### RS-02: Reloading on the code screen brings it back [CORE]

| Field | Content |
|---|---|
| WHY | The mail-app round trip often reloads Instagram's browser; the visitor must land back on "enter the code", not step 1 (AC6). |
| DEPENDS | RS-01 |
| ACCOUNT | New alias. |
| STEPS | 1. Do RS-01 up to the code screen. 2. Reload the page. 3. Enter the code. |
| EXPECT | After the reload the code screen shows again with the same alias, and Resend and "Use a different email" are there. The code verifies and you reach the app. You do NOT land on step 1 or the email form. |
| RESET | R1. |

### RS-03: Closing the in-app browser and coming back within the hour (device) [CORE]

| Field | Content |
|---|---|
| WHY | The worst case: Instagram closes its browser while you're in Mail. The record lives in localStorage so this still resumes (AC6). |
| DEPENDS | RS-01 |
| ACCOUNT | New alias. |
| STEPS | 1. Phone, Instagram, reach the code screen. 2. Close the in-app browser (X), switch to Mail, read the code. 3. Back in Instagram, tap the same link again, CTA. |
| EXPECT | `/onboarding` opens on the code screen for the alias; the code verifies. You do NOT have to start over. If Instagram gave the page fresh storage (it can), note "STORAGE NOT KEPT" — that is the browser, not a failure. |
| RESET | R1. |

### RS-04: An existing account resumes with a sign-in code [CORE]

| Field | Content |
|---|---|
| WHY | An existing address gets a sign-in code, a different code type; restoring the wrong type gives "invalid code" (AC6). |
| DEPENDS | RS-01 (keep its alias instead of resetting) |
| ACCOUNT | The confirmed alias from RS-01. |
| STEPS | 1. R2. 2. Signup again with the same alias and a wrong password. 3. On the code screen, reload. 4. Enter the new code. |
| EXPECT | After the reload the code screen is back; the sign-in code works and you reach the app. You do NOT see "Invalid verification code". |
| RESET | R1. |

### RS-05: After an hour, you start again from step 1 [EDGE]

| Field | Content |
|---|---|
| WHY | Codes expire after 60 minutes; a dead code screen would be a trap (AC7). |
| DEPENDS | RS-02 |
| ACCOUNT | New alias. |
| STEPS | 1. Reach the code screen. 2. Run R3. 3. Reload. |
| EXPECT | The wizard opens on step 1 with the name and phone still filled; the resume record is gone from localStorage. You do NOT see the code screen. |
| RESET | R1, R2. |

### RS-06: "Use a different email" forgets the old one [EDGE]

| Field | Content |
|---|---|
| WHY | Changing the email must not bring the old code screen back on the next reload. |
| DEPENDS | RS-02 |
| ACCOUNT | New alias. |
| STEPS | 1. Reach the code screen, reload (resumed). 2. Tap "Use a different email". 3. Reload. |
| EXPECT | After step 3 you are on step 2's email form or step 1, NOT on the code screen for the old alias. |
| RESET | R1, R2. |

### RS-07: The password is never stored, and everything is cleared on success [CORE]

| Field | Content |
|---|---|
| WHY | A password at rest in the browser is a liability; leftovers after signup would resurrect old screens (AC8, AC9). |
| DEPENDS | RS-01 |
| ACCOUNT | New alias. |
| STEPS | 1. Reach the code screen. 2. DevTools → Application: read every `stampeo_onboarding*` entry in localStorage and sessionStorage. 3. Verify the code. 4. Read them again (on the showcase origin). |
| EXPECT | At step 2 the resume record holds the email, the code type, name and phone, and NO password field or value. After step 3 the resume record and the draft are gone. You do NOT see the password anywhere, including the address bar. |
| RESET | R1. |

### RS-08: Already signed in wins over a resume record [EDGE]

| Field | Content |
|---|---|
| WHY | A signed-in owner must go to the app, never to a stale code screen. |
| DEPENDS | RS-02 |
| ACCOUNT | Any confirmed alias. |
| STEPS | 1. Reach the code screen for a NEW alias (record written). 2. In another tab, sign in with the confirmed alias. 3. Open `/en/onboarding`. |
| EXPECT | You are sent to the app. You do NOT see the code screen. |
| RESET | R1 for the new alias, R2. |

---

## PW: Password rule and form hints

### PW-01: 8 characters of anything, everywhere [CORE]

| Field | Content |
|---|---|
| WHY | The four character-class rules existed only in the browser and are the hardest part of the form on a phone keyboard (AC12). |
| DEPENDS | none |
| ACCOUNT | New alias. |
| STEPS | 1. Signup email form: type `abcdefg` (7), then `abcdefgh` (8). 2. Switch the site to fr, es, pl and look at the requirement line. 3. Request a password reset for a confirmed alias, open the link, try `abcdefg` then `abcdefgh`. |
| EXPECT | 7 characters: Continue/Save stays disabled. 8: enabled, and the reset saves. One requirement line, in each language. You do NOT see the old checklist in any language, and no request is sent for 7 characters. |
| RESET | R1. |

### PW-02: Autofill hints [EDGE]

| Field | Content |
|---|---|
| WHY | Typing is the friction on a phone; iOS offers the contact email and browsers offer a strong password (AC11). |
| DEPENDS | none |
| ACCOUNT | None. |
| STEPS | Inspect the signup email form's inputs (or tap them on an iPhone). |
| EXPECT | Email input `autocomplete="email"`, password input `autocomplete="new-password"`; on iPhone Safari the keyboard bar offers your email and a strong password. You do NOT see `autocomplete="off"`. |
| RESET | None. |

---

## AN: Analytics (after release, read-only)

### AN-01: Events carry the in-app tag and the escape outcome [CORE]

| Field | Content |
|---|---|
| WHY | This is how we learn whether the fix works and how often the iPhone switch succeeds (AC10). |
| DEPENDS | Release to prod. |
| ACCOUNT | PostHog, project 141822. |
| STEPS | A few days after release, in PostHog: break down `onboarding_step_completed` by `in_app_browser`; list `onboarding_browser_escape_attempted` and `onboarding_browser_escape_failed` by `platform`. |
| EXPECT | `in_app_browser` is set (`instagram`, `facebook`, …) on in-app sessions and empty elsewhere; escape events carry `provider`, `platform`, `in_app_browser`. You do NOT see an email in any of these events. |
| RESET | None. |

---

## Execution rules (for the testing agent)

1. **Order.** Setup first. Then sections top to bottom, and within a section, BLOCKER cases first unless DEPENDS forces otherwise.
2. **On BLOCKER failure:** stop the section; dependants are SKIPPED, not failed. Write a failure report, continue with sections that don't depend on it.
3. **On CORE failure:** write a failure report, skip only its dependants, continue.
4. **On EDGE failure:** write a failure report, continue.
5. **On ambiguity:** consult WHY; if still ambiguous, report AMBIGUOUS with what you saw so the runbook gets fixed.
6. **After any failure:** run the case's RESET before moving on.
7. **Reporting:** one failure report per failed case in `docs/features/STA-456/failure-reports/`, using the failure-report template. Reference cases by ID only.
8. **Re-runs after fixes:** the failed case, its dependants, and anything listed in "Known state" as needing re-verification. Nothing else.
