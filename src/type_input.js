'use strict';

var Type = require('./core');
var Settings = require('./settings');
var DomUtil = require('./dom_utilities');

var TypeInputEvent = require('./events/input');

var CaretFilter = require('./input_filters/caret');
var RemoveFilter = require('./input_filters/remove');

/**
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
  this._selection = this._type.getSelection();

  this._el = this._createElement();

  this._elStyle = this._el.style;
  this._caretStyle = this._caret.caretEl.style;

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
    this._filters.caret = new CaretFilter(this._type, this);
    this._filters.remove = new RemoveFilter(this._type, this);
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
   * @returns {TypeInput}
   * @private
   */
  this._bindKeyDownEvents = function () {

    this._el.addEventListener('keydown', function (e) {
      this._processFilters(e);
    }.bind(this), false);

    // TODO REMOVE DEV HACK
    document.body.addEventListener('keydown', function (e) {
      this._processFilters(e);
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
    this._el.addEventListener('input', function () {
      this._onInput();
    }.bind(this), false);
    return this;
  };

  /**
   * Todo Legacy Internet Explorer and attachEvent https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/addEventListener
   *
   * @returns {TypeInput}
   * @private
   */
  this._bindMouseEvents = function () {

    var self = this;

    function dragSelection(e) {
      self._selection.moveEndToPos(e.clientX, e.clientY);
    }

    function stopDraggingSelection() {
      document.removeEventListener('mousemove', dragSelection, false);
      document.removeEventListener('mouseup', stopDraggingSelection, false);
    }

    function startDraggingSelection(e) {
      self._selection.beginNewAtPos(e.clientX, e.clientY);
      document.addEventListener('mousemove', dragSelection, false);
      document.addEventListener('mouseup', stopDraggingSelection, false);
    }

    function caret(e) {
      if (self._selection.exists()) {
        self._caret._hide();
      } else {
        self._moveCaretToMousePosition(e.clientX, e.clientY);
        self._focusInput();
      }
    }

    this._type.getRoot().addEventListener('mousedown', startDraggingSelection, false);
    this._type.getRoot().addEventListener('mouseup', caret, false);

    return this;

  };



  /**
   * Takes a {KeyboardEvent} and passes it to all registered
   * filters. Returns the resulting {TypeInputEvent}
   *
   * @param {KeyboardEvent} e
   * @returns {TypeInputEvent}
   * @private
   */
  this._processFilters = function (e) {

    var inputEvent, key, filters, name, func;

    inputEvent = TypeInputEvent.fromKeyDown(e);
    filters = this._filters;
    key = inputEvent.key;

    for (name in filters) {
      if (filters.hasOwnProperty(name) && (func = filters[name].keys[key])) {
        if (filters[name][func](inputEvent) === false || inputEvent.cancel) {
          e.preventDefault();
          break;
        }
      }
    }

    return inputEvent;

  };

  /**
   *
   * @returns {TypeInput}
   * @private
   */
  this._onInput = function () {
    this._contents.insertText(this._caret.textNode, this._caret.offset, this._el.textContent);
    this._caret._setOffset(this._caret.offset + this._el.textContent.length); // todo better api
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
   * Todo generalise and formalise and normalise adding elements to the domUtil.elementsContainer
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
