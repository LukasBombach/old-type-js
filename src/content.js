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
  this._root = type.getRoot();
  this._type = type;
  //this._bindEvents(type);
};

(function () {

  this.insert = function (textNode, offset, content) {
    this._writer.insertText(textNode, offset, content);


    var absOffset = Type.TextWalker.offset(this._root, textNode, 0, offset);
    var insertion = new Type.Actions.Insert(this._type, absOffset, content);
    this._undoManager.push(insertion);

    //var insertion = new Type.Actions.Insert(textNode, offset, content);
    //this._content.execute(insertion);

  };

  this.delete = function () {

  };

  this.format = function () {

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
