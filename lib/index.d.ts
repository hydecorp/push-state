import { Observable, Subject } from "rxjs";
import { RxLitElement } from '@hydecorp/component';
import { Context } from './common';
import { FetchManager } from './fetch';
import { UpdateManager } from './update';
import { EventListenersMixin } from './event-listeners';
import { EventManager } from './event';
import { HistoryManager } from './history';
import { ScrollManager } from './scroll';
declare const HyPushState_base: Constructor<RxLitElement>;
export declare class HyPushState extends HyPushState_base implements Location, EventListenersMixin {
    el: HTMLElement;
    createRenderRoot(): this;
    replaceSelector?: string;
    linkSelector: string;
    scriptSelector?: string;
    prefetch: boolean;
    duration: number;
    simulateHashChange: boolean;
    baseURL: string;
    _initialized: Promise<unknown> & {
        resolve: (value: unknown) => void;
        reject: (reason?: any) => void;
    };
    get initialized(): Promise<unknown> & {
        resolve: (value: unknown) => void;
        reject: (reason?: any) => void;
    };
    $: {
        linkSelector?: Subject<string>;
        prefetch?: Subject<boolean>;
    };
    animPromise: Promise<{}>;
    fadePromise: Promise<{}>;
    scrollManager: ScrollManager;
    historyManager: HistoryManager;
    fetchManager: FetchManager;
    updateManager: UpdateManager;
    eventManager: EventManager;
    private _url;
    private _setLocation;
    get hash(): string;
    get host(): string;
    get hostname(): string;
    get href(): string;
    get pathname(): string;
    get port(): string;
    get protocol(): string;
    get search(): string;
    get origin(): string;
    get ancestorOrigins(): DOMStringList;
    set hash(value: string);
    set host(value: string);
    set hostname(value: string);
    set href(value: string);
    set pathname(value: string);
    set port(value: string);
    set protocol(value: string);
    set search(value: string);
    set origin(_: string);
    set ancestorOrigins(_: DOMStringList);
    setupEventListeners: () => {
        pushEvent$: Observable<[MouseEvent, HTMLAnchorElement]>;
        hintEvent$: Observable<[Event, HTMLAnchorElement]>;
    };
    reload$: Subject<Context>;
    private cacheNr;
    get histId(): string;
    assign(url: string): void;
    reload(): void;
    replace(url: string): void;
    compareContext(p: Context, q: Context): boolean;
    connectedCallback(): void;
    upgrade: () => void;
    disconnectedCallback(): void;
}
export {};
//# sourceMappingURL=index.d.ts.map