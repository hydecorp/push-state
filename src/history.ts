import { isExternal, getScrollTop, getScrollHeight, Cause, Context } from "./common";

import { ReplaceContext } from "./update";

// @ts-ignore
window.HashChangeEvent = window.HashChangeEvent || function HashChangeEvent(type, { oldURL = '', newURL = '' } = {}) {
  const e = new CustomEvent(type)
  // @ts-ignore
  e.oldURL = oldURL;
  // @ts-ignore
  e.newURL = newURL;
  return e;
}

function simHashChange(newURL: URL, oldURL: URL) {
  if (newURL.hash !== oldURL.hash) {
    window.dispatchEvent(new HashChangeEvent('hashchange', { newURL: newURL.href, oldURL: oldURL.href }));
  }
}

export class HistoryManager {
  private parent: Location & { histId: string, simulateHashChange: boolean };

  constructor(parent: Location & { histId: string, simulateHashChange: boolean }) {
    this.parent = parent;
  }

  updateHistoryState({ cause, replace, url, oldURL }: Context) {
    if (isExternal(this.parent)) return;

    switch (cause) {
      case Cause.Init:
      case Cause.Push: {
        const { histId } = this.parent;

        if (replace || url.href === location.href) {
          const state = { ...history.state, [histId]: {} };
          history.replaceState(state, document.title, url.href);
        } else {
          history.pushState({ [histId]: {} }, document.title, url.href);
        }
        // no break
      }
      case Cause.Pop: {
        if (this.parent.simulateHashChange && oldURL) simHashChange(url, oldURL);
        break;
      }
      default: {
        // if (process.env.DEBUG) console.warn(`Type '${cause}' not reconginzed`);
        break;
      }
    }
  }

  updateTitle({ cause, title }: ReplaceContext) {
    document.title = title;
    if (!isExternal(this.parent) && cause === Cause.Push) {
      history.replaceState(history.state, title);
    }
  }

  updateHistoryScrollPosition = () => {
    if (isExternal(this.parent)) return;

    const state = this.assignScrollPosition(history.state || {});
    history.replaceState(state, document.title);
  }

  private assignScrollPosition(state: any) {
    const { histId } = this.parent;
    return {
      ...state,
      [histId]: {
        ...state[histId],
        scrollTop: getScrollTop(),
        scrollHeight: getScrollHeight(),
      },
    };
  }
};
