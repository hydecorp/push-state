import { isExternal, getScrollTop, getScrollHeight, Cause, Context } from "./common";

import { ReplaceContext } from "./update";

export class HistoryManager {
  private parent: Location & { histId: () => string };

  constructor(parent: Location & { histId: () => string }) {
    this.parent = parent;
  }

  updateHistoryState({ cause, replace, url: { href }, title }: ReplaceContext) {
    if (isExternal(this.parent)) return;

    switch (cause) {
      case Cause.Init:
      case Cause.Push: {
        const id = this.parent.histId();
        if (replace || href === location.href) {
          const state = { ...history.state, [id]: { ...history.state[id] } };
          history.replaceState(state, title, href);
        } else {
          const state = { ...history.state, [id]: {} };
          history.pushState(state, title, href);
        }
      }
      case Cause.Pop: {
        break;
      }
      default: {
        // if (process.env.DEBUG) console.warn(`Type '${cause}' not reconginzed`);
        break;
      }
    }
  }

  // FIXME: use one updatehistory state function for both?
  updateHistoryStateHash({ cause, url }: Context) {
    if (isExternal(this.parent)) return; // TODO: abort or not?

    if (cause === Cause.Push) {
      const id = this.parent.histId();
      history.pushState({ ...history.state, [id]: {} }, document.title, url.href);
    }
  }

  updateHistoryScrollPosition = () => {
    if (isExternal(this.parent)) return;

    const state = this.assignScrollPosition(history.state || {});
    history.replaceState(state, document.title, location.href);
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
