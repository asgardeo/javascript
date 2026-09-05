---
'@asgardeo/react': patch
'@asgardeo/nextjs': patch
---

- React: the embedded `<SignUp />` now renders `RICH_TEXT` flow components (for example the terms of service text under the registration form), which were previously dropped, leaving the submit button jammed against the last field.
- Next.js: `<SignUp />` forwards all remaining props to the underlying form (`showTitle`, `showSubtitle`, `showLogo`, `onComplete`, `onFlowChange`, class names, ...). Previously they were accepted by the type but silently ignored, so for instance `showTitle={false}` had no effect when a registration flow renders its own heading.
