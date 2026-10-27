/** How a reader reaches us from the help center. */

export const SUPPORT_EMAIL = "support@stampeo.app";

export const SUPPORT_PHONE = "+33 6 49 37 04 70";

/** The same number for `tel:` and `wa.me`, which take digits only. */
const SUPPORT_PHONE_DIGITS = "33649370470";

export const SUPPORT_MAILTO = `mailto:${SUPPORT_EMAIL}`;
export const SUPPORT_TEL = `tel:+${SUPPORT_PHONE_DIGITS}`;
export const SUPPORT_WHATSAPP = `https://wa.me/${SUPPORT_PHONE_DIGITS}`;
