import { hiIN } from "../i18n";
import { setLocale, t } from "../models/i18n";

// Set Hindi
setLocale(hiIN);

// Translate something
console.log(t("signin.title")); // Output: "साइन इन"
