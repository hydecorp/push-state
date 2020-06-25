import { Context } from "./common";
import { ReplaceContext } from "./update";
export declare class HistoryManager {
    private parent;
    constructor(parent: Location & {
        histId: string;
        simulateHashChange: boolean;
    });
    updateHistoryState({ cause, replace, url, oldURL }: Context): void;
    updateTitle({ cause, title }: ReplaceContext): void;
    updateHistoryScrollPosition: () => void;
    private assignScrollPosition;
}
