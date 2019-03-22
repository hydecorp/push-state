import { Observable, of, from, PartialObserver } from "rxjs";
import { tap, concatMap, catchError, finalize } from "rxjs/operators";

import { ReplaceContext } from "./update";
import { HyPushState } from ".";

export class ScriptManager {
  private parent: HyPushState;

  constructor(parent: HyPushState) {
    this.parent = parent;
  }

  get scriptSelector() { return this.parent.scriptSelector }

  tempRemoveScriptTags(replaceEls: Element[]) {
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

  insertScript([script, ref]: [HTMLScriptElement, Node]): Observable<{}> {
    document.write = (...args) => {
      const temp = document.createElement("div");
      temp.innerHTML = args.join();
      Array.from(temp.childNodes).forEach(node => {
        ref.parentNode.insertBefore(node, ref.nextSibling);
      });
    };

    return script.src !== ""
      ? Observable.create((observer: PartialObserver<Event>) => {
        script.addEventListener("load", e => (observer.next(e), observer.complete()));
        script.addEventListener("error", e => (observer.error(e)))
        ref.parentNode.insertBefore(script, ref.nextSibling);
      })
      : of({}).pipe(tap(() => {
        ref.parentNode.insertBefore(script, ref.nextSibling);
      }));
  }

  reinsertScriptTags(context: ReplaceContext) {
    if (!this.scriptSelector) return Promise.resolve(context);

    const originalWrite = document.write;

    const { scripts } = context;

    return from(scripts).pipe(
      concatMap(script => this.insertScript(script)),
      catchError(error => of({ ...context, error })),
      finalize(() => (document.write = originalWrite))
    )
      .toPromise()
      .then(() => context);
  }
}