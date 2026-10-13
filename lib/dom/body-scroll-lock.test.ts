import { describe, expect, test } from "bun:test";
import { lockBodyScroll } from "./body-scroll-lock";

const fakeBody = (overflow = "") => ({ style: { overflow } });

describe("while a full-screen layer is open the page behind it does not scroll", () => {
  test("the lock hides overflow and the release puts back what the page had", () => {
    const body = fakeBody("auto");
    const release = lockBodyScroll(body);
    expect(body.style.overflow).toBe("hidden");
    release();
    expect(body.style.overflow).toBe("auto");
  });

  test("two layers open together keep the lock until the last one closes", () => {
    const body = fakeBody();
    const releaseMenu = lockBodyScroll(body);
    const releaseGuide = lockBodyScroll(body);
    releaseMenu();
    expect(body.style.overflow).toBe("hidden");
    releaseGuide();
    expect(body.style.overflow).toBe("");
  });

  test("a release called twice (React re-running an effect) does not unlock someone else's lock", () => {
    const body = fakeBody();
    const first = lockBodyScroll(body);
    const second = lockBodyScroll(body);
    first();
    first();
    expect(body.style.overflow).toBe("hidden");
    second();
    expect(body.style.overflow).toBe("");
  });
});
