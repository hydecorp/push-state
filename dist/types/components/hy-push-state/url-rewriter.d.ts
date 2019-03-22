export declare class URLRewriter {
    private parent;
    constructor(parent: {
        href: string;
    });
    private readonly href;
    rewriteURLs(replaceEls: Element[]): void;
    private rewriteURL;
    private rewriteURLSrcSet;
    private rewriteURLList;
}
