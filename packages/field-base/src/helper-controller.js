/**
 * @license
 * Copyright (c) 2021 Vaadin Ltd.
 * This program is available under Apache License Version 2.0, available at https://vaadin.com/license/
 */
import { FlattenedNodesObserver } from '@polymer/polymer/lib/utils/flattened-nodes-observer.js';

/**
 * A controller to manage slotted helper element.
 */
export class HelperController {
  static __generateHelperId() {
    this._uniqHelperId = 1 + this._uniqHelperId || 0;
    return this._uniqHelperId;
  }

  constructor(host) {
    this.host = host;

    // Save generated ID to restore later
    this.__savedHelperId = `helper-${host.localName}-${HelperController.__generateHelperId()}`;
  }

  hostConnected() {
    if (this.helperNode) {
      this.__applyCustomHelper(this.helperNode);
    }

    this.__helperSlot = this.host.shadowRoot.querySelector('[name=helper]');
    this.__helperSlotObserver = new FlattenedNodesObserver(this.__helperSlot, (info) => {
      const helper = this._currentHelper;

      const newHelper = info.addedNodes.find((node) => node !== helper);
      const oldHelper = info.removedNodes.find((node) => node === helper);

      if (newHelper) {
        // Custom helper is added, remove the previous one.
        if (helper && helper.isConnected) {
          this.host.removeChild(helper);
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

        this.__applyDefaultHelper();
      }
    });
  }

  get helperNode() {
    return this.host.querySelector('[slot=helper]');
  }

  setHelperText(helperText) {
    this.helperText = helperText;
    this.__applyDefaultHelper();
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
    this.host.appendChild(helper);
    this._currentHelper = helper;

    return helper;
  }

  /**
   * @private
   */
  __applyDefaultHelper() {
    let helper = this.helperNode;

    const hasHelperText = this.__isNotEmpty(this.helperText);
    if (hasHelperText && !helper) {
      // Create helper lazily
      helper = this.__attachDefaultHelper();
    }

    // Only set text content for default helper
    if (helper && helper === this.__defaultHelper) {
      helper.textContent = this.helperText;
    }

    this.__toggleHasHelper(hasHelperText);
  }

  /**
   * @param {boolean} hasHelper
   * @private
   */
  __toggleHasHelper(hasHelper) {
    this.host.toggleAttribute('has-helper', hasHelper);
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

    this.host.dispatchEvent(new CustomEvent('helper-id-changed', { detail: { value: customHelper.id } }));
  }
}
