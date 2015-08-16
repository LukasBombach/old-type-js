'use strict';

var Type = require('../../../core');

/**
 * Creates a new Type.Etherpad.Changeset instance
 *
 * @constructor
 */
Type.Etherpad.Changeset.Changes.Insertion = function (offset, text) {
  this.start  = offset;
  this.length = text.length;
  this.end    = offset + text.length;
  this.text   = text;
};

/**
 * Inherit from Etherpad change
 */
Type.OOP.inherits(Type.Etherpad.Changeset.Changes.Insertion, Type.Etherpad.Changeset.Changes.Change);


(function () {

  /**
   * Etherpad's serialized string for this operation
   * @type {string}
   */
  this.op = '+';

  /**
   *
   * @returns {string}
   */
  this.getOperation = function () {
    return this.op + this.text.length;
  };

  /**
   * @param {Type.Content} content - The content this changeset
   *     should be applied to
   * @param {Type.Caret} localCaret - The local user's caret
   * @returns {Type.Etherpad.Changeset.Changes.Insertion} - This instance
   */
  this.apply = function (content, localCaret) {
    content.insert(this.start, this.text);
    localCaret.moveBy(this.length);
    return this;
  };

  /**
   *
   * @param {Type.Etherpad.Changeset.Changes.Insertion} that - Another Insertion
   *     instance
   * @returns {boolean}
   */
  this.mergable = function (that) {
    return that instanceof Type.Etherpad.Changeset.Changes.Insertion &&
      this.start <= that.start && that.start <= this.end;
  };

  /**
   *
   * @param {Type.Etherpad.Changeset.Changes.Insertion} that - Another Insertion
   *     instance
   * @returns {Type.Etherpad.Changeset.Changes.Insertion} - This instance
   */
  this.merge = function (that) {
    var offset = that.start - this.start;
    this.text = this.text.substr(0, offset) + that.text + this.text.substr(offset);
    return this;
  }

}).call(Type.Etherpad.Changeset.Changes.Insertion.prototype);

module.exports = Type.Etherpad.Changeset.Changes.Insertion;
