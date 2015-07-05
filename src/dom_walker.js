'use strict';

var Util = require('./type_utilities');

/**
 * @param {Node} node - The node to be used as the starting point for the
 *     first traversal operation.
 * @param {Object|Node} [options] - If an object is passed, it should
 *     contain settings determining what node to return, see specifics
 *     below. If a {Node} is passed, this acts as options.constrainingNode
 * @param {Function|string} [options.filterFunction] - nextNode traverses
 *     the DOM tree and passes each node to this function. This function
 *     should return true if the node passed is a node that we look for
 *     or false otherwise. E.g. if we want to find the next text node
 *     in the tree, the function should check if the node passed is of
 *     nodeType === 3. If this parameter is not set, any node found
 *     will be returned.
 *     todo allow css selectors to be used for traversal
 * @param {Node} [options.constrainingNode] While traversing the DOM,
 *     this method will check nodes' parents and parents' parents. By
 *     passing a DOM node as this parameter, traversing up will stop at
 *     this node and return null. This is useful when you want to permit
 *     traversing outside the editor's root node.
 * @constructor
 */
function DomWalker(node, options) {
  this.setNode(node);
  this.setOptions(options);
}

(function () {

  /**
   *
   * @returns {null|Node}
   */
  this.next = function () {
    var node = DomWalker._nextNode(this._node, this._options);
    if (node === null) {
      return null;
    }
    this._node = node;
    return node;
  };

  /**
   *
   * @returns {null|Node}
   */
  this.prev = function () {
    var node = DomWalker._prevNode(this._node, this._options);
    if (node === null) {
      return null;
    }
    this._node = node;
    return node;
  };

  /**
   * @param {Node} node
   */
  this.setNode = function (node) {
    if (!node.nodeType) {
      throw new Error('The given node is not a DOM node');
    }
    this._node = node;
    return this;
  };

  /**
   * 
   * @param options
   * @returns {*}
   */
  this.setOptions = function (options) {
    this._options = DomWalker.loadOptions(options);
    return this;
  };

  /**
   *
   * @returns {Node}
   */
  this.getNode = function () {
    return this._node;
  };


}).call(DomWalker.prototype);


(function () {

  /**
   *
   * @type {Object}
   * @private
   */
  DomWalker._filterFunctions = {
    text    : '_isTextNodeWithContents',
    visible : '_isVisible'
  };

  /**
   *
   * @param node
   * @param options
   * @returns {null|Node}
   */
  DomWalker.next = function (node, options) {
    return DomWalker._nextNode(node, DomWalker.loadOptions(options));
  };

  /**
   *
   * @param node
   * @param options
   * @returns {null|Node}
   */
  DomWalker.prev = function (node, options) {
    return DomWalker._prevNode(node, DomWalker.loadOptions(options));
  };

  /**
   *
   * @param options
   * @returns {*}
   */
  DomWalker.loadOptions = function (options) {

    // If no options parameter has been passed
    options = options || {};

    // If a node has been passed as options parameter
    if (options.nodeType) {
      options = {constrainingNode: options};
    }

    // If a function has been passed as ooptions parameter
    if (typeof options === 'string' || Util.isFunction(options)) {
      options = {filter: options};
    }

    // Load internal filter function if filter param is a string
    if (options.filter) {
      options.filter = DomWalker._loadFilter(options.filter);
    }

    // Return processed options
    return options;

  };

  /**
   *
   * @param filter
   * @returns {*}
   * @private
   */
  DomWalker._loadFilter = function (filter) {
    var funcName;
    if (typeof filter === 'string') {
      funcName = DomWalker._filterFunctions[filter];
      return DomWalker[funcName];
    }
    return filter;
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
   * @param {boolean} [returnMe] This should not be passed by the
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
  DomWalker._nextNode = function (node, options, returnMe) {

    // For later use
    var parent = node.parentNode;

    // If a node is found in this call, return it, stop the recursion
    if (returnMe === true && (!options.filterFunction || options.filterFunction(node))) {
      return node;
    }

    // 1. If this node has children, go down the tree
    if (node.childNodes.length) {
      return DomWalker._nextNode(node.childNodes[0], options, true);
    }

    // 2. If this node has siblings, move right in the tree
    if (node.nextSibling !== null) {
      return DomWalker._nextNode(node.nextSibling, options, true);
    }

    // 3. Move up in the node's parents until a parent has a sibling or the constrainingNode is hit
    while (parent !== options.constrainingNode) {
      if (parent.nextSibling !== null) {
        return DomWalker._nextNode(parent.nextSibling, options, true);
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
   * @param {boolean} [returnMe] This should not be passed by the
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
  DomWalker._prevNode = function (node, options, returnMe) {

    // For later use
    var parent = node.parentNode;

    // If a node is found in this call, return it, stop the recursion
    if (returnMe === true && (!options.filterFunction || options.filterFunction(node))) {
      return node;
    }

    // 1. If this node has children, go down the tree
    if (node.childNodes.length) {
      return DomWalker._prevNode(node.lastChild, options, true);
    }

    // 2. If this node has siblings, move right in the tree
    if (node.previousSibling !== null) {
      return DomWalker._prevNode(node.previousSibling, options, true);
    }

    // 3. Move up in the node's parents until a parent has a sibling or the constrainingNode is hit
    while (parent !== options.constrainingNode) {
      if (parent.previousSibling !== null) {
        return DomWalker._prevNode(parent.previousSibling, options, true);
      }
      parent = parent.parentNode;
    }

    // We have not found a node we were looking for
    return null;

  };

  DomWalker.first = function (node, filter) {

  };

  /**
   * Returns true if a give node is a text node and its content is not
   * entirely whitespace.
   *
   * @param {Node} node The node to be checked.
   * @returns {boolean}
   * @private
   */
  DomWalker._isTextNodeWithContents = function (node) {
    return node.nodeType === this._TEXT_NODE && /[^\t\n\r ]/.test(node.textContent);
  };

  /**
   *
   * @param node
   * @returns {boolean}
   * @private
   */
  DomWalker._isVisible = function (node) {
    return !!node.offsetHeight;
  };

}).call(DomWalker);


module.exports = DomWalker;
