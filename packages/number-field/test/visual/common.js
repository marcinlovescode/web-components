import { css, registerStyles } from '@vaadin/vaadin-themable-mixin/vaadin-themable-mixin.js';

/* hide caret */
registerStyles(
  'vaadin-number-field',
  css`
    :host([focus-ring]) ::slotted(input) {
      font-size: 0 !important;
    }
  `
);