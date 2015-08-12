'use strict';

var Type = require('./core');

/**
 * todo pasting
 * todo trigger events
 *
 * @param {Type} type
 * @constructor
 */
Type.Input = function (type) {

  this._type = type;
  this._content = type.getContent();
  this._writer = type.getWriter();
  this._caret = type.getCaret();
  this._selection = this._type.getSelection();

  this._el = this._createElement();

  this._elStyle = this._el.style;
  this._caretStyle = this._caret.caretEl.style;

  this._loadFilters();
  this._bindEvents();

};

(function () {

  /**
   *
   * @returns {Type.Input}
   * @private
   */
  this._loadFilters = function () {
    this._filters = this._filters || {};
    this._filters.undo = new Type.Input.Filter.Undo(this._type, this);
    this._filters.cmd = new Type.Input.Filter.Command(this._type, this);
    this._filters.caret = new Type.Input.Filter.Caret(this._type, this);
    this._filters.remove = new Type.Input.Filter.Remove(this._type, this);
    this._filters.lineBreaks = new Type.Input.Filter.LineBreaks(this._type, this);
    return this;
  };

  /**
   * Binds events on type's root element to catch keyboard
   * and mouse input.
   *
   * @returns {Type.Input}
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
   * @returns {Type.Input}
   * @private
   */
  this._bindKeyDownEvents = function () {

    this._el.addEventListener('keydown', function (e) {
      this._processFilterPipeline(e);
    }.bind(this), false);

    return this;
  };

  /**
   * Todo x-browser http://stackoverflow.com/a/8694125/1183252
   * Todo x-browser http://jsfiddle.net/MBags/ (?)
   *
   * @returns {Type.Input}
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
   * @returns {Type.Input}
   * @private
   */
  this._bindMouseEvents = function () {

    var self = this;

    function dragSelection(e) {
      self._selection.moveTo(e.clientX, e.clientY);
    }

    function stopDraggingSelection() {
      document.removeEventListener('mousemove', dragSelection, false);
      document.removeEventListener('mouseup', stopDraggingSelection, false);
    }

    function startDraggingSelection(e) {
      e.preventDefault();
      self._caret._hide();
      self._selection.beginAt(e.clientX, e.clientY);
      document.addEventListener('mousemove', dragSelection, false);
      document.addEventListener('mouseup', stopDraggingSelection, false);
    }

    function caret(e) {
      if (self._selection.collapsed()) {
        self._moveCaretToMousePosition(e.clientX, e.clientY);
        self._caret._blink();
      }
      self._focusInput();
    }

    function selectWord(e) {
      self._selection.selectWordAt(e.clientX, e.clientY);
    }

    this._type.getRoot().addEventListener('mousedown', startDraggingSelection, false);
    this._type.getRoot().addEventListener('mouseup', caret, false);
    this._type.getRoot().addEventListener('dblclick', selectWord, false);

    return this;

  };

  /**
   * Takes a {KeyboardEvent} and creates a {Type.Events.Input}. Then
   * iterates over all registered input filters in the pipeline and
   * has them process it in order. Will stop processing the event
   * when any handler of an input filter cancels the event. Returns
   * the resulting {Type.Events.Input}
   *
   * @param {KeyboardEvent} e
   * @returns {Type.Events.Input}
   * @private
   */
  this._processFilterPipeline = function (e) {

    var inputEvent = Type.Events.Input.fromKeyDown(e),
      name;

    for (name in this._filters) {
      if (this._filters.hasOwnProperty(name)) {
        this._processFilter(this._filters[name], inputEvent);
        if (inputEvent.canceled) {
          e.preventDefault();
          break;
        }
      }
    }

    return inputEvent;

  };

  /**
   *
   * @param filter
   * @param {Type.Events.Input} e
   * @private
   */
  this._processFilter = function (filter, e) {
    var func = filter.keys[e.key];
    if (func) {
      filter[func](e);
    }
    if (!e.canceled && filter.keys.all) {
      filter[filter.keys.all](e)
    }
    return e;
  };

  /**
   *
   * @returns {Type.Input}
   * @private
   */
  this._onInput = function () {

    //this._writer.insertText(this._caret.textNode, this._caret.offset, this._el.textContent);

    //var insertion = new Type.Actions.Insert(this._type, this._caret.textNode, this._caret.offset, this._el.textContent);
    //this._content.execute(insertion);

    this._content.insert(this._caret.textNode, this._caret.offset, this._el.textContent);

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
    var range = Type.Range.fromPoint(x, y);
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
    div.className = Type.Settings.prefix + 'input';
    Type.DomUtilities.getElementsContainer().appendChild(div);
    return div;
  };

}).call(Type.Input.prototype);

Type.Input.Filter = {};

module.exports = Type.Input;
