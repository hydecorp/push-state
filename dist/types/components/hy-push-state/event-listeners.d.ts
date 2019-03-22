import { Observable } from "rxjs";
export declare class EventListenersMixin {
    el: HTMLElement;
    linkSelector: string;
    linkSelector$: Observable<string>;
    prefetch$: Observable<boolean>;
    pushEvent$: Observable<[MouseEvent, HTMLAnchorElement]>;
    hintEvent$: Observable<[Event, HTMLAnchorElement]>;
    setupEventListeners(): void;
}
