import { of, from } from "rxjs";
import { concatMap, catchError, finalize, mapTo } from "rxjs/operators";
function cloneScript(script) {
    const newScript = document.createElement('script');
    Array.from(script.attributes).forEach(attr => newScript.setAttributeNode(attr.cloneNode()));
    newScript.innerHTML = script.innerHTML;
    return newScript;
}
export class ScriptManager {
    constructor(parent) {
        this.parent = parent;
    }
    get scriptSelector() { return this.parent.scriptSelector; }
    removeScriptTags(replaceEls) {
        const scripts = [];
        replaceEls.forEach(el => {
            if (el && this.scriptSelector) {
                el.querySelectorAll(this.scriptSelector).forEach((script) => {
                    if (script instanceof HTMLScriptElement) {
                        const newScript = cloneScript(script);
                        const pair = [newScript, script];
                        scripts.push(pair);
                    }
                });
            }
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
            Array.from(temp.childNodes).forEach(node => { var _a; return (_a = ref.parentNode) === null || _a === void 0 ? void 0 : _a.insertBefore(node, ref); });
        };
        return new Promise((resolve, reject) => {
            var _a, _b;
            if (script.src !== "") {
                script.addEventListener("load", resolve);
                script.addEventListener("error", reject);
                (_a = ref.parentNode) === null || _a === void 0 ? void 0 : _a.replaceChild(script, ref);
            }
            else {
                (_b = ref.parentNode) === null || _b === void 0 ? void 0 : _b.replaceChild(script, ref);
                resolve({});
            }
        });
    }
}
//# sourceMappingURL=script.js.map