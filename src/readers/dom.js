'use strict';

var Document = require('../Document');

/**
 *
 * @constructor
 */
function DomReader(rootNode) {
  this.setDom(rootNode);
}

/**
 *
 * @returns {Document}
 */
DomReader.prototype.getDocument = function () {

  if (this.documentDirty === false) {
    return this.document;
  }

  this.document = new Document();

  this.documentDirty = false;

  return this.document;
};

/**
 *
 * @param rootNode
 * @returns {DomReader}
 */
DomReader.prototype.setDom = function (rootNode) {
  this.dom = rootNode;
  this.document = null;
  this.documentDirty = true;
  return this;
};

module.exports = DomReader;
