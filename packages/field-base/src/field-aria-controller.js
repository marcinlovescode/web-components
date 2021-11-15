/**
 * @license
 * Copyright (c) 2021 Vaadin Ltd.
 * This program is available under Apache License Version 2.0, available at https://vaadin.com/license/
 */
export class FieldAriaController {
  constructor(host, { labelController, errorController, helperController }) {
    this.host = host;
    this.labelController = labelController;
    this.errorController = errorController;
    this.helperController = helperController;

    this.__updateAriaAttributes = this.__updateAriaAttributes.bind(this);
  }

  hostConnected() {
    this.host.addEventListener('has-label-changed', this.__updateAriaAttributes);
    this.host.addEventListener('has-error-message-changed', this.__updateAriaAttributes);
    this.__updateAriaAttributes();
    this.__updateAriaRequiredAttribute();
  }

  hostDisconnected() {
    this.host.removeEventListener('has-label-changed', this.__updateAriaAttributes);
    this.host.removeEventListener('has-error-message-changed', this.__updateAriaAttributes);
  }

  get __isGroupField() {
    return this.target === this.host;
  }

  setTarget(target) {
    this.target = target;
    this.__updateAriaAttributes();
    this.__updateAriaRequiredAttribute();
  }

  setRequired(required) {
    this.required = required;
    this.__updateAriaRequiredAttribute();
  }

  get labelId() {
    return this.labelController.labelNode?.id;
  }

  get helperId() {
    return this.helperController.helperNode?.id;
  }

  get errorId() {
    return this.errorController.errorNode?.id;
  }

  __updateAriaAttributes() {
    if (!this.target) {
      return;
    }

    const ariaLabelledBy = this.__getInitialAriaAttribute('aria-labelledby');
    const ariaDescribedBy = this.__getInitialAriaAttribute('aria-describedby');

    if (this.host.hasAttribute('has-label')) {
      ariaLabelledBy.push(this.labelId);
    }

    // For groups, add all IDs to aria-labelledby rather than aria-describedby -
    // that should guarantee that it's announced when the group is entered.
    if (this.__isGroupField) {
      ariaLabelledBy.push(this.helperId);
    } else {
      ariaDescribedBy.push(this.helperId);
    }

    // Error message ID needs to be dynamically added / removed based on the validity
    // Otherwise assistive technologies would announce the error, even if we hide it.
    if (this.host.hasAttribute('has-error-message')) {
      if (this.__isGroupField) {
        ariaLabelledBy.push(this.errorId);
      } else {
        ariaDescribedBy.push(this.errorId);
      }
    }

    this.target.setAttribute('aria-labelledby', ariaLabelledBy.filter(Boolean).join(' '));
    this.target.setAttribute('aria-describedby', ariaDescribedBy.filter(Boolean).join(' '));
  }

  __updateAriaRequiredAttribute() {
    if (!this.target) {
      return;
    }

    if (!this.__isGroupField) {
      // native <input> or <textarea>, required is enough
      return;
    }

    if (this.required) {
      this.target.setAttribute('aria-required', true);
    } else {
      this.target.removeAttribute('aria-required');
    }
  }

  __getInitialAriaAttribute(attr) {
    const { labelIdPrefix } = this.labelController;
    const { errorIdPrefix } = this.errorController;
    const { helperIdPrefix } = this.helperController;

    const value = this.target.getAttribute(attr) || '';
    return value.split(' ').filter((id) => {
      if (new RegExp(`^(${errorIdPrefix}|${helperIdPrefix}|${labelIdPrefix})`).test(id)) {
        return false;
      }

      return true;
    });
  }
}
