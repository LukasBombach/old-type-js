

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

      var key = e.keyCode || e.which;

      console.log(key);

      // Left arrow
      if(key == 37) {
        e.preventDefault();
        caret.moveLeft();
      }

      // Right arrow
      else if(key == 39) {
        e.preventDefault();
        caret.moveRight();
      }

      // Up arrow
      else if(key == 38) {
        e.preventDefault();
        caret.moveUp();
      }

      // Down arrow
      else if(key == 40) {
        e.preventDefault();
        caret.moveDown();
      }

      // Backspace
      else if(key == 8) {
        caret.removeCharacter();
        e.preventDefault();
      }

      // Space
      else if(key == 32) {
        e.preventDefault();
        caret.insertText(' ');
      }

    });

    function getInfoFromRange() {
      var range = window.getSelection().getRangeAt(0);
      return {
        startContainer : range.startContainer,
        startOffset    : range.startOffset,
        endContainer   : range.endContainer,
        endOffset      : range.endOffset
      }
    }

    Mousetrap.bind('command+b', function(e) {
      self.dom.cmd('strong', getInfoFromRange());
      return false;
    });

    Mousetrap.bind('command+i', function(e) {
      self.dom.cmd('em', getInfoFromRange());
      return false;
    });

    Mousetrap.bind('command+u', function(e) {
      self.dom.cmd('u', getInfoFromRange());
      return false;
    });

    /*
     else if( (e.metaKey || e.ctrlKey) &&  key == 98) { // cmd + b
     e.preventDefault();
     var range = window.getSelection().getRangeAt(0);
     self.dom.cmd(self.caret.textNode, 'strong', range.startOffset, range.endOffset);
     //self.caret._moveElToOffset();
     }

     else if( (e.metaKey || e.ctrlKey) &&  key == 105) { // cmd + i
     e.preventDefault();
     var range = window.getSelection().getRangeAt(0);
     self.dom.cmd(self.caret.textNode, 'em', range.startOffset, range.endOffset);
     //self.caret._moveElToOffset();
     }

     else if( (e.metaKey || e.ctrlKey) &&  key == 21) { // strg + u
     e.preventDefault();
     var range = window.getSelection().getRangeAt(0);
     self.dom.cmd(self.caret.textNode, 'u', range.startOffset, range.endOffset);
     //self.caret._moveElToOffset();
     }
    */

    // Most text input can be caught on keypress
    window.document.addEventListener('keypress', function(e) {
      var key = e.keyCode || e.which;
      if(key === 8) {
        // done at keydown
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
