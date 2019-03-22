import { Observable } from "rxjs";
import { ReplaceContext } from "./update";
import { HyPushState } from ".";
export declare class ScriptManager {
    private parent;
    constructor(parent: HyPushState);
    readonly scriptSelector: string;
    tempRemoveScriptTags(replaceEls: Element[]): [HTMLScriptElement, Node][];
    insertScript([script, ref]: [HTMLScriptElement, Node]): Observable<{}>;
    reinsertScriptTags(context: ReplaceContext): Promise<ReplaceContext>;
}
