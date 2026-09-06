---
'@asgardeo/nextjs': patch
---

A failed profile update no longer blanks `<UserProfile />`. The server action reports failures as a result rather than throwing, and the component handed the empty user of that result to the profile context, wiping the displayed profile without any message. It now keeps the current profile on screen and shows the reason through the profile's error alert, as the React SDK does, and forwards the component-level `preferences` (i18n / theme) to the base component. The action's error message no longer claims it failed to *get* the profile.
