import { of, zip, Observable } from "rxjs";
import { catchError, map, take, switchMap } from "rxjs/operators";

import { fetchRx, Context } from "./common";
import { HyPushState } from './index';

export interface ResponseContext extends Context {
  responseText: string | null;
  error?: any;
};

export interface ResponseContextOk extends ResponseContext {
  responseText: string;
};

export interface ResponseContextErr extends ResponseContext {
  responseText: null;
  error: any;
};

export class FetchManager {
  private parent: HyPushState;

  constructor(parent: HyPushState) {
    this.parent = parent;
  }

  fetchPage(context: Context): Observable<ResponseContext> {
    return fetchRx(context.url.href, {
      method: "GET",
      mode: 'cors', ///isExternal(this.parent) ? 'cors' : undefined,
      headers: { Accept: "text/html" },
    })
    .pipe(
      switchMap(response => response.text()),
      map(responseText => ({ ...context, responseText })),
      catchError(error => of({ ...context, error, responseText: null })),
    );
  }

  private selectPrefetch({ href }: URL, latestPrefetch: ResponseContext, prefetch$: Observable<ResponseContext>) {
    return href === latestPrefetch.url.href // && latestPrefetch.error == null
      ? of(latestPrefetch)
      : prefetch$.pipe(take(1));
  }

  // Returns an observable that emits exactly one notice, which contains the response.
  // It will not emit until an (optional) page transition animation completes.
  getResponse(prefetch$: Observable<ResponseContext>, context: Context, latestPrefetch: ResponseContext) {
    return zip(
      this.selectPrefetch(context.url, latestPrefetch, prefetch$),
      this.parent.animPromise,
    ).pipe(
      map(([prefetch]) => ({ ...prefetch, ...context }) as ResponseContext),
    );
  }
};
