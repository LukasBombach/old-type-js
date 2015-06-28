'use strict';

var TypeRange = require('./type_range');

function TypeSelection() {
  this._range = null;
  this._overlays = [];
}

(function () {

  /**
   * Selects the text encapsulated by the give Range
   *
   * @param {TypeRange} range
   * @returns {TypeSelection}
   */
  this.select = function (range) {
    //this.unselect();
    this._drawSlection(range);
    this._range = range;
    return this;
  };

  /**
   *
   * @returns {TypeSelection}
   */
  this.unselect = function () {
    this._range = null;
    return this;
  };

  /**
   * Returns the {TypeRange} that the selection spans over
   *
   * @returns {TypeRange|null}
   */
  this.getRange = function () {
    return this._range;
  };

  /**
   * Returns whether or not there is currently a selection
   *
   * @returns {boolean}
   */
  this.exists = function () {
    return this._range === null;
  };

  /**
   *
   * @param {TypeRange} range
   * @returns {TypeSelection}
   * @private
   */
  this._drawSlection = function (range) {

    return this;
  };

  /**
   *
   * @param {Range} range
   * @returns {Object}
   * @private
   */
  this._rectsFromRange = function (range) {

    var rangeRects = range.getClientRects();

    return {};
  };

}).call(TypeSelection.prototype);



module.exports = TypeSelection;
