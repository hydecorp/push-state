import { of, zip } from "rxjs";
import { catchError, map, take, switchMap } from "rxjs/operators";
import { fetchRx } from "./common";
;
;
;
export class FetchManager {
    constructor(parent) {
        this.parent = parent;
    }
    fetchPage(context) {
        return fetchRx(context.url.href, {
            method: "GET",
            mode: 'cors',
            headers: { Accept: "text/html" },
        })
            .pipe(switchMap(response => response.text()), map(responseText => ({ ...context, responseText })), catchError(error => of({ ...context, error, responseText: null })));
    }
    selectPrefetch({ href }, latestPrefetch, prefetch$) {
        return href === latestPrefetch.url.href // && latestPrefetch.error == null
            ? of(latestPrefetch)
            : prefetch$.pipe(take(1));
    }
    // Returns an observable that emits exactly one notice, which contains the response.
    // It will not emit until an (optional) page transition animation completes.
    getResponse(prefetch$, context, latestPrefetch) {
        return zip(this.selectPrefetch(context.url, latestPrefetch, prefetch$), this.parent.animPromise).pipe(map(([prefetch]) => ({ ...prefetch, ...context })));
    }
}
;
//# sourceMappingURL=fetch.js.map