# Failure report — owner scrub fails on a NOT NULL column

ISSUE: STA-326
FOUND: 2026-09-20, incidentally, while verifying STA-324's consent unlink
       against the REAL purge path rather than a hard `DELETE FROM businesses`
SEVERITY: live GDPR Art. 17 failure

## Expected

Deleting a Business account removes the owner's personal data, as Privacy
Policy §8 states: "On deletion, Business-account personal data is deleted and
End Customer personal data is irreversibly anonymized."

Concretely: after `purge_business_data` completes for a business whose owner
belongs to no other business, that user row carries no name, no email and no
phone, and `summary["users_scrubbed"]` counts them.

## Actual

The owner's name, email and phone are untouched. Every time. The purge still
reports success.

`account_deletion.py` scrubs with:

```python
db.table("users").update(
    {"name": None, "email": None, "phone": None, "avatar_url": None}
).eq("id", uid).execute()
```

`users.name` and `users.email` are **NOT NULL**, so PostgREST answers 400:

```
APIError: null value in column "email" of relation "users"
          violates not-null constraint (23502)
```

which the surrounding `except Exception` catches and files under
`summary["errors"]`. Nothing reads that list, so the failure is silent.

## State

- dev, `information_schema.columns`: `users.email` is_nullable **NO**,
  `users.name` is_nullable **NO**; `phone` and `avatar_url` are nullable.
- dev, `pg_constraint`: `users_email_key UNIQUE (email)`. This matters for the
  fix: a single fixed sentinel email would satisfy NOT NULL and then collide on
  the SECOND account deletion.
- Not a regression. The code and the constraints appear never to have agreed,
  so this has presumably failed for every deletion ever performed.

## Steps to reproduce

1. Pick a business whose owner has exactly one membership.
2. `purge_business_data(get_db(), business_id)`.
3. Read `summary["errors"]` — it contains a `users:` entry naming the
   constraint. `summary["users_scrubbed"]` is 0.
4. Select that user: `name`, `email` and `phone` are unchanged.

Observed live on dev at 2026-09-20T20:26Z during STA-324 verification; the
traceback is in that session's output.

## Not in scope

The `businesses` row is anonymised in place and that part works. This report
concerns the `users` row only.
