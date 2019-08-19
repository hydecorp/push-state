import { of, from } from "rxjs";
import { concatMap, catchError, finalize, mapTo } from "rxjs/operators";
export class ScriptManager {
    constructor(parent) {
        this.parent = parent;
    }
    get scriptSelector() { return this.parent.scriptSelector; }
    removeScriptTags(replaceEls) {
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
    reinsertScriptTags(context) {
        if (!this.scriptSelector)
            return Promise.resolve(context);
        const { scripts } = context;
        const originalWrite = document.write;
        return from(scripts).pipe(concatMap(script => this.insertScript(script)), catchError(error => of({ ...context, error })), finalize(() => (document.write = originalWrite)), mapTo(context))
            .toPromise();
    }
    insertScript([script, ref]) {
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
            }
            else {
                ref.parentNode.insertBefore(script, ref.nextSibling);
                resolve();
            }
        });
    }
}
