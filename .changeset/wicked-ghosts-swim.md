---
'@asgardeo/browser': patch
---

Fix SCIM2 responses (`/scim2/Me`, `/scim2/Schemas`, and related organization/profile API calls) not being parsed as JSON.

`FetchHttpClient` only treated a response as JSON when its `Content-Type` header was exactly `application/json`. Asgardeo's SCIM2 endpoints respond with `Content-Type: application/scim+json`, which didn't match, so the response body was returned as raw, unparsed text instead of a parsed object. This caused the user profile to render incorrectly (missing fields, or falling back to a partial ID-token-derived profile) or crash with `TypeError: schemas.forEach is not a function`.

The content-type check now correctly matches `application/json` and any subtype ending in `+json` (e.g. `application/scim+json`), while still treating non-document JSON formats like `application/geo+json-seq` as text (since those aren't parseable as a single JSON document).
