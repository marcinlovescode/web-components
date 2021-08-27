import { expect } from '@esm-bundle/chai';
import { fixtureSync } from '@vaadin/testing-helpers';
import { createFile } from './common.js';
import '../vaadin-upload.js';

describe('<vaadin-upload-file> element', () => {
  let fileElement, fileObject;

  beforeEach(() => {
    fileElement = fixtureSync(`<vaadin-upload-file></vaadin-upload-file>`);
    fileObject = createFile(100000, 'application/unknown');
    fileElement.file = fileObject;
  });

  describe('state attributes', () => {
    it('should not be uploading by default', () => {
      expect(fileElement.hasAttribute('uploading')).to.be.false;
    });

    it('should reflect uploading', () => {
      fileElement.set('file.uploading', true);
      expect(fileElement.hasAttribute('uploading')).to.be.true;
    });

    it('should not be indeterminate by default', () => {
      expect(fileElement.hasAttribute('indeterminate')).to.be.false;
    });

    it('should reflect indeterminate', () => {
      fileElement.set('file.indeterminate', true);
      expect(fileElement.hasAttribute('indeterminate')).to.be.true;
    });

    it('should not be complete by default', () => {
      expect(fileElement.hasAttribute('complete')).to.be.false;
    });

    it('should reflect complete', () => {
      fileElement.set('file.complete', true);
      expect(fileElement.hasAttribute('complete')).to.be.true;
    });

    it('should not be error by default', () => {
      expect(fileElement.hasAttribute('error')).to.be.false;
    });

    it('should reflect error', () => {
      fileElement.set('file.error', true);
      expect(fileElement.hasAttribute('error')).to.be.true;
    });
  });

  describe('a11y', () => {
    let i18n, button;

    beforeEach(() => {
      i18n = {
        file: {
          start: 'Start',
          retry: 'Retry',
          clear: 'Clear'
        }
      };
      fileElement.i18n = i18n;
    });

    describe('start button', () => {
      beforeEach(() => {
        button = fileElement.shadowRoot.querySelector('[part=start-button]');
      });

      it('should have aria-label attribute', () => {
        expect(button.getAttribute('aria-label')).to.equal(i18n.file.start);
      });
    });

    describe('retry button', () => {
      beforeEach(() => {
        button = fileElement.shadowRoot.querySelector('[part=retry-button]');
      });

      it('should have aria-label attribute', () => {
        expect(button.getAttribute('aria-label')).to.equal(i18n.file.retry);
      });
    });

    describe('clear button', () => {
      beforeEach(() => {
        button = fileElement.shadowRoot.querySelector('[part=clear-button]');
      });

      it('should have aria-label attribute', () => {
        expect(button.getAttribute('aria-label')).to.equal(i18n.file.clear);
      });
    });
  });
});
