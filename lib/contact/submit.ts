import { metaEventForContactForm } from "../meta-pixel";

/** One per form: true while a request is in flight. */
export interface SubmitGuard {
  sending: boolean;
}

/**
 * Send the contact form. The `Contact` event is reported once, when the API
 * answers 2xx; a second submit while one is in flight sends nothing. A tracking
 * failure never turns a received form into an error.
 */
export async function submitContactForm(input: {
  body: Record<string, string>;
  apiUrl: string | undefined;
  guard: SubmitGuard;
  track: (event: "Contact") => void;
  send?: typeof fetch;
}): Promise<"success" | "error" | "busy"> {
  const { guard } = input;
  if (guard.sending) return "busy";
  guard.sending = true;

  try {
    const res = await (input.send ?? fetch)(`${input.apiUrl}/public/contact`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input.body),
    });
    if (!res.ok) return "error";

    const contact = metaEventForContactForm(res.status);
    if (contact) {
      try {
        input.track(contact);
      } catch {
        // Losing the measurement is the acceptable failure.
      }
    }
    return "success";
  } catch {
    return "error";
  } finally {
    guard.sending = false;
  }
}
