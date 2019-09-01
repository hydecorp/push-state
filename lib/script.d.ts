import { HyPushState } from ".";
export declare class ScriptManager {
    private parent;
    constructor(parent: HyPushState);
    readonly scriptSelector: string;
    removeScriptTags(replaceEls: Element[]): [HTMLScriptElement, Node][];
    reinsertScriptTags(context: {
        scripts: Array<[HTMLScriptElement, Node]>;
    }): Promise<{
        scripts: [HTMLScriptElement, Node][];
    }>;
    private insertScript;
}
