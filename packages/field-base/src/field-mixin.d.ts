/**
 * @license
 * Copyright (c) 2021 Vaadin Ltd.
 * This program is available under Apache License Version 2.0, available at https://vaadin.com/license/
 */
import { Constructor } from '@open-wc/dedupe-mixin';
import { DelegateStateMixinClass } from './delegate-state-mixin.js';
import { LabelMixinClass } from './label-mixin.js';
import { ValidateMixinClass } from './validate-mixin.js';

/**
 * A mixin to provide common field logic: label, error message and helper text.
 */
export declare function FieldMixin<T extends Constructor<HTMLElement>>(
  superclass: T
): T &
  Constructor<DelegateStateMixinClass> &
  Constructor<FieldMixinClass> &
  Constructor<LabelMixinClass> &
  Constructor<ValidateMixinClass>;

export declare class FieldMixinClass {
  /**
   * A target element to which ARIA attributes are set.
   */
  ariaTarget: HTMLElement;

  /**
   * String used for the helper text.
   *
   * @attr {string} helper-text
   */
  helperText: string | null | undefined;

  /**
   * Error message to show when the field is invalid.
   *
   * @attr {string} error-message
   */
  errorMessage: string | null | undefined;

  protected readonly _ariaAttr: 'aria-labelledby' | 'aria-describedby';

  protected _ariaTargetChanged(target: HTMLElement): void;

  protected readonly _errorNode: HTMLElement;

  protected readonly _helperNode?: HTMLElement;

  protected _helperTextChanged(helperText: string | null | undefined): void;

  protected _updateAriaAttribute(target: HTMLElement, invalid: boolean, helperId: string): void;

  protected _updateAriaRequiredAttribute(target: HTMLElement, required: boolean): void;
}