'use strict';

var TypeSelectionOverlay = require('./type_selection_overlay');

/**
 *
 * @param {Type} type
 * @constructor
 */
function TypeSelection(type) {
  this._root = type.getRoot();
  this._rootRect = this._root.getBoundingClientRect();
  this._overlays = [];
  this._startNode = null;
  this._startOffset = null;
}

(function () {

  /**
   *
   * @param {number} x - Absolute horizontal position on the document
   * @param {number} y - Absolute vertical position on the document
   * @returns {TypeSelection} - This instance
   */
  this.beginNewAtPos = function (x, y) {
    var range =  document.caretRangeFromPoint(x, y);
    return this.beginNewAt(range.startContainer, range.startOffset);
  };

  /**
   *
   * @param {Node} node - The text node that the selection should start in
   * @param {number} offset - The offset in the text node that the selection should start in
   * @returns {TypeSelection} - This instance
   */
  this.beginNewAt = function (node, offset) {
    this.unselect();
    return this;
  };

  /**
   *
   * @param {number} x - Absolute horizontal position on the document
   * @param {number} y - Absolute vertical position on the document
   * @returns {TypeSelection} - This instance
   */
  this.moveEndToPos = function (x, y) {
    return this;
  };

  /**
   *
   * @param {Node} node - The text node that the selection should end in
   * @param {number} offset - The offset in the text node that the selection should end in
   * @returns {TypeSelection} - This instance
   */
  this.moveEndTo = function (node, offset) {
    return this;
  };


  /**
   * Removes all selection overlays and resets internal variables
   *
   * @returns {TypeSelection} - This instance
   */
  this.unselect = function () {
    var i;
    for (i = 0; i < this._overlays.length; i += 1) {
      this._overlays[i].remove();
    }
    this._overlays = [];
    this._startNode = null;
    this._startOffset = null;
    return this;
  };

  /**
   * Returns whether or not this selection is visible
   *
   * @returns {boolean}
   */
  this.exists = function () {
    return !!this._overlays.length && this._overlays[0].visible();
  };

}).call(TypeSelection.prototype);

module.exports = TypeSelection;
