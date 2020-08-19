import { isExternal, fragmentFromString } from "./common";

import { ScriptManager } from "./script";
import { rewriteURLs } from "./rewrite-urls";

import { ResponseContext } from './fetch';
import { HyPushState } from ".";

const CANONICAL_SEL = 'link[rel=canonical]';
const META_DESC_SEL = 'meta[name=description]';

export interface ReplaceContext extends ResponseContext {
  title: string;
  document: Document,
  replaceEls: [Element] | Element[];
  scripts: Array<[HTMLScriptElement, HTMLScriptElement]>;
};

export class UpdateManager {
  private parent: HyPushState;
  private scriptManager: ScriptManager;

  constructor(parent: HyPushState) {
    this.parent = parent;
    this.scriptManager = new ScriptManager(parent);
  }

  get el() { return this.parent.el; }
  get replaceSelector() { return this.parent.replaceSelector; }
  get scriptSelector() { return this.parent.scriptSelector; }

  // Extracts the elements to be replaced
  private getReplaceElements(doc: Document): Element[] {
    if (this.replaceSelector) {
      return this.replaceSelector.split(',').map(sel => doc.querySelector(sel));
    } else if (this.el.id) {
      return [doc.getElementById(this.el.id)];
    } else {
      const index = Array.from(document.getElementsByTagName(this.el.tagName)).indexOf(this.el);
      return [doc.getElementsByTagName(this.el.tagName)[index]];
    }
  }

  // Takes the response string and turns it into document fragments
  // that can be inserted into the DOM.
  responseToContent(context: ResponseContext): ReplaceContext {
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

  // Replaces the old elments with the new one, one-by-one.
  private replaceContentWithSelector(elements: Element[]) {
    this.replaceSelector
      .split(',')
      .map(sel => document.querySelector(sel))
      .forEach((oldElement, i) => oldElement.parentNode.replaceChild(elements[i], oldElement));
  }

  // When no `relaceIds` are set, replace the entire content of the component (slow).
  private replaceContentWholesale([el]: [Element]) {
    this.el.innerHTML = el.innerHTML;
  }

  private replaceContent(replaceEls: Element[]) {
    if (this.replaceSelector) {
      this.replaceContentWithSelector(replaceEls);
    } else {
      this.replaceContentWholesale(replaceEls as [Element]);
    }
  }

  private replaceHead(doc: Document)  {
    const { head } = this.el.ownerDocument;

    const canonicalEl = head.querySelector(CANONICAL_SEL) as HTMLLinkElement|null;
    const cEl = doc.head.querySelector(CANONICAL_SEL) as HTMLLinkElement|null;
    if (canonicalEl && cEl) canonicalEl.href = cEl.href;

    const metaDescEl = head.querySelector(META_DESC_SEL) as HTMLMetaElement|null;
    const mEl = doc.head.querySelector(META_DESC_SEL) as HTMLMetaElement|null;
    if (metaDescEl && mEl) metaDescEl.content = mEl.content;
  }

  updateDOM(context: ReplaceContext) {
    try {
      const { replaceEls, document } = context;
      if (isExternal(this.parent)) rewriteURLs(replaceEls, this.parent.href);
      this.replaceHead(document)
      this.replaceContent(replaceEls);
    } catch (error) {
      throw { ...context, error };
    }
  }

  reinsertScriptTags(context: { scripts: Array<[HTMLScriptElement, HTMLScriptElement]> }) {
    return this.scriptManager.reinsertScriptTags(context);
  }
}
