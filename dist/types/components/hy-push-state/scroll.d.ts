import { Context } from "./common";
export declare class ScrollManager {
    private parent;
    constructor(parent: {
        histId: () => string;
    });
    manageScrollPostion({ cause, url: { hash } }: Context): void;
    private scrollHashIntoView;
    private restoreScrollPostion;
    private restoreScrollPostionOnReload;
}
