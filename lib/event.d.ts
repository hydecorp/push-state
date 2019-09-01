import { Context } from './common';
import { HyPushState } from "./index";
export declare class EventManager {
    private parent;
    constructor(parent: HyPushState);
    animPromise: Promise<{}>;
    readonly duration: number;
    onStart(context: Context): void;
    emitDOMError(context: any): void;
    emitNetworkError(context: any): void;
    emitError(context: any): void;
    emitReady(context: any): void;
    emitAfter(context: any): void;
    emitProgress(context: any): void;
    emitLoad(context: any): void;
}
