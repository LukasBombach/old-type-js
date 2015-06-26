'use strict';

var Type = require('./core');
var Settings = require('./settings');
var DomUtil = require('./dom_utilities');

var CaretFilter = require('./input_filters/caret');
var RemoveFilter = require('./input_filters/remove');

/**
 * todo textarea / contenteditable
 * todo einfache eingaben
 * todo pasting
 * todo backspace und delete
 * todo verhalten bei bestimmten elementen (br löschen oder am löschen wenn man am anfang eines elements ist)
 * todo trigger events
 *
 * @param {Type} type
 * @constructor
 */
function TypeInput(type) {

  this._type = type;
  this._contents = type.getContents();
  this._caret = type.getCaret();

  this._el = this._createElement();

  this._isMac = type.getEnv().mac;

  this._elStyle = this._el.style;
  this._caretStyle = this._caret.caretEl.style;

  this._loadFilters();
  this._bindEvents();
}

/**
 * Maps character codes to readable names
 *
 * @type {Object}
 */
TypeInput.keyNames = {
  8  : 'backspace',
  37 : 'left',
  38 : 'up',
  39 : 'right',
  40 : 'down'
};

(function () {

  /**
   *
   * @returns {TypeInput}
   * @private
   */
  this._loadFilters = function () {
    this._filters = this._filters || {};
    this._filters.caret = new CaretFilter(this._type, this);
    //this._filters.remove = new RemoveFilter(this._type, this);
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
   * Some inputs needs to be interrupted and caught before it gets inserted
   * to the input element. This includes return keys for example
   *
   * Todo keyCode : https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent/keyCode
   * Todo keyCode : http://stackoverflow.com/questions/1444477/keycode-and-charcode
   * Todo inputEvent Vielleicht wirklich als Klasse, allein schon wegen abgabe
   *
   * @returns {TypeInput}
   * @private
   */
  this._bindKeyDownEvents = function () {

    var filters = this._filters;

    this._el.addEventListener('keydown', function (e) {

      var key, func, name, inputEvent;

      key = TypeInput.keyNames[e.keyCode] || e.keyCode;

      inputEvent = {
        key    : key,
        shift  : e.shiftKey,
        alt    : e.altKey,
        ctrl   : e.ctrlKey,
        meta   : e.metaKey,
        cmd    : (!this._isMac && e.ctrlKey) || (this._isMac && e.metaKey),
        cancel : false
      };

      for (name in filters) {
        if (filters.hasOwnProperty(name) && (func = filters[name].keys[key])) {
          filters[name][func](inputEvent);
          if (inputEvent.cancel) {
            e.preventDefault(); // todo event still bubbles
            break;
          }
        }
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
    this._el.addEventListener('input', function(e) { this._onInput(e); }.bind(this), false);
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
        this._caret._hide();
      }
    }.bind(this), false);
    return this;
  };

  /**
   *
   * @param {InputEvent} e
   * @returns {TypeInput}
   * @private
   */
  this._onInput = function (e) {
    this._contents.insertText(this._caret.textNode, this._caret.offset, this._el.textContent);
    this._el.innerHTML = '';
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
    if (range.startContainer.nodeType === 3) {
      this._caret.moveTo(range.startContainer, range.startOffset);
      this._caret._blink();
    }
    return this;
  };

  /**
   *
   * @param sync
   * @returns {*}
   * @private
   */
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

}).call(TypeInput.prototype);

module.exports = TypeInput;
