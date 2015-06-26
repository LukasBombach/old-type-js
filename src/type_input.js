'use strict';

var Type = require('./core');
var Settings = require('./settings');
var DomUtil = require('./dom_utilities');
var Caret = require('./input/caret');
var CommandFilter = require('./input_filters/command');

/**
 * todo textarea / contenteditable
 * todo einfache eingaben
 * todo pasting
 * todo backspace und delete
 * todo verhalten bei bestimmten elementen (br löschen oder am löschen wenn man am anfang eines elements ist)
 *
 * @param {Type} type
 * @constructor
 */
function TypeInput(type) {

  this._type = type;
  this._contents = type.getContents();

  this._el = this._createElement();

  this._elStyle = this._el.style;
  this._caretStyle = type.getCaret().caretEl.style;

  this._loadFilters();
  this._bindEvents();
}

(function () {

  /**
   *
   * @returns {TypeInput}
   * @private
   */
  this._loadFilters = function () {
    this._filters = this._filters || {};
    this._filters.command = new CommandFilter(this._type, this);
    return this;
  };

  /**
   * Binds events on type's root element to catch keyboard
   * and mouse input.
   *
   * @returns {TypeInput}
   * @private
   */
  this._bindEvents = function () {
    this._bindKeyDownEvents();
    this._bindInputEvents();
    this._bindMouseEvents();
    return this;
  };

  /**
   * todo trigger events
   * @returns {TypeInput}
   */
  this._onInput = function () {
    this._contents.insertText(this._el.textContent);
    this._el.innerHTML = '';
    return this;
  };

  /**
   * todo Wenn das clipboard beim copy befehel direkt veränderbar ist, muss nichts weiter gemacht werden
   * todo Wenn nicht, aktuelle selektion in das contenteditable ding kopieren
   * todo trigger events
   */
  this._onContextMenu = function () {
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
      if (key in this._caretMethodMap) {
        this.caret[this._caretMethodMap[key]]();
      }

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
    this._el.addEventListener('input', function() { this.onInput(); }.bind(this), false);
    return this;
  };

  /**
   *
   * @returns {TypeInput}
   * @private
   */
  this._bindMouseEvents = function () {
    this._type.getRoot().addEventListener('mouseup', function(e) {
      if (window.getSelection().isCollapsed) {
        this._moveCaretToMousePosition(e.clientX, e.clientY);
        this._focusInput()
      } else {
        this.caret._hide();
      }
    }.bind(this), false);
    return this;
  };

  /**
   *
   * @param x
   * @param y
   * @returns {*}
   * @private
   */
  this._moveCaretToMousePosition = function(x, y) {
    var range = document.caretRangeFromPoint(x, y);
    if (range.startContainer.nodeType == 3) {
      this.caret.moveTo(range.startContainer, range.startOffset);
      this.caret._blink();
    }
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

  this._focusInput = function (sync) {
    if (sync) {
      this._el.focus();
    } else {
      window.setTimeout(function() { this._el.focus();}.bind(this), 0);
    }
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
