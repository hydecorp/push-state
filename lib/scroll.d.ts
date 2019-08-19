import { Cause } from "./common";
export declare class ScrollManager {
    private parent;
    constructor(parent: {
        histId: string;
    });
    manageScrollPosition({ cause, url: { hash } }: {
        cause: Cause;
        url: URL;
    }): void;
    private scrollHashIntoView;
    private restoreScrollPostion;
    private restoreScrollPostionOnReload;
}
