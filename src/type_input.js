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
  this.catchInput();
}


(function () {


  /**
   *
   * @returns {TypeInput}
   */
  this.onInput = function () {
    this._caret.insertText(this._el.innerHTML);
    this._el.innerHTML = '';
    return this;
  };

  /**
   *
   * @returns {TypeInput}
   */
  this.catchInput = function () {
    this._catchKeyDownEvents();
    this._catchInputEvents();
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
  this._catchKeyDownEvents = function () {
    var key;
    this._el.addEventListener('keydown', function(e) {
      key = this._keyNames[e.keyCode];
      this._caret[this._caretMethodMap[key]]();
    }.bind(this), false);
    return this;
  };

  /**
   *
   * @returns {TypeInput}
   * @private
   */
  this._catchInputEvents = function () {
    var self = this;
    this._el.addEventListener('input', function() { self.onInput(); }, false);
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
