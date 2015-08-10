'use strict';

var Type = require('./core');

/**
 *
 * @param {Type} type
 * @constructor
 */
Type.Content = function (type) {
  this._type = type;
  this._stack = [];
};

(function () {

  /**
   *
   * @param {Type.Actions.Type} action
   * @returns {*}
   */
  this.execute = function (action) {
    this._stack.push(action);
    action.execute();
    return this;
  };

}).call(Type.Content.prototype);

module.exports = Type.Content;
