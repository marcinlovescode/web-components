/**
 * @license
 * Copyright (c) 2021 Vaadin Ltd.
 * This program is available under Apache License Version 2.0, available at https://vaadin.com/license/
 */
import { SlotController } from './slot-controller.js';

/**
 * A controller to manage slotted `<label>` element.
 */
export class LabelController extends SlotController {
  static __generateLabelId() {
    this._uniqLabelId = 1 + this._uniqLabelId || 0;
    return this._uniqLabelId;
  }

  constructor(host) {
    super(host, [
      'label',
      () => document.createElement('label'),
      (host, node) => {
        node.id = `${host.localName}-${LabelController.__generateLabelId()}`;
        if (this.label) {
          node.textContent = this.label;
        }
      }
    ]);

    /**
     * @type {MutationObserver}
     * @private
     */
    this.__labelNodeObserver = new MutationObserver(() => {
      this.toggleHasLabelAttribute();
    });
  }

  hostConnected() {
    super.hostConnected();

    if (this.labelNode) {
      this.toggleHasLabelAttribute();
      this.__labelNodeObserver.observe(this.labelNode, { childList: true, subtree: true, characterData: true });
    }
  }

  get labelNode() {
    return this._slottedNode;
  }

  setLabel(label) {
    this.label = label;

    if (this.labelNode) {
      this.labelNode.textContent = this.label;
      this.toggleHasLabelAttribute();
    }
  }

  toggleHasLabelAttribute() {
    if (this.labelNode) {
      const hasLabel = this.labelNode.children.length > 0 || this.labelNode.textContent.trim() !== '';

      this.host.toggleAttribute('has-label', hasLabel);
      this.host.dispatchEvent(new CustomEvent('has-label-changed', { detail: { value: hasLabel } }));
    }
  }
}
