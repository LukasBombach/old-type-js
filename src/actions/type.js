'use strict';

var Type = require('../core');

/**
 * Creates a new Type action
 * @constructor
 */
Type.Actions.Type = function () {
};

(function () {

  /**
   * Performs this action
   * @returns {Type.Actions.Type} - This instance
   */
  this.execute = function () {
    return this;
  };


  /**
   * Revokes this action
   * @returns {Type.Actions.Type} - This instance
   */
  this.undo = function () {
    return this;
  };

}).call(Type.Actions.Type.prototype);

module.exports = Type.Actions.Type;
