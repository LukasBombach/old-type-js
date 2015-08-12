'use strict';

var Type = require('./core');

/**
 *
 * @param {Type} type
 * @constructor
 */
Type.Content = function (type) {
  this._undoManager = type.getUndoManager();
  this._writer = type.getWriter();
  this._formatter = type.getFormatter();
  this._root = type.getRoot();
  this._type = type;
  //this._bindEvents(type);
};

(function () {

  /**
   * Inserts text to the editor's contents and pushes an
   * action to the undo manager{}
   *
   * @param {Text} textNode - The text node in which the
   *     contents should be inserted
   * @param {Number} offset - The character offset in the
   *     text node at which the contents should be inserted
   * @param {String} content - The text that should be
   *     inserted
   * @returns {Type.Content} - This instance
   */
  this.insert = function (textNode, offset, content) {

    // Change contents
    this._writer.insertText(textNode, offset, content);

    // Undo capabilities
    var absOffset = Type.TextWalker.offset(this._root, textNode, 0, offset);
    var insertion = new Type.Actions.Insert(this._type, absOffset, content);
    this._undoManager.push(insertion);

    // Chaining
    return this;

  };

  /**
   * Removes the text inside a given range from the contents
   *
   * @param {Type.Range} range - The text range that should
   *     be removed from the contents.
   * @returns {Type.Content} - This instance
   */
  this.remove = function (range) {

    // Undo capabilities
    var removal = Type.Actions.Remove.fromRange(this._type, range);
    this._undoManager.push(removal);

    // Change contents
    this._writer.remove(range);

    // Chaining
    return this;

  };

  this.format = function (tag, range) {

    var formatting = new Type.Actions.Format.fromRange (this._type, range, tag);
    this._undoManager.push(formatting);

    this._formatter.format(tag, range);



  };

  //this._bindEvents = function (type) {
  //  type.on('input')
  //};

  /**
   *
   * @param {Type.Actions.Type} action
   * @returns {*}
   */
  this.execute = function (action) {
    this._undoManager.push(action);
    action.execute();
    return this;
  };

}).call(Type.Content.prototype);

module.exports = Type.Content;
