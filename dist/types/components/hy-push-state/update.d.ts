import { ResponseContext } from './fetch';
import { HyPushState } from ".";
export interface ReplaceContext extends ResponseContext {
    title: string;
    documentFragment: DocumentFragment;
    replaceEls: [Element] | Element[];
    scripts: Array<[HTMLScriptElement, Node | null]>;
}
export declare class UpdateManager {
    private parent;
    private urlRewriter;
    private scriptManager;
    constructor(parent: HyPushState);
    readonly el: HTMLElement;
    readonly replaceSelector: string;
    readonly scriptSelector: string;
    private getTitle;
    private getReplaceElements;
    responseToContent(context: ResponseContext): ReplaceContext;
    private replaceContentWithSelector;
    private replaceContentWholesale;
    private replaceContent;
    updateDOM(context: ReplaceContext): void;
    reinsertScriptTags(context: ReplaceContext): Promise<ReplaceContext>;
}
