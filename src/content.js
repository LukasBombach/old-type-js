'use strict';

var Type = require('./core');

/**
 *
 * @param {Type} type
 * @constructor
 */
Type.Content = function (type) {
  this._type = type;
};

(function () {

  /**
   *
   * @param {number} steps
   * @returns {Type.Writer}
   */
  this.undo = function (steps) {
    steps = steps === null ? 1 : steps;
    return this;
  };

  /**
   *
   * @param {number} steps
   * @returns {Type.Writer}
   */
  this.redo = function (steps) {
    steps = steps === null ? 1 : steps;
    return this;
  };

  /**
   *
   * @param {string} changeset
   * @returns {Type.Writer}
   */
  this.applyChangeset = function (changeset) {
    return this;
  };

  /**
   *
   * @param {string} changeset
   * @returns {Type.Writer}
   */
  this.removeChangeset = function (changeset) {
    this.applyChangeset(this._invertChangeset(changeset));
    return this;
  };

  /**
   *
   * @param {string} changeset
   * @returns {Type.Writer}
   * @private
   */
  this._invertChangeset = function (changeset) {

  };

}).call(Type.Content.prototype);

module.exports = Type.Content;
