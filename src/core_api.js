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

    if (!params.length) {
      return this._caret.absoluteOffset();
    }

    if (params.length && params[0] === 'show') {
      this._caret.show();
      return this;
    }

    if (params.length && params[0] === 'hide') {
      this._caret.hide();
      return this;
    }

    if (params.length === 1 && typeof params[0] === "number") {
      this._caret.absoluteOffset(params[0]);
      return this;
    }

    if (params.length === 2) {
      new TypeRange(this.root, params[0], params[1]).select();
      return this;
    }

  };

  this.selection = function (params) {

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
