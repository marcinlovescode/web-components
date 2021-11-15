/**
 * @license
 * Copyright (c) 2021 Vaadin Ltd.
 * This program is available under Apache License Version 2.0, available at https://vaadin.com/license/
 */
import { FlattenedNodesObserver } from '@polymer/polymer/lib/utils/flattened-nodes-observer.js';
import { animationFrame } from '@vaadin/component-base/src/async.js';
import { Debouncer } from '@vaadin/component-base/src/debounce.js';
import { SlotMixin } from '@vaadin/component-base/src/slot-mixin.js';
import { ErrorController } from './error-controller.js';
import { LabelMixin } from './label-mixin.js';
import { ValidateMixin } from './validate-mixin.js';

/**
 * A mixin to provide common field logic: label, error message and helper text.
 *
 * @polymerMixin
 * @mixes LabelMixin
 * @mixes ValidateMixin
 */
export const FieldMixin = (superclass) =>
  class FieldMixinClass extends ValidateMixin(LabelMixin(SlotMixin(superclass))) {
    static get properties() {
      return {
        /**
         * A target element to which ARIA attributes are set.
         * @protected
         */
        ariaTarget: {
          type: Object
        },

        /**
         * Error to show when the field is invalid.
         *
         * @attr {string} error-message
         */
        errorMessage: {
          type: String
        },

        /**
         * String used for the helper text.
         * @attr {string} helper-text
         */
        helperText: {
          type: String,
          observer: '_helperTextChanged'
        },

        /** @protected */
        _helperId: String
      };
    }

    static get observers() {
      return [
        '__observeOffsetHeight(errorMessage, invalid, label, helperText)',
        '__invalidChanged(invalid)',
        '__errorMessageChanged(errorMessage)'
      ];
    }

    /**
     * @protected
     * @return {HTMLElement}
     */
    get _errorNode() {
      return this._errorController.errorNode;
    }

    /**
     * @protected
     * @return {HTMLElement}
     */
    get _helperNode() {
      return this._getDirectSlotChild('helper');
    }

    constructor() {
      super();

      this._errorController = new ErrorController(this);

      // Ensure every instance has unique ID
      const uniqueId = (FieldMixinClass._uniqueFieldId = 1 + FieldMixinClass._uniqueFieldId || 0);
      this._helperId = `helper-${this.localName}-${uniqueId}`;

      // Save generated ID to restore later
      this.__savedHelperId = this._helperId;
    }

    __invalidChanged(invalid, oldInvalid) {
      if (oldInvalid === invalid) {
        return;
      }

      if (invalid) {
        this._errorController.show();
      } else {
        this._errorController.hide();
      }
    }

    __errorMessageChanged(errorMessage) {
      this._errorController.setErrorMessage(errorMessage);
    }

    /** @protected */
    ready() {
      super.ready();

      this.addController(this._errorController);

      const helper = this._helperNode;
      if (helper) {
        this.__applyCustomHelper(helper);
      }

      this.__helperSlot = this.shadowRoot.querySelector('[name="helper"]');

      this.__helperSlotObserver = new FlattenedNodesObserver(this.__helperSlot, (info) => {
        const helper = this._currentHelper;

        const newHelper = info.addedNodes.find((node) => node !== helper);
        const oldHelper = info.removedNodes.find((node) => node === helper);

        if (newHelper) {
          // Custom helper is added, remove the previous one.
          if (helper && helper.isConnected) {
            this.removeChild(helper);
          }

          this.__applyCustomHelper(newHelper);

          this.__helperIdObserver = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
              // only handle helper nodes
              if (
                mutation.type === 'attributes' &&
                mutation.attributeName === 'id' &&
                mutation.target === this._currentHelper &&
                mutation.target.id !== this.__savedHelperId
              ) {
                this.__updateHelperId(mutation.target);
              }
            });
          });

          this.__helperIdObserver.observe(newHelper, { attributes: true });
        } else if (oldHelper) {
          // The observer does not exist when default helper is removed.
          if (this.__helperIdObserver) {
            this.__helperIdObserver.disconnect();
          }

          this.__applyDefaultHelper(this.helperText);
        }
      });
    }

    /**
     * @param {HTMLElement} helper
     * @private
     */
    __applyCustomHelper(helper) {
      this.__updateHelperId(helper);
      this._currentHelper = helper;
      this.__toggleHasHelper(helper.children.length > 0 || this.__isNotEmpty(helper.textContent));
    }

    /**
     * @param {string} helperText
     * @private
     */
    __isNotEmpty(helperText) {
      return helperText && helperText.trim() !== '';
    }

    /** @private */
    __attachDefaultHelper() {
      let helper = this.__defaultHelper;

      if (!helper) {
        helper = document.createElement('div');
        helper.setAttribute('slot', 'helper');
        this.__defaultHelper = helper;
      }

      helper.id = this.__savedHelperId;
      this.appendChild(helper);
      this._currentHelper = helper;

      return helper;
    }

    /**
     * @param {string} helperText
     * @private
     */
    __applyDefaultHelper(helperText) {
      let helper = this._helperNode;

      const hasHelperText = this.__isNotEmpty(helperText);
      if (hasHelperText && !helper) {
        // Create helper lazily
        helper = this.__attachDefaultHelper();
      }

      // Only set text content for default helper
      if (helper && helper === this.__defaultHelper) {
        helper.textContent = helperText;
      }

      this.__toggleHasHelper(hasHelperText);
    }

    /**
     * @param {boolean} hasHelper
     * @private
     */
    __toggleHasHelper(hasHelper) {
      this.toggleAttribute('has-helper', hasHelper);
    }

    /**
     * Dispatch an event if a specific size measurement property has changed.
     * Supporting multiple properties here is needed for `vaadin-text-area`.
     * @protected
     */
    _dispatchIronResizeEventIfNeeded(prop, value) {
      const oldSize = '__old' + prop;
      if (this[oldSize] !== undefined && this[oldSize] !== value) {
        this.dispatchEvent(new CustomEvent('iron-resize', { bubbles: true, composed: true }));
      }

      this[oldSize] = value;
    }

    /** @private */
    __observeOffsetHeight() {
      this.__observeOffsetHeightDebouncer = Debouncer.debounce(
        this.__observeOffsetHeightDebouncer,
        animationFrame,
        () => {
          this._dispatchIronResizeEventIfNeeded('Height', this.offsetHeight);
        }
      );
    }

    /**
     * @param {HTMLElement} customHelper
     * @private
     */
    __updateHelperId(customHelper) {
      let newId;

      if (customHelper.id) {
        newId = customHelper.id;
      } else {
        newId = this.__savedHelperId;
        customHelper.id = newId;
      }

      this._helperId = newId;
    }

    /**
     * @param {string} helperText
     * @protected
     */
    _helperTextChanged(helperText) {
      this.__applyDefaultHelper(helperText);
    }
  };
