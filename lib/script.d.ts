import { HyPushState } from ".";
export declare class ScriptManager {
    private parent;
    constructor(parent: HyPushState);
    get scriptSelector(): string | undefined;
    removeScriptTags(replaceEls: (Element | null)[]): [HTMLScriptElement, HTMLScriptElement][];
    reinsertScriptTags(context: {
        scripts: Array<[HTMLScriptElement, HTMLScriptElement]>;
    }): Promise<{
        scripts: Array<[HTMLScriptElement, HTMLScriptElement]>;
    } | undefined>;
    private insertScript;
}
//# sourceMappingURL=script.d.ts.map