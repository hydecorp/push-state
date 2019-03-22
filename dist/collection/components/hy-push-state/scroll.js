import { getScrollTop, Cause } from "./common";
export class ScrollManager {
    constructor(parent) {
        this.parent = parent;
    }
    manageScrollPostion({ cause, url: { hash } }) {
        switch (cause) {
            case Cause.Push:
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
            case Cause.Hint: break;
        }
    }
    scrollHashIntoView(hash, options) {
        if (hash) {
            const el = document.getElementById(decodeURIComponent(hash.substr(1)));
            if (el)
                el.scrollIntoView(options);
        }
        else {
            window.scroll(window.pageXOffset, 0);
        }
    }
    restoreScrollPostion() {
        const id = this.parent.histId();
        const { scrollTop } = (window.history.state && window.history.state[id]) || {};
        if (scrollTop != null) {
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
