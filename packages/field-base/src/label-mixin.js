/**
 * @license
 * Copyright (c) 2021 Vaadin Ltd.
 * This program is available under Apache License Version 2.0, available at https://vaadin.com/license/
 */
import { dedupingMixin } from '@polymer/polymer/lib/utils/mixin.js';
import { ElementMixin } from '@vaadin/component-base/src/element-mixin.js';
import { LabelController } from '@vaadin/field-base/src/label-controller.js';

/**
 * A mixin to provide label via corresponding property or named slot.
 *
 * @polymerMixin
 * @mixes SlotMixin
 */
export const LabelMixin = dedupingMixin(
  (superclass) =>
    class LabelMixinClass extends ElementMixin(superclass) {
      static get properties() {
        return {
          /**
           * The label text for the input node.
           * When no light dom defined via [slot=label], this value will be used.
           */
          label: {
            type: String,
            observer: '_labelChanged'
          }
        };
      }

      constructor() {
        super();
        this._labelController = new LabelController(this);
      }

      ready() {
        super.ready();
        this.addController(this._labelController);
      }

      /** @protected */
      get _labelNode() {
        return this._labelController.labelNode;
      }

      /** @protected */
      _labelChanged(label) {
        this._labelController.setLabel(label);
      }
    }
);
