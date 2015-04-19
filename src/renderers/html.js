'use strict';

function renderNode(node) {
  return node;
}

function HtmlRenderer(document) {
  this.document = document;
}

HtmlRenderer.prototype.output = function () {
  return renderNode(this.document);
};

module.exports = HtmlRenderer;
