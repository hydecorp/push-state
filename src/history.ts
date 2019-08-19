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

export class HistoryManager {
  private parent: Location & { histId: string, simulateHashChange: boolean };

  constructor(parent: Location & { histId: string, simulateHashChange: boolean }) {
    this.parent = parent;
  }

  updateHistoryState(context: Context) {
    const { cause, replace, url: { href, hash }, oldURL } = context
    if (isExternal(this.parent)) return;

    switch (cause) {
      case Cause.Init:
      case Cause.Push: {
        const { histId } = this.parent;

        const oldURL = location.href
        const hashChange = hash !== location.hash;

        if (replace || href === location.href) {
          const state = Object.assign(history.state || {}, { [histId]: {} });
          history.replaceState(state, document.title, href);
        } else {
          history.pushState({ [histId]: {} }, document.title, href);
        }

        if (this.parent.simulateHashChange && hashChange) {
          window.dispatchEvent(new HashChangeEvent('hashchange', { newURL: href, oldURL }))
        }
      }
      case Cause.Pop: {
        const hashChange = hash !== oldURL.hash;
        if (this.parent.simulateHashChange && hashChange) {
          window.dispatchEvent(new HashChangeEvent('hashchange', { newURL: href, oldURL: oldURL.href }))
        }
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

  // FIXME: use one updatehistory state function for both?
  updateHistoryStateHash({ cause, url }: Context) {
    if (isExternal(this.parent)) return; // TODO: abort or not?

    if (cause === Cause.Push) {
      const { histId } = this.parent;
      history.pushState({ [histId]: {} }, document.title, url.href);
    }
  }

  updateHistoryScrollPosition = () => {
    if (isExternal(this.parent)) return;

    const state = this.assignScrollPosition(history.state || {});
    history.replaceState(state, document.title);
  }

  private assignScrollPosition(state: object) {
    const { histId } = this.parent;
    return Object.assign(state, {
      [histId]: {
        ...state[histId],
        scrollTop: getScrollTop(),
        scrollHeight: getScrollHeight(),
      },
    });
  }
};
