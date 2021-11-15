/**
 * @license
 * Copyright (c) 2021 Vaadin Ltd.
 * This program is available under Apache License Version 2.0, available at https://vaadin.com/license/
 */
import { animationFrame } from '@vaadin/component-base/src/async.js';
import { Debouncer } from '@vaadin/component-base/src/debounce.js';
import { ErrorController } from './error-controller.js';
import { FieldAriaController } from './field-aria-controller.js';
import { HelperController } from './helper-controller.js';
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
  class FieldMixinClass extends ValidateMixin(LabelMixin(superclass)) {
    static get properties() {
      return {
        /**
         * A target element to which ARIA attributes are set.
         * @protected
         */
        ariaTarget: {
          type: Object,
          observer: '_ariaTargetChanged'
        },

        /**
         * Error to show when the field is invalid.
         *
         * @attr {string} error-message
         */
        errorMessage: {
          type: String,
          observer: '_errorMessageChanged'
        },

        /**
         * String used for the helper text.
         * @attr {string} helper-text
         */
        helperText: {
          type: String,
          observer: '_helperTextChanged'
        }
      };
    }

    static get observers() {
      return [
        '__observeOffsetHeight(errorMessage, invalid, label, helperText)',
        '_invalidChanged(invalid)',
        '_requiredChanged(required)'
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
      return this._helperController.helperNode;
    }

    constructor() {
      super();

      this._errorController = new ErrorController(this);
      this._helperController = new HelperController(this);

      this._fieldAriaController = new FieldAriaController(this, {
        labelController: this._labelController,
        errorController: this._errorController,
        helperController: this._helperController
      });
    }

    _invalidChanged(invalid, oldInvalid) {
      if (oldInvalid === invalid) {
        return;
      }

      if (invalid) {
        this._errorController.show();
      } else {
        this._errorController.hide();
      }
    }

    _errorMessageChanged(errorMessage) {
      this._errorController.setErrorMessage(errorMessage);
    }

    /**
     * @param {string} helperText
     * @protected
     */
    _helperTextChanged(helperText) {
      this._helperController.setHelperText(helperText);
    }

    /**
     * @param {boolean} required
     */
    _requiredChanged(required) {
      this._fieldAriaController.setRequired(required);
    }

    /**
     * @param {HTMLElement} ariaTarget
     */
    _ariaTargetChanged(ariaTarget) {
      this._fieldAriaController.setTarget(ariaTarget);
    }

    /** @protected */
    ready() {
      super.ready();

      this.addController(this._errorController);
      this.addController(this._helperController);
      this.addController(this._fieldAriaController);
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
  };
