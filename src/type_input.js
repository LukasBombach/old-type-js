'use strict';

var Settings = require('./settings');
var DomUtil = require('./dom_utilities');
var Caret = require('./input/caret');

// todo
// textarea / contenteditable
// einfache eingaben
// pasting
// backspace und delete
// verhalten bei bestimmten elementen (br löschen oder am löschen wenn man am anfang eines elements ist)


'use strict';

var Type = require('./core');


function TypeInput (type) {
  this._type = type;
  this._el = this._createElement();
  this._caret = new Caret(null, type.options.root);
  this._caret.moveTo(DomUtil.firstTextNode(type.options.root))._blink();
  this._caretStyle = this._caret.caretEl.style;
  this._elStyle = this._el.style;
  this.catchInput();
}


(function () {

  /**
   *
   * @returns {TypeInput}
   */
  this.onInput = function () {
    this._caret.insertText(this._el.textContent);
    this._el.innerHTML = '';
    return this;
  };

  /**
   *
   * @returns {TypeInput}
   */
  this.catchInput = function () {
    this._bindKeyDownEvents();
    this._bindInputEvents();
    this._bindMouseEvents();
    return this;
  };

  /**
   * Some inputs needs to be interrupted and caught before it gets inserted
   * to the input element. This includes return keys for example
   *
   * Todo keyCode : https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent/keyCode
   * Todo keyCode : http://stackoverflow.com/questions/1444477/keycode-and-charcode
   *
   * @returns {TypeInput}
   * @private
   */
  this._bindKeyDownEvents = function () {
    var key;
    this._el.addEventListener('keydown', function(e) {
      key = this._keyNames[e.keyCode];
      this._caret[this._caretMethodMap[key]]();
    }.bind(this), false);
    return this;
  };

  /**
   * Todo x-browser http://stackoverflow.com/a/8694125/1183252
   * Todo x-browser http://jsfiddle.net/MBags/ (?)
   *
   * @returns {TypeInput}
   * @private
   */
  this._bindInputEvents = function () {
    var self = this;
    this._el.addEventListener('input', function() { self.onInput(); }, false);
    return this;
  };

  /**
   *
   * @returns {*}
   * @private
   */
  this._bindMouseEvents = function () {
    var range, self = this;
    this._type.options.root.addEventListener('mouseup', function(e) {
      if (window.getSelection().isCollapsed) {
        range = document.caretRangeFromPoint(e.clientX, e.clientY);
        if (range.startContainer.nodeType == 3) {
          self._caret.moveTo(range.startContainer, range.startOffset);
        }
        window.setTimeout(function() { self._el.focus();}, 0);
      } else {
        self._caret._hide();
      }
    }, false);
    return this;
  };

  /**
   * The input element should be moved with the visible caret because the
   * page scrolls to the input element when the user enters something.
   *
   * @returns {TypeInput}
   * @private
   */
  this._moveElToCaret = function () {
    this._elStyle.left = this._caretStyle.left;
    this._elStyle.top  = this._caretStyle.top;
    return this;
  };

  /**
   *
   * @returns {Element}
   * @private
   */
  this._createElement = function () {
    var div = document.createElement('div');
    div.setAttribute('contenteditable', 'true');
    div.className = Settings.prefix + 'input';
    DomUtil.elementsContainer().appendChild(div);
    return div;
  };

  /**
   * Maps character codes to readable names
   *
   * @private
   */
  this._keyNames = {
    8  : 'backSpace',
    37 : 'arrLeft',
    38 : 'arrUp',
    39 : 'arrRight',
    40 : 'arrDown'
  };

  /**
   * Maps character names to caret methods for keyDown events
   *
   * @private
   */
  this._caretMethodMap = {
    backSpace: 'removeCharacter',
    arrLeft  : 'moveLeft',
    arrUp    : 'moveUp',
    arrRight : 'moveRight',
    arrDown  : 'moveDown'
  }

}).call(TypeInput.prototype);

module.exports = TypeInput;
