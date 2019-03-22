import { isExternal, fragmentFromString } from "./common";
import { ScriptManager } from "./script";
import { URLRewriter } from "./url-rewriter";
;
export class UpdateManager {
    constructor(parent) {
        this.parent = parent;
        this.urlRewriter = new URLRewriter(parent);
        this.scriptManager = new ScriptManager(parent);
    }
    get el() { return this.parent.el; }
    get replaceSelector() { return this.parent.replaceSelector; }
    get scriptSelector() { return this.parent.scriptSelector; }
    getTitle(fragment) {
        return (fragment.querySelector("title") || { textContent: '' }).textContent;
    }
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
    responseToContent(context) {
        try {
            const { response } = context;
            const documentFragment = fragmentFromString(response);
            const title = this.getTitle(documentFragment);
            const replaceEls = this.getReplaceElements(documentFragment);
            const scripts = this.scriptSelector
                ? this.scriptManager.tempRemoveScriptTags(replaceEls)
                : [];
            return Object.assign({}, context, { documentFragment, title, replaceEls, scripts });
        }
        catch (e) {
            console.error(e);
        }
    }
    replaceContentWithSelector(elements) {
        this.replaceSelector
            .split(',')
            .map(sel => document.querySelector(sel))
            .forEach((oldElement, i) => oldElement.parentNode.replaceChild(elements[i], oldElement));
    }
    replaceContentWholesale([el]) {
        this.el.innerHTML = el.innerHTML;
    }
    replaceContent(replaceEls) {
        if (this.scriptSelector) {
            this.replaceContentWithSelector(replaceEls);
        }
        else {
            this.replaceContentWholesale(replaceEls);
        }
    }
    updateDOM(context) {
        try {
            const { replaceEls } = context;
            if (isExternal(this.parent))
                this.urlRewriter.rewriteURLs(replaceEls);
            this.replaceContent(replaceEls);
        }
        catch (error) {
            throw Object.assign({}, context, { error });
        }
    }
    reinsertScriptTags(context) {
        return this.scriptManager.reinsertScriptTags(context);
    }
}
