---
'@asgardeo/react': patch
---

Dialogs (for example the popup mode of `<UserProfile />` opened from the user dropdown) now move focus onto the dialog when they open. Previously focus stayed on the trigger, which the focus manager had just hidden from assistive technology with `aria-hidden`, and browsers reported "Blocked aria-hidden on an element because its descendant retained focus".
