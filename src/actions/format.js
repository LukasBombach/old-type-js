'use strict';

var Type = require('../core');

/**
 * Creates a new Type action
 * @param {*} sourceId - An arbitrary key identifying the author
 *     of this action
 * @param {Type} type - A type instance on which the action
 *     should be executed
 * @param {Number} start - The character offset from which the
 *     text should be formatted
 * @param {Number} end - The character offset to which the
 *     text should be formatted
 * @param {Element[]} nodes - The initial elements that have been
 *     affected by performing this action
 * @param {Number} tag - The tag the text should be formatted
 *     with
 * @param {boolean} [undone] - The state of this action
 * @constructor
 */
Type.Actions.Format = function (sourceId, type, start, end, tag, nodes, undone) {
  this.sourceId = sourceId;
  this.undone = undone || false;
  this._formatter = type.getFormatter();
  this._caret = type.getCaret();
  this._root = type.getRoot();
  this._start = start;
  this._end = end;
  this._tag = tag;
  this._nodes = nodes;
};

/**
 * Inherit from general Type action
 */
Type.OOP.inherits(Type.Actions.Format, Type.Actions.Type);

(function () {

  /**
   * Removes text from the editor
   * @param {Number[][]} shifts
   * @returns {Type.Actions.Format} - This instance
   */
  this.execute = function (shifts) {
    var adjStart = this._getShiftTo(this._start, shifts),
      adjEnd = this._getShiftTo(this._end, shifts),
      range = Type.Range.fromPositions(this._root, this._start+adjStart, this._end+adjEnd);
    this._nodes = this._formatter.format(this._tag, range);
    this.undone = false;
    return this;
  };

  /**
   * Inserts the removed text again
   * @param {Number[][]} shifts
   * @returns {Type.Actions.Format} - This instance
   */
  this.undo = function (shifts) {
    var len = this._nodes.length,
      i;
    for (i = 0; i < len; i += 1) {
      Type.DomUtilities.unwrap(this._nodes[i]);
    }
    this.undone = true;
    return this;

  };

}).call(Type.Actions.Format.prototype);


/**
 * Creates a new Type action
 * @param {*} sourceId - An arbitrary key identifying the author
 *     of this action
 * @param {Type} type - A type instance on which the action
 *     should be executed
 * @param {Type.Range} range - The text range that should be
 *     formatted.
 * @param {Number} tag - The tag the text should be formatted
 *     with
 * @constructor
 */
Type.Actions.Format.fromRange = function (sourceId, type, range, tag, nodes) {
  var bookmark = range.save(type.getRoot());
  return new Type.Actions.Format(sourceId, type, bookmark.start, bookmark.end, tag, nodes);
};

module.exports = Type.Actions.Format;
