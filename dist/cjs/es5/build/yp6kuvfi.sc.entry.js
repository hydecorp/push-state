"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var extendStatics = function (t, e) { return (extendStatics = Object.setPrototypeOf || { __proto__: [] } instanceof Array && function (t, e) { t.__proto__ = e; } || function (t, e) { for (var r in e)
    e.hasOwnProperty(r) && (t[r] = e[r]); })(t, e); };
function __extends(t, e) { function r() { this.constructor = t; } extendStatics(t, e), t.prototype = null === e ? Object.create(e) : (r.prototype = e.prototype, new r); }
function isFunction(t) { return "function" == typeof t; }
var _enable_super_gross_mode_that_will_cause_bad_things = !1, config = { Promise: void 0, set useDeprecatedSynchronousErrorHandling(t) { _enable_super_gross_mode_that_will_cause_bad_things = t; }, get useDeprecatedSynchronousErrorHandling() { return _enable_super_gross_mode_that_will_cause_bad_things; } };
function hostReportError(t) { setTimeout(function () { throw t; }); }
var empty = { closed: !0, next: function (t) { }, error: function (t) { if (config.useDeprecatedSynchronousErrorHandling)
        throw t; hostReportError(t); }, complete: function () { } }, isArray = Array.isArray || function (t) { return t && "number" == typeof t.length; };
function isObject(t) { return null !== t && "object" == typeof t; }
function UnsubscriptionErrorImpl(t) { return Error.call(this), this.message = t ? t.length + " errors occurred during unsubscription:\n" + t.map(function (t, e) { return e + 1 + ") " + t.toString(); }).join("\n  ") : "", this.name = "UnsubscriptionError", this.errors = t, this; }
UnsubscriptionErrorImpl.prototype = Object.create(Error.prototype);
var UnsubscriptionError = UnsubscriptionErrorImpl, Subscription = function () { function t(t) { this.closed = !1, this._parent = null, this._parents = null, this._subscriptions = null, t && (this._unsubscribe = t); } var e; return t.prototype.unsubscribe = function () { var t, e = !1; if (!this.closed) {
    var r = this._parent, n = this._parents, o = this._unsubscribe, i = this._subscriptions;
    this.closed = !0, this._parent = null, this._parents = null, this._subscriptions = null;
    for (var s = -1, c = n ? n.length : 0; r;)
        r.remove(this), r = ++s < c && n[s] || null;
    if (isFunction(o))
        try {
            o.call(this);
        }
        catch (r) {
            e = !0, t = r instanceof UnsubscriptionError ? flattenUnsubscriptionErrors(r.errors) : [r];
        }
    if (isArray(i))
        for (s = -1, c = i.length; ++s < c;) {
            var u = i[s];
            if (isObject(u))
                try {
                    u.unsubscribe();
                }
                catch (r) {
                    e = !0, t = t || [], r instanceof UnsubscriptionError ? t = t.concat(flattenUnsubscriptionErrors(r.errors)) : t.push(r);
                }
        }
    if (e)
        throw new UnsubscriptionError(t);
} }, t.prototype.add = function (e) { var r = e; switch (typeof e) {
    case "function": r = new t(e);
    case "object":
        if (r === this || r.closed || "function" != typeof r.unsubscribe)
            return r;
        if (this.closed)
            return r.unsubscribe(), r;
        if (!(r instanceof t)) {
            var n = r;
            (r = new t)._subscriptions = [n];
        }
        break;
    default:
        if (!e)
            return t.EMPTY;
        throw new Error("unrecognized teardown " + e + " added to Subscription.");
} if (r._addParent(this)) {
    var o = this._subscriptions;
    o ? o.push(r) : this._subscriptions = [r];
} return r; }, t.prototype.remove = function (t) { var e = this._subscriptions; if (e) {
    var r = e.indexOf(t);
    -1 !== r && e.splice(r, 1);
} }, t.prototype._addParent = function (t) { var e = this._parent, r = this._parents; return e !== t && (e ? r ? -1 === r.indexOf(t) && (r.push(t), !0) : (this._parents = [t], !0) : (this._parent = t, !0)); }, t.EMPTY = ((e = new t).closed = !0, e), t; }();
function flattenUnsubscriptionErrors(t) { return t.reduce(function (t, e) { return t.concat(e instanceof UnsubscriptionError ? e.errors : e); }, []); }
var rxSubscriber = "function" == typeof Symbol ? Symbol("rxSubscriber") : "@@rxSubscriber_" + Math.random(), Subscriber = function (t) { function e(r, n, o) { var i = t.call(this) || this; switch (i.syncErrorValue = null, i.syncErrorThrown = !1, i.syncErrorThrowable = !1, i.isStopped = !1, arguments.length) {
    case 0:
        i.destination = empty;
        break;
    case 1:
        if (!r) {
            i.destination = empty;
            break;
        }
        if ("object" == typeof r) {
            r instanceof e ? (i.syncErrorThrowable = r.syncErrorThrowable, i.destination = r, r.add(i)) : (i.syncErrorThrowable = !0, i.destination = new SafeSubscriber(i, r));
            break;
        }
    default: i.syncErrorThrowable = !0, i.destination = new SafeSubscriber(i, r, n, o);
} return i; } return __extends(e, t), e.prototype[rxSubscriber] = function () { return this; }, e.create = function (t, r, n) { var o = new e(t, r, n); return o.syncErrorThrowable = !1, o; }, e.prototype.next = function (t) { this.isStopped || this._next(t); }, e.prototype.error = function (t) { this.isStopped || (this.isStopped = !0, this._error(t)); }, e.prototype.complete = function () { this.isStopped || (this.isStopped = !0, this._complete()); }, e.prototype.unsubscribe = function () { this.closed || (this.isStopped = !0, t.prototype.unsubscribe.call(this)); }, e.prototype._next = function (t) { this.destination.next(t); }, e.prototype._error = function (t) { this.destination.error(t), this.unsubscribe(); }, e.prototype._complete = function () { this.destination.complete(), this.unsubscribe(); }, e.prototype._unsubscribeAndRecycle = function () { var t = this._parent, e = this._parents; return this._parent = null, this._parents = null, this.unsubscribe(), this.closed = !1, this.isStopped = !1, this._parent = t, this._parents = e, this; }, e; }(Subscription), SafeSubscriber = function (t) { function e(e, r, n, o) { var i, s = t.call(this) || this; s._parentSubscriber = e; var c = s; return isFunction(r) ? i = r : r && (i = r.next, n = r.error, o = r.complete, r !== empty && (isFunction((c = Object.create(r)).unsubscribe) && s.add(c.unsubscribe.bind(c)), c.unsubscribe = s.unsubscribe.bind(s))), s._context = c, s._next = i, s._error = n, s._complete = o, s; } return __extends(e, t), e.prototype.next = function (t) { if (!this.isStopped && this._next) {
    var e = this._parentSubscriber;
    config.useDeprecatedSynchronousErrorHandling && e.syncErrorThrowable ? this.__tryOrSetError(e, this._next, t) && this.unsubscribe() : this.__tryOrUnsub(this._next, t);
} }, e.prototype.error = function (t) { if (!this.isStopped) {
    var e = this._parentSubscriber, r = config.useDeprecatedSynchronousErrorHandling;
    if (this._error)
        r && e.syncErrorThrowable ? (this.__tryOrSetError(e, this._error, t), this.unsubscribe()) : (this.__tryOrUnsub(this._error, t), this.unsubscribe());
    else if (e.syncErrorThrowable)
        r ? (e.syncErrorValue = t, e.syncErrorThrown = !0) : hostReportError(t), this.unsubscribe();
    else {
        if (this.unsubscribe(), r)
            throw t;
        hostReportError(t);
    }
} }, e.prototype.complete = function () { var t = this; if (!this.isStopped) {
    var e = this._parentSubscriber;
    if (this._complete) {
        var r = function () { return t._complete.call(t._context); };
        config.useDeprecatedSynchronousErrorHandling && e.syncErrorThrowable ? (this.__tryOrSetError(e, r), this.unsubscribe()) : (this.__tryOrUnsub(r), this.unsubscribe());
    }
    else
        this.unsubscribe();
} }, e.prototype.__tryOrUnsub = function (t, e) { try {
    t.call(this._context, e);
}
catch (t) {
    if (this.unsubscribe(), config.useDeprecatedSynchronousErrorHandling)
        throw t;
    hostReportError(t);
} }, e.prototype.__tryOrSetError = function (t, e, r) { if (!config.useDeprecatedSynchronousErrorHandling)
    throw new Error("bad call"); try {
    e.call(this._context, r);
}
catch (e) {
    return config.useDeprecatedSynchronousErrorHandling ? (t.syncErrorValue = e, t.syncErrorThrown = !0, !0) : (hostReportError(e), !0);
} return !1; }, e.prototype._unsubscribe = function () { var t = this._parentSubscriber; this._context = null, this._parentSubscriber = null, t.unsubscribe(); }, e; }(Subscriber);
function canReportError(t) { for (; t;) {
    var e = t.destination;
    if (t.closed || t.isStopped)
        return !1;
    t = e && e instanceof Subscriber ? e : null;
} return !0; }
function toSubscriber(t, e, r) { if (t) {
    if (t instanceof Subscriber)
        return t;
    if (t[rxSubscriber])
        return t[rxSubscriber]();
} return t || e || r ? new Subscriber(t, e, r) : new Subscriber(empty); }
var observable = "function" == typeof Symbol && Symbol.observable || "@@observable";
function noop() { }
function pipeFromArray(t) { return t ? 1 === t.length ? t[0] : function (e) { return t.reduce(function (t, e) { return e(t); }, e); } : noop; }
var Observable = function () { function t(t) { this._isScalar = !1, t && (this._subscribe = t); } return t.prototype.lift = function (e) { var r = new t; return r.source = this, r.operator = e, r; }, t.prototype.subscribe = function (t, e, r) { var n = this.operator, o = toSubscriber(t, e, r); if (o.add(n ? n.call(o, this.source) : this.source || config.useDeprecatedSynchronousErrorHandling && !o.syncErrorThrowable ? this._subscribe(o) : this._trySubscribe(o)), config.useDeprecatedSynchronousErrorHandling && o.syncErrorThrowable && (o.syncErrorThrowable = !1, o.syncErrorThrown))
    throw o.syncErrorValue; return o; }, t.prototype._trySubscribe = function (t) { try {
    return this._subscribe(t);
}
catch (e) {
    config.useDeprecatedSynchronousErrorHandling && (t.syncErrorThrown = !0, t.syncErrorValue = e), canReportError(t) ? t.error(e) : console.warn(e);
} }, t.prototype.forEach = function (t, e) { var r = this; return new (e = getPromiseCtor(e))(function (e, n) { var o; o = r.subscribe(function (e) { try {
    t(e);
}
catch (t) {
    n(t), o && o.unsubscribe();
} }, n, e); }); }, t.prototype._subscribe = function (t) { var e = this.source; return e && e.subscribe(t); }, t.prototype[observable] = function () { return this; }, t.prototype.pipe = function () { for (var t = [], e = 0; e < arguments.length; e++)
    t[e] = arguments[e]; return 0 === t.length ? this : pipeFromArray(t)(this); }, t.prototype.toPromise = function (t) { var e = this; return new (t = getPromiseCtor(t))(function (t, r) { var n; e.subscribe(function (t) { return n = t; }, function (t) { return r(t); }, function () { return t(n); }); }); }, t.create = function (e) { return new t(e); }, t; }();
function getPromiseCtor(t) { if (t || (t = Promise), !t)
    throw new Error("no Promise impl found"); return t; }
function ObjectUnsubscribedErrorImpl() { return Error.call(this), this.message = "object unsubscribed", this.name = "ObjectUnsubscribedError", this; }
ObjectUnsubscribedErrorImpl.prototype = Object.create(Error.prototype);
var ObjectUnsubscribedError = ObjectUnsubscribedErrorImpl, SubjectSubscription = function (t) { function e(e, r) { var n = t.call(this) || this; return n.subject = e, n.subscriber = r, n.closed = !1, n; } return __extends(e, t), e.prototype.unsubscribe = function () { if (!this.closed) {
    this.closed = !0;
    var t = this.subject, e = t.observers;
    if (this.subject = null, e && 0 !== e.length && !t.isStopped && !t.closed) {
        var r = e.indexOf(this.subscriber);
        -1 !== r && e.splice(r, 1);
    }
} }, e; }(Subscription), SubjectSubscriber = function (t) { function e(e) { var r = t.call(this, e) || this; return r.destination = e, r; } return __extends(e, t), e; }(Subscriber), Subject = function (t) { function e() { var e = t.call(this) || this; return e.observers = [], e.closed = !1, e.isStopped = !1, e.hasError = !1, e.thrownError = null, e; } return __extends(e, t), e.prototype[rxSubscriber] = function () { return new SubjectSubscriber(this); }, e.prototype.lift = function (t) { var e = new AnonymousSubject(this, this); return e.operator = t, e; }, e.prototype.next = function (t) { if (this.closed)
    throw new ObjectUnsubscribedError; if (!this.isStopped)
    for (var e = this.observers, r = e.length, n = e.slice(), o = 0; o < r; o++)
        n[o].next(t); }, e.prototype.error = function (t) { if (this.closed)
    throw new ObjectUnsubscribedError; this.hasError = !0, this.thrownError = t, this.isStopped = !0; for (var e = this.observers, r = e.length, n = e.slice(), o = 0; o < r; o++)
    n[o].error(t); this.observers.length = 0; }, e.prototype.complete = function () { if (this.closed)
    throw new ObjectUnsubscribedError; this.isStopped = !0; for (var t = this.observers, e = t.length, r = t.slice(), n = 0; n < e; n++)
    r[n].complete(); this.observers.length = 0; }, e.prototype.unsubscribe = function () { this.isStopped = !0, this.closed = !0, this.observers = null; }, e.prototype._trySubscribe = function (e) { if (this.closed)
    throw new ObjectUnsubscribedError; return t.prototype._trySubscribe.call(this, e); }, e.prototype._subscribe = function (t) { if (this.closed)
    throw new ObjectUnsubscribedError; return this.hasError ? (t.error(this.thrownError), Subscription.EMPTY) : this.isStopped ? (t.complete(), Subscription.EMPTY) : (this.observers.push(t), new SubjectSubscription(this, t)); }, e.prototype.asObservable = function () { var t = new Observable; return t.source = this, t; }, e.create = function (t, e) { return new AnonymousSubject(t, e); }, e; }(Observable), AnonymousSubject = function (t) { function e(e, r) { var n = t.call(this) || this; return n.destination = e, n.source = r, n; } return __extends(e, t), e.prototype.next = function (t) { var e = this.destination; e && e.next && e.next(t); }, e.prototype.error = function (t) { var e = this.destination; e && e.error && this.destination.error(t); }, e.prototype.complete = function () { var t = this.destination; t && t.complete && this.destination.complete(); }, e.prototype._subscribe = function (t) { return this.source ? this.source.subscribe(t) : Subscription.EMPTY; }, e; }(Subject);
function refCount() { return function (t) { return t.lift(new RefCountOperator(t)); }; }
var RefCountOperator = function () { function t(t) { this.connectable = t; } return t.prototype.call = function (t, e) { var r = this.connectable; r._refCount++; var n = new RefCountSubscriber(t, r), o = e.subscribe(n); return n.closed || (n.connection = r.connect()), o; }, t; }(), RefCountSubscriber = function (t) { function e(e, r) { var n = t.call(this, e) || this; return n.connectable = r, n; } return __extends(e, t), e.prototype._unsubscribe = function () { var t = this.connectable; if (t) {
    this.connectable = null;
    var e = t._refCount;
    if (e <= 0)
        this.connection = null;
    else if (t._refCount = e - 1, e > 1)
        this.connection = null;
    else {
        var r = this.connection, n = t._connection;
        this.connection = null, !n || r && n !== r || n.unsubscribe();
    }
}
else
    this.connection = null; }, e; }(Subscriber), ConnectableObservable = function (t) { function e(e, r) { var n = t.call(this) || this; return n.source = e, n.subjectFactory = r, n._refCount = 0, n._isComplete = !1, n; } return __extends(e, t), e.prototype._subscribe = function (t) { return this.getSubject().subscribe(t); }, e.prototype.getSubject = function () { var t = this._subject; return t && !t.isStopped || (this._subject = this.subjectFactory()), this._subject; }, e.prototype.connect = function () { var t = this._connection; return t || (this._isComplete = !1, (t = this._connection = new Subscription).add(this.source.subscribe(new ConnectableSubscriber(this.getSubject(), this))), t.closed ? (this._connection = null, t = Subscription.EMPTY) : this._connection = t), t; }, e.prototype.refCount = function () { return refCount()(this); }, e; }(Observable), connectableProto = ConnectableObservable.prototype, connectableObservableDescriptor = { operator: { value: null }, _refCount: { value: 0, writable: !0 }, _subject: { value: null, writable: !0 }, _connection: { value: null, writable: !0 }, _subscribe: { value: connectableProto._subscribe }, _isComplete: { value: connectableProto._isComplete, writable: !0 }, getSubject: { value: connectableProto.getSubject }, connect: { value: connectableProto.connect }, refCount: { value: connectableProto.refCount } }, ConnectableSubscriber = function (t) { function e(e, r) { var n = t.call(this, e) || this; return n.connectable = r, n; } return __extends(e, t), e.prototype._error = function (e) { this._unsubscribe(), t.prototype._error.call(this, e); }, e.prototype._complete = function () { this.connectable._isComplete = !0, this._unsubscribe(), t.prototype._complete.call(this); }, e.prototype._unsubscribe = function () { var t = this.connectable; if (t) {
    this.connectable = null;
    var e = t._connection;
    t._refCount = 0, t._subject = null, t._connection = null, e && e.unsubscribe();
} }, e; }(SubjectSubscriber), BehaviorSubject = function (t) { function e(e) { var r = t.call(this) || this; return r._value = e, r; } return __extends(e, t), Object.defineProperty(e.prototype, "value", { get: function () { return this.getValue(); }, enumerable: !0, configurable: !0 }), e.prototype._subscribe = function (e) { var r = t.prototype._subscribe.call(this, e); return r && !r.closed && e.next(this._value), r; }, e.prototype.getValue = function () { if (this.hasError)
    throw this.thrownError; if (this.closed)
    throw new ObjectUnsubscribedError; return this._value; }, e.prototype.next = function (e) { t.prototype.next.call(this, this._value = e); }, e; }(Subject), EMPTY = new Observable(function (t) { return t.complete(); });
function empty$1(t) { return t ? emptyScheduled(t) : EMPTY; }
function emptyScheduled(t) { return new Observable(function (e) { return t.schedule(function () { return e.complete(); }); }); }
function isScheduler(t) { return t && "function" == typeof t.schedule; }
var subscribeToArray = function (t) { return function (e) { for (var r = 0, n = t.length; r < n && !e.closed; r++)
    e.next(t[r]); e.closed || e.complete(); }; };
function fromArray(t, e) { return new Observable(e ? function (r) { var n = new Subscription, o = 0; return n.add(e.schedule(function () { o !== t.length ? (r.next(t[o++]), r.closed || n.add(this.schedule())) : r.complete(); })), n; } : subscribeToArray(t)); }
function scalar(t) { var e = new Observable(function (e) { e.next(t), e.complete(); }); return e._isScalar = !0, e.value = t, e; }
function of() { for (var t = [], e = 0; e < arguments.length; e++)
    t[e] = arguments[e]; var r = t[t.length - 1]; switch (isScheduler(r) ? t.pop() : r = void 0, t.length) {
    case 0: return empty$1(r);
    case 1: return r ? fromArray(t, r) : scalar(t[0]);
    default: return fromArray(t, r);
} }
function identity(t) { return t; }
function ArgumentOutOfRangeErrorImpl() { return Error.call(this), this.message = "argument out of range", this.name = "ArgumentOutOfRangeError", this; }
ArgumentOutOfRangeErrorImpl.prototype = Object.create(Error.prototype);
var ArgumentOutOfRangeError = ArgumentOutOfRangeErrorImpl;
function map(t, e) { return function (r) { if ("function" != typeof t)
    throw new TypeError("argument is not a function. Are you looking for `mapTo()`?"); return r.lift(new MapOperator(t, e)); }; }
var MapOperator = function () { function t(t, e) { this.project = t, this.thisArg = e; } return t.prototype.call = function (t, e) { return e.subscribe(new MapSubscriber(t, this.project, this.thisArg)); }, t; }(), MapSubscriber = function (t) { function e(e, r, n) { var o = t.call(this, e) || this; return o.project = r, o.count = 0, o.thisArg = n || o, o; } return __extends(e, t), e.prototype._next = function (t) { var e; try {
    e = this.project.call(this.thisArg, t, this.count++);
}
catch (t) {
    return void this.destination.error(t);
} this.destination.next(e); }, e; }(Subscriber), OuterSubscriber = function (t) { function e() { return null !== t && t.apply(this, arguments) || this; } return __extends(e, t), e.prototype.notifyNext = function (t, e, r, n, o) { this.destination.next(e); }, e.prototype.notifyError = function (t, e) { this.destination.error(t); }, e.prototype.notifyComplete = function (t) { this.destination.complete(); }, e; }(Subscriber), InnerSubscriber = function (t) { function e(e, r, n) { var o = t.call(this) || this; return o.parent = e, o.outerValue = r, o.outerIndex = n, o.index = 0, o; } return __extends(e, t), e.prototype._next = function (t) { this.parent.notifyNext(this.outerValue, t, this.outerIndex, this.index++, this); }, e.prototype._error = function (t) { this.parent.notifyError(t, this), this.unsubscribe(); }, e.prototype._complete = function () { this.parent.notifyComplete(this), this.unsubscribe(); }, e; }(Subscriber), subscribeToPromise = function (t) { return function (e) { return t.then(function (t) { e.closed || (e.next(t), e.complete()); }, function (t) { return e.error(t); }).then(null, hostReportError), e; }; };
function getSymbolIterator() { return "function" == typeof Symbol && Symbol.iterator ? Symbol.iterator : "@@iterator"; }
var iterator = getSymbolIterator(), subscribeToIterable = function (t) { return function (e) { for (var r = t[iterator]();;) {
    var n = r.next();
    if (n.done) {
        e.complete();
        break;
    }
    if (e.next(n.value), e.closed)
        break;
} return "function" == typeof r.return && e.add(function () { r.return && r.return(); }), e; }; }, subscribeToObservable = function (t) { return function (e) { var r = t[observable](); if ("function" != typeof r.subscribe)
    throw new TypeError("Provided object does not correctly implement Symbol.observable"); return r.subscribe(e); }; }, isArrayLike = function (t) { return t && "number" == typeof t.length && "function" != typeof t; };
function isPromise(t) { return !!t && "function" != typeof t.subscribe && "function" == typeof t.then; }
var subscribeTo = function (t) { if (t instanceof Observable)
    return function (e) { return t._isScalar ? (e.next(t.value), void e.complete()) : t.subscribe(e); }; if (t && "function" == typeof t[observable])
    return subscribeToObservable(t); if (isArrayLike(t))
    return subscribeToArray(t); if (isPromise(t))
    return subscribeToPromise(t); if (t && "function" == typeof t[iterator])
    return subscribeToIterable(t); var e = isObject(t) ? "an invalid object" : "'" + t + "'"; throw new TypeError("You provided " + e + " where a stream was expected. You can provide an Observable, Promise, Array, or Iterable."); };
function subscribeToResult(t, e, r, n, o) { if (void 0 === o && (o = new InnerSubscriber(t, r, n)), !o.closed)
    return subscribeTo(e)(o); }
function isInteropObservable(t) { return t && "function" == typeof t[observable]; }
function isIterable(t) { return t && "function" == typeof t[iterator]; }
function fromPromise(t, e) { return new Observable(e ? function (r) { var n = new Subscription; return n.add(e.schedule(function () { return t.then(function (t) { n.add(e.schedule(function () { r.next(t), n.add(e.schedule(function () { return r.complete(); })); })); }, function (t) { n.add(e.schedule(function () { return r.error(t); })); }); })), n; } : subscribeToPromise(t)); }
function fromIterable(t, e) { if (!t)
    throw new Error("Iterable cannot be null"); return new Observable(e ? function (r) { var n, o = new Subscription; return o.add(function () { n && "function" == typeof n.return && n.return(); }), o.add(e.schedule(function () { n = t[iterator](), o.add(e.schedule(function () { if (!r.closed) {
    var t, e;
    try {
        var o = n.next();
        t = o.value, e = o.done;
    }
    catch (t) {
        return void r.error(t);
    }
    e ? r.complete() : (r.next(t), this.schedule());
} })); })), o; } : subscribeToIterable(t)); }
function fromObservable(t, e) { return new Observable(e ? function (r) { var n = new Subscription; return n.add(e.schedule(function () { var o = t[observable](); n.add(o.subscribe({ next: function (t) { n.add(e.schedule(function () { return r.next(t); })); }, error: function (t) { n.add(e.schedule(function () { return r.error(t); })); }, complete: function () { n.add(e.schedule(function () { return r.complete(); })); } })); })), n; } : subscribeToObservable(t)); }
function from(t, e) { if (!e)
    return t instanceof Observable ? t : new Observable(subscribeTo(t)); if (null != t) {
    if (isInteropObservable(t))
        return fromObservable(t, e);
    if (isPromise(t))
        return fromPromise(t, e);
    if (isArrayLike(t))
        return fromArray(t, e);
    if (isIterable(t) || "string" == typeof t)
        return fromIterable(t, e);
} throw new TypeError((null !== t && typeof t || t) + " is not observable"); }
function mergeMap(t, e, r) { return void 0 === r && (r = Number.POSITIVE_INFINITY), "function" == typeof e ? function (n) { return n.pipe(mergeMap(function (r, n) { return from(t(r, n)).pipe(map(function (t, o) { return e(r, t, n, o); })); }, r)); } : ("number" == typeof e && (r = e), function (e) { return e.lift(new MergeMapOperator(t, r)); }); }
var MergeMapOperator = function () { function t(t, e) { void 0 === e && (e = Number.POSITIVE_INFINITY), this.project = t, this.concurrent = e; } return t.prototype.call = function (t, e) { return e.subscribe(new MergeMapSubscriber(t, this.project, this.concurrent)); }, t; }(), MergeMapSubscriber = function (t) { function e(e, r, n) { void 0 === n && (n = Number.POSITIVE_INFINITY); var o = t.call(this, e) || this; return o.project = r, o.concurrent = n, o.hasCompleted = !1, o.buffer = [], o.active = 0, o.index = 0, o; } return __extends(e, t), e.prototype._next = function (t) { this.active < this.concurrent ? this._tryNext(t) : this.buffer.push(t); }, e.prototype._tryNext = function (t) { var e, r = this.index++; try {
    e = this.project(t, r);
}
catch (t) {
    return void this.destination.error(t);
} this.active++, this._innerSub(e, t, r); }, e.prototype._innerSub = function (t, e, r) { var n = new InnerSubscriber(this, void 0, void 0); this.destination.add(n), subscribeToResult(this, t, e, r, n); }, e.prototype._complete = function () { this.hasCompleted = !0, 0 === this.active && 0 === this.buffer.length && this.destination.complete(), this.unsubscribe(); }, e.prototype.notifyNext = function (t, e, r, n, o) { this.destination.next(e); }, e.prototype.notifyComplete = function (t) { var e = this.buffer; this.remove(t), this.active--, e.length > 0 ? this._next(e.shift()) : 0 === this.active && this.hasCompleted && this.destination.complete(); }, e; }(OuterSubscriber);
function mergeAll(t) { return void 0 === t && (t = Number.POSITIVE_INFINITY), mergeMap(identity, t); }
function concatAll() { return mergeAll(1); }
function concat() { for (var t = [], e = 0; e < arguments.length; e++)
    t[e] = arguments[e]; return concatAll()(of.apply(void 0, t)); }
function defer(t) { return new Observable(function (e) { var r; try {
    r = t();
}
catch (t) {
    return void e.error(t);
} return (r ? from(r) : empty$1()).subscribe(e); }); }
function fromEvent(t, e, r, n) { return isFunction(r) && (n = r, r = void 0), n ? fromEvent(t, e, r).pipe(map(function (t) { return isArray(t) ? n.apply(void 0, t) : n(t); })) : new Observable(function (n) { setupSubscription(t, e, function (t) { n.next(arguments.length > 1 ? Array.prototype.slice.call(arguments) : t); }, n, r); }); }
function setupSubscription(t, e, r, n, o) { var i; if (isEventTarget(t)) {
    var s = t;
    t.addEventListener(e, r, o), i = function () { return s.removeEventListener(e, r, o); };
}
else if (isJQueryStyleEventEmitter(t)) {
    var c = t;
    t.on(e, r), i = function () { return c.off(e, r); };
}
else if (isNodeStyleEventEmitter(t)) {
    var u = t;
    t.addListener(e, r), i = function () { return u.removeListener(e, r); };
}
else {
    if (!t || !t.length)
        throw new TypeError("Invalid event target");
    for (var a = 0, l = t.length; a < l; a++)
        setupSubscription(t[a], e, r, n, o);
} n.add(i); }
function isNodeStyleEventEmitter(t) { return t && "function" == typeof t.addListener && "function" == typeof t.removeListener; }
function isJQueryStyleEventEmitter(t) { return t && "function" == typeof t.on && "function" == typeof t.off; }
function isEventTarget(t) { return t && "function" == typeof t.addEventListener && "function" == typeof t.removeEventListener; }
function merge() { for (var t = [], e = 0; e < arguments.length; e++)
    t[e] = arguments[e]; var r = Number.POSITIVE_INFINITY, n = null, o = t[t.length - 1]; return isScheduler(o) ? (n = t.pop(), t.length > 1 && "number" == typeof t[t.length - 1] && (r = t.pop())) : "number" == typeof o && (r = t.pop()), null === n && 1 === t.length && t[0] instanceof Observable ? t[0] : mergeAll(r)(fromArray(t, n)); }
var NEVER = new Observable(noop);
function zip() { for (var t = [], e = 0; e < arguments.length; e++)
    t[e] = arguments[e]; var r = t[t.length - 1]; return "function" == typeof r && t.pop(), fromArray(t, void 0).lift(new ZipOperator(r)); }
var ZipOperator = function () { function t(t) { this.resultSelector = t; } return t.prototype.call = function (t, e) { return e.subscribe(new ZipSubscriber(t, this.resultSelector)); }, t; }(), ZipSubscriber = function (t) { function e(e, r, n) { void 0 === n && (n = Object.create(null)); var o = t.call(this, e) || this; return o.iterators = [], o.active = 0, o.resultSelector = "function" == typeof r ? r : null, o.values = n, o; } return __extends(e, t), e.prototype._next = function (t) { var e = this.iterators; isArray(t) ? e.push(new StaticArrayIterator(t)) : e.push("function" == typeof t[iterator] ? new StaticIterator(t[iterator]()) : new ZipBufferIterator(this.destination, this, t)); }, e.prototype._complete = function () { var t = this.iterators, e = t.length; if (this.unsubscribe(), 0 !== e) {
    this.active = e;
    for (var r = 0; r < e; r++) {
        var n = t[r];
        n.stillUnsubscribed ? this.destination.add(n.subscribe(n, r)) : this.active--;
    }
}
else
    this.destination.complete(); }, e.prototype.notifyInactive = function () { this.active--, 0 === this.active && this.destination.complete(); }, e.prototype.checkIterators = function () { for (var t = this.iterators, e = t.length, r = this.destination, n = 0; n < e; n++)
    if ("function" == typeof (s = t[n]).hasValue && !s.hasValue())
        return; var o = !1, i = []; for (n = 0; n < e; n++) {
    var s, c = (s = t[n]).next();
    if (s.hasCompleted() && (o = !0), c.done)
        return void r.complete();
    i.push(c.value);
} this.resultSelector ? this._tryresultSelector(i) : r.next(i), o && r.complete(); }, e.prototype._tryresultSelector = function (t) { var e; try {
    e = this.resultSelector.apply(this, t);
}
catch (t) {
    return void this.destination.error(t);
} this.destination.next(e); }, e; }(Subscriber), StaticIterator = function () { function t(t) { this.iterator = t, this.nextResult = t.next(); } return t.prototype.hasValue = function () { return !0; }, t.prototype.next = function () { var t = this.nextResult; return this.nextResult = this.iterator.next(), t; }, t.prototype.hasCompleted = function () { var t = this.nextResult; return t && t.done; }, t; }(), StaticArrayIterator = function () { function t(t) { this.array = t, this.index = 0, this.length = 0, this.length = t.length; } return t.prototype[iterator] = function () { return this; }, t.prototype.next = function (t) { var e = this.index++; return e < this.length ? { value: this.array[e], done: !1 } : { value: null, done: !0 }; }, t.prototype.hasValue = function () { return this.array.length > this.index; }, t.prototype.hasCompleted = function () { return this.array.length === this.index; }, t; }(), ZipBufferIterator = function (t) { function e(e, r, n) { var o = t.call(this, e) || this; return o.parent = r, o.observable = n, o.stillUnsubscribed = !0, o.buffer = [], o.isComplete = !1, o; } return __extends(e, t), e.prototype[iterator] = function () { return this; }, e.prototype.next = function () { var t = this.buffer; return 0 === t.length && this.isComplete ? { value: null, done: !0 } : { value: t.shift(), done: !1 }; }, e.prototype.hasValue = function () { return this.buffer.length > 0; }, e.prototype.hasCompleted = function () { return 0 === this.buffer.length && this.isComplete; }, e.prototype.notifyComplete = function () { this.buffer.length > 0 ? (this.isComplete = !0, this.parent.notifyInactive()) : this.destination.complete(); }, e.prototype.notifyNext = function (t, e, r, n, o) { this.buffer.push(e), this.parent.checkIterators(); }, e.prototype.subscribe = function (t, e) { return subscribeToResult(this, this.observable, this, e); }, e; }(OuterSubscriber);
function catchError(t) { return function (e) { var r = new CatchOperator(t), n = e.lift(r); return r.caught = n; }; }
var CatchOperator = function () { function t(t) { this.selector = t; } return t.prototype.call = function (t, e) { return e.subscribe(new CatchSubscriber(t, this.selector, this.caught)); }, t; }(), CatchSubscriber = function (t) { function e(e, r, n) { var o = t.call(this, e) || this; return o.selector = r, o.caught = n, o; } return __extends(e, t), e.prototype.error = function (e) { if (!this.isStopped) {
    var r = void 0;
    try {
        r = this.selector(e, this.caught);
    }
    catch (e) {
        return void t.prototype.error.call(this, e);
    }
    this._unsubscribeAndRecycle();
    var n = new InnerSubscriber(this, void 0, void 0);
    this.add(n), subscribeToResult(this, r, void 0, void 0, n);
} }, e; }(OuterSubscriber);
function concatMap(t, e) { return mergeMap(t, e, 1); }
function distinctUntilChanged(t, e) { return function (r) { return r.lift(new DistinctUntilChangedOperator(t, e)); }; }
var DistinctUntilChangedOperator = function () { function t(t, e) { this.compare = t, this.keySelector = e; } return t.prototype.call = function (t, e) { return e.subscribe(new DistinctUntilChangedSubscriber(t, this.compare, this.keySelector)); }, t; }(), DistinctUntilChangedSubscriber = function (t) { function e(e, r, n) { var o = t.call(this, e) || this; return o.keySelector = n, o.hasKey = !1, "function" == typeof r && (o.compare = r), o; } return __extends(e, t), e.prototype.compare = function (t, e) { return t === e; }, e.prototype._next = function (t) { var e; try {
    var r = this.keySelector;
    e = r ? r(t) : t;
}
catch (t) {
    return this.destination.error(t);
} var n = !1; if (this.hasKey)
    try {
        n = (0, this.compare)(this.key, e);
    }
    catch (t) {
        return this.destination.error(t);
    }
else
    this.hasKey = !0; n || (this.key = e, this.destination.next(t)); }, e; }(Subscriber);
function filter(t, e) { return function (r) { return r.lift(new FilterOperator(t, e)); }; }
var FilterOperator = function () { function t(t, e) { this.predicate = t, this.thisArg = e; } return t.prototype.call = function (t, e) { return e.subscribe(new FilterSubscriber(t, this.predicate, this.thisArg)); }, t; }(), FilterSubscriber = function (t) { function e(e, r, n) { var o = t.call(this, e) || this; return o.predicate = r, o.thisArg = n, o.count = 0, o; } return __extends(e, t), e.prototype._next = function (t) { var e; try {
    e = this.predicate.call(this.thisArg, t, this.count++);
}
catch (t) {
    return void this.destination.error(t);
} e && this.destination.next(t); }, e; }(Subscriber);
function tap(t, e, r) { return function (n) { return n.lift(new DoOperator(t, e, r)); }; }
var DoOperator = function () { function t(t, e, r) { this.nextOrObserver = t, this.error = e, this.complete = r; } return t.prototype.call = function (t, e) { return e.subscribe(new TapSubscriber(t, this.nextOrObserver, this.error, this.complete)); }, t; }(), TapSubscriber = function (t) { function e(e, r, n, o) { var i = t.call(this, e) || this; return i._tapNext = noop, i._tapError = noop, i._tapComplete = noop, i._tapError = n || noop, i._tapComplete = o || noop, isFunction(r) ? (i._context = i, i._tapNext = r) : r && (i._context = r, i._tapNext = r.next || noop, i._tapError = r.error || noop, i._tapComplete = r.complete || noop), i; } return __extends(e, t), e.prototype._next = function (t) { try {
    this._tapNext.call(this._context, t);
}
catch (t) {
    return void this.destination.error(t);
} this.destination.next(t); }, e.prototype._error = function (t) { try {
    this._tapError.call(this._context, t);
}
catch (t) {
    return void this.destination.error(t);
} this.destination.error(t); }, e.prototype._complete = function () { try {
    this._tapComplete.call(this._context);
}
catch (t) {
    return void this.destination.error(t);
} return this.destination.complete(); }, e; }(Subscriber);
function take(t) { return function (e) { return 0 === t ? empty$1() : e.lift(new TakeOperator(t)); }; }
var TakeOperator = function () { function t(t) { if (this.total = t, this.total < 0)
    throw new ArgumentOutOfRangeError; } return t.prototype.call = function (t, e) { return e.subscribe(new TakeSubscriber(t, this.total)); }, t; }(), TakeSubscriber = function (t) { function e(e, r) { var n = t.call(this, e) || this; return n.total = r, n.count = 0, n; } return __extends(e, t), e.prototype._next = function (t) { var e = this.total, r = ++this.count; r <= e && (this.destination.next(t), r === e && (this.destination.complete(), this.unsubscribe())); }, e; }(Subscriber);
function finalize(t) { return function (e) { return e.lift(new FinallyOperator(t)); }; }
var FinallyOperator = function () { function t(t) { this.callback = t; } return t.prototype.call = function (t, e) { return e.subscribe(new FinallySubscriber(t, this.callback)); }, t; }(), FinallySubscriber = function (t) { function e(e, r) { var n = t.call(this, e) || this; return n.add(new Subscription(r)), n; } return __extends(e, t), e; }(Subscriber);
function mapTo(t) { return function (e) { return e.lift(new MapToOperator(t)); }; }
var MapToOperator = function () { function t(t) { this.value = t; } return t.prototype.call = function (t, e) { return e.subscribe(new MapToSubscriber(t, this.value)); }, t; }(), MapToSubscriber = function (t) { function e(e, r) { var n = t.call(this, e) || this; return n.value = r, n; } return __extends(e, t), e.prototype._next = function (t) { this.destination.next(this.value); }, e; }(Subscriber);
function multicast(t, e) { return function (r) { var n; if (n = "function" == typeof t ? t : function () { return t; }, "function" == typeof e)
    return r.lift(new MulticastOperator(n, e)); var o = Object.create(r, connectableObservableDescriptor); return o.source = r, o.subjectFactory = n, o; }; }
var MulticastOperator = function () { function t(t, e) { this.subjectFactory = t, this.selector = e; } return t.prototype.call = function (t, e) { var r = this.selector, n = this.subjectFactory(), o = r(n).subscribe(t); return o.add(e.subscribe(n)), o; }, t; }();
function pairwise() { return function (t) { return t.lift(new PairwiseOperator); }; }
var PairwiseOperator = function () { function t() { } return t.prototype.call = function (t, e) { return e.subscribe(new PairwiseSubscriber(t)); }, t; }(), PairwiseSubscriber = function (t) { function e(e) { var r = t.call(this, e) || this; return r.hasPrev = !1, r; } return __extends(e, t), e.prototype._next = function (t) { this.hasPrev ? this.destination.next([this.prev, t]) : this.hasPrev = !0, this.prev = t; }, e; }(Subscriber);
function shareSubjectFactory() { return new Subject; }
function share() { return function (t) { return refCount()(multicast(shareSubjectFactory)(t)); }; }
function startWith() { for (var t = [], e = 0; e < arguments.length; e++)
    t[e] = arguments[e]; return function (e) { var r = t[t.length - 1]; isScheduler(r) ? t.pop() : r = null; var n = t.length; return concat(1 !== n || r ? n > 0 ? fromArray(t, r) : empty$1(r) : scalar(t[0]), e); }; }
function switchMap(t, e) { return "function" == typeof e ? function (r) { return r.pipe(switchMap(function (r, n) { return from(t(r, n)).pipe(map(function (t, o) { return e(r, t, n, o); })); })); } : function (e) { return e.lift(new SwitchMapOperator(t)); }; }
var SwitchMapOperator = function () { function t(t) { this.project = t; } return t.prototype.call = function (t, e) { return e.subscribe(new SwitchMapSubscriber(t, this.project)); }, t; }(), SwitchMapSubscriber = function (t) { function e(e, r) { var n = t.call(this, e) || this; return n.project = r, n.index = 0, n; } return __extends(e, t), e.prototype._next = function (t) { var e, r = this.index++; try {
    e = this.project(t, r);
}
catch (t) {
    return void this.destination.error(t);
} this._innerSub(e, t, r); }, e.prototype._innerSub = function (t, e, r) { var n = this.innerSubscription; n && n.unsubscribe(); var o = new InnerSubscriber(this, void 0, void 0); this.destination.add(o), this.innerSubscription = subscribeToResult(this, t, e, r, o); }, e.prototype._complete = function () { var e = this.innerSubscription; e && !e.closed || t.prototype._complete.call(this), this.unsubscribe(); }, e.prototype._unsubscribe = function () { this.innerSubscription = null; }, e.prototype.notifyComplete = function (e) { this.destination.remove(e), this.innerSubscription = null, this.isStopped && t.prototype._complete.call(this); }, e.prototype.notifyNext = function (t, e, r, n, o) { this.destination.next(e); }, e; }(OuterSubscriber);
function takeUntil(t) { return function (e) { return e.lift(new TakeUntilOperator(t)); }; }
var TakeUntilOperator = function () { function t(t) { this.notifier = t; } return t.prototype.call = function (t, e) { var r = new TakeUntilSubscriber(t), n = subscribeToResult(r, this.notifier); return n && !r.seenValue ? (r.add(n), e.subscribe(r)) : r; }, t; }(), TakeUntilSubscriber = function (t) { function e(e) { var r = t.call(this, e) || this; return r.seenValue = !1, r; } return __extends(e, t), e.prototype.notifyNext = function (t, e, r, n, o) { this.seenValue = !0, this.complete(); }, e.prototype.notifyComplete = function () { }, e; }(OuterSubscriber);
function withLatestFrom() { for (var t = [], e = 0; e < arguments.length; e++)
    t[e] = arguments[e]; return function (e) { var r; return "function" == typeof t[t.length - 1] && (r = t.pop()), e.lift(new WithLatestFromOperator(t, r)); }; }
var Cause, WithLatestFromOperator = function () { function t(t, e) { this.observables = t, this.project = e; } return t.prototype.call = function (t, e) { return e.subscribe(new WithLatestFromSubscriber(t, this.observables, this.project)); }, t; }(), WithLatestFromSubscriber = function (t) { function e(e, r, n) { var o = t.call(this, e) || this; o.observables = r, o.project = n, o.toRespond = []; var i = r.length; o.values = new Array(i); for (var s = 0; s < i; s++)
    o.toRespond.push(s); for (s = 0; s < i; s++) {
    var c = r[s];
    o.add(subscribeToResult(o, c, c, s));
} return o; } return __extends(e, t), e.prototype.notifyNext = function (t, e, r, n, o) { this.values[r] = e; var i = this.toRespond; if (i.length > 0) {
    var s = i.indexOf(r);
    -1 !== s && i.splice(s, 1);
} }, e.prototype.notifyComplete = function () { }, e.prototype._next = function (t) { if (0 === this.toRespond.length) {
    var e = [t].concat(this.values);
    this.project ? this._tryProject(e) : this.destination.next(e);
} }, e.prototype._tryProject = function (t) { var e; try {
    e = this.project.apply(this, t);
}
catch (t) {
    return void this.destination.error(t);
} this.destination.next(e); }, e; }(OuterSubscriber);
function subscribeWhen(t) { return function (e) { return t.pipe(switchMap(function (t) { return t ? e : NEVER; })); }; }
function unsubscribeWhen(t) { return function (e) { return t.pipe(switchMap(function (t) { return t ? NEVER : e; })); }; }
function fetchRx(t, e) { return Observable.create(function (r) { var n = new AbortController, o = null; return fetch(t, Object.assign({}, e, { signal: n.signal })).then(function (t) { o = t, r.next(t), r.complete(); }).catch(function (t) { return r.error(t); }), function () { o || n.abort(); }; }); }
function isExternal(t, e) { return void 0 === e && (e = window.location), t.protocol !== e.protocol || t.host !== e.host; }
function isHash(t, e) { return void 0 === e && (e = window.location), "" !== t.hash && t.origin === e.origin && t.pathname === e.pathname; }
function applyMixins(t, e) { e.forEach(function (e) { Object.getOwnPropertyNames(e.prototype).forEach(function (r) { t.prototype[r] = e.prototype[r]; }); }); }
function getScrollHeight() { var t = document.documentElement, e = document.body, r = "scrollHeight"; return t[r] || e[r]; }
function getScrollTop() { return window.pageYOffset || document.body.scrollTop; }
function fragmentFromString(t) { return document.createRange().createContextualFragment(t); }
function matchesAncestors(t, e) { for (var r = t; null != r;) {
    if (r.matches(e))
        return r;
    r = r.parentNode instanceof Element ? r.parentNode : null;
} return null; }
function createMutationObservable(t, e) { return Observable.create(function (r) { var n = new MutationObserver(function (t) { return t.forEach(function (t) { return r.next(t); }); }); return n.observe(t, e), function () { n.disconnect(); }; }); }
function shouldLoadAnchor(t) { return t && "" === t.target; }
function isPushEvent(t, e) { var r = t.url, n = t.event; return !n.metaKey && !n.ctrlKey && shouldLoadAnchor(t.anchor) && !isExternal(r, e); }
function isHintEvent(t, e) { var r = t.url; return shouldLoadAnchor(t.anchor) && !isExternal(r, e) && !isHash(r, e); }
function isHashChange(t, e) { var r = e.url, n = e.cause; return r.pathname === t.url.pathname && (n === Cause.Pop || n === Cause.Push && "" !== r.hash); }
!function (t) { t.Init = "init", t.Hint = "hint", t.Push = "push", t.Pop = "pop"; }(Cause || (Cause = {}));
var FetchManager = function () { function t(t) { this.parent = t; } return Object.defineProperty(t.prototype, "animPromise", { get: function () { return this.parent.animPromise; }, enumerable: !0, configurable: !0 }), t.prototype.fetchPage = function (t) { return fetchRx(t.url.href, { method: "GET", mode: "cors", headers: { Accept: "text/html" } }).pipe(switchMap(function (t) { return t.text(); }), map(function (e) { return Object.assign({}, t, { response: e }); }), catchError(function (e) { return of(Object.assign({}, t, { error: e, response: null })); })); }, t.prototype.selectPrefetch = function (t, e, r) { return t.href === e.url.href && null == e.error ? of(e) : r.pipe(take(1)); }, t.prototype.getResponse = function (t, e, r) { return zip(this.selectPrefetch(e.url, r, t), this.animPromise, function (t) { return Object.assign({}, t, e); }); }, t; }(), ScriptManager = function () { function t(t) { this.parent = t; } return Object.defineProperty(t.prototype, "scriptSelector", { get: function () { return this.parent.scriptSelector; }, enumerable: !0, configurable: !0 }), t.prototype.tempRemoveScriptTags = function (t) { var e = this, r = []; return t.forEach(function (t) { return t.querySelectorAll(e.scriptSelector).forEach(function (t) { var e = [t, t.previousSibling]; t.parentNode.removeChild(t), r.push(e); }); }), r; }, t.prototype.insertScript = function (t) { var e = t[0], r = t[1]; return document.write = function () { for (var t = [], e = 0; e < arguments.length; e++)
    t[e] = arguments[e]; var n = document.createElement("div"); n.innerHTML = t.join(), Array.from(n.childNodes).forEach(function (t) { r.parentNode.insertBefore(t, r.nextSibling); }); }, "" !== e.src ? Observable.create(function (t) { e.addEventListener("load", function (e) { return t.next(e), t.complete(); }), e.addEventListener("error", function (e) { return t.error(e); }), r.parentNode.insertBefore(e, r.nextSibling); }) : of({}).pipe(tap(function () { r.parentNode.insertBefore(e, r.nextSibling); })); }, t.prototype.reinsertScriptTags = function (t) { var e = this; if (!this.scriptSelector)
    return Promise.resolve(t); var r = document.write; return from(t.scripts).pipe(concatMap(function (t) { return e.insertScript(t); }), catchError(function (e) { return of(Object.assign({}, t, { error: e })); }), finalize(function () { return document.write = r; })).toPromise().then(function () { return t; }); }, t; }(), URLRewriter = function () { function t(t) { this.parent = t; } return Object.defineProperty(t.prototype, "href", { get: function () { return this.parent.href; }, enumerable: !0, configurable: !0 }), t.prototype.rewriteURLs = function (t) { var e = this; t.forEach(function (t) { t.querySelectorAll("[href]").forEach(e.rewriteURL("href")), t.querySelectorAll("[src]").forEach(e.rewriteURL("src")), t.querySelectorAll("img[srcset]").forEach(e.rewriteURLSrcSet("srcset")), t.querySelectorAll("blockquote[cite]").forEach(e.rewriteURL("cite")), t.querySelectorAll("del[cite]").forEach(e.rewriteURL("cite")), t.querySelectorAll("ins[cite]").forEach(e.rewriteURL("cite")), t.querySelectorAll("q[cite]").forEach(e.rewriteURL("cite")), t.querySelectorAll("img[longdesc]").forEach(e.rewriteURL("longdesc")), t.querySelectorAll("frame[longdesc]").forEach(e.rewriteURL("longdesc")), t.querySelectorAll("iframe[longdesc]").forEach(e.rewriteURL("longdesc")), t.querySelectorAll("img[usemap]").forEach(e.rewriteURL("usemap")), t.querySelectorAll("input[usemap]").forEach(e.rewriteURL("usemap")), t.querySelectorAll("object[usemap]").forEach(e.rewriteURL("usemap")), t.querySelectorAll("form[action]").forEach(e.rewriteURL("action")), t.querySelectorAll("button[formaction]").forEach(e.rewriteURL("formaction")), t.querySelectorAll("input[formaction]").forEach(e.rewriteURL("formaction")), t.querySelectorAll("video[poster]").forEach(e.rewriteURL("poster")), t.querySelectorAll("object[data]").forEach(e.rewriteURL("data")), t.querySelectorAll("object[codebase]").forEach(e.rewriteURL("codebase")), t.querySelectorAll("object[archive]").forEach(e.rewriteURLList("archive")); }); }, t.prototype.rewriteURL = function (t) { var e = this; return function (r) { try {
    r.setAttribute(t, new URL(r.getAttribute(t), e.href).href);
}
catch (t) { } }; }, t.prototype.rewriteURLSrcSet = function (t) { var e = this; return function (r) { try {
    r.setAttribute(t, r.getAttribute(t).split(/\s*,\s*/).map(function (t) { var r = t.split(/\s+/); return r[0] = new URL(r[0], e.href).href, r.join(" "); }).join(", "));
}
catch (t) { } }; }, t.prototype.rewriteURLList = function (t) { var e = this; return function (r) { try {
    r.setAttribute(t, r.getAttribute(t).split(/[\s,]+/).map(function (t) { return new URL(t, e.href).href; }).join(", "));
}
catch (t) { } }; }, t; }(), UpdateManager = function () { function t(t) { this.parent = t, this.urlRewriter = new URLRewriter(t), this.scriptManager = new ScriptManager(t); } return Object.defineProperty(t.prototype, "el", { get: function () { return this.parent.el; }, enumerable: !0, configurable: !0 }), Object.defineProperty(t.prototype, "replaceSelector", { get: function () { return this.parent.replaceSelector; }, enumerable: !0, configurable: !0 }), Object.defineProperty(t.prototype, "scriptSelector", { get: function () { return this.parent.scriptSelector; }, enumerable: !0, configurable: !0 }), t.prototype.getTitle = function (t) { return (t.querySelector("title") || { textContent: "" }).textContent; }, t.prototype.getReplaceElements = function (t) { if (this.replaceSelector)
    return this.replaceSelector.split(",").map(function (e) { return t.querySelector(e); }); if (this.el.id)
    return [t.getElementById(this.el.id)]; var e = Array.from(document.getElementsByTagName(this.el.tagName)).indexOf(this.el); return [t.querySelectorAll(this.el.tagName)[e]]; }, t.prototype.responseToContent = function (t) { try {
    var e = fragmentFromString(t.response), r = this.getTitle(e), n = this.getReplaceElements(e), o = this.scriptSelector ? this.scriptManager.tempRemoveScriptTags(n) : [];
    return Object.assign({}, t, { documentFragment: e, title: r, replaceEls: n, scripts: o });
}
catch (t) {
    console.error(t);
} }, t.prototype.replaceContentWithSelector = function (t) { this.replaceSelector.split(",").map(function (t) { return document.querySelector(t); }).forEach(function (e, r) { return e.parentNode.replaceChild(t[r], e); }); }, t.prototype.replaceContentWholesale = function (t) { this.el.innerHTML = t[0].innerHTML; }, t.prototype.replaceContent = function (t) { this.scriptSelector ? this.replaceContentWithSelector(t) : this.replaceContentWholesale(t); }, t.prototype.updateDOM = function (t) { try {
    var e = t.replaceEls;
    isExternal(this.parent) && this.urlRewriter.rewriteURLs(e), this.replaceContent(e);
}
catch (e) {
    throw Object.assign({}, t, { error: e });
} }, t.prototype.reinsertScriptTags = function (t) { return this.scriptManager.reinsertScriptTags(t); }, t; }(), EventListenersMixin = function () { function t() { } return t.prototype.setupEventListeners = function () { var t = this; if (this.pushEvent$ = fromEvent(this.el, "click").pipe(map(function (e) { var r = matchesAncestors(e.target, t.linkSelector); if (r instanceof HTMLAnchorElement)
    return [e, r]; }), filter(function (t) { return !!t; })), "MutationObserver" in window && "Set" in window) {
    var e = new Set, r = new Subject;
    this.hintEvent$ = r;
    var n = function (t) { return r.next([t, t.currentTarget]); }, o = function (t) { e.has(t) || (e.add(t), t.addEventListener("mouseenter", n, { passive: !0 }), t.addEventListener("touchstart", n, { passive: !0 }), t.addEventListener("focus", n, { passive: !0 })); }, i = function (e) { e instanceof Element && (e.matches(t.linkSelector) ? o(e) : e.querySelectorAll(t.linkSelector).forEach(o)); }, s = function (t) { e.delete(t), t.removeEventListener("mouseenter", n), t.removeEventListener("touchstart", n), t.removeEventListener("focus", n); }, c = function (e) { e instanceof Element && (e.matches(t.linkSelector) ? s(e) : e.querySelectorAll(t.linkSelector).forEach(s)); };
    this.linkSelector$.subscribe(function () { e.forEach(s), i(t.el); }), createMutationObservable(this.el, { childList: !0, subtree: !0 }).pipe(startWith({ addedNodes: [this.el], removedNodes: [] }), tap({ complete: function () { e.forEach(s); } }), subscribeWhen(this.prefetch$)).subscribe(function (t) { var e = t.addedNodes; t.removedNodes.forEach(c), e.forEach(i); });
} }, t; }(), timeout = function (t) { return new Promise(function (e) { return setTimeout(e, t); }); }, EventManager = function () { function t(t) { this.parent = t; } return Object.defineProperty(t.prototype, "animPromise", { get: function () { return this.parent.animPromise; }, set: function (t) { this.parent.animPromise = t; }, enumerable: !0, configurable: !0 }), Object.defineProperty(t.prototype, "duration", { get: function () { return this.parent.duration; }, enumerable: !0, configurable: !0 }), t.prototype.onStart = function (t) { var e = this; this.animPromise = timeout(this.duration), this.parent.start.emit(Object.assign({}, t, { transitionUntil: function (t) { e.animPromise = t; } })); }, t.prototype.emitDOMError = function (t) { console.log(t.error); var e = t.url; t.replaceElMissing ? (window.history.back(), setTimeout(function () { return document.location.href = e; }, 100)) : this.parent.error.emit(t); }, t.prototype.emitNetworkError = function (t) { this.parent.networkerror.emit(t); }, t.prototype.emitError = function (t) { console.log(t.error), this.parent.error.emit(t); }, t.prototype.emitReady = function (t) { this.parent.ready.emit(t); }, t.prototype.emitAfter = function (t) { this.parent.after.emit(t); }, t.prototype.emitProgress = function (t) { this.parent.progress.emit(t); }, t.prototype.emitLoad = function (t) { this.parent.load.emit(t); }, t; }(), HistoryManager = function () { function t(t) { this.parent = t; } return t.prototype.updateHistoryState = function (t) { var e, r = t.cause, n = t.replace, o = t.url.href; if (!isExternal(this.parent))
    switch (r) {
        case Cause.Init:
        case Cause.Push:
            var i = this.parent.histId(), s = Object.assign({}, window.history.state, ((e = {})[i] = {}, e));
            n || o === window.location.href ? window.history.replaceState(s, document.title, o) : window.history.pushState(s, document.title, o);
    } }, t.prototype.updateHistoryStateHash = function (t) { var e, r = t.cause, n = t.url; if (!isExternal(this.parent) && r === Cause.Push) {
    var o = this.parent.histId();
    window.history.pushState(((e = {})[o] = {}, e), document.title, n.href);
} }, t.prototype.updateHistoryTitle = function (t) { var e = t.cause, r = t.title; document.title = r, isExternal(this.parent) || e !== Cause.Push || window.history.replaceState(window.history.state, r, window.location.href); }, t.prototype.updateHistoryScrollPosition = function () { if (!isExternal(this.parent)) {
    var t = this.assignScrollPosition(window.history.state || {});
    window.history.replaceState(t, document.title, window.location.href);
} }, t.prototype.assignScrollPosition = function (t) { var e, r = this.parent.histId(); return Object.assign({}, t, ((e = {})[r] = Object.assign({}, t[r], { scrollTop: getScrollTop(), scrollHeight: getScrollHeight() }), e)); }, t; }(), ScrollManager = function () { function t(t) { this.parent = t; } return t.prototype.manageScrollPostion = function (t) { var e = t.url.hash; switch (t.cause) {
    case Cause.Push:
        this.scrollHashIntoView(e, { behavior: "smooth", block: "start", inline: "nearest" });
        break;
    case Cause.Pop:
        this.restoreScrollPostion();
        break;
    case Cause.Init: this.restoreScrollPostionOnReload();
} }, t.prototype.scrollHashIntoView = function (t, e) { if (t) {
    var r = document.getElementById(decodeURIComponent(t.substr(1)));
    r && r.scrollIntoView(e);
}
else
    window.scroll(window.pageXOffset, 0); }, t.prototype.restoreScrollPostion = function () { var t = this.parent.histId(), e = (window.history.state && window.history.state[t] || {}).scrollTop; null != e && window.scroll(window.pageXOffset, e); }, t.prototype.restoreScrollPostionOnReload = function () { 0 != getScrollTop() || this.restoreScrollPostion(); }, t; }(), HyPushState = function () { function t() { this.linkSelector = "a[href]:not([data-no-push])", this.prefetch = !1, this.duration = 0, this.initialHref = window.location.href, this.scrollManager = new ScrollManager(this), this.historyManager = new HistoryManager(this), this.fetchManager = new FetchManager(this), this.updateManager = new UpdateManager(this), this.eventManager = new EventManager(this), this.reload$ = new Subject, this.cacheNr = 0; } return t.prototype.setLinkSelector = function (t) { this.linkSelector$.next(t); }, t.prototype.setPrefetch = function (t) { this.prefetch$.next(t); }, Object.defineProperty(t.prototype, "hash", { get: function () { return this.url.hash; }, enumerable: !0, configurable: !0 }), Object.defineProperty(t.prototype, "host", { get: function () { return this.url.host; }, enumerable: !0, configurable: !0 }), Object.defineProperty(t.prototype, "hostname", { get: function () { return this.url.hostname; }, enumerable: !0, configurable: !0 }), Object.defineProperty(t.prototype, "href", { get: function () { return this.url.href; }, enumerable: !0, configurable: !0 }), Object.defineProperty(t.prototype, "origin", { get: function () { return this.url.origin; }, enumerable: !0, configurable: !0 }), Object.defineProperty(t.prototype, "pathname", { get: function () { return this.url.pathname; }, enumerable: !0, configurable: !0 }), Object.defineProperty(t.prototype, "port", { get: function () { return this.url.port; }, enumerable: !0, configurable: !0 }), Object.defineProperty(t.prototype, "protocol", { get: function () { return this.url.protocol; }, enumerable: !0, configurable: !0 }), Object.defineProperty(t.prototype, "search", { get: function () { return this.url.search; }, enumerable: !0, configurable: !0 }), Object.defineProperty(t.prototype, "ancestorOrigins", { get: function () { return window.location.ancestorOrigins; }, enumerable: !0, configurable: !0 }), t.prototype.histId = function () { return this.el.id || this.el.tagName; }, t.prototype.assign = function (t) { this.reload$.next({ cause: Cause.Push, url: new URL(t, this.href), cacheNr: ++this.cacheNr }); }, t.prototype.reload = function () { this.reload$.next({ cause: Cause.Push, url: new URL(this.href), cacheNr: ++this.cacheNr, replace: !0 }); }, t.prototype.replace = function (t) { this.reload$.next({ cause: Cause.Push, url: new URL(t, this.href), cacheNr: ++this.cacheNr, replace: !0 }); }, t.prototype.compareContext = function (t, e) { return t.url.href === e.url.href && t.error === e.error && t.cacheNr === e.cacheNr; }, t.prototype.componentWillLoad = function () { var t = this; this.linkSelector$ = new BehaviorSubject(this.linkSelector), this.prefetch$ = new BehaviorSubject(this.prefetch), this.setupEventListeners(); var e = {}, r = merge(this.pushEvent$.pipe(map(function (e) { var r = e[0], n = e[1]; return { cause: Cause.Push, url: new URL(n.href, t.href), anchor: n, event: r, cacheNr: t.cacheNr }; }), filter(function (e) { return isPushEvent(e, t); }), tap(function (e) { e.event.preventDefault(), t.historyManager.updateHistoryScrollPosition(); })), fromEvent(window, "popstate").pipe(filter(function () { return window.history.state && window.history.state[t.histId()]; }), map(function (e) { return { cause: Cause.Pop, url: new URL(window.location.href, t.href), event: e, cacheNr: t.cacheNr }; })), this.reload$).pipe(startWith({ url: new URL(this.initialHref) }), tap(function (e) { return t.url = e.url; }), pairwise(), share()), n = r.pipe(filter(function (t) { return !isHashChange.apply(void 0, t); }), map(function (t) { return t[1]; }), share()), o = r.pipe(filter(function (t) { return isHashChange.apply(void 0, t); }), map(function (t) { return t[1]; })), i = defer(function () { return merge(n.pipe(mapTo(!0)), e.response$.pipe(mapTo(!1))); }).pipe(startWith(!1)), s = merge(this.prefetch$.pipe(switchMap(function (e) { return e ? t.hintEvent$.pipe(unsubscribeWhen(i), map(function (e) { var r = e[0], n = e[1]; return { cause: Cause.Hint, url: new URL(n.href, t.href), anchor: n, event: r, cacheNr: t.cacheNr }; }), filter(function (e) { return isHintEvent(e, t); })) : NEVER; })), n).pipe(distinctUntilChanged(function (e, r) { return t.compareContext(e, r); }), switchMap(function (e) { return t.fetchManager.fetchPage(e); }), startWith({ url: {} }), share()), c = e.response$ = n.pipe(tap(function (e) { t.historyManager.updateHistoryState(e), t.eventManager.onStart(e); }), withLatestFrom(s), switchMap(function (e) { var r; return (r = t.fetchManager).getResponse.apply(r, [s].concat(e)); }), share()), u = c.pipe(filter(function (t) { return !t.error; })), a = c.pipe(filter(function (t) { return t.error; })); u.pipe(map(function (e) { return t.updateManager.responseToContent(e); }), tap(function (e) { t.eventManager.emitReady(e), t.updateManager.updateDOM(e), t.historyManager.updateHistoryTitle(e), t.scrollManager.manageScrollPostion(e), t.eventManager.emitAfter(e); }), tap({ error: function (e) { return t.eventManager.emitDOMError(e); } }), catchError(function (t, e) { return e; }), switchMap(function (e) { return t.updateManager.reinsertScriptTags(e); }), tap({ error: function (e) { return t.eventManager.emitError(e); } }), catchError(function (t, e) { return e; })).subscribe(function (e) { return t.eventManager.emitLoad(e); }), o.subscribe(function (e) { t.historyManager.updateHistoryStateHash(e), t.scrollManager.manageScrollPostion(e); }), a.subscribe(function (e) { return t.eventManager.emitNetworkError(e); }), n.pipe(switchMap(function (e) { return defer(function () { return t.animPromise; }).pipe(takeUntil(c), mapTo(e)); })).subscribe(function (e) { return t.eventManager.emitProgress(e); }); }, Object.defineProperty(t, "is", { get: function () { return "hy-push-state"; }, enumerable: !0, configurable: !0 }), Object.defineProperty(t, "properties", { get: function () { return { assign: { method: !0 }, duration: { type: Number, attr: "duration", reflectToAttr: !0, mutable: !0 }, el: { elementRef: !0 }, initialHref: { type: String, attr: "initial-href", mutable: !0 }, linkSelector: { type: String, attr: "link-selector", reflectToAttr: !0, mutable: !0, watchCallbacks: ["setLinkSelector"] }, prefetch: { type: Boolean, attr: "prefetch", reflectToAttr: !0, mutable: !0, watchCallbacks: ["setPrefetch"] }, reload: { method: !0 }, replace: { method: !0 }, replaceSelector: { type: String, attr: "replace-selector", reflectToAttr: !0, mutable: !0 }, scriptSelector: { type: String, attr: "script-selector", reflectToAttr: !0, mutable: !0 } }; }, enumerable: !0, configurable: !0 }), Object.defineProperty(t, "events", { get: function () { return [{ name: "start", method: "start", bubbles: !0, cancelable: !0, composed: !0 }, { name: "ready", method: "ready", bubbles: !0, cancelable: !0, composed: !0 }, { name: "after", method: "after", bubbles: !0, cancelable: !0, composed: !0 }, { name: "progress", method: "progress", bubbles: !0, cancelable: !0, composed: !0 }, { name: "load", method: "load", bubbles: !0, cancelable: !0, composed: !0 }, { name: "error", method: "error", bubbles: !0, cancelable: !0, composed: !0 }, { name: "networkerror", method: "networkerror", bubbles: !0, cancelable: !0, composed: !0 }]; }, enumerable: !0, configurable: !0 }), t; }();
exports.HyPushState = HyPushState;
applyMixins(HyPushState, [EventListenersMixin]);
