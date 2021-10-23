/**
 * @license
 * Copyright (c) 2021 Vaadin Ltd.
 * This program is available under Apache License Version 2.0, available at https://vaadin.com/license/
 */

/**
 * @polymerMixin
 */
export const ItemsMixin = (superClass) =>
  class ItemsMixin extends superClass {
    static get properties() {
      return {
        items: {
          type: Array,
          observer: '__itemsChanged'
        }
      };
    }

    __createItemElement(item) {
      const element = document.createElement(item.component || 'vaadin-item');
      element.disabled = item.disabled;
      element.value = item.value;
      element.textContent = item.label || item.text;
      return element;
    }

    /** @private */
    __itemsChanged(items) {
      if (items) {
        this.renderer = (root) => {
          let listBox = root.firstElementChild;
          if (!listBox) {
            listBox = document.createElement('vaadin-list-box');
            root.appendChild(listBox);
          }

          listBox.textContent = '';

          items.forEach((item) => listBox.appendChild(this.__createItemElement(item)));
        };
      }
    }
  };
