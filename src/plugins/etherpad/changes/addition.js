'use strict';

var Type = require('../../../core');

/**
 * Creates a new Type.Etherpad.Changeset.Changes.Addition instance
 *
 * @param {number} text - The contents of this addition
 * @param {number} [length] - The length of the contents
 * @constructor
 */
Type.Etherpad.Changeset.Changes.Addition = function (text, length) {
  this.text = text;
  this.length = length || text.length;
};

/**
 * Inherit from Etherpad change
 */
Type.OOP.inherits(Type.Etherpad.Changeset.Changes.Addition, Type.Etherpad.Changeset.Changes.Change);


(function () {

  /**
   * Etherpad's serialized string for this operation
   * @type {string}
   */
  this.op = '+';

}).call(Type.Etherpad.Changeset.Changes.Addition.prototype);


module.exports = Type.Etherpad.Changeset.Changes.Addition;
