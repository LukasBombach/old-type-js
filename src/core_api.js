'use strict';

var Type = require('./core');

(function () {

  /**
   * Returns the offset of the caret
   * type.caret()
   *
   * Show the caret
   * type.caret('show')
   *
   * Hides the caret
   * type.caret('hide')
   *
   * Moves the caret to the 10th character
   * type.caret(10)
   *
   * Convenience function for type.select(10, 20)
   * type.caret(10, 20)
   *
   * @param {...*} params - Various parameters are possible.
   *     See examples in the block comment.
   * @returns {Type} - The editor instance
   */
  this.caret = function (params) {

    // type.caret() todo was ist bei selektion?
    if (!arguments.length) {
      return this._caret.getOffset();
    }

    // type.caret('show')
    if (arguments[0] === 'show') {
      this._caret.show();
      return this;
    }

    // type.caret('hide')
    if (arguments[0] === 'hide') {
      this._caret.hide();
      return this;
    }

    // type.caret(10)
    if (arguments.length === 1 && typeof arguments[0] === "number") {
      this._caret.setOffset(arguments[0]);
      return this;
    }

    // type.caret(10, 20)
    if (arguments.length === 2) {
      return this.selection(arguments[0], arguments[1]);
    }

    return this;

  };

  /**
   * Same as type.selection('text')
   * type.selection()
   *
   * Returns the unformatted (plain) contents of the current selection
   * type.selection('text')
   *
   * Return the currently selected HTML
   * type.selection('html')
   *
   * Convenience function for type.caret(10)
   * type.selection(10)
   *
   * Selects characters 10 to 20
   * type.selection(10, 20)
   *
   * Select an element
   * type.selection(element)
   *
   * Creates a selection between 2 elements
   * type.selection(element1, element2)
   *
   * Creates a selection between the first and last element in the jQuery Collection
   * type.selection(jQueryCollection)
   *
   * Returns an object that can be passed to type.selection('restore') to store and recreate a selection
   * type.selection('save')
   *
   * Takes an object returned by type.selection('save') as a second argument to recreate a stored selection
   * type.selection('restore', sel)
   *
   * @param {...*} params - Various parameters are possible.
   *     See examples in the block comment.
   * @returns {Type} - The editor instance
   */
  this.selection = function (params) {

    // type.selection() || type.selection('text')
    if (!arguments.length || arguments[0] === 'text') {
      return Type.Range.fromCurrentSelection().text();
    }

    // type.selection('html')
    if (arguments[0] === 'html') {
      return Type.Range.fromCurrentSelection().html();
    }

    // type.selection(10)
    if (arguments.length === 1 && typeof arguments[0] === "number") {
      return this.caret(arguments[0]);
    }

    // type.selection(10, 20)
    if (arguments.length === 2 && typeof arguments[0] === "number") {
      new Type.Range(this.root, arguments[0], arguments[1]).select();
      return this;
    }

    // type.selection(element)
    if (DomUtil.isNode(arguments[0])) {
      new Type.Range(arguments[0]).select();
      return this;
    }

    // type.selection(element1, element2)
    if (arguments.length === 2 && DomUtil.isNode(arguments)) {
      new Type.Range(arguments[0], arguments[1]).select();
      return this;
    }

    // type.selection(jQueryCollection) || type.selection([Array])
    if (arguments[0].jQuery) {
      new Type.Range(arguments[0], arguments[1]).select();
      return this;
    }

    // type.selection('save')
    if (arguments[0] === 'save') {
      return Type.Range.fromCurrentSelection().save();
    }

    // type.selection('restore', sel)
    if (arguments[0] === 'restore') {
      return Type.Range.fromCurrentSelection().restore(arguments[1]);
    }

    return this;

  };

  /**
   * Inserts plain text at the caret's position, regardless if str contains html. Will overwrite the current
   * type.insert(str)* selection if there is one.
   *
   *
   * Inserts formatted text at the caret's position. Will overwrite the current selection if there is one.
   * type.insert('html', str)
   *
   * Inserts str at the offset given as second parameter
   * type.insert(str, 10)

   * Same as type.insert(str, 10) but inserts formatted text given as html string
   * type.insert('html', str, 10)
   *
   * @param {...*} params - Various parameters are possible.
   *     See examples in the block comment.
   * @returns {Type} - The editor instance
   */
  this.insert = function (params) {

    // type.insert(str)
    if (arguments.length === 1) {
      this.getInput().getContent().insert(this.getCaret().getOffset(), arguments[0]);
      return this;
    }

    // type.insert(str, 'text')
    if (arguments.length === 2 && arguments[1] === 'text') {
      // this._writer.insertText(arguments[0]);
      this.getInput().getContent().insert(this.getCaret().getOffset(), arguments[0]);
      return this;
    }

    // type.insert(str, 10)
    if (arguments.length === 2 && typeof arguments[1] === 'number') {
      this._writer.insertText(arguments[0], arguments[1]);
      return this;
    }

    // type.insert('html', str, 10)
    if (arguments.length === 3 && arguments[0] === 'html') {
      this._writer.insertHTML(arguments[1], arguments[2]);
      return this;
    }

    return this;

  };

  /**
   * Formats the currently selected text with the given tag.
   * type.format(tagName, [...params])* E.g. use type.cmd('strong') to format the currently selected text bold
   *
   * Applies type.format to a specific text range
   * type.format(startOffset, endOffset, tagName, [...params])
   *
   * @param {...*} params - Various parameters are possible.
   *     See examples in the block comment.
   * @returns {Type} - The editor instance
   */
  this.format = function (params) {

    var sel, range;

    if (arguments.length === 1) {
      sel = this._selection.save();
      this.getInput().getContent().format(arguments[0], this._selection.getRange());
      this._selection.restore(sel);
      return this;
    }

    if (arguments.length === 3) {
      range = Type.Range.fromPositions(this.getRoot(), arguments[1], arguments[2]);
      this.getInput().getContent().format(arguments[0], range);
      return this;
    }

    return this;
  };

  /**
   * Deletes the currently selected text. Does nothing if there is no selection.
   * type.remove()
   *
   * Removes a number of characters from the caret's position. A negative number will remove characters left
   * of the caret, a positive number from the right. If there is a selection, the characters will be removed
   * from the end of the selection.
   * type.remove(numChars)
   *
   * Will remove characters between the given offsets
   * type.remove(startOffset, endOffset)
   *
   * @param {...*} params - Various parameters are possible.
   *     See examples in the block comment.
   * @returns {Type} - The editor instance
   */
  this.remove = function (params) {

    if (arguments.length < 2) {
      this.getInput().getContent().remove(this.getCaret().getOffset(), arguments[0] || -1)
    }

    if (arguments.length === 2) {
      this.getInput().getContent().remove(arguments[0], arguments[1]);
    }

    return this;
  };

  /**
   * Revokes the last user input
   *
   * @param {Number} [steps] - The number of actions to revoke
   * @returns {Type} - The editor instance
   */
  this.undo = function (steps) {
    var sourceId = this.getInput().getContent().getSourceId();
    this.getUndoManager().undo(sourceId, steps);
    return this;
  };

  /**
   * Reapplies a revoked input
   * @param {Number} [steps] - The number of actions to reapply
   * @returns {Type} - The editor instance
   */
  this.redo = function (steps) {
    var sourceId = this.getInput().getContent().getSourceId();
    this.getUndoManager().redo(sourceId, steps);
    return this;
  };

}).call(Type.fn);
