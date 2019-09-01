import { Cause } from "./common";
export declare class ScrollManager {
    private parent;
    constructor(parent: {
        histId: string;
    } & HTMLElement);
    manageScrollPosition({ cause, url: { hash } }: {
        cause: Cause;
        url: URL;
    }): void;
    private elementFromHash;
    private scrollHashIntoView;
    private restoreScrollPosition;
    private restoreScrollPositionOnReload;
}
