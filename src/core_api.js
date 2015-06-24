'use strict';

var Type = require('./core');
var TypeRange = require('./type_range');

(function () {

  /**
   * Todo this should only process parameters an call plugin methods
   */

  /**
   *
   * @param params
   * @returns {*}
   */
  this.caret = function (params) {

    // type.caret()
    if (!params.length) {
      return this._caret.absoluteOffset(); // todo was ist bei selektion?
    }

    // type.caret('show')
    if (params[0] === 'show') {
      this._caret.show();
      return this;
    }

    // type.caret('hide')
    if (params[0] === 'hide') {
      this._caret.hide();
      return this;
    }

    // type.caret(10)
    if (params.length === 1 && typeof params[0] === "number") {
      this._caret.absoluteOffset(params[0]);
      return this;
    }

    // type.caret(10, 20)
    if (params.length === 2) {
      new TypeRange(this.root, params[0], params[1]).select();
      return this;
    }

  };

  this.selection = function (params) {

    // type.selection() || type.selection('text')
    if (!params.length || (params.length === 1 && params[0] === 'text')) {
      return TypeRange.fromCurrentSelection().text();
    }

    // type.selection('html')
    if (params[0] === 'html') {
      return TypeRange.fromCurrentSelection().html();
    }

    // type.selection(10)
    if (params.length === 1 && typeof params[0] === "number") {
      this._caret.absoluteOffset(params[0]);
      return this;
    }

    // type.selection(10, 20)
    if (params.length === 2) {
      new TypeRange(this.root, params[0], params[1]).select();
      return this;
    }

    // type.selection(element)
    if (DomUtil.isEl(params[0])) {
      new TypeRange(params[0]).select();
      return this;
    }

    // type.selection(element1, element2)
    if (params.length === 2 && DomUtil.isEl(params)) {
      new TypeRange(params[0], params[1]).select();
      return this;
    }

    // type.selection(jQueryCollection) || type.selection([Array])
    if (params[0].jQuery) {
      new TypeRange(params[0], params[1]).select();
      return this;
    }


    // type.selection('save')
    // type.selection('restore', sel)

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
