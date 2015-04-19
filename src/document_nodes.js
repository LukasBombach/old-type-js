'use strict';

/**
 * Creates a DocumentNode
 * @param type number
 * @constructor
 */
function DocumentNode(type) {
  this.setType(type);
}

/**
 * Setter for type
 * @param type number
 */
DocumentNode.prototype.setType = function (type) {
  if (!DocumentNode.TYPE.hasOwnProperty(type)) {
    throw new Error('The type passed must be a key of DocumentNode.TYPE');
  }
  this.type = type;
  return this;
};

/**
 * Reflect DOM nodeTypes
 * @type {{
 *   ELEMENT: number,
 *   TEXT: number,
 *   PROCESSING_INSTRUCTION: number,
 *   COMMENT: number,
 *   DOCUMENT: number,
 *   DOCUMENT_TYPE: number,
 *   DOCUMENT_FRAGMENT: number
 * }}
 */
DocumentNode.TYPE = {
  ELEMENT : 1,
  TEXT : 3,
  PROCESSING_INSTRUCTION : 7,
  COMMENT : 8,
  DOCUMENT : 9,
  DOCUMENT_TYPE : 10,
  DOCUMENT_FRAGMENT : 11
};

module.exports = DocumentNode;
