'use strict';

var Type = require('../../../core');

/**
 * Creates a new Type.Etherpad.Changeset instance
 *
 * @constructor
 */
Type.Etherpad.Changeset.Changes.Formatting = function (offset, length) {
  this.start  = offset;
  this.length = length;
  this.end    = offset + length;
};

/**
 * Inherit from Etherpad change
 */
Type.OOP.inherits(Type.Etherpad.Changeset.Changes.Formatting, Type.Etherpad.Changeset.Changes.Change);


(function () {

  /**
   * Etherpad's serialized string for this operation
   * @type {string}
   */
  this.op = '-';

  /**
   * Maps Etherpad's formatting codes to readable formattings
   *
   * @type {{0: string}}
   * @private
   */
  this._formattingCodes = {
    0 : 'strong'
  };

}).call(Type.Etherpad.Changeset.Changes.Formatting.prototype);

module.exports = Type.Etherpad.Changeset.Changes.Formatting;
