'use strict';

var Settings = require('./settings');
var DomUtil = require('./dom_utilities');
var Caret = require('./input/caret');
var CommandFilter = require('./input_filters/command');

// todo
// textarea / contenteditable
// einfache eingaben
// pasting
// backspace und delete
// verhalten bei bestimmten elementen (br löschen oder am löschen wenn man am anfang eines elements ist)


var Type = require('./core');


function TypeInput (type) {
  this._type = type;
  this._el = this._createElement();
  this.caret = new Caret(null, type.options.root);
  this.caret.moveTo(DomUtil.firstTextNode(type.options.root))._blink();
  this._caretStyle = this.caret.caretEl.style;
  this._elStyle = this._el.style;
  this._loadFilters();
  this.catchInput();
}


(function () {

  /**
   *
   * @returns {TypeInput}
   */
  this.onInput = function () {
    this.caret.insertText(this._el.textContent);
    this._el.innerHTML = '';
    return this;
  };

  this.onContextMenu = function () {

    // Wenn das clipboard beim copy befehel direkt veränderbar ist, muss nichts weiter gemacht werden
    // Wenn nicht, aktuelle selektion in das contenteditable ding kopieren

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
    var key, k;
    this._el.addEventListener('keydown', function(e) {

      // Get the readable name for the key
      key  = this._keyNames[e.keyCode];

      // Proxy this to the caret
      if (key in this._caretMethodMap)
        this.caret[this._caretMethodMap[key]]();

      for (k in this._filters) {
        if (key in this._filters[k].keys) this._filters[k][this._filters[k].keys[key]](); // Todo clean up cryptic code
      }

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
   * @returns {TypeInput}
   * @private
   */
  this._bindMouseEvents = function () {
    var range, self = this;
    this._type.options.root.addEventListener('mouseup', function(e) {
      if (window.getSelection().isCollapsed) {
        range = document.caretRangeFromPoint(e.clientX, e.clientY);
        if (range.startContainer.nodeType == 3) {
          self.caret.moveTo(range.startContainer, range.startOffset);
          self.caret._blink();
        }
        window.setTimeout(function() { self._el.focus();}, 0);
      } else {
        self.caret._hide();
      }
    }, false);
    return this;
  };

  /**
   *
   * @returns {TypeInput}
   * @private
   */
  this._loadFilters = function () {
    this._filters = this._filters || {};
    this._filters['command'] = new CommandFilter(this._type, this);
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
   * @type {Object}
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
   * @type {Object}
   * @private
   */
  this._caretMethodMap = {
    arrLeft  : 'moveLeft',
    arrUp    : 'moveUp',
    arrRight : 'moveRight',
    arrDown  : 'moveDown'
  };

}).call(TypeInput.prototype);

module.exports = TypeInput;
