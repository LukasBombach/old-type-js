'use strict';

var Type = require('./core');
//var TypeRange = require('./type_range');

(function () {

  /**
   *
   * @param params
   * @returns {*}
   */
  this.caret = function (params) {

    // type.caret() todo was ist bei selektion?
    if (!arguments.length) {
      return this._caret.absoluteOffset();
    }

    // type.caret('show')
    if (arguments[0] === 'show') {
      this._caret.show();
      return this;
    }

    // type.caret('hide')
    if (arguments[0] === 'hide') {
      this._caret.hide();
      return this;
    }

    // type.caret(10)
    if (arguments.length === 1 && typeof arguments[0] === "number") {
      this._caret.absoluteOffset(arguments[0]);
      return this;
    }

    // type.caret(10, 20)
    if (arguments.length === 2) {
      return this.selection(arguments[0], arguments[1]);
    }

    return this;

  };

  /**
   *
   * @param params
   * @returns {*}
   */
  this.selection = function (params) {

    // type.selection() || type.selection('text')
    if (!arguments.length || arguments[0] === 'text') {
      return TypeRange.fromCurrentSelection().text();
    }

    // type.selection('html')
    if (arguments[0] === 'html') {
      return TypeRange.fromCurrentSelection().html();
    }

    // type.selection(10)
    if (arguments.length === 1 && typeof arguments[0] === "number") {
      return this.caret(arguments[0]);
    }

    // type.selection(10, 20)
    if (arguments.length === 2 && typeof arguments[0] === "number") {
      new TypeRange(this.root, arguments[0], arguments[1]).select();
      return this;
    }

    // type.selection(element)
    if (DomUtil.isNode(arguments[0])) {
      new TypeRange(arguments[0]).select();
      return this;
    }

    // type.selection(element1, element2)
    if (arguments.length === 2 && DomUtil.isNode(arguments)) {
      new TypeRange(arguments[0], arguments[1]).select();
      return this;
    }

    // type.selection(jQueryCollection) || type.selection([Array])
    if (arguments[0].jQuery) {
      new TypeRange(arguments[0], arguments[1]).select();
      return this;
    }

    // type.selection('save')
    if (arguments[0] === 'save') {
      return TypeRange.fromCurrentSelection().save();
    }

    // type.selection('restore', sel)
    if (arguments[0] === 'restore') {
      return TypeRange.fromCurrentSelection().restore(arguments[1]);
    }

    return this;

  };

  /**
   *
   * @param params
   * @returns {*}
   */
  this.insert = function (params) {

    // type.insert(str)
    if (arguments.length === 1) {
      this.input.insertText(arguments[0]);
      return this;
    }

    // type.insert('html', str)
    if (arguments.length === 2 && arguments[0] === 'html') {
      this.input.insertHTML(arguments[1]);
      return this;
    }

    // type.insert(str, 10)
    if (arguments.length === 2 && typeof arguments[1] === 'number') {
      this.input.insertText(arguments[0], arguments[1]);
      return this;
    }

    // type.insert('html', str, 10)
    if (arguments.length === 3 && arguments[0] === 'html') {
      this.input.insertHTML(arguments[1], arguments[2]);
      return this;
    }

    return this;

  };

  /**
   *
   * @param params
   * @returns {*}
   */
  this.replace = function (params) {
    return this;
  };

  /**
   *
   * @param params
   * @returns {*}
   */
  this.format = function (params) {
    return this;
  };

  /**
   *
   * @param params
   * @returns {*}
   */
  this.remove = function (params) {
    return this;
  };

  /**
   *
   * @param steps
   * @returns {*}
   */
  this.undo = function (steps) {
    return this;
  };

  /**
   *
   * @param steps
   * @returns {*}
   */
  this.redo = function (steps) {
    return this;
  };

  /**
   *
   * @param params
   * @returns {*}
   */
  this.settings = function (params) {
    return this;
  };

}).call(Type.fn);
