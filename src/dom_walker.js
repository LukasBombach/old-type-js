'use strict';

var Util = require('./type_utilities');

function DomWalker(startNode, filter) {
  this.setNode(startNode);
  this.setFilter(filter);
  this._createTreeWalker();
}

(function () {

  this.next = function () {
    if (null !== this._treeWalker) {
      this._node = this._treeWalker.nextNode();
    } else {
      this._node = this._nextNode(this._node)
    }
    return this._node;
  };

  /**
   * Traverses the DOM tree and finds the next node after the node passed
   * as first argument. Will traverse the children, siblings and parents'
   * siblings (in that order) to find the next node in the DOM tree as
   * displayed by the document flow.
   *
   * @param {Node} node - The node from which the search should start
   * @param {Object|Node} [options] - If an object is passed, it should
   *     contain settings determining what node to return, see specifics
   *     below. If a {Node} is passed, this acts as options.constrainingNode
   * @param {Function} [options.filterFunction] - nextNode traverses the
   *     DOM tree and passes each node to this function. This function
   *     should return true if the node passed is a node that we look for
   *     or false otherwise. E.g. if we want to find the next text node
   *     in the tree, the function should check if the node passed is of
   *     nodeType === 3. If this parameter is not set, any node found
   *     will be returned.
   * @param {Node} [options.constrainingNode] While traversing the DOM,
   *     this method will check nodes' parents and parents' parents. By
   *     passing a DOM node as this parameter, traversing up will stop at
   *     this node and return null. This is useful when you want to permit
   *     traversing outside the editor's root node.
   * @param {boolean} [options.returnMe] This should not be passed by the
   *     programmer, it is used internally for recursive function calls to
   *     determine if the current node should be returned or not. If the
   *     programmer passes a node and does *not* pass this argument, the
   *     node passed will not be considered for returning. After that,
   *     internally, this will be set to true and be passed on with the
   *     next node in the DOM to a recursive call. The node then passed to
   *     this method might be the node we are looking for, so having this
   *     set to true will return that node (given that the filterFunction
   *     also returns true for that node)
   * @returns {null|Node} The next node in the DOM tree found or null
   *     if none is found for the options.filterFunction criteria or
   *     options.constrainingNode has been hit.
   */
  this._nextNode = function (node, options) {

    // If no options parameter has been passed
    options = options || {};

    // If a node has been passed as options parameter
    if (options.nodeType) {
      options = {constrainingNode: options};
    }

    // If a function has been passed as ooptions parameter
    if (Util.isFunction(options)) {
      options = {filterFunction: options};
    }

    // For later use
    var parent = node.parentNode;

    // If a node is found in this call, return it, stop the recursion
    if (options.returnMe === true && (!options.filterFunction || options.filterFunction(node))) {
      return node;
    }

    // Will make future recursive calls consider to return the nodes passed
    options.returnMe = true;

    // 1. If this node has children, go down the tree
    if (node.childNodes.length) {
      return this._nextNode(node.childNodes[0], options);
    }

    // 2. If this node has siblings, move right in the tree
    if (node.nextSibling !== null) {
      return this._nextNode(node.nextSibling, options);
    }

    // 3. Move up in the node's parents until a parent has a sibling or the constrainingNode is hit
    while (parent !== options.constrainingNode) {
      if (parent.nextSibling !== null) {
        return this._nextNode(parent.nextSibling, options);
      }
      parent = parent.parentNode;
    }

    // We have not found a node we were looking for
    return null;

  };

  /**
   * Traverses the DOM tree and finds the previous node before the node passed
   * as first argument. Will traverse the children, siblings and parents'
   * siblings (in that order) to find the next node in the DOM tree as
   * displayed by the document flow.
   *
   * @param {Node} node - The node from which the search should start
   * @param {Object|Node} [options] - If an object is passed, it should
   *     contain settings determining what node to return, see specifics
   *     below. If a {Node} is passed, this acts as options.constrainingNode
   * @param {Function} [options.filterFunction] - nextNode traverses the
   *     DOM tree and passes each node to this function. This function
   *     should return true if the node passed is a node that we look for
   *     or false otherwise. E.g. if we want to find the next text node
   *     in the tree, the function should check if the node passed is of
   *     nodeType === 3. If this parameter is not set, any node found
   *     will be returned.
   * @param {Node} [options.constrainingNode] While traversing the DOM,
   *     this method will check nodes' parents and parents' parents. By
   *     passing a DOM node as this parameter, traversing up will stop at
   *     this node and return null. This is useful when you want to permit
   *     traversing outside the editor's root node.
   * @param {boolean} [options.returnMe] This should not be passed by the
   *     programmer, it is used internally for recursive function calls to
   *     determine if the current node should be returned or not. If the
   *     programmer passes a node and does *not* pass this argument, the
   *     node passed will not be considered for returning. After that,
   *     internally, this will be set to true and be passed on with the
   *     next node in the DOM to a recursive call. The node then passed to
   *     this method might be the node we are looking for, so having this
   *     set to true will return that node (given that the filterFunction
   *     also returns true for that node)
   * @returns {null|Node} The next node in the DOM tree found or null
   *     if none is found for the options.filterFunction criteria or
   *     options.constrainingNode has been hit.
   */
  this._prevNode = function (node, options) {

    // If no options parameter has been passed
    options = options || {};

    // If a node has been passed as options parameter
    if (options.nodeType) {
      options = {constrainingNode: options};
    }

    // If a function has been passed as ooptions parameter
    if (Util.isFunction(options)) {
      options = {filterFunction: options};
    }

    // For later use
    var parent = node.parentNode;

    // If a node is found in this call, return it, stop the recursion
    if (options.returnMe === true && (!options.filterFunction || options.filterFunction(node))) {
      return node;
    }

    // Will make future recursive calls consider to return the nodes passed
    options.returnMe = true;

    // 1. If this node has children, go down the tree
    if (node.childNodes.length) {
      return this._prevNode(node.lastChild, options);
    }

    // 2. If this node has siblings, move right in the tree
    if (node.previousSibling !== null) {
      return this._prevNode(node.previousSibling, options);
    }

    // 3. Move up in the node's parents until a parent has a sibling or the constrainingNode is hit
    while (parent !== options.constrainingNode) {
      if (parent.previousSibling !== null) {
        return this._prevNode(parent.previousSibling, options);
      }
      parent = parent.parentNode;
    }

    // We have not found a node we were looking for
    return null;

  };

  /**
   * Setter for _node
   * @param {Node} node
   */
  this.setNode = function (node) {
    if (!node.nodeType) {
      throw new Error('The given node is not a DOM node');
    }
    this._node = node;
  };

  /**
   *
   * @returns {Node|null}
   */
  this.getNode = function () {
    return this._node;
  };

  /**
   *
   * @param filter
   */
  this.setFilter = function (filter) {
    this._filter = filter;
    if (filter === DomWalker.TEXT) {
      this._filterFunc = this._textFilter;
    }
  };

  //this._textFilter

  /**
   *
   * @returns {DomWalker}
   * @private
   */
  this._createTreeWalker = function () {

    var show, filter;

    if (!document.createTreeWalker) {
      this._treeWalker = null;
      return this;
    }

    show = this._filter === DomWalker.TEXT ? NodeFilter.SHOW_TEXT : NodeFilter.SHOW_ELEMENT;
    filter = Util.isFunction(this._filter) ? {acceptNode:this._filter} : undefined;

    this._treeWalker = document.createTreeWalker(this._node, show, filter);

    return this;

  };


}).call(DomWalker.prototype);

DomWalker.TEXT = 'text';

module.exports = DomWalker;
