# STA-506 legal review: who answers for staff activity data (privacy §2.1, §3.2, §8; Terms §8) in en, fr, es and pl

Prepared 2026-10-26 for counsel. Branch `feat/sta-506-staff-data-roles`, showcase. This is item E4 / AC30 of STA-190 (the Team page). It follows the format of `docs/features/STA-377/legal-review.md`. It is not legal advice.

**This is a draft. It must not be merged before counsel signs off.**

## 1. Scope

**The change.** The business (the employer) becomes the controller of staff activity data, and Stampeo its processor. Staff activity data means which team member recorded each transaction, plus each member's last scan and number of scans, as shown to the owner and administrators. Before this change:
- privacy §2.1 made Stampeo controller of all business account data, employees included;
- §3.2 put the activity figures and the per-scan attribution on Stampeo's legitimate interest;
- Terms §8 (the Art. 28 terms) covered End Customer data only;
- §8 had no retention row for staff activity.

**Changed** in all four locales (English is the source; French, Spanish and Polish are written natively from it):

| Document | Section | Change |
|---|---|---|
| Privacy | §2.1 | New paragraph: the business is controller and Stampeo processor for staff activity data, under Terms §8.11. Stampeo's own two uses are pointed to §3.2. |
| Privacy | §3.2 | The two activity rows are rewritten: what the data is, the business's purpose, and the legal basis "determined by the business, as controller". The closing sentence is replaced by three paragraphs and a list: roles and the duty to inform; who sees what; location; Stampeo's own two uses as controller. |
| Privacy | §8 | One new retention row, "Staff activity data (§3.2)". |
| Terms | §8 opening | The Art. 28 terms now also cover Staff Activity Data, "as set out in §8.11". |
| Terms | new §8.11 | Definition, roles, which §8 clauses apply, and four Business User obligations (inform the team, legal basis and proportionality, staff representatives where the law requires, rights requests). |

**Not changed:**
- **Section numbers and ids.** No heading was renamed or renumbered. §8.11 is a new last subsection of Terms §8, and `STABLE_LEGAL_IDS` is untouched.
- **"Last updated".** Privacy still reads 23 October 2026 and Terms 14 September 2026; see the checklist in section 6.
- **Privacy §10.** It still routes employees' rights requests to Stampeo (see Q7).
- **The Terms §8 title**, "End Customer Data (Data Processing Terms)" (see Q9).

**Tests.** `lib/legal/staff-data-roles.test.ts` (new) pins each statement in each locale:
- §2.1 roles;
- §3.2 business basis on both rows;
- the retired denial stays retired;
- Stampeo's own uses are stated;
- the position is never sent;
- the §8 row;
- the Terms §8 opening cites 8.11;
- §8.11 roles, duty to inform and staff representatives;
- §8 still numbered 8.1 to 8.11.

`lib/legal/policy-test-utils.ts` gains a terms reader. Every case failed before the text existed, and a one-off mutation fails only its own case.

## 2. The facts the text states, checked against the code

| # | Fact | Evidence | Where stated |
|---|---|---|---|
| F1 | Every transaction stores the id of the team member who recorded it: stamps or points added, rewards redeemed, scans voided, and the manual adjustments an owner or administrator makes in the dashboard. | `transactions.employee_id` (migration 23, FK to `auth.users`, ON DELETE SET NULL); set by the scan, redeem and void paths and by `customers.py` adjustments. Copied into `analytics_visits.employee_id` (migration 217, no FK). | §2.1, §3.2 row 4, Terms §8.11 |
| F2 | The dashboard shows "by {name}" on each transaction: Activity page, a customer's history, Home recent scans. Scanners never see the dashboard: they are redirected to `/scanner-welcome`. | web `activity-item.tsx`, `transaction-item.tsx`, `recent-scans.tsx`, `role-guard.tsx` | §3.2 ¶1 |
| F3 | The last scan and all-time scan count are on the Team page, for owners and administrators only, and filled only when the business has `team.employee_tracking` (Growth and Pro) in good billing standing. | Backend STA-190 B-1/B-2 (`feat/sta-190-team-data`, `memberships.py`: `require_management_access`, `feature_in_good_standing`) | §3.2 row 3 and ¶1 |
| F4 | The scanner app shows a user their own scan count, nothing about colleagues. | scanner-app `businesses.tsx` | §3.2 ¶1 |
| F5 | The scanner app may ask for location permission to suggest the nearest location. The nearest location is computed on the device and the position is never sent. A scan stores the location selected in the app. | scanner-app `location-context.tsx` ("The position never leaves the device") | §3.2 ¶2 |
| F6 | Stampeo's own uses: (a) the superadmin console's team tab (name, email, role, scan count, last activity, platforms used) and activity feed (each transaction with the team member's name; the customer only as an 8-character id prefix); the impersonation user picker shows last activity. (b) The deletion clock of a cancelled account is the later of billing inactivity and the latest `memberships.last_active_at`, which only a scan writes. No automated fraud scoring reads `employee_id`. | backend `admin/business_detail.py`, `admin/impersonation.py`, `services/account_deletion.py`, `repositories/membership.py` | §3.2 list, Terms §8.11 ¶2 |
| F7 | When a member is removed, their membership row (and its counters) goes, but `employee_id` stays on the transactions, so the business still sees their name. When the business account is deleted: memberships are deleted; a staff user with no other business is scrubbed ("Deleted user", sentinel email); transactions and `analytics_visits` are kept, `employee_id` included. Users cannot delete their own account in the product. | `account_deletion.py` (purge step 4) | §8 row |

**On today's `dev`, F3 is not yet true.** `GET /memberships/business/{id}` answers any member, scanners included, with `scans_count` and `last_active_at` on every plan, and the Team page shows them on every plan. "Only to the owner and administrators" and "where the business's plan includes it" become true when STA-190 B-1 and B-2 reach production (G1).

## 3. Gating items

**G1. STA-190 B-1 and B-2 must be live in production before this text is published** (F3).

**G2. Roles (Q1 and Q2) need counsel's answer before anything else.** If the answer is joint controllership or independent controllers, §2.1, §3.2 and §8.11 change shape, and the tests change with them.

**G3. Date and notices.** See the checklist in section 6.

## 4. Questions for counsel

| # | Question | What the draft does |
|---|---|---|
| Q1 | **Is "processor" right?** Stampeo decides that attribution is recorded on every transaction (the business cannot turn it off), what is computed from it, and how long it is kept. Under EDPB Guidelines 07/2020, "which data" and "for how long" are essential means, normally a controller's decision. The options: (A) business controller, Stampeo processor, with a carve-out for Stampeo's own uses (this draft); (B) joint controllers (Art. 26), with an arrangement whose essence is made available to staff; (C) Stampeo independent controller for recording, the business independent controller for what it does with what it sees. | Option A, written as asked. |
| Q2 | **Stampeo's own uses.** A processor that uses data for its own purposes is a controller for them (Art. 28(10)). The draft says so and names two uses: support and investigation of misuse (the superadmin console, F6a), and the inactivity rule (F6b). Is legitimate interest the right basis for both, or is the inactivity clock better grounded in the storage-limitation duty? Is this compatible further processing (Art. 6(4))? Do staff need their own Art. 13 notice of these uses beyond this policy, given they never accept the Terms? | Both on legitimate interest, in §3.2. |
| Q3 | **The business's legal basis cell.** It reads "Determined by the business, as controller (usually its legitimate interest)". Is suggesting a basis acceptable, or should it say only "determined by the business"? Consent is generally not a valid basis in employment (EDPB 05/2020). | Suggests legitimate interest, in brackets. |
| Q4 | **The employer's duty to inform**, and how far the Terms should go. France: Code du travail L1222-4 (no information about an employee collected by a means not brought to their prior knowledge) and L2312-38 (the CSE is informed and consulted before means of monitoring employees' activity are introduced, in businesses of 50 or more). Spain: Estatuto de los Trabajadores art. 64.5 and LOPDGDD arts. 87 to 90. Poland: Kodeks pracy arts. 22² and 22³ (two weeks' notice before monitoring). Is a generic clause with a French example enough? Should Stampeo provide a template staff notice? Does saying "monitor its team's activity" (conditionally) concede that this is monitoring? | Four obligations in §8.11, with the CSE as the one example, worded "where that law requires it". |
| Q5 | **DPIA.** The CNIL's list of processing requiring a DPIA includes the systematic monitoring of employees' activity. The Team page shows no rankings, no time-of-day patterns, no idle time and no phone location (STA-190 guardrails). Confirm that neither the business nor Stampeo needs a DPIA for this. | Not mentioned. |
| Q6 | **Retention.** (a) A former member's name stays on their transactions for as long as the business account exists. Is that proportionate, or should it become "Former team member" after they leave, or after N months? (b) On deletion, `employee_id` stays on the retained transactions and `analytics_visits`. For a staff member who still works for another business on Stampeo, those rows are pseudonymous, not anonymous. Should the purge null `employee_id` (a backend change)? | The §8 row describes the code as it is: "kept as statistics", not "anonymized". |
| Q7 | **Rights routing.** §10 tells "Business users and employees" to contact Stampeo. For staff activity data the employer is now controller. Proposed addition: "Employees: for staff activity data, contact the business you work for first; you may also reach us at contact@stampeo.app." | Not drafted (§10 is outside this change). |
| Q8 | **Is this a substantial change, and when does §8.11 bind?** Privacy §13 promises an email for substantial changes. Terms §14 promises an email at least 30 days before a substantial modification takes effect. §8.11 adds obligations on Business Users. | Treated as substantial (section 6). |
| Q9 | **The Terms §8 title** still says "End Customer Data (Data Processing Terms)". Renaming it, for example to "Data Processed on the Business User's Behalf (Data Processing Terms)", changes its anchor. Nothing in the code links to that anchor (only `privacy#cookies` is linked) and it is not in `STABLE_LEGAL_IDS`, so a rename looks safe. | Title kept, so no id changes. |
| Q10 | **Device platform.** `memberships.platforms_used` and each transaction's `metadata.platform` record whether a member scanned from iOS, Android or the web. They feed the app-adoption achievements (a team-level badge the business sees) and the superadmin team tab. Not disclosed today. Disclose it in §3.2? | Not added (outside the brief). |
| Q11 | **"In the dashboard ... only to the owner and administrators".** At the API level, the transaction feed (`GET /transactions/{business_id}`, `require_any_access`) returns each transaction with the team member's name to a scanner-role session too. No app screen uses this, and the scanner app does not call it. Is the dashboard-scoped wording enough, or should the API be closed to scanners (a backend change)? | The wording is scoped to the dashboard, where it is true. |
| Q12 | **The owner's own activity.** The owner is a member of the team and scans too. Is the business being controller of the owner's own activity data unproblematic? | Included in "team". |

## 5. Wording choices

**J1. "Per-scan attribution" became "Per-transaction attribution".** It also covers rewards redeemed, scans cancelled and the dashboard adjustments of owners and administrators (F1).

**J2. "Employee" became "team member".** Owners and administrators scan as well. Terms §8.11 lists the three roles.

**J3. One defined term per locale.**
- **en:** "staff activity data" (privacy), "Staff Activity Data" (Terms).
- **fr:** "données d'activité de l'équipe" / "Données d'Activité de l'Équipe".
- **es:** "datos de actividad del equipo" / "Datos de Actividad del Equipo".
- **pl:** "dane o aktywności zespołu" / "Dane o Aktywności Zespołu".

The legal role names are the requested ones:
- **fr:** "responsable de traitement" / "sous-traitant";
- **es:** "responsable del tratamiento" / "encargado del tratamiento";
- **pl:** "administrator" / "podmiot przetwarzający".

**J4. The old §3.2 sentence "Stampeo does not use them for its own purposes" was untrue** (F6) and is replaced by the two named uses. A test keeps it from returning in any locale.

**J5. The location paragraph** is there because employee geolocation is the most sensitive form of staff monitoring, and it states exactly what the code does (F5).

**J6. Plans are not named** ("where the business's plan includes it"), because a feature grant can give team activity to a business on another plan.

**J7. Per-locale vocabulary.**
- **fr:** "entreprise" for the business (the existing term throughout the French policy, 44 uses), "application scanner", "établissement", "fil d'activité".
- **es:** "comercio", "establecimiento", "aplicación de escaneo", "página de actividad" (the dashboard's label). "Empresa" appears only in the labour-law example.
- **pl:**
  - "firma", "lokal", "aplikacja do skanowania", "strona Aktywność" (the dashboard's label);
  - "położenie telefonu" rather than "lokalizacja", which the copy rules keep apart from "lokal";
  - third-person and impersonal forms only, no gendered address.

**J8. The in-app notice of STA-505 (E3) is not referenced**, because it has not shipped. Once it is live, §8.11 could add: "Stampeo shows team members this information when they join a business; that notice does not replace the Business User's own duty to inform."

**J9. Which §8 clauses apply.** §8.11 extends 8.1 to 8.5 and 8.10 to staff activity data. §8.6 (support access) and §8.7 (audit export) already cover the whole dashboard. §8.8 and §8.9 are about End Customers. Confirm 8.6 and 8.7 need no mention.

## 6. Publication checklist

- [ ] **Counsel signs off** on at least Q1 and Q2; the text and `staff-data-roles.test.ts` are adjusted together.
- [ ] **STA-190 B-1 and B-2 are live in production** (G1).
- [ ] **"Last updated" set to the publication date in all eight files:** the four privacy policies (now 23 October 2026) and the four Terms (now 14 September 2026). They were left unchanged on purpose.
- [ ] **Email to Business users before or at publication.**
  - Privacy §13 makes this a substantial change, which requires an email.
  - Terms §14 requires the email at least 30 days before the Terms change takes effect.
  - Either email at publication and state that §8.11 applies 30 days later, or email 30 days ahead and publish both on the effective date.
  - Harry decides when.
- [ ] **All four locales (en, fr, es, pl) ship in the same deploy**, privacy and Terms together.
- [ ] **`bun test lib` is green.**
- [ ] **The adjacent findings below have each been decided** (fix, accept or defer).

## 7. Found while checking, not fixed here

1. **A dashboard login does not defer account deletion, although the policy says it does.**
   - **What the code does:** the deletion clock reads `memberships.last_active_at`, which only `record_scan_activity` writes. `MembershipRepository.update_activity` has no caller, and STA-190 deletes it as dead code.
   - **What we promise:** privacy §8 and Terms §6.3 say "the account is kept if the owner logs back in", and the T-30/T-14 warning emails say the same.
   - **The gap:** an owner who only logs in does not stop the deletion; only a scan or a resubscription does.
   - **Where to fix:** a backend fix, not part of this change.
2. **The transaction feed API is open to scanners** (Q11).
3. **`employee_id` survives the deletion purge** (Q6b).
