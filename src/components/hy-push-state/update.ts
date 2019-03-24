import { isExternal, fragmentFromString } from "./common";

import { ScriptManager } from "./script";
import { rewriteURLs } from "./rewrite-urls";

import { ResponseContext } from './fetch';
import { HyPushState } from ".";

export interface ReplaceContext extends ResponseContext {
  title: string;
  documentFragment: DocumentFragment;
  replaceEls: [Element] | Element[];
  scripts: Array<[HTMLScriptElement, Node | null]>;
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

  // Extracts the title of the page
  private getTitle(fragment: DocumentFragment) {
    return (fragment.querySelector("title") || { textContent: '' } as HTMLTitleElement).textContent;
  }

  // Extracts the elements to be replaced
  private getReplaceElements(fragment: DocumentFragment): Element[] {
    if (this.replaceSelector) {
      return this.replaceSelector.split(',').map(sel => fragment.querySelector(sel));
    } else if (this.el.id) {
      return [fragment.getElementById(this.el.id)];
    } else {
      const index = Array.from(document.getElementsByTagName(this.el.tagName)).indexOf(this.el);
      return [fragment.querySelectorAll(this.el.tagName)[index]];
    }
  }

  // Takes the response string and turns it into document fragments
  // that can be inserted into the DOM.
  responseToContent(context: ResponseContext): ReplaceContext {
    try {
      const { response } = context;

      const documentFragment = fragmentFromString(response);
      const title = this.getTitle(documentFragment);
      const replaceEls = this.getReplaceElements(documentFragment);

      // if (replaceEls.some(x => x == null)) {
      //   throw { ...context, replaceElMissing: true };
      // }

      const scripts = this.scriptSelector
        ? this.scriptManager.tempRemoveScriptTags(replaceEls)
        : [];

      return { ...context, documentFragment, title, replaceEls, scripts };
    } catch (e) {
      console.error(e);
    }
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

  // TODO: doc
  private replaceContent(replaceEls: Element[]) {
    if (this.scriptSelector) {
      this.replaceContentWithSelector(replaceEls);
    } else {
      this.replaceContentWholesale(replaceEls as [Element]);
    }
  }

  // TODO: doc
  updateDOM(context: ReplaceContext) {
    try {
      const { replaceEls } = context;
      if (isExternal(this.parent)) rewriteURLs(replaceEls, this.parent.href);
      this.replaceContent(replaceEls);
    } catch (error) {
      throw { ...context, error };
    }
  }

  reinsertScriptTags(context: ReplaceContext) {
    return this.scriptManager.reinsertScriptTags(context);
  }
}
