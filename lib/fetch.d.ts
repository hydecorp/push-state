import { Observable } from "rxjs";
import { Context } from "./common";
import { HyPushState } from './index';
export interface ResponseContext extends Context {
    responseText: string | null;
    error?: any;
}
export interface ResponseContextOk extends ResponseContext {
    responseText: string;
}
export interface ResponseContextErr extends ResponseContext {
    responseText: null;
    error: any;
}
export declare class FetchManager {
    private parent;
    constructor(parent: HyPushState);
    fetchPage(context: Context): Observable<ResponseContext>;
    private selectPrefetch;
    getResponse(prefetch$: Observable<ResponseContext>, context: Context, latestPrefetch: ResponseContext): Observable<ResponseContext>;
}
//# sourceMappingURL=fetch.d.ts.map