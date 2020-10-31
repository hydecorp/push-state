import { Subject, Observable } from "rxjs";
export declare class EventListenersMixin {
    el: HTMLElement;
    linkSelector: string;
    $: {
        linkSelector?: Subject<string>;
        prefetch?: Subject<boolean>;
    };
    setupEventListeners(): {
        hintEvent$: Observable<[Event, HTMLAnchorElement]>;
        pushEvent$: Observable<[MouseEvent, HTMLAnchorElement]>;
    };
}
//# sourceMappingURL=event-listeners.d.ts.map