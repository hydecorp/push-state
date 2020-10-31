import { ResponseContext } from './fetch';
import { HyPushState } from ".";
export interface ReplaceContext extends ResponseContext {
    title: string;
    document: Document;
    replaceEls: [Element] | Element[];
    scripts: Array<[HTMLScriptElement, HTMLScriptElement]>;
}
export declare class UpdateManager {
    private parent;
    private scriptManager;
    constructor(parent: HyPushState);
    get el(): HTMLElement;
    get replaceSelector(): string;
    get scriptSelector(): string;
    private getReplaceElements;
    responseToContent(context: ResponseContext): ReplaceContext;
    private replaceContentWithSelector;
    private replaceContentWholesale;
    private replaceContent;
    private replaceHead;
    updateDOM(context: ReplaceContext): void;
    reinsertScriptTags(context: {
        scripts: Array<[HTMLScriptElement, HTMLScriptElement]>;
    }): Promise<{
        scripts: [HTMLScriptElement, HTMLScriptElement][];
    }>;
}
//# sourceMappingURL=update.d.ts.map