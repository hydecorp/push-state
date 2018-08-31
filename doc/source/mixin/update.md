# src / mixin / update.js
Copyright (c) 2018 Florian Klampfer <https://qwtel.com/>

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with this program.  If not, see <http://www.gnu.org/licenses/>.


```js

import { fragmentFromString, isExternal } from "../common";

import { scriptMixin } from "./script-hack";

export const updateMixin = C =>
  class extends scriptMixin(C) {
```

Extracts the title of the page


```js
    getTitle(fragment) {
      return (fragment.querySelector("title") || {}).textContent;
    }
```

Extracts the elements to be replaced


```js
    getReplaceElements(fragment) {
      if (this.replaceIds.length > 0) {
        return this.replaceIds.map(id => fragment.getElementById(id));
      } else if (this.el.id) {
        return [fragment.getElementById(this.el.id)];
      } else {
        const index = Array.from(document.getElementsByTagName(this.el.tagName)).indexOf(this.el);
        return [fragment.querySelectorAll(this.el.tagName)[index]];
      }
    }
```

Takes the response string and turns it into document fragments
that can be inserted into the DOM.


```js
    responseToContent(context) {
      const { response } = context;

      const documentFragment = fragmentFromString(response);
      const title = this.getTitle(documentFragment);
      const replaceEls = this.getReplaceElements(documentFragment);

      if (replaceEls.some(x => x == null)) {
        throw Object.assign(context, { replaceElMissing: true });
      }

      const scripts = this.scriptSelector ? this.tempRemoveScriptTags(replaceEls) : [];

      return Object.assign(context, { documentFragment, title, replaceEls, scripts });
    }
```

Replaces the old elments with the new one, one-by-one.


```js
    replaceContentByIds(elements) {
      this.replaceIds
        .map(id => document.getElementById(id))
        .forEach((oldElement, i) => oldElement.parentNode.replaceChild(elements[i], oldElement));
    }
```

When no `relaceIds` are set, replace the entire content of the component (slow).


```js
    replaceContentWholesale([el]) {
      this.el.innerHTML = el.innerHTML;
    }
```

TODO: doc


```js
    replaceContent(replaceEls) {
      if (this.replaceIds.length > 0) {
        this.replaceContentByIds(replaceEls);
      } else {
        this.replaceContentWholesale(replaceEls);
      }
    }
```

TODO: doc


```js
    updateDOM(context) {
      try {
        const { replaceEls } = context;
        this.updateHistoryTitle(context);
        if (isExternal(this)) this.rewriteURLs(replaceEls);
        this.replaceContent(replaceEls);
      } catch (error) {
        throw Object.assign(context, { error });
      }
    }
```

When fetching documents from an external source,
relative URLs will be resolved relative to the current `window.location`.
We can rewrite URL to absolute urls


```js
    rewriteURLs(replaceEls) {
      replaceEls.forEach(el => {
        /* console.time(); */
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
        /* console.timeEnd(); */
        /* el.querySelectorAll("command[icon]").forEach(this.rewriteURL("icon")); */ // obsolte
      });
    }

    rewriteURL(attr) {
      return el => {
        try {
          el.setAttribute(attr, new URL(el.getAttribute(attr), this.href).href);
        } catch (e) {
          if (process.env.DEBUG)
            console.warn(`Couldn't rewrite URL in attribute ${attr} on element`, el);
        }
      };
    }

    rewriteURLSrcSet(attr) {
      return el => {
        try {
          el.setAttribute(
            attr,
            el
              .getAttribute(attr)
              .split(/\s*,\s*/)
              .map(str => {
                const pair = str.split(/\s+/);
                pair[0] = new URL(pair[0], this.href).href;
                return pair.join(" ");
              })
              .join(", ")
          );
        } catch (e) {
          if (process.env.DEBUG)
            console.warn(`Couldn't rewrite URLs in attribute ${attr} on element`, el);
        }
      };
    }

    rewriteURLList(attr) {
      return el => {
        try {
          el.setAttribute(
            attr,
            el
              .getAttribute(attr)
              .split(/[\s,]+/)
              .map(str => new URL(str, this.href).href)
              .join(", ")
          );
        } catch (e) {
          if (process.env.DEBUG)
            console.warn(`Couldn't rewrite URLs in attribute ${attr} on element`, el);
        }
      };
    }
  };
```


