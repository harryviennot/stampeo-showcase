"use client";

/**
 * Last-resort "open the app" button.
 *
 * When App Links / Universal Links are verified the OS opens the app before
 * this page ever renders, so this button only fires on the paths that slipped
 * through: an in-app browser that swallowed the association, or a device where
 * verification has not run yet. The custom scheme still works there.
 */
export function OpenInApp({ code, label }: { code: string; label: string }) {
  return (
    <button
      type="button"
      onClick={() => {
        globalThis.location.href = `stampeo-scanner://join?code=${encodeURIComponent(code)}`;
      }}
      style={{
        width: "100%",
        padding: "16px 24px",
        borderRadius: 9999,
        border: "none",
        background: "#f97316",
        color: "#fff",
        fontSize: 16,
        fontWeight: 600,
        cursor: "pointer",
      }}
    >
      {label}
    </button>
  );
}
