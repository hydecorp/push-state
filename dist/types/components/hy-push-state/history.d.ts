import { Context } from "./common";
import { ReplaceContext } from "./update";
export declare class HistoryManager {
    private parent;
    constructor(parent: {
        host: string;
        protocol: string;
        histId: () => string;
    });
    updateHistoryState({ cause, replace, url: { href } }: Context): void;
    updateHistoryStateHash({ cause, url }: Context): void;
    updateHistoryTitle({ cause, title }: ReplaceContext): void;
    updateHistoryScrollPosition(): void;
    private assignScrollPosition;
}
