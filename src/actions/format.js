'use strict';

var Type = require('../core');

/**
 * Creates a new Type action
 * @param {Type} type - A type instance on which the action
 *     should be executed
 * @param {Number} start - The character offset from which the
 *     text should be removed
 * @param {Number} end - The character offset to which the
 *     text should be removed
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
    //this._caret.setOffset(this.start);
    return this;
  };

  /**
   * Inserts the removed text again
   * @returns {Type.Actions.Format} - This instance
   */
  this.undo = function () {
    //Type.DomUtilities.unwrap()
    var range = Type.Range.fromPositions(this._root, this.start, this.end);
    this._formatter.removeFormat(this.tag, range);
    //this._caret.setOffset(this.end);
    return this;
  };

  /**
   * Returns if a given action can be merged with this
   * action
   * @param {*} that
   * @returns {boolean}
   */
  this.mergeable = function (that) {
    return false; // Deactivated
    return (that instanceof Type.Actions.Format) &&
      ((that.end == this.start) || (that.start == this.end));
  };

  /**
   * Merges another remove action with this remove action
   * @param {Type.Actions.Format|*} that
   * @returns {Type.Actions.Format} - This instance
   */
  this.merge = function (that) {
    this.start = Math.min(this.start, that.start);
    this.end = Math.max(this.end, that.end);
    this._contents = this._getContents();
    return this;
  };

  /**
   * Returns the contents between the text offsets of
   * this action.
   * @private
   */
  this._getContents = function () {
    var range = Type.Range.fromPositions(this._root, this.start, this.end);
    return range.getNativeRange().cloneContents().childNodes;
  };

}).call(Type.Actions.Format.prototype);


/**
 * Creates a new Type action
 * @param {Type} type - A type instance on which the action
 *     should be executed
 * @param {Type.Range} range - The text range that should
 *     be removed from the contents.
 * @constructor
 */
Type.Actions.Format.fromRange = function (type, range) {
  var bookmark = range.save(type.getRoot());
  return new Type.Actions.Format(type, bookmark.start, bookmark.end);
};

module.exports = Type.Actions.Format;
