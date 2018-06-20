const isPolymer2 = document.querySelector('script[src*="wct-browser-legacy"]') === null;

window.VaadinComboBoxSuites = [
  'vaadin-combo-box.html',
  'toggling-dropdown.html',
  'overlay-position.html',
  'selecting-items.html',
  'form-input.html',
  'filtering.html',
  'keyboard.html',
  'scrolling.html',
  'aria.html',
  'using-object-values.html',
  'data-binding.html',
  'vaadin-combo-box-light.html',
  'item-template.html',
  'vaadin-combo-box-dropdown.html'
];

if (isPolymer2) {
  window.VaadinComboBoxSuites.push('late-upgrade.html');
}
