

var TempDomHelper = require('./TempDomHelper');

function BrowserDeviceInput(element, caret) {

  if(arguments.length == 1) {
    caret = element;
    element = window.document;
  }

  // Todo listening to window.document instead of element

  this.caret = caret;
  this.dom = new TempDomHelper();

  this.bindKeyboard(element, caret);
  this.bindMouse(element, caret);

}

(function () {

  /**
   * Bind keyboard events
   *
   * @param element
   * @param caret
   * @returns {BrowserDeviceInput}
   */
  this.bindKeyboard = function(element, caret) {

    var self = this;

    // Some events must be catched on keydown to prevent
    // native browser behaviour
    window.document.addEventListener('keydown', function(e) {

      // TODO Code repetition
      // TODO keyCode is deprecated

      // Left arrow
      if(e.keyCode == 37) {
        e.preventDefault();
        caret.moveLeft();
      }

      // Right arrow
      else if(e.keyCode == 39) {
        e.preventDefault();
        caret.moveRight();
      }

      // Up arrow
      else if(e.keyCode == 38) {
        e.preventDefault();
        caret.moveUp();
      }

      // Down arrow
      else if(e.keyCode == 40) {
        e.preventDefault();
        caret.moveDown();
      }

      // Backspace
      else if(e.keyCode == 8) {
        caret.removeCharacter();
        e.preventDefault();
      }

      // Space
      else if(e.keyCode == 32) {
        e.preventDefault();
        caret.insertText(' ');
      }

    });

    // Most text input can be caught on keypress
    window.document.addEventListener('keypress', function(event) {
      var key = event.keyCode || event.which;
      if(key === 8) {
        // done at keydown
      } else if(event.metaKey &&  key == 98) { // cmd + b
        var range = window.getSelection().getRangeAt(0);
        self.dom.cmd(self.caret.textNode, 'strong', range.startOffset, range.endOffset);
        self.caret._moveElToOffset();
      } else {
        caret.insertText(String.fromCharCode(key));
      }

    });

    // Chaining
    return this;
  };

  /**
   * Bind mouse events
   *
   * @param element
   * @param caret
   * @returns {BrowserDeviceInput}
   */
  this.bindMouse = function(element, caret) {
    var range, textNode, offset;
    element.addEventListener("click", function(e) {
      range = window.document.caretRangeFromPoint(e.clientX, e.clientY);
      textNode = range.startContainer;
      offset = range.startOffset;
      if (textNode.nodeType == 3) {
        caret.moveTo(textNode, offset);
      }
    }, false);
    return this;
  };

}).call(BrowserDeviceInput.prototype);

module.exports = BrowserDeviceInput;
