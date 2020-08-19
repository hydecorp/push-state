import { getScrollTop, Cause } from "./common";
export class ScrollManager {
    constructor(parent) {
        this.parent = parent;
        if ('scrollRestoration' in history) {
            history.scrollRestoration = 'manual';
        }
    }
    manageScrollPosition({ cause, url: { hash } }) {
        switch (cause) {
            case Cause.Push: {
                // FIXME: make configurable
                this.scrollHashIntoView(hash, { behavior: "smooth", block: "start", inline: "nearest" });
                break;
            }
            case Cause.Pop: {
                this.restoreScrollPosition();
                break;
            }
            case Cause.Init: {
                this.restoreScrollPositionOnReload();
                break;
            }
        }
    }
    elementFromHash(hash) {
        return document.getElementById(decodeURIComponent(hash.substr(1)));
    }
    scrollHashIntoView(hash, options) {
        if (hash) {
            const el = this.elementFromHash(hash);
            if (el)
                el.scrollIntoView(options);
        }
        else {
            window.scroll(window.pageXOffset, 0);
        }
    }
    restoreScrollPosition() {
        const { histId } = this.parent;
        const { scrollTop } = (history.state && history.state[histId]) || {};
        if (scrollTop != null) {
            window.scroll(window.pageXOffset, scrollTop);
        }
    }
    restoreScrollPositionOnReload() {
        const { histId } = this.parent;
        const scrollState = history.state && history.state[histId];
        // FIXME: As far as I can tell there is no better way of figuring out if the user has scrolled
        //        and it doesn't work on hash links b/c the scroll position is going to be non-null by definition
        if (scrollState && getScrollTop() === 0) {
            this.restoreScrollPosition();
        }
        else if (location.hash) {
            requestAnimationFrame(() => this.scrollHashIntoView(location.hash, true));
        }
    }
}
;
//# sourceMappingURL=scroll.js.map