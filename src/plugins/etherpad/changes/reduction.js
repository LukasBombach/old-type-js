'use strict';

var Type = require('../../../core');

/**
 * Creates a new Type.Etherpad.Changeset.Changes.Reduction instance
 *
 * @param {number} length - The number of character to be removed
 * @constructor
 */
Type.Etherpad.Changeset.Changes.Reduction = function (length) {
  this.length = length;
};

/**
 * Inherit from Etherpad change
 */
Type.OOP.inherits(Type.Etherpad.Changeset.Changes.Reduction, Type.Etherpad.Changeset.Changes.Change);


(function () {

  /**
   * Etherpad's serialized string for this operation
   * @type {string}
   */
  this.op = '-';

}).call(Type.Etherpad.Changeset.Changes.Reduction.prototype);


module.exports = Type.Etherpad.Changeset.Changes.Reduction;
