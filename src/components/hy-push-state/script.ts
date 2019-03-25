import { of, from } from "rxjs";
import { concatMap, catchError, finalize, mapTo } from "rxjs/operators";

import { ReplaceContext } from "./update";
import { HyPushState } from ".";

export class ScriptManager {
  private parent: HyPushState;

  constructor(parent: HyPushState) {
    this.parent = parent;
  }

  get scriptSelector() { return this.parent.scriptSelector }

  removeScriptTags(replaceEls: Element[]) {
    const scripts: Array<[HTMLScriptElement, Node | null]> = [];

    replaceEls.forEach(el => {
      return el.querySelectorAll(this.scriptSelector).forEach((script: HTMLScriptElement) => {
        const pair: [HTMLScriptElement, Node] = [script, script.previousSibling];
        script.parentNode.removeChild(script);
        scripts.push(pair);
      })
    });

    return scripts;
  }

  reinsertScriptTags(context: ReplaceContext) {
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

  private insertScript([script, ref]: [HTMLScriptElement, Node]): Promise<{}> {
    document.write = (...args) => {
      const temp = document.createElement("div");
      temp.innerHTML = args.join();
      Array.from(temp.childNodes).forEach(node => {
        ref.parentNode.insertBefore(node, ref.nextSibling);
      });
    };

    return new Promise((resolve, reject) => {
      if (script.src !== "") {
        script.addEventListener("load", resolve);
        script.addEventListener("error", reject);
        ref.parentNode.insertBefore(script, ref.nextSibling);
      } else {
        ref.parentNode.insertBefore(script, ref.nextSibling);
        resolve();
      }
    });
  }
}