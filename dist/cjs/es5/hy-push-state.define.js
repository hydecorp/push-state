"use strict";
// HyPushState: Custom Elements Define Library, ES Module/es5 Target
Object.defineProperty(exports, "__esModule", { value: true });
var hy_push_state_core_js_1 = require("./hy-push-state.core.js");
var hy_push_state_components_js_1 = require("./hy-push-state.components.js");
function defineCustomElements(win, opts) {
    return hy_push_state_core_js_1.defineCustomElement(win, hy_push_state_components_js_1.COMPONENTS, opts);
}
exports.defineCustomElements = defineCustomElements;
