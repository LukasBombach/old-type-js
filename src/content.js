'use strict';

var Type = require('./core');

/**
 *
 * @param {Type} type
 * @constructor
 */
Type.Content = function (type) {
  this._undoManager = type.getUndoManager();
};

(function () {

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
