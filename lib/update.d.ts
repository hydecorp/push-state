import { ResponseContext } from './fetch';
import { HyPushState } from ".";
export interface ReplaceContext extends ResponseContext {
    title: string;
    documentFragment: DocumentFragment;
    replaceEls: [Element] | Element[];
    scripts: Array<[HTMLScriptElement, Node]>;
}
export declare class UpdateManager {
    private parent;
    private scriptManager;
    constructor(parent: HyPushState);
    get el(): HTMLElement;
    get replaceSelector(): string;
    get scriptSelector(): string;
    private getTitle;
    private getReplaceElements;
    responseToContent(context: ResponseContext): ReplaceContext;
    private replaceContentWithSelector;
    private replaceContentWholesale;
    private replaceContent;
    updateDOM(context: ReplaceContext): void;
    reinsertScriptTags(context: {
        scripts: Array<[HTMLScriptElement, Node]>;
    }): Promise<{
        scripts: [HTMLScriptElement, Node][];
    }>;
}
