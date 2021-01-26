import { of, from } from "rxjs";
import { concatMap, catchError, finalize, mapTo } from "rxjs/operators";

import { HyPushState } from ".";

function cloneScript(script: HTMLScriptElement) {
  const newScript = document.createElement('script');
  Array.from(script.attributes).forEach(attr => newScript.setAttributeNode(attr.cloneNode() as Attr));
  newScript.innerHTML = script.innerHTML;
  return newScript;
}

export class ScriptManager {
  private parent: HyPushState;

  constructor(parent: HyPushState) {
    this.parent = parent;
  }

  get scriptSelector() { return this.parent.scriptSelector }

  removeScriptTags(replaceEls: (Element|null)[]) {
    const scripts: Array<[HTMLScriptElement, HTMLScriptElement]> = [];

    replaceEls.forEach(el => {
      if (el && this.scriptSelector) {
        el.querySelectorAll(this.scriptSelector).forEach((script) => {
          if (script instanceof HTMLScriptElement) {
            const newScript = cloneScript(script);
            const pair: [HTMLScriptElement, HTMLScriptElement] = [newScript, script];
            scripts.push(pair);
          }
        });
      }
    });

    return scripts;
  }

  reinsertScriptTags(context: { scripts: Array<[HTMLScriptElement, HTMLScriptElement]> }) {
    if (!this.scriptSelector) return Promise.resolve(context);

    const { scripts } = context;

    const originalWrite = document.write;

    return from(scripts).pipe(
      concatMap(script => this.insertScript(script)),
      catchError(error => of({ ...context, error })),
      finalize(() => (document.write = originalWrite)),
      mapTo(context),
    )
      .toPromise();
  }

  private insertScript([script, ref]: [HTMLScriptElement, HTMLScriptElement]): Promise<{}> {
    document.write = (...args) => {
      const temp = document.createElement("div");
      temp.innerHTML = args.join();
      Array.from(temp.childNodes).forEach(node => ref.parentNode?.insertBefore(node, ref));
    };

    return new Promise((resolve, reject) => {
      if (script.src !== "") {
        script.addEventListener("load", resolve);
        script.addEventListener("error", reject);
        ref.parentNode?.replaceChild(script, ref);
      } else {
        ref.parentNode?.replaceChild(script, ref);
        resolve({});
      }
    });
  }
}