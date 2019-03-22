/**
 * Copyright (c) 2019 Florian Klampfer <https://qwtel.com/>
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 *
 * @license
 * @nocompile
 */
import { EventEmitter } from '../../stencil.core';
import { Observable, Subject } from "rxjs";
import { Context } from './common';
import { FetchManager } from './fetch';
import { UpdateManager } from './update';
import { EventListenersMixin } from './event-listeners';
import { EventManager } from './event';
import { HistoryManager } from './history';
import { ScrollManager } from './scroll';
export declare class HyPushState implements Location, EventListenersMixin {
    el: HTMLElement;
    replaceSelector?: string;
    linkSelector: string;
    scriptSelector?: string;
    prefetch: boolean;
    duration: number;
    initialHref: string;
    linkSelector$: Subject<string>;
    prefetch$: Subject<boolean>;
    setLinkSelector(_: string): void;
    setPrefetch(_: boolean): void;
    start: EventEmitter;
    ready: EventEmitter;
    after: EventEmitter;
    progress: EventEmitter;
    load: EventEmitter;
    error: EventEmitter;
    networkerror: EventEmitter;
    private url;
    readonly hash: string;
    readonly host: string;
    readonly hostname: string;
    readonly href: string;
    readonly origin: string;
    readonly pathname: string;
    readonly port: string;
    readonly protocol: string;
    readonly search: string;
    readonly ancestorOrigins: DOMStringList;
    animPromise: Promise<{}>;
    scrollManager: ScrollManager;
    historyManager: HistoryManager;
    fetchManager: FetchManager;
    updateManager: UpdateManager;
    eventManager: EventManager;
    setupEventListeners: () => void;
    pushEvent$: Observable<[MouseEvent, HTMLAnchorElement]>;
    hintEvent$: Observable<[Event, HTMLAnchorElement]>;
    reload$: Subject<Context>;
    private cacheNr;
    histId(): string;
    assign(url: string): void;
    reload(): void;
    replace(url: string): void;
    compareContext(p: Context, q: Context): boolean;
    componentWillLoad(): void;
}
