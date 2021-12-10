/**
@license
Copyright (c) 2015 The Polymer Project Authors. All rights reserved.
This code may only be used under the BSD style license found at
http://polymer.github.io/LICENSE.txt The complete set of authors may be found at
http://polymer.github.io/AUTHORS.txt The complete set of contributors may be
found at http://polymer.github.io/CONTRIBUTORS.txt Code distributed by Google as
part of the polymer project is also subject to an additional IP rights grant
found at http://polymer.github.io/PATENTS.txt
*/

// Contains all connected resizables that do not have a parent.
var ORPHANS = new Set();

/**
 * @polymerMixin
 * @mixes DirMixin
 */
export const IronResizableMixin = (superClass) =>
  class VaadinIronResizableMixin extends superClass {
    /**
     * `IronResizableBehavior` is a behavior that can be used in Polymer elements to
     * coordinate the flow of resize events between "resizers" (elements that
     *control the size or hidden state of their children) and "resizables" (elements
     *that need to be notified when they are resized or un-hidden by their parents
     *in order to take action on their new measurements).
     *
     * Elements that perform measurement should add the `IronResizableBehavior`
     *behavior to their element definition and listen for the `iron-resize` event on
     *themselves. This event will be fired when they become showing after having
     *been hidden, when they are resized explicitly by another resizable, or when
     *the window has been resized.
     *
     * Note, the `iron-resize` event is non-bubbling.
     *
     **/

    static get properties() {
      return {
        /**
         * The closest ancestor element that implements `IronResizableBehavior`.
         */
        _parentResizable: {
          type: Object,
          observer: '_parentResizableChanged'
        },

        /**
         * True if this element is currently notifying its descendant elements of
         * resize.
         */
        _notifyingDescendant: {
          type: Boolean,
          value: false
        }
      };
    }

    constructor() {
      super();
      // We don't really need property effects on these, and also we want them
      // to be created before the `_parentResizable` observer fires:
      this._interestedResizables = [];
      this._boundNotifyResize = this.notifyResize.bind(this);
      this._boundOnDescendantIronResize = this._onDescendantIronResize.bind(this);
      this.addEventListener('iron-request-resize-notifications', this._onIronRequestResizeNotifications.bind(this));
    }

    connectedCallback() {
      super.connectedCallback();
      this._requestResizeNotifications();
    }

    disconnectedCallback() {
      super.disconnectedCallback();

      if (this._parentResizable) {
        this._parentResizable.stopResizeNotificationsFor(this);
      } else {
        ORPHANS.delete(this);
        window.removeEventListener('resize', this._boundNotifyResize);
      }

      this._parentResizable = null;
    }

    /**
     * Can be called to manually notify a resizable and its descendant
     * resizables of a resize change.
     */
    notifyResize() {
      if (!this.isConnected) {
        return;
      }

      this._interestedResizables.forEach(function (resizable) {
        if (this.resizerShouldNotify(resizable)) {
          this._notifyDescendant(resizable);
        }
      }, this);

      this._fireResize();
    }

    /**
     * Used to assign the closest resizable ancestor to this resizable
     * if the ancestor detects a request for notifications.
     */
    assignParentResizable(parentResizable) {
      if (this._parentResizable) {
        this._parentResizable.stopResizeNotificationsFor(this);
      }

      this._parentResizable = parentResizable;

      if (parentResizable && parentResizable._interestedResizables.indexOf(this) === -1) {
        parentResizable._interestedResizables.push(this);
        parentResizable._subscribeIronResize(this);
      }
    }

    /**
     * Used to remove a resizable descendant from the list of descendants
     * that should be notified of a resize change.
     */
    stopResizeNotificationsFor(target) {
      var index = this._interestedResizables.indexOf(target);

      if (index > -1) {
        this._interestedResizables.splice(index, 1);
        this._unsubscribeIronResize(target);
      }
    }

    /**
     * Subscribe this element to listen to iron-resize events on the given target.
     *
     * Preferred over target.listen because the property renamer does not
     * understand to rename when the target is not specifically "this"
     *
     * @param {!HTMLElement} target Element to listen to for iron-resize events.
     */
    _subscribeIronResize(target) {
      target.addEventListener('iron-resize', this._boundOnDescendantIronResize);
    }

    /**
     * Unsubscribe this element from listening to to iron-resize events on the
     * given target.
     *
     * Preferred over target.unlisten because the property renamer does not
     * understand to rename when the target is not specifically "this"
     *
     * @param {!HTMLElement} target Element to listen to for iron-resize events.
     */
    _unsubscribeIronResize(target) {
      target.removeEventListener('iron-resize', this._boundOnDescendantIronResize);
    }

    /**
     * This method can be overridden to filter nested elements that should or
     * should not be notified by the current element. Return true if an element
     * should be notified, or false if it should not be notified.
     *
     * implements `IronResizableBehavior`.
     * @return {boolean} True if the `element` should be notified of resize.
     */
    resizerShouldNotify() {
      return true;
    }

    _onDescendantIronResize(event) {
      if (this._notifyingDescendant) {
        event.stopPropagation();
      }
    }

    _fireResize() {
      this.dispatchEvent(new CustomEvent('iron-resize', { bubbles: false }));
    }

    _onIronRequestResizeNotifications(event) {
      var target = event.target;
      if (target === this) {
        return;
      }

      target.assignParentResizable(this);
      this._notifyDescendant(target);

      event.stopPropagation();
    }

    _parentResizableChanged(parentResizable) {
      if (parentResizable) {
        window.removeEventListener('resize', this._boundNotifyResize);
      }
    }

    _notifyDescendant(descendant) {
      // NOTE(cdata): In IE10, attached is fired on children first, so it's
      // important not to notify them if the parent is not attached yet (or
      // else they will get redundantly notified when the parent attaches).
      if (!this.isConnected) {
        return;
      }

      this._notifyingDescendant = true;
      descendant.notifyResize();
      this._notifyingDescendant = false;
    }

    _requestResizeNotifications() {
      if (!this.isConnected) {
        return;
      }

      if (document.readyState === 'loading') {
        var _requestResizeNotifications = this._requestResizeNotifications.bind(this);
        document.addEventListener('readystatechange', function readystatechanged() {
          document.removeEventListener('readystatechange', readystatechanged);
          _requestResizeNotifications();
        });
      } else {
        this._findParent();

        if (!this._parentResizable) {
          // If this resizable is an orphan, tell other orphans to try to find
          // their parent again, in case it's this resizable.
          ORPHANS.forEach(function (orphan) {
            if (orphan !== this) {
              orphan._findParent();
            }
          }, this);

          window.addEventListener('resize', this._boundNotifyResize);
          this.notifyResize();
        } else {
          // If this resizable has a parent, tell other child resizables of
          // that parent to try finding their parent again, in case it's this
          // resizable.
          this._parentResizable._interestedResizables.forEach(function (resizable) {
            if (resizable !== this) {
              resizable._findParent();
            }
          }, this);
        }
      }
    }

    _findParent() {
      this.assignParentResizable(null);
      this.dispatchEvent(new CustomEvent('iron-request-resize-notifications', { bubbles: true, cancelable: true }));

      if (!this._parentResizable) {
        ORPHANS.add(this);
      } else {
        ORPHANS.delete(this);
      }
    }

    getEffectiveChildren() {
      // TODO:
      return [...this.children];
    }
  };
