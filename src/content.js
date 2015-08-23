'use strict';

var Type = require('./core');

/**
 * Creates a new Content class
 *
 * This class can be used to manipulate the editor's
 * contents and will make sure any action performed
 * is undoable and re-doable.
 *
 * @param {Type} type
 * @constructor
 */
Type.Content = function (type) {
  this._sourceId = this._createUniqueSourceId();
  this._undoManager = type.getUndoManager();
  this._writer = type.getWriter();
  this._formatter = type.getFormatter();
  this._root = type.getRoot();
  this._type = type;
};

(function () {

  /**
   * Inserts text to the editor's contents and pushes an
   * action to the undo manager{}
   *
   * @param {Text|Number} textNode - The text node in which the
   *     contents should be inserted
   * @param {Number|String} offset - The character offset in the
   *     text node at which the contents should be inserted
   * @param {String} [content] - The text that should be
   *     inserted
   * @returns {Type.Content} - This instance
   */
  this.insert = function (textNode, offset, content) {

    // If only an offset and contents were given
    if (arguments.length === 2) {
      var nodeInfo = Type.TextWalker.nodeAt(this._root, textNode);
      content = offset;
      offset = nodeInfo.offset;
      textNode = nodeInfo.node;
    }

    // Change contents
    this._writer.insertText(textNode, offset, content);

    // Undo capabilities
    var absOffset = Type.TextWalker.offset(this._root, textNode, 0, offset);
    var insertion = new Type.Actions.Insert(this._sourceId, this._type, absOffset, content);
    this._undoManager.push(insertion);

    // Chaining
    return this;

  };

  /**
   * Removes the text inside a given range from the contents
   *
   * @param {Type.Range|Number} range - The text range that should
   *     be removed from the contents. This parameter can also be
   *     the start offset
   * @param {Number} numCharacters - If this parameter is set the
   *     first parameter will be interpreted as a number and is the
   *     start offset in the text. This parameter will be the number
   *     of character to be removed beginning from the start offset.
   * @returns {Type.Content} - This instance
   */
  this.remove = function (range, numCharacters) {

    // If only an offset numCharacters were given
    if (arguments.length === 2) {
      range = Type.Range.fromPositions(this._root, range, range + numCharacters);
    }

    // Undo capabilities
    var removal = Type.Actions.Remove.fromRange(this._sourceId, this._type, range);
    this._undoManager.push(removal);

    // Change contents
    this._writer.remove(range);

    // Chaining
    return this;

  };

  /**
   * Formats a given text range
   *
   * @param {String} tag - The HTML tag the text should
   *     be formatted with
   * @param {Type.Range|number} range - The range of text
   *     that should be formatted or a number that will be
   *     the start offset of the formatting
   * @param {number} [end] - If the second parameter that
   *     was given is a start offset, this will be the end
   *     offset in the text that will be formatted.
   * @returns {Type.Content} - This instance
   */
  this.format = function (tag, range, end) {

    // If positions instead of a range were given
    if (arguments.length === 3) {
      range = Type.Range.fromPositions(this._root, range, end);
    }

    // Change contents
    var nodes = this._formatter.format(tag, range);

    // Undo capabilities
    var formatting = new Type.Actions.Format.fromRange(this._sourceId, this._type, range, tag, nodes);
    this._undoManager.push(formatting);

    // Chaining
    return this;

  };

  /**
   * Formats a given text range
   *
   * @param {String} tag - The HTML tag the text should
   *     be formatted with
   * @param {Type.Range|number} range - The range of text
   *     that should be formatted or a number that will be
   *     the start offset of the formatting
   * @param {number} [end] - If the second parameter that
   *     was given is a start offset, this will be the end
   *     offset in the text that will be formatted.
   * @returns {Type.Content} - This instance
   */
  this.removeFormat = function (tag, range, end) {

    // If positions instead of a range were given
    if (arguments.length === 3) {
      range = Type.Range.fromPositions(this._root, range, end);
    }

    // Change contents
    this._formatter.removeFormat(tag, range);

    // Chaining
    return this;

  };

  /**
   * Getter for this content's source id
   * @returns {number}
   */
  this.getSourceId = function () {
    return this._sourceId;
  };

  /**
   * Getter for this instance's root element, i.e. the
   * element that contains this editor's text.
   * @returns {Element}
   */
  this.getRoot = function () {
    return this._root;
  };

  /**
   *
   * @returns {*|number}
   * @private
   */
  this._createUniqueSourceId = function () {
    Type.Content._lastSourceId = Type.Content._lastSourceId || 0;
    Type.Content._lastSourceId += 1;
    return Type.Content._lastSourceId;
  }

}).call(Type.Content.prototype);

module.exports = Type.Content;
