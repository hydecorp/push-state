import { ResponseContext, ResponseContextOk } from './fetch';
import { HyPushState } from ".";
export interface ReplaceContext extends ResponseContext {
    title: string;
    document: Document;
    replaceEls: (Element | null)[];
    scripts: Array<[HTMLScriptElement, HTMLScriptElement]>;
}
export declare class UpdateManager {
    private parent;
    private scriptManager;
    constructor(parent: HyPushState);
    get el(): HyPushState;
    get replaceSelector(): string | undefined;
    get scriptSelector(): string | undefined;
    private getReplaceElements;
    responseToContent(context: ResponseContextOk): ReplaceContext;
    private replaceContentWithSelector;
    private replaceContentWholesale;
    private replaceContent;
    private replaceHead;
    updateDOM(context: ReplaceContext): void;
    reinsertScriptTags(context: {
        scripts: Array<[HTMLScriptElement, HTMLScriptElement]>;
    }): Promise<{
        scripts: [HTMLScriptElement, HTMLScriptElement][];
    } | undefined>;
}
//# sourceMappingURL=update.d.ts.map