import { PUSH_NOTIFICATIONS_PREVIEW as COPY } from "@/lib/landing-pages/copy/previews/push-notifications";
import { LpSection } from "../../shared/LpSection";
import { WordingEditor } from "./WordingEditor";

/** "Use our wording, or write your own": the dashboard's message editor, with the lock screen it writes to. */
export function EditorSection() {
  return (
    <LpSection section="editor" eyebrow={COPY.editor.eyebrow} title={COPY.editor.title} lead={COPY.editor.lead} align="center">
      <WordingEditor />
    </LpSection>
  );
}
