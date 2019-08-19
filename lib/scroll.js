import { getScrollTop, Cause } from "./common";
export class ScrollManager {
    constructor(parent) {
        this.parent = parent;
        if ('scrollRestoration' in window.history) {
            window.history.scrollRestoration = 'manual';
        }
    }
    manageScrollPosition({ cause, url: { hash } }) {
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
    scrollHashIntoView(hash, options) {
        if (hash) {
            const el = document.getElementById(decodeURIComponent(hash.substr(1)));
            if (el)
                el.scrollIntoView(options);
            // else if (process.env.DEBUG) console.warn(`Can't find element with id ${hash}`);
        }
        else {
            window.scroll(window.pageXOffset, 0);
        }
    }
    restoreScrollPostion() {
        const { histId } = this.parent;
        const { scrollTop } = (window.history.state && window.history.state[histId]) || {};
        if (scrollTop != null) {
            // FIXME: Setting `min-height` to ensure that we can scroll back to the previous position?
            /* document.body.style.minHeight = `${scrollHeight}px`; */
            window.scroll(window.pageXOffset, scrollTop);
        }
    }
    restoreScrollPostionOnReload() {
        const userHasScrolled = getScrollTop() != 0;
        if (!userHasScrolled)
            this.restoreScrollPostion();
    }
}
;
