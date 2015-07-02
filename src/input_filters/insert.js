'use strict';

var TypeRange = require('../type_range');


/**
 *
 * @param {Type} type
 * @param {TypeInput} input
 * @constructor
 */
function InsertFilter(type, input) {
  this._contents = type.getContents();
  this._caret = type.getCaret();
  this._selection = type.getSelection();
}

(function () {

  this.keys = {
    all : 'insert'
  };

  /**
   *
   * @param {TypeInputEvent} e
   */
  this.insert = function (e) {

  };

}).call(InsertFilter.prototype);

module.exports = InsertFilter;
