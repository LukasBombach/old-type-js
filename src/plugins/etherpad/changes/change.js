'use strict';

var Type = require('../../../core');

/**
 * Creates a new Type.Etherpad.Changeset instance
 *
 * @constructor
 */
Type.Etherpad.Changeset.Changes.Change = function () {

};

(function () {

  this.apply = function (content, localCaret) {
    return this;
  };

  this.mergable = function (that) {
    return false;
  };

  this.merge = function (that) {
    return this;
  };

  this.getCharbank = function () {
    return '';
  };

  this.getOperation = function () {
    return '';
  };

  this.getLength = function () {
    return 0;
  };

}).call(Type.Etherpad.Changeset.Changes.Change.prototype);

Type.Etherpad.Changeset.Changes.Change.fromMatch = function (match) {
  return new Type.Etherpad.Changeset.Changes.Change();
};

module.exports = Type.Etherpad.Changeset.Changes.Change;
