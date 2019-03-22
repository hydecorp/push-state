import { Observable, of, from } from "rxjs";
import { tap, concatMap, catchError, finalize } from "rxjs/operators";
export class ScriptManager {
    constructor(parent) {
        this.parent = parent;
    }
    get scriptSelector() { return this.parent.scriptSelector; }
    tempRemoveScriptTags(replaceEls) {
        const scripts = [];
        replaceEls.forEach(el => {
            return el.querySelectorAll(this.scriptSelector).forEach((script) => {
                const pair = [script, script.previousSibling];
                script.parentNode.removeChild(script);
                scripts.push(pair);
            });
        });
        return scripts;
    }
    insertScript([script, ref]) {
        document.write = (...args) => {
            const temp = document.createElement("div");
            temp.innerHTML = args.join();
            Array.from(temp.childNodes).forEach(node => {
                ref.parentNode.insertBefore(node, ref.nextSibling);
            });
        };
        return script.src !== ""
            ? Observable.create((observer) => {
                script.addEventListener("load", e => (observer.next(e), observer.complete()));
                script.addEventListener("error", e => (observer.error(e)));
                ref.parentNode.insertBefore(script, ref.nextSibling);
            })
            : of({}).pipe(tap(() => {
                ref.parentNode.insertBefore(script, ref.nextSibling);
            }));
    }
    reinsertScriptTags(context) {
        if (!this.scriptSelector)
            return Promise.resolve(context);
        const originalWrite = document.write;
        const { scripts } = context;
        return from(scripts).pipe(concatMap(script => this.insertScript(script)), catchError(error => of(Object.assign({}, context, { error }))), finalize(() => (document.write = originalWrite)))
            .toPromise()
            .then(() => context);
    }
}
