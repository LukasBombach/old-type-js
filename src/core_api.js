'use strict';

var Type = require('./core');
var TypeRange = require('./type_range');

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
      new TypeRange(this.root, arguments[0], arguments[1]).select();
      return this;
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
      this._caret.absoluteOffset(arguments[0]);
      return this;
    }

    // type.selection(10, 20)
    if (arguments.length === 2 && typeof arguments[0] === "number") {
      new TypeRange(this.root, arguments[0], arguments[1]).select();
      return this;
    }

    // type.selection(element)
    if (DomUtil.isEl(arguments[0])) {
      new TypeRange(arguments[0]).select();
      return this;
    }

    // type.selection(element1, element2)
    if (arguments.length === 2 && DomUtil.isEl(arguments)) {
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

  this.insert = function (params) {

  };

  this.format = function (params) {

  };

  this.remove = function (params) {

  };

  this.settings = function (params) {

  };

}).call(Type.fn);
