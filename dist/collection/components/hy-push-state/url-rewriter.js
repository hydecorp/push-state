export class URLRewriter {
    constructor(parent) {
        this.parent = parent;
    }
    get href() { return this.parent.href; }
    ;
    rewriteURLs(replaceEls) {
        replaceEls.forEach((el) => {
            el.querySelectorAll("[href]").forEach(this.rewriteURL("href"));
            el.querySelectorAll("[src]").forEach(this.rewriteURL("src"));
            el.querySelectorAll("img[srcset]").forEach(this.rewriteURLSrcSet("srcset"));
            el.querySelectorAll("blockquote[cite]").forEach(this.rewriteURL("cite"));
            el.querySelectorAll("del[cite]").forEach(this.rewriteURL("cite"));
            el.querySelectorAll("ins[cite]").forEach(this.rewriteURL("cite"));
            el.querySelectorAll("q[cite]").forEach(this.rewriteURL("cite"));
            el.querySelectorAll("img[longdesc]").forEach(this.rewriteURL("longdesc"));
            el.querySelectorAll("frame[longdesc]").forEach(this.rewriteURL("longdesc"));
            el.querySelectorAll("iframe[longdesc]").forEach(this.rewriteURL("longdesc"));
            el.querySelectorAll("img[usemap]").forEach(this.rewriteURL("usemap"));
            el.querySelectorAll("input[usemap]").forEach(this.rewriteURL("usemap"));
            el.querySelectorAll("object[usemap]").forEach(this.rewriteURL("usemap"));
            el.querySelectorAll("form[action]").forEach(this.rewriteURL("action"));
            el.querySelectorAll("button[formaction]").forEach(this.rewriteURL("formaction"));
            el.querySelectorAll("input[formaction]").forEach(this.rewriteURL("formaction"));
            el.querySelectorAll("video[poster]").forEach(this.rewriteURL("poster"));
            el.querySelectorAll("object[data]").forEach(this.rewriteURL("data"));
            el.querySelectorAll("object[codebase]").forEach(this.rewriteURL("codebase"));
            el.querySelectorAll("object[archive]").forEach(this.rewriteURLList("archive"));
        });
    }
    rewriteURL(attr) {
        return (el) => {
            try {
                el.setAttribute(attr, new URL(el.getAttribute(attr), this.href).href);
            }
            catch (e) {
            }
        };
    }
    rewriteURLSrcSet(attr) {
        return (el) => {
            try {
                el.setAttribute(attr, el
                    .getAttribute(attr)
                    .split(/\s*,\s*/)
                    .map(str => {
                    const pair = str.split(/\s+/);
                    pair[0] = new URL(pair[0], this.href).href;
                    return pair.join(" ");
                })
                    .join(", "));
            }
            catch (e) {
            }
        };
    }
    rewriteURLList(attr) {
        return (el) => {
            try {
                el.setAttribute(attr, el
                    .getAttribute(attr)
                    .split(/[\s,]+/)
                    .map(str => new URL(str, this.href).href)
                    .join(", "));
            }
            catch (e) {
            }
        };
    }
}
