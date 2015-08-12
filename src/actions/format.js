'use strict';

var Type = require('../core');

/**
 * Creates a new Type action
 * @param {Type} type - A type instance on which the action
 *     should be executed
 * @param {Number} start - The character offset from which the
 *     text should be formatted
 * @param {Number} end - The character offset to which the
 *     text should be formatted
 * @param {Number} tag - The tag the text should be formatted
 *     with
 * @constructor
 */
Type.Actions.Format = function (type, start, end, tag) {
  this._formatter = type.getFormatter();
  this._caret = type.getCaret();
  this._root = type.getRoot();
  this.start = start;
  this.end = end;
  this.tag = tag;
};

(function () {

  /**
   * Removes text from the editor
   * @returns {Type.Actions.Format} - This instance
   */
  this.execute = function () {
    var range = Type.Range.fromPositions(this._root, this.start, this.end);
    this._formatter.format(this.tag, range);
    return this;
  };

  /**
   * Inserts the removed text again
   * @returns {Type.Actions.Format} - This instance
   */
  this.undo = function () {
    var range = Type.Range.fromPositions(this._root, this.start, this.end);
    this._formatter.removeFormat(this.tag, range);
    return this;
  };

}).call(Type.Actions.Format.prototype);


/**
 * Creates a new Type action
 * @param {Type} type - A type instance on which the action
 *     should be executed
 * @param {Type.Range} range - The text range that should be
 *     formatted.
 * @param {Number} tag - The tag the text should be formatted
 *     with
 * @constructor
 */
Type.Actions.Format.fromRange = function (type, range, tag) {
  var bookmark = range.save(type.getRoot());
  return new Type.Actions.Format(type, bookmark.start, bookmark.end, tag);
};

module.exports = Type.Actions.Format;
