import { renderIn, type Region } from "./render-en";

/**
 * What `run` answers when it runs inside a render under the locale's providers: a component called as a function
 * gets the context its hooks read, and what it returns (a tree of elements with their handler props) is handed
 * back without being mounted. A server render cannot click, so a test takes the handler from the tree and calls it.
 */
export function inRender<T>(locale: string, run: () => T, region: Region = {}): T {
  let answer: T | undefined;
  const Probe = () => {
    answer = run();
    return null;
  };

  renderIn(locale, <Probe />, region);
  return answer as T;
}
