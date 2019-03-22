import { isExternal, getScrollTop, getScrollHeight, Cause, Context } from "./common";

import { ReplaceContext } from "./update";

export class HistoryManager {
  private parent: {
    host: string;
    protocol: string;
    histId: () => string;
  };

  constructor(parent: { host: string, protocol: string, histId: () => string }) {
    this.parent = parent;
  }

  // ## Update History state
  // add a new entry on the history stack, assuming the href is differnt.
  updateHistoryState({ cause, replace, url: { href } }: Context) {
    if (isExternal(this.parent)) return;

    switch (cause) {
      case Cause.Init:
      case Cause.Push: {
        const id = this.parent.histId();
        const state = { ...window.history.state, [id]: {} };
        if (replace || href === window.location.href) {
          window.history.replaceState(state, document.title, href);
        } else {
          window.history.pushState(state, document.title, href);
        }
      }
      case Cause.Pop:
        break;
      default: {
        //   if (process.env.DEBUG) console.warn(`Type '${cause}' not reconginzed?`);
        break;
      }
    }
  }

  // FIXME: use one updatehistory state function for both?
  updateHistoryStateHash({ cause, url }: Context) {
    if (isExternal(this.parent)) return; // TODO: abort or not?

    if (cause === Cause.Push) {
      const id = this.parent.histId();
      window.history.pushState({ [id]: {} }, document.title, url.href);
    }
  }

  updateHistoryTitle({ cause, title }: ReplaceContext) {
    document.title = title;

    if (!isExternal(this.parent) && cause === Cause.Push) {
      window.history.replaceState(window.history.state, title, window.location.href);
    }
  }

  updateHistoryScrollPosition() {
    if (isExternal(this.parent)) return;

    const state = this.assignScrollPosition(window.history.state || {});
    window.history.replaceState(state, document.title, window.location.href);
  }

  private assignScrollPosition(state: object) {
    const id = this.parent.histId();
    return {
      ...state,
      [id]: {
        ...state[id],
        scrollTop: getScrollTop(),
        scrollHeight: getScrollHeight(),
      },
    };
  }
};
