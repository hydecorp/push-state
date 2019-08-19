// When fetching documents from an external source,
// relative URLs will be resolved relative to the current `window.location`.
// We can rewrite URL to absolute urls
export function rewriteURLs(replaceEls, base) {
    replaceEls.forEach((el) => {
        el.querySelectorAll("[href]").forEach(rewriteURL("href", base));
        el.querySelectorAll("[src]").forEach(rewriteURL("src", base));
        el.querySelectorAll("img[srcset]").forEach(rewriteURLSrcSet("srcset", base));
        el.querySelectorAll("blockquote[cite]").forEach(rewriteURL("cite", base));
        el.querySelectorAll("del[cite]").forEach(rewriteURL("cite", base));
        el.querySelectorAll("ins[cite]").forEach(rewriteURL("cite", base));
        el.querySelectorAll("q[cite]").forEach(rewriteURL("cite", base));
        el.querySelectorAll("img[longdesc]").forEach(rewriteURL("longdesc", base));
        el.querySelectorAll("frame[longdesc]").forEach(rewriteURL("longdesc", base));
        el.querySelectorAll("iframe[longdesc]").forEach(rewriteURL("longdesc", base));
        el.querySelectorAll("img[usemap]").forEach(rewriteURL("usemap", base));
        el.querySelectorAll("input[usemap]").forEach(rewriteURL("usemap", base));
        el.querySelectorAll("object[usemap]").forEach(rewriteURL("usemap", base));
        el.querySelectorAll("form[action]").forEach(rewriteURL("action", base));
        el.querySelectorAll("button[formaction]").forEach(rewriteURL("formaction", base));
        el.querySelectorAll("input[formaction]").forEach(rewriteURL("formaction", base));
        el.querySelectorAll("video[poster]").forEach(rewriteURL("poster", base));
        el.querySelectorAll("object[data]").forEach(rewriteURL("data", base));
        el.querySelectorAll("object[codebase]").forEach(rewriteURL("codebase", base));
        el.querySelectorAll("object[archive]").forEach(rewriteURLList("archive", base));
        /* el.querySelectorAll("command[icon]").forEach(this.rewriteURL("icon")); */ // obsolte
    });
}
function rewriteURL(attr, base) {
    return (el) => {
        try {
            el.setAttribute(attr, new URL(el.getAttribute(attr), base).href);
        }
        catch (e) {
            // if (process.env.DEBUG) console.warn(`Couldn't rewrite URL in attribute ${attr} on element`, el);
        }
    };
}
function rewriteURLSrcSet(attr, base) {
    return (el) => {
        try {
            el.setAttribute(attr, el
                .getAttribute(attr)
                .split(/\s*,\s*/)
                .map(str => {
                const pair = str.split(/\s+/);
                pair[0] = new URL(pair[0], base).href;
                return pair.join(" ");
            })
                .join(", "));
        }
        catch (e) {
            // if (process.env.DEBUG) console.warn(`Couldn't rewrite URLs in attribute ${attr} on element`, el);
        }
    };
}
function rewriteURLList(attr, base) {
    return (el) => {
        try {
            el.setAttribute(attr, el
                .getAttribute(attr)
                .split(/[\s,]+/)
                .map(str => new URL(str, base).href)
                .join(", "));
        }
        catch (e) {
            // if (process.env.DEBUG) console.warn(`Couldn't rewrite URLs in attribute ${attr} on element`, el);
        }
    };
}
