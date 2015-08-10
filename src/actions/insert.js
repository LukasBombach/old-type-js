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
Type.Actions.Insert = function (type, textNode, offset, text) {
  this._writer = type.getWriter();
  this._textNode = textNode;
  this._offset = offset;
  this._text = text;
};

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

}).call(Type.Actions.Insert.prototype);

module.exports = Type.Actions.Insert;
