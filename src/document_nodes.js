'use strict';

/**
 * Creates a DocumentNode
 * @param type
 * @constructor
 */
function DocumentNode(type) {
  this.type = type || null;
}

/**
 * Reflect DOM nodeTypes
 * See https://developer.mozilla.org/en-US/docs/Web/API/Node/nodeType
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
