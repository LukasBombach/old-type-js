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
   *
   * @type {string}
   */
  this.op = '+';

  /**
   *
   * @param that
   * @returns {boolean}
   */
  this.mergable = function (that) {
    return that instanceof Type.Etherpad.Changeset.Changes.Insertion &&
      this.start <= that.start && that.start <= this.end;
  };

  /**
   *
   * @param that
   * @returns {*}
   */
  this.merge = function (that) {
    var offset = that.start - this.start;
    this.text = this.text.substr(0, offset) + that.text + this.text.substr(offset);
    return this;
  }

}).call(Type.Etherpad.Changeset.Changes.Insertion);

module.exports = Type.Etherpad.Changeset.Changes.Insertion;
