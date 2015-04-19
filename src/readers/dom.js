'use strict';

var Document = require('../Document');

/**
 *
 * @constructor
 */
function DomReader(markup) {
  this.setMarkup(markup);
}

DomReader.prototype.getDocument = function () {

  if (this.documentDirty === false) {
    return this.document;
  }

  this.document = new Document();

  this.documentDirty = false;

  return this.document;
};

DomReader.prototype.setMarkup = function (markup) {
  this.markup = markup;
  this.document = null;
  this.documentDirty = true;
  return this;
};

module.exports = DomReader;

