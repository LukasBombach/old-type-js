'use strict';

var Type = require('../../../core');

/**
 * Creates a new Type.Etherpad.Changeset instance
 *
 * @constructor
 */
Type.Etherpad.Changeset.Changes.Formatting = function (command, offset, length) {
  this.command = command;
  this.start   = offset;
  this.length  = length;
  this.end     = offset + length;
};

/**
 * Inherit from Etherpad change
 */
Type.OOP.inherits(Type.Etherpad.Changeset.Changes.Formatting, Type.Etherpad.Changeset.Changes.Change);


(function () {

  /**
   * Etherpad's serialized string for this operation
   *
   * @type {string}
   */
  this.op = '=';

  /**
   * Maps Etherpad commands to tags to apply in the editor
   *
   * @type {{bold: string}}
   * @private
   */
  this._tagMap = {
    bold : 'strong'
  };

  /**
   * @param {Type.Content} content - The content this changeset
   *     should be applied to
   * @param {Type.Caret} [localCaret] - The local user's caret
   * @returns {Type.Etherpad.Changeset.Changes.Insertion} - This instance
   */
  this.apply = function (content, localCaret) {
    content.format(this._tagMap[this.command], this.start, this.end);
    return this;
  };

}).call(Type.Etherpad.Changeset.Changes.Formatting.prototype);


/**
 *
 * @param attrs
 * @param match
 * @returns {Type.Etherpad.Changeset.Changes.Formatting}
 */
Type.Etherpad.Changeset.Changes.Formatting.fromAttrs = function (attrs, offset, match) {
  return new Type.Etherpad.Changeset.Changes.Formatting(attrs[0][0], offset, parseInt(match.value));
};


module.exports = Type.Etherpad.Changeset.Changes.Formatting;
