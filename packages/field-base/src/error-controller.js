/**
 * @license
 * Copyright (c) 2021 Vaadin Ltd.
 * This program is available under Apache License Version 2.0, available at https://vaadin.com/license/
 */
import { SlotController } from './slot-controller.js';

/**
 * A controller to manage slotted error element.
 */
export class ErrorController extends SlotController {
  static __generateErrorId() {
    this._uniqErrorId = 1 + this._uniqErrorId || 0;
    return this._uniqErrorId;
  }

  constructor(host) {
    super(host, [
      'error-message',
      () => document.createElement('div'),
      (host, node) => {
        node.id = `error-${host.localName}-${ErrorController.__generateErrorId()}`;
        this.__updateErrorMessage();
      }
    ]);

    this.isVisible = false;
  }

  get errorNode() {
    return this._slottedNode;
  }

  show() {
    this.isVisible = true;
    this.__updateErrorMessage();
  }

  hide() {
    this.isVisible = false;
    this.__updateErrorMessage();
  }

  setErrorMessage(errorMessage) {
    this.errorMessage = errorMessage;
    this.__updateErrorMessage();
  }

  /**
   * @param {boolean} invalid
   * @param {string} errorMessage
   * @protected
   */
  __updateErrorMessage() {
    if (!this.errorNode) {
      return;
    }

    // save the custom error message content
    if (this.errorNode.textContent && !this.errorMessage) {
      this.errorMessage = this.errorNode.textContent.trim();
    }

    const hasErrorMessage = this.isVisible && Boolean(this.errorMessage);
    this.errorNode.textContent = hasErrorMessage ? this.errorMessage : '';
    this.host.toggleAttribute('has-error-message', hasErrorMessage);
    this.host.dispatchEvent(new CustomEvent('has-error-message-changed', { detail: { value: hasErrorMessage } }));

    // Role alert will make the error message announce immediately
    // as the field becomes invalid
    if (hasErrorMessage) {
      this.errorNode.setAttribute('role', 'alert');
    } else {
      this.errorNode.removeAttribute('role');
    }
  }
}
