import { Observable } from "rxjs";
import { Context } from "./common";
import { HyPushState } from './index';
export interface ResponseContext extends Context {
    response: string | null;
    error?: any;
}
export declare class FetchManager {
    private parent;
    constructor(parent: HyPushState);
    private readonly animPromise;
    fetchPage(context: Context): Observable<ResponseContext>;
    private selectPrefetch;
    getResponse(prefetch$: Observable<ResponseContext>, context: Context, latestPrefetch: ResponseContext): Observable<ResponseContext>;
}
