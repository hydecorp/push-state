import { isExternal, getScrollTop, getScrollHeight, Cause } from "./common";
export class HistoryManager {
    constructor(parent) {
        this.parent = parent;
    }
    updateHistoryState({ cause, replace, url: { href } }) {
        if (isExternal(this.parent))
            return;
        switch (cause) {
            case Cause.Init:
            case Cause.Push: {
                const id = this.parent.histId();
                const state = Object.assign({}, window.history.state, { [id]: {} });
                if (replace || href === window.location.href) {
                    window.history.replaceState(state, document.title, href);
                }
                else {
                    window.history.pushState(state, document.title, href);
                }
            }
            case Cause.Pop:
                break;
            default: {
                break;
            }
        }
    }
    updateHistoryStateHash({ cause, url }) {
        if (isExternal(this.parent))
            return;
        if (cause === Cause.Push) {
            const id = this.parent.histId();
            window.history.pushState({ [id]: {} }, document.title, url.href);
        }
    }
    updateHistoryTitle({ cause, title }) {
        document.title = title;
        if (!isExternal(this.parent) && cause === Cause.Push) {
            window.history.replaceState(window.history.state, title, window.location.href);
        }
    }
    updateHistoryScrollPosition() {
        if (isExternal(this.parent))
            return;
        const state = this.assignScrollPosition(window.history.state || {});
        window.history.replaceState(state, document.title, window.location.href);
    }
    assignScrollPosition(state) {
        const id = this.parent.histId();
        return Object.assign({}, state, { [id]: Object.assign({}, state[id], { scrollTop: getScrollTop(), scrollHeight: getScrollHeight() }) });
    }
}
;
