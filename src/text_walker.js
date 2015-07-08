'use strict';

var Type = require('./core');

Type.TextWalker = function () {
};

(function () {

  /**
   *
   * @param fromNode
   * @param toNode
   * @param fromOffset
   * @param toOffset
   * @returns {*}
   */
  Type.TextWalker.offset = function (fromNode, toNode, fromOffset, toOffset) {

    var dom = new Type.DomWalker(fromNode, 'text'),
      node = dom.next(true),
      offsetWalked = 0;

    fromOffset = fromOffset || 0;
    toOffset = toOffset || 0;

    do {
      if (node === toNode) {
        return offsetWalked + toOffset - fromOffset;
      }
      offsetWalked += node.nodeValue.trim().length;
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
  Type.TextWalker.nodeAt = function (fromNode, offset, startOffset) {

    var walker = new Type.DomWalker(fromNode, 'text'),
      node = walker.first(),//Type.DomWalker.first(fromNode, 'text'),
      offsetWalked = 0,
      length;

    startOffset = startOffset || 0;
    offset += startOffset;

    //if (fromNode.nodeType === 3 && offset >= 0 && offset <= fromNode.nodeValue.trim().length) {
    //  return { node: fromNode, offset: offset };
    //}

    if (offset >= 0 && offset <= node.nodeValue.trim().length) {
      return { node: node, offset: offset };
    }

    if (offset < 0) {
      while (node = walker.prev()) {
        length = node.nodeValue.trim().length;
        if (offsetWalked - length <= offset) {
          return { node: node, offset: length+(offset-offsetWalked) };
        }
        offsetWalked -= length;
      }

    } else {
      do {
        length = node.nodeValue.trim().length;
        if (offsetWalked + length >= offset) {
          return { node: node, offset: offset-offsetWalked };
        }
        offsetWalked += length;
      } while (node = walker.next());
    }

    return null;

  };

}).call(Type.TextWalker);


module.exports = Type.TextWalker;
