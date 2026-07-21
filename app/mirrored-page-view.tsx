import type { MirroredPage } from "./generated-pages";
import { WebflowRuntime } from "./webflow-runtime";

export function MirroredPageView({ page }: { page: MirroredPage }) {
  return (
    <>
      <main
        className="mirrored-content"
        dangerouslySetInnerHTML={{ __html: page.html }}
      />
      <WebflowRuntime page={page} />
    </>
  );
}
