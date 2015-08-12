'use strict';

var Type = require('../core');

/**
 * Creates a new Type action
 * @param {Type} type - A type instance on which the action
 *     should be executed
 * @param {Number} offset - The character offset at which the
 *     text should be inserted
 * @param {String} text - The text (containing HTML) that
 *     should be inserted
 * @constructor
 */
Type.Actions.Insert = function (type, offset, text) {
  this._writer = type.getWriter();
  this._caret = type.getCaret();
  this._root = type.getRoot();
  this.add(offset, text);
};

(function () {

  /**
   * Inserts text in the editor
   * @returns {Type.Actions.Insert} - This instance
   */
  this.execute = function () {
    var len = this._stack.length,
      nodeInfo,
      i;
    for (i = 0; i < len; i += 1) {
      nodeInfo = Type.TextWalker.nodeAt(this._root, this._stack[i].start);
      this._writer.insertText(nodeInfo.node, nodeInfo.offset, this._stack[i].text);
    }
    this._caret.setOffset(this._stack[len-1].end);
    return this;
  };


  /**
   * Revokes this action
   * @returns {Type.Actions.Insert} - This instance
   */
  this.undo = function () {
    var len = this._stack.length,
      i;
    for (i = len - 1; i >= 0; i -= 1) {
      this._writer.remove(Type.Range.fromPositions(this._root, this._stack[i].start, this._stack[i].end));
    }
    this._caret.setOffset(this._stack[0].start);
    return this;
  };


  /**
   * Returns if a given action can be merged with this
   * action
   * @param {*} that
   * @returns {boolean}
   */
  this.mergeable = function (that) {
    return that instanceof Type.Actions.Insert;
  };

  /**
   * Merges a given action with this action
   * @param {Type.Actions.Insert|*} that
   * @returns {Type.Actions.Insert} - This instance
   */
  this.merge = function (that) {

    var stack = that.getStack(),
      length = stack.length,
      i;

    for (i = 0; i < length; i += 1) {
      this.add(stack[i].start, stack[i].text);
    }

    return this;

  };

  /**
   *
   * @param {Number} start
   * @param {String} text
   * @returns {Type.Actions.Insert} - This instance
   */
  this.add = function (start, text) {

    // Required vars
    var length = text.length,
      end = start + length,
      stackText,
      insertPosition,
      i;

    // Create stack if not exists
    this._stack = this._stack || [];

    // Add to stack if stack is empty
    if (this._stack.length === 0) {
      this._stack.push({start:start, end:end, text:text});
      return this;
    }

    // Iterate over stack and insert maintaining order
    for (i = 0; i < this._stack.length; i++) {

      // Insert at beginning
      if (this._stack[i].start > end) {
        this._stack.splice(i, 0, {start:start, end:end, text:text});
        break;
      }

      // Add to insertion if it overlaps with another instertion
      if (start >= this._stack[i].start && start <= this._stack[i].end) {
        stackText = this._stack[i].text;
        insertPosition = start - this._stack[i].start;
        this._stack[i].text = stackText.substr(0, insertPosition) + text + stackText.substr(insertPosition);
        this._stack[i].end += length;
        break;
      }

      // Add to end
      if (i+1 >= this._stack.length) {
        this._stack.push({start:start, end:end, text:text});
        break;
      }

      // Insert between other insertions
      if (this._stack[i].end < start && (this._stack[i+1].start < end)) {
        this._stack.splice(i, 0, {start:start, end:end, text:text});
        break;
      }

    }

    // Chaining
    return this;
  };

  /**
   * Getter for this instance's stack
   * @returns {Array}
   */
  this.getStack = function () {
    return this._stack || [];
  }

}).call(Type.Actions.Insert.prototype);

module.exports = Type.Actions.Insert;
