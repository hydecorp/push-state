import { isExternal } from "./common";
import { ScriptManager } from "./script";
import { rewriteURLs } from "./rewrite-urls";
const CANONICAL_SEL = 'link[rel=canonical]';
const META_DESC_SEL = 'meta[name=description]';
;
export class UpdateManager {
    constructor(parent) {
        this.parent = parent;
        this.scriptManager = new ScriptManager(parent);
    }
    get el() { return this.parent; }
    get replaceSelector() { return this.parent.replaceSelector; }
    get scriptSelector() { return this.parent.scriptSelector; }
    // Extracts the elements to be replaced
    getReplaceElements(doc) {
        if (this.replaceSelector) {
            return this.replaceSelector.split(',').map(sel => doc.querySelector(sel));
        }
        else if (this.el.id) {
            return [doc.getElementById(this.el.id)];
        }
        else {
            const index = Array.from(document.getElementsByTagName(this.el.tagName)).indexOf(this.el);
            return [doc.getElementsByTagName(this.el.tagName)[index]];
        }
    }
    // Takes the response string and turns it into document fragments
    // that can be inserted into the DOM.
    responseToContent(context) {
        const { responseText } = context;
        const doc = new DOMParser().parseFromString(responseText, 'text/html');
        const { title = '' } = doc;
        const replaceEls = this.getReplaceElements(doc);
        if (replaceEls.every(el => el == null)) {
            throw new Error(`Couldn't find any element in the document at '${location}'.`);
        }
        const scripts = this.scriptSelector
            ? this.scriptManager.removeScriptTags(replaceEls)
            : [];
        return { ...context, document: doc, title, replaceEls, scripts };
    }
    // Replaces the old elements with the new one, one-by-one.
    replaceContentWithSelector(replaceSelector, elements) {
        replaceSelector
            .split(',')
            .map(sel => document.querySelector(sel))
            .forEach((oldElement, i) => {
            var _a;
            const el = elements[i];
            if (el)
                (_a = oldElement === null || oldElement === void 0 ? void 0 : oldElement.parentNode) === null || _a === void 0 ? void 0 : _a.replaceChild(el, oldElement);
        });
    }
    // When no `replaceIds` are set, replace the entire content of the component (slow).
    replaceContentWholesale([el]) {
        if (el)
            this.el.innerHTML = el.innerHTML;
    }
    replaceContent(replaceEls) {
        if (this.replaceSelector) {
            this.replaceContentWithSelector(this.replaceSelector, replaceEls);
        }
        else {
            this.replaceContentWholesale(replaceEls);
        }
    }
    replaceHead(doc) {
        const { head } = this.el.ownerDocument;
        const canonicalEl = head.querySelector(CANONICAL_SEL);
        const cEl = doc.head.querySelector(CANONICAL_SEL);
        if (canonicalEl && cEl)
            canonicalEl.href = cEl.href;
        const metaDescEl = head.querySelector(META_DESC_SEL);
        const mEl = doc.head.querySelector(META_DESC_SEL);
        if (metaDescEl && mEl)
            metaDescEl.content = mEl.content;
    }
    updateDOM(context) {
        try {
            const { replaceEls, document } = context;
            if (isExternal(this.parent))
                rewriteURLs(replaceEls, this.parent.href);
            this.replaceHead(document);
            this.replaceContent(replaceEls);
        }
        catch (error) {
            throw { ...context, error };
        }
    }
    reinsertScriptTags(context) {
        return this.scriptManager.reinsertScriptTags(context);
    }
}
//# sourceMappingURL=update.js.map