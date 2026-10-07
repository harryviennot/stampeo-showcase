/**
 * Sending the contact form (AC6.2).
 *
 * The form was received when the API says so: that, not a click on a link to
 * the page, is the `Contact` Meta hears about, once. A second submit while the
 * first is in flight sends nothing.
 */

import { describe, expect, test } from "bun:test";

import { submitContactForm } from "./submit";

const API = "https://api.stampeo.app";
const BODY = { name: "Marie", email: "marie@example.com", subject: "Hello", message: "Hi" };

/** A fetch we answer ourselves, so a request can be left in flight. */
function fakeApi() {
  const calls: { url: string; init: RequestInit }[] = [];
  const waiting: ((response: Response) => void)[] = [];
  const send = ((url: string, init: RequestInit) => {
    calls.push({ url, init });
    return new Promise<Response>((resolve) => waiting.push(resolve));
  }) as unknown as typeof fetch;
  return { calls, send, answer: (status: number) => waiting.shift()!(new Response(null, { status })) };
}

function form(over: Partial<Parameters<typeof submitContactForm>[0]> = {}) {
  const events: string[] = [];
  const api = fakeApi();
  const input = {
    body: BODY,
    apiUrl: API,
    guard: { sending: false },
    send: api.send,
    track: (event: "Contact") => void events.push(event),
    ...over,
  };
  return { api, events, input, submit: () => submitContactForm(input) };
}

describe("a form the API received", () => {
  test("reports one Contact, after the answer, and nothing before it", async () => {
    const { api, events, submit } = form();

    const sent = submit();
    expect(events).toEqual([]);
    api.answer(200);

    expect(await sent).toBe("success");
    expect(events).toEqual(["Contact"]);
    expect(api.calls).toHaveLength(1);
    expect(api.calls[0].url).toBe(`${API}/public/contact`);
    expect(JSON.parse(String(api.calls[0].init.body))).toEqual(BODY);
  });

  test("is not turned into a failure by the tracking", async () => {
    const { api, submit } = form({
      track: () => {
        throw new Error("blocked by extension");
      },
    });

    const sent = submit();
    api.answer(200);

    expect(await sent).toBe("success");
  });
});

describe("a form the API did not receive", () => {
  test.each([400, 422, 500])("an answer of %d reports no Contact", async (status) => {
    const { api, events, submit } = form();

    const sent = submit();
    api.answer(status);

    expect(await sent).toBe("error");
    expect(events).toEqual([]);
  });

  test("a request that cannot be made reports no Contact", async () => {
    const { events, submit } = form({
      send: (() => Promise.reject(new Error("offline"))) as unknown as typeof fetch,
    });

    expect(await submit()).toBe("error");
    expect(events).toEqual([]);
  });
});

describe("a second submit", () => {
  test("while the first is in flight sends nothing and reports nothing", async () => {
    const { api, events, submit } = form();

    const first = submit();
    const second = await submit();
    api.answer(200);

    expect(second).toBe("busy");
    expect(await first).toBe("success");
    expect(api.calls).toHaveLength(1);
    expect(events).toEqual(["Contact"]);
  });

  test.each([200, 500])("is allowed again once the first has been answered with %d", async (status) => {
    const { api, submit } = form();

    const first = submit();
    api.answer(status);
    await first;
    const again = submit();
    api.answer(200);

    expect(await again).toBe("success");
    expect(api.calls).toHaveLength(2);
  });
});
