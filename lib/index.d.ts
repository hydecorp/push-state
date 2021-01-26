import { Observable, Subject } from "rxjs";
import { RxLitElement } from '@hydecorp/component';
import { EventListenersMixin } from './event-listeners';
declare const HyPushState_base: Constructor<RxLitElement>;
export declare class HyPushState extends HyPushState_base implements Location, EventListenersMixin {
    #private;
    el: HTMLElement;
    createRenderRoot(): this;
    replaceSelector?: string;
    linkSelector: string;
    scriptSelector?: string;
    prefetch: boolean;
    duration: number;
    simulateHashChange: boolean;
    baseURL: string;
    get initialized(): Promise<unknown> & {
        resolve: (value: unknown) => void;
        reject: (reason?: any) => void;
    };
    $: {
        linkSelector: Subject<string>;
        prefetch: Subject<boolean>;
    };
    animPromise: Promise<any>;
    fadePromise: Promise<any>;
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
    setupEventListeners: () => {
        pushEvent$: Observable<[MouseEvent, HTMLAnchorElement]>;
        hintEvent$: Observable<[Event, HTMLAnchorElement]>;
    };
    get histId(): string;
    assign(url: string): void;
    reload(): void;
    replace(url: string): void;
    connectedCallback(): void;
    disconnectedCallback(): void;
}
export {};
//# sourceMappingURL=index.d.ts.map