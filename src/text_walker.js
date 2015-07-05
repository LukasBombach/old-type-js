'use strict';

var DomWalker = require('./dom_walker');

function TextWalker(node, options) {
}

(function () {

  /**
   *
   * @param fromNode
   * @param toNode
   * @param fromOffset
   * @param toOffset
   * @returns {*}
   */
  TextWalker.offset = function (fromNode, toNode, fromOffset, toOffset) {

    var dom = new DomWalker(fromNode, 'text'),
      node = dom.next(true),
      offsetWalked = 0;

    fromOffset = fromOffset || 0;
    toOffset = toOffset || 0;

    do {
      if (node === toNode) {
        return offsetWalked + toOffset - fromOffset;
      }
      offsetWalked += node.nodeValue.length;
    } while (node = dom.next());

    return null;

  };

  /**
   * todo constraining node
   * @param {Node} fromNode
   * @param {number} offset
   * @param {number} [startOffset]
   * @returns {{node:Node,offset:number}|null} - The node and the offset to its
   *     start or null if no node could be found
   */
  TextWalker.nodeAt = function (fromNode, offset, startOffset) {

    var walker = new DomWalker(fromNode, 'text'),
      node = fromNode,
      offsetWalked = 0,
      length;

    startOffset = startOffset || 0;
    offset += startOffset;

    if (fromNode.nodeType === 3 && offset >= 0 && offset <= fromNode.nodeValue.length) {
      return { node: fromNode, offset: offset };
    }

    if (offset < 0) {
      while (node = walker.prev()) {
        length = node.nodeValue.length;
        if (offsetWalked - length <= offset) {
          return { node: node, offset: length+(offset-offsetWalked) };
        }
        offsetWalked -= length;
      }

    } else {
      while (node = walker.next()) {
        length = node.nodeValue.length;
        if (offsetWalked + length >= offset) {
          return { node: node, offset: offset-offsetWalked };
        }
        offsetWalked += length;
      }
    }

    return null;

  };

}).call(TextWalker);


module.exports = TextWalker;
