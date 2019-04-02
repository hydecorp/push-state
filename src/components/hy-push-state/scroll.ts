import { getScrollTop, Cause, Context } from "./common";

// ### Managing scroll positions
// The following functions deal with managing the scroll position of the site.

interface ScrollState {
  [k: string]: any;
  scrollTop?: number;
  scrollHeight?: number;
}

export class ScrollManager {
  private parent: { histId: () => string };

  constructor(parent: { histId: () => string }) {
    this.parent = parent;
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual';
    }
  }

  // TODO
  manageScrollPostion({ cause, url: { hash } }: Context) {
    switch (cause) {
      case Cause.Push:
        // FIXME: make configurable
        this.scrollHashIntoView(hash, { behavior: "smooth", block: "start", inline: "nearest" });
        break;
      case Cause.Pop: {
        this.restoreScrollPostion();
        break;
      }
      case Cause.Init: {
        this.restoreScrollPostionOnReload();
        break;
      }
    }
  }

  private scrollHashIntoView(hash: string, options: boolean | ScrollIntoViewOptions) {
    if (hash) {
      const el = document.getElementById(decodeURIComponent(hash.substr(1)));
      if (el) el.scrollIntoView(options);
      // else if (process.env.DEBUG) console.warn(`Can't find element with id ${hash}`);
    } else {
      window.scroll(window.pageXOffset, 0);
    }
  }

  private restoreScrollPostion() {
    const id = this.parent.histId();
    const { scrollTop } = (window.history.state && window.history.state[id]) || {} as ScrollState;

    if (scrollTop != null) {
      // FIXME: Setting `min-height` to ensure that we can scroll back to the previous position?
      /* document.body.style.minHeight = `${scrollHeight}px`; */
      window.scroll(window.pageXOffset, scrollTop);
    }
  }

  private restoreScrollPostionOnReload() {
    const userHasScrolled = getScrollTop() != 0;
    if (!userHasScrolled) this.restoreScrollPostion();
  }
};
