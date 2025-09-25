import { hiIN } from "../packages/javascript/src/i18n";
import { setLocale, t } from "../packages/javascript/src/models/i18n";

// set it to Hindi
setLocale(hiIN);

// let translate something
console.log(t("signin.title")); // Output: "साइन इन"
