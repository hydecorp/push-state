import { HyPushState } from ".";
export declare class ScriptManager {
    private parent;
    constructor(parent: HyPushState);
    get scriptSelector(): string;
    removeScriptTags(replaceEls: Element[]): [HTMLScriptElement, Node][];
    reinsertScriptTags(context: {
        scripts: Array<[HTMLScriptElement, Node]>;
    }): Promise<{
        scripts: Array<[HTMLScriptElement, Node]>;
    }>;
    private insertScript;
}
