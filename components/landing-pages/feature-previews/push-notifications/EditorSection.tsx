import { useLandingCopy } from "@/lib/landing-pages/copy/bundle";
import { LpSection } from "../../shared/LpSection";
import { WordingEditor } from "./WordingEditor";

/** The dashboard's message editor, with the lock screen it writes to. */
export function EditorSection() {
  const copy = useLandingCopy();
  const { editor } = copy.previews.pushNotifications.PUSH_NOTIFICATIONS_PREVIEW;

  return (
    <LpSection section="editor" eyebrow={editor.eyebrow} title={editor.title} lead={editor.lead} align="center">
      <WordingEditor
        copy={editor}
        sender={copy.shared.SAMPLE_BUSINESS}
        timeAgo={copy.shared.SHARED.now}
        alt={copy.previews.shared.PREVIEW_SHARED.lockScreenAlt}
      />
    </LpSection>
  );
}
