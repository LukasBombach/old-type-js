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
Type.Actions.Remove = function (type, start, end) {
  this._writer = type.getWriter();
  this._caret = type.getCaret();
  this._root = type.getRoot();
  this.start = start;
  this.end = end;
  this._contents = this._getContents();
};

(function () {

  /**
   * Removes text from the editor
   * @returns {Type.Actions.Remove} - This instance
   */
  this.execute = function () {
    var range = Type.Range.fromPositions(this._root, this.start, this.end);
    this._writer.remove(range);
    this._caret.setOffset(this.start);
    return this;
  };

  /**
   * Inserts the removed text again
   * @returns {Type.Actions.Remove} - This instance
   */
  this.undo = function () {
    var nodeInfo = Type.TextWalker.nodeAt(this._root, this.start);
    this._writer.insertHTML(nodeInfo.node, nodeInfo.offset, this._contents);
    this._caret.setOffset(this.end);
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
    return (that instanceof Type.Actions.Remove) &&
      ((that.end == this.start) || (that.start == this.end));
  };

  /**
   * Merges another remove action with this remove action
   * @param {Type.Actions.Remove|*} that
   * @returns {Type.Actions.Remove} - This instance
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

}).call(Type.Actions.Remove.prototype);


/**
 * Creates a new Type action
 * @param {Type} type - A type instance on which the action
 *     should be executed
 * @param {Type.Range} range - The text range that should
 *     be removed from the contents.
 * @constructor
 */
Type.Actions.Remove.fromRange = function (type, range) {
  var bookmark = range.save(type.getRoot());
  return new Type.Actions.Remove(type, bookmark.start, bookmark.end);
};

module.exports = Type.Actions.Remove;
