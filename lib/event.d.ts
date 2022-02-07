import { Context } from './common';
import { ResponseContextErr } from './fetch';
import { HyPushState } from "./index";
export declare class EventManager {
    private parent;
    constructor(parent: HyPushState);
    onStart(context: Context): void;
    emitDOMError(error: any): void;
    emitNetworkError(context: ResponseContextErr): void;
    emitError(context: Context): void;
    emitReady(context: Context): void;
    emitAfter(context: Context): void;
    emitProgress(context: Context): void;
    emitLoad(context: Context): void;
}
//# sourceMappingURL=event.d.ts.map