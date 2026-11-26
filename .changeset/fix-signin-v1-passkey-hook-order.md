---
'@asgardeo/react': patch
---

Fix the v1 `SignIn` crashing with "Rendered more hooks than during the previous render" when the flow starts with a
passkey step. The passkey is now triggered once per step from an effect that runs on every render.
