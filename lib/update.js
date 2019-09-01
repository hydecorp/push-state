import { isExternal, fragmentFromString } from "./common";
import { ScriptManager } from "./script";
import { rewriteURLs } from "./rewrite-urls";
;
export class UpdateManager {
    constructor(parent) {
        this.parent = parent;
        this.scriptManager = new ScriptManager(parent);
    }
    get el() { return this.parent.el; }
    get replaceSelector() { return this.parent.replaceSelector; }
    get scriptSelector() { return this.parent.scriptSelector; }
    // Extracts the title of the page
    getTitle(fragment) {
        return (fragment.querySelector("title") || { textContent: '' }).textContent;
    }
    // Extracts the elements to be replaced
    getReplaceElements(fragment) {
        if (this.replaceSelector) {
            return this.replaceSelector.split(',').map(sel => fragment.querySelector(sel));
        }
        else if (this.el.id) {
            return [fragment.getElementById(this.el.id)];
        }
        else {
            const index = Array.from(document.getElementsByTagName(this.el.tagName)).indexOf(this.el);
            return [fragment.querySelectorAll(this.el.tagName)[index]];
        }
    }
    // Takes the response string and turns it into document fragments
    // that can be inserted into the DOM.
    responseToContent(context) {
        try {
            const { response } = context;
            const documentFragment = fragmentFromString(response);
            const title = this.getTitle(documentFragment);
            const replaceEls = this.getReplaceElements(documentFragment);
            // if (replaceEls.some(x => x == null)) {
            //   throw { ...context, replaceElMissing: true };
            // }
            const scripts = this.scriptSelector
                ? this.scriptManager.removeScriptTags(replaceEls)
                : [];
            return { ...context, documentFragment, title, replaceEls, scripts };
        }
        catch (e) {
            console.error(e);
        }
    }
    // Replaces the old elments with the new one, one-by-one.
    replaceContentWithSelector(elements) {
        this.replaceSelector
            .split(',')
            .map(sel => document.querySelector(sel))
            .forEach((oldElement, i) => oldElement.parentNode.replaceChild(elements[i], oldElement));
    }
    // When no `relaceIds` are set, replace the entire content of the component (slow).
    replaceContentWholesale([el]) {
        this.el.innerHTML = el.innerHTML;
    }
    // TODO: doc
    replaceContent(replaceEls) {
        if (this.replaceSelector) {
            this.replaceContentWithSelector(replaceEls);
        }
        else {
            this.replaceContentWholesale(replaceEls);
        }
    }
    // TODO: doc
    updateDOM(context) {
        try {
            const { replaceEls } = context;
            if (isExternal(this.parent))
                rewriteURLs(replaceEls, this.parent.href);
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
