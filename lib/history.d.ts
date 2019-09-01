import { Context } from "./common";
import { ReplaceContext } from "./update";
export declare class HistoryManager {
    private parent;
    constructor(parent: Location & {
        histId: string;
        simulateHashChange: boolean;
    });
    updateHistoryState(context: Context): void;
    updateTitle({ cause, title }: ReplaceContext): void;
    updateHistoryStateHash({ cause, url }: Context): void;
    updateHistoryScrollPosition: () => void;
    private assignScrollPosition;
}
