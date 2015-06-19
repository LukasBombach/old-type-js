

//var TempDomHelper = require('./TempDomHelper');

function BrowserDeviceInput(type, caret) {

  if(arguments.length == 1) {
    caret = element;
    element = window.document;
  }

  // Todo listening to window.document instead of element

  this._type = type;
  var element = type.options.root;

  this.caret = caret;
  //this.dom = new TempDomHelper();

  this.bindKeyboard(element, caret);
  this.bindMouse(element, caret);
  this.bindUi(element, caret);

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

      //console.log(key);

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

    Mousetrap.bind('command+b', function(e) {
      self._type.cmd('strong');
      return false;
    });

    Mousetrap.bind('command+i', function(e) {
      self._type.cmd('em');
      return false;
    });

    Mousetrap.bind('command+u', function(e) {
      self._type.cmd('u');
      return false;
    });

    Mousetrap.bind('command+s', function(e) {
      self._type.cmd('s');
      return false;
    });

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

  /**
   *
   * @param element
   * @param caret
   * @returns {*}
   */
  this.bindUi = function(element, caret) {

    var controls = document.getElementById('controls');

    if(!controls) {
      return this;
    }

    var elements = controls.querySelectorAll('button'),
      self = this,
      cmd;

    for (var i = 0; i < elements.length; i++) {
      elements[i].onclick = function() {
        cmd = this.getAttribute('data-cmd');
        self._type.cmd(cmd);
      }
    }

    return this;
  };

  this._getInfoFromRange = function () {
    var range = window.getSelection().getRangeAt(0);
    return {
      startContainer : range.startContainer,
      startOffset    : range.startOffset,
      endContainer   : range.endContainer,
      endOffset      : range.endOffset
    }
  }


}).call(BrowserDeviceInput.prototype);

module.exports = BrowserDeviceInput;
