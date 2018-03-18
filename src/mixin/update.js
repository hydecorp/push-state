// # src / mixin / update.js
// Copyright (c) 2018 Florian Klampfer <https://qwtel.com/>
//
// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
//
// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.
//
// You should have received a copy of the GNU General Public License
// along with this program.  If not, see <http://www.gnu.org/licenses/>.

import { fragmentFromString } from '../common';

import { PUSH } from './constants';
import { scriptMixin } from './script-hack';

// For convenience....
const assign = Object.assign.bind(Object);

export const updateMixin = C =>
  class extends scriptMixin(C) {
    // Extracts the title of the page
    getTitle(fragment) {
      return (fragment.querySelector('title') || {}).textContent;
    }

    // Extracts the elements to be replaced
    getReplaceElements(fragment) {
      if (this.replaceIds.length > 0) {
        return this.replaceIds.map(id => fragment.getElementById(id));
      } else if (this.el.id) {
        return [fragment.getElementById(this.el.id)];
      } else {
        const index = Array.from(document.getElementsByTagName(this.el.tagName)).indexOf(this.el);
        return [fragment.querySelectorAll(this.el.tagName)[index]];
      }
    }

    // Takes the response string and turns it into document fragments
    // that can be inserted into the DOM.
    responseToContent(context) {
      const { response } = context;

      const fragment = fragmentFromString(response);
      const title = this.getTitle(fragment);
      const replaceEls = this.getReplaceElements(fragment);

      if (replaceEls.some(x => x == null)) {
        throw assign(context, { replaceElMissing: true });
      }

      const scripts = this.scriptSelector ? this.tempRemoveScriptTags(replaceEls) : [];

      return assign(context, { title, replaceEls, scripts });
    }

    // Replaces the old elments with the new one, one-by-one.
    replaceContentByIds(elements) {
      this.replaceIds.map(id => document.getElementById(id)).forEach((oldElement, i) => {
        oldElement.parentNode.replaceChild(elements[i], oldElement);
      });
    }

    // When no `relaceIds` are set, replace the entire content of the component (slow).
    replaceContentWholesale([el]) {
      this.el.innerHTML = el.innerHTML;
    }

    // TODO: doc
    replaceContent(replaceEls) {
      if (this.replaceIds.length > 0) {
        this.replaceContentByIds(replaceEls);
      } else {
        this.replaceContentWholesale(replaceEls);
      }
    }

    // TODO: doc
    updateDOM(context) {
      try {
        const { title, replaceEls, type } = context;

        document.title = title;

        if (type === PUSH) {
          window.history.replaceState(window.history.state, title, window.location);
        }

        this.replaceContent(replaceEls);
      } catch (error) {
        throw assign(context, { error });
      }
    }
  };
