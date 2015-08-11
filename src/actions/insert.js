'use strict';

var Type = require('../core');

/**
 * Creates a new Type action
 * @param {Type} type - A type instance on which the action
 *     should be executed
 * @param {Text} textNode - The text node in which the text
 *     should be inserted
 * @param {Number} offset - The character offset in the text
 *     at which the text should be inserted
 * @param {String} text - The text (containing HTML) that
 *     should be inserted
 * @constructor
 */
Type.Actions.Insert = function (type, offset, text) {
  this._writer = type.getWriter();
  this.add(offset, text);
};
//Type.Actions.Insert = function (type, textNode, offset, text) {
//  this._writer = type.getWriter();
//  this._textNode = textNode;
//  this._offset = offset;
//  this._text = text;
//};

(function () {

  /**
   * Inserts text in the editor
   * @returns {Type.Actions.Type} - This instance
   */
  this.execute = function () {
    this._writer.insertText(this._textNode, this._offset, this._text);
    return this;
  };


  /**
   * Revokes this action
   * @returns {Type.Actions.Type} - This instance
   */
  this.undo = function () {
    return this;
  };

  /**
   *
   * @param {Number} start
   * @param {String} text
   * @returns {*}
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
      if (this._stack[i].start >= start && this._stack[i].end <= end) {
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
   *
   * @param {Number} offset
   * @param {Number} numChars
   * @returns {*}
   */
  this.remove = function (offset, numChars) {
    return this;
  };

}).call(Type.Actions.Insert.prototype);

module.exports = Type.Actions.Insert;
