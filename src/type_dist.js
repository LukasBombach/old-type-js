var document_node = {}, document = {}, readers_dom = {}, renderers_html = {}, core = {}, input_caret = {}, type = {};
document_node = function (exports) {
  /**
   * Creates a DocumentNode
   * @param type string A key in {DocumentNode.TYPE}
   * @param value
   * @constructor
   * @param parentNode
   */
  function DocumentNode(type, value, parentNode) {
    if (type === null) {
      throw new Error('A type must be passed');
    }
    if (value instanceof DocumentNode) {
      parentNode = value;
      value = null;
    }
    this.setType(type);
    this.setValue(value);
    this.setParentNode(parentNode);
    this.childNodes = [];
  }
  /**
   * Setter for type
   * @param type string A key in {DocumentNode.TYPE}
   */
  DocumentNode.prototype.setType = function (type) {
    if (!DocumentNode.ELTYPE.hasOwnProperty(type)) {
      throw new Error('The type passed must be a key of DocumentNode.ELTYPE. Type passed is ' + type);
    }
    this.type = type;
    return this;
  };
  /**
   * Setter for value
   * @param value
   */
  DocumentNode.prototype.setValue = function (value) {
    this.value = value;
    return this;
  };
  /**
   * Setter for parentNode
   * @param parentNode
   */
  DocumentNode.prototype.setParentNode = function (parentNode) {
    this.parentNode = parentNode;
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
    ELEMENT: 1,
    TEXT: 3,
    PROCESSING_INSTRUCTION: 7,
    COMMENT: 8,
    DOCUMENT: 9,
    DOCUMENT_TYPE: 10,
    DOCUMENT_FRAGMENT: 11
  };
  DocumentNode.ELTYPE = {
    UNKNOWN: -1,
    TEXT: 1,
    BLOCK: 2,
    INLINE: 3,
    IMG: 4,
    H1: 5,
    H2: 6,
    H3: 7,
    H4: 8,
    H5: 9,
    H6: 10,
    P: 11,
    STRONG: 12,
    EM: 13,
    A: 14,
    OL: 15,
    UL: 16,
    LI: 17,
    CODE: 18,
    PRE: 19,
    SUP: 20
  };
  /**
   * @type {DocumentNode}
   */
  exports = DocumentNode;
  return exports;
}(document_node);
document = function (exports) {
  var Node = document_node;
  /**
   * Holds the contents of the editor
   *
   * @class Document
   * @constructor
   */
  var Document = function (rootNode) {
    this.setRootNode(rootNode);
  };
  /**
   * Setter for rootNode
   * @param rootNode
   */
  Document.prototype.setRootNode = function (rootNode) {
    this.rootNode = rootNode;
    return this;
  };
  exports = Document;
  return exports;
}(document);
readers_dom = function (exports) {
  var Document = document;
  var DocumentNode = document_node;
  var nodeTypeMap = {
    1: 'ELEMENT',
    3: 'TEXT',
    7: 'PROCESSING_INSTRUCTION',
    8: 'COMMENT',
    9: 'DOCUMENT',
    10: 'DOCUMENT_TYPE',
    11: 'DOCUMENT_FRAGMENT'
  };
  var NODE_TYPE_TEXT = 3;
  var elementTypeMap = {
    text: 'TEXT',
    div: 'BLOCK',
    span: 'INLINE',
    img: 'IMG',
    h1: 'H1',
    h2: 'H2',
    h3: 'H3',
    h4: 'H4',
    h5: 'H5',
    h6: 'H6',
    p: 'P',
    strong: 'STRONG',
    bold: 'STRONG',
    em: 'EM',
    i: 'EM',
    a: 'A',
    ol: 'OL',
    ul: 'UL',
    li: 'LI',
    code: 'CODE',
    pre: 'PRE',
    sup: 'SUP'
  };
  function getDocumentNodesForDomNode(domNode, parentDocumentNode) {
    var type;
    if (domNode.nodeType === NODE_TYPE_TEXT) {
      type = elementTypeMap.text;
    } else if (elementTypeMap[domNode.tagName.toLowerCase()] !== undefined) {
      type = elementTypeMap[domNode.tagName.toLowerCase()];
    } else {
      type = 'UNKNOWN';
      console.debug('Did not find map for tag', domNode.tagName.toLowerCase());
    }
    var value = domNode.nodeType === Node.TEXT_NODE ? domNode.nodeValue : null;
    var documentNode = new DocumentNode(type, value, parentDocumentNode);
    for (var i = 0; i < domNode.childNodes.length; i++) {
      documentNode.childNodes.push(getDocumentNodesForDomNode(domNode.childNodes[i], documentNode));
    }
    return documentNode;
  }
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
    this.document = new Document(getDocumentNodesForDomNode(this.dom, null));
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
  exports = DomReader;
  return exports;
}(readers_dom);
renderers_html = function (exports) {
  var DocumentNode = document_node;
  var elementTypeMap = {
    TEXT: 'text',
    BLOCK: 'div',
    INLINE: 'span',
    IMG: 'img',
    H1: 'h1',
    H2: 'h2',
    H3: 'h3',
    H4: 'h4',
    H5: 'h5',
    H6: 'h6',
    P: 'p',
    STRONG: 'strong',
    EM: 'em',
    A: 'a',
    OL: 'ol',
    UL: 'ul',
    LI: 'li',
    CODE: 'code',
    PRE: 'pre',
    SUP: 'sup'
  };
  /**
   * Returns a DOM node reflecting a {DocumentNode}.
   * Will recursively generate and return nested nodes.
   * @private
   * @param node {DocumentNode}
   * @returns {*}
   */
  function renderNode(node) {
    if (DocumentNode.ELTYPE[node.type] === DocumentNode.ELTYPE.TEXT) {
      return window.document.createTextNode(node.value);
    }
    var element = window.document.createElement(elementTypeMap[node.type]);
    for (var i = 0; i < node.childNodes.length; i++) {
      element.appendChild(renderNode(node.childNodes[i]));
    }
    return element;
  }
  /**
   *
   * @param document {Document}
   * @constructor
   */
  function HtmlRenderer(document) {
    this.document = document;
  }
  /**
   * Returns the DOM reflecting the internal document
   * @returns {*}
   */
  HtmlRenderer.prototype.output = function () {
    return renderNode(this.document.rootNode);
  };
  /**
   *
   * @type {HtmlRenderer}
   */
  exports = HtmlRenderer;
  return exports;
}(renderers_html);
core = function (exports) {
  var DomReader = readers_dom;
  var Renderer = renderers_html;
  /**
   * The main class and entry point to set up a Type instance in the browser.
   *
   * @class Type
   * @constructor
   */
  function Type(element, elementOut) {
    var reader = new DomReader(element);
    var document = reader.getDocument();
    var renderer = new Renderer(document);
    var output = renderer.output();
    elementOut.appendChild(output);  /*window.setInterval(function () {
                                       var s = window.getSelection();
                                       var oRange = s.getRangeAt(0); //get the text range
                                       var oRect = oRange.getBoundingClientRect();
                                       console.log(oRect);
                                     }, 1000);*/
  }
  Type.fn = Type.prototype;
  Type.Settings = { prefix: 'typejs-' };
  exports = Type;
  return exports;
}(core);
input_caret = function (exports) {
  function textNodeNode(options) {
    options = options || {};
    this.prev = options.prev;
    this.next = options.next;
  }
  /**
   * Type js core from which we will read settings
   * @private
   * @type {Type}
   */
  //var Type = require('../core');
  /**
   * The id attribute of the container element
   * @private
   * @type {string}
   */
  var containerId = 'typejs-' + 'caret-container';
  /**
   * Returns the container which all caret divs will be appended to
   * Creates the container if it has not been created yet
   * @private
   * @returns {HTMLElement}
   */
  function getElementContainer() {
    var container = window.document.getElementById(containerId);
    if (container === null) {
      container = window.document.createElement('div');
      container.setAttribute('id', containerId);
      window.document.body.appendChild(container);
    }
    return container;
  }
  /**
   * Creates a div - the visual representation of the caret
   * @private
   * @returns {HTMLElement}
   */
  function createElement() {
    var container = getElementContainer(), el = window.document.createElement('div');
    el.className = 'typejs-' + 'caret';
    container.appendChild(el);
    return el;
  }
  /**
   * Adds a class to an element
   * @private
   * @param el
   * @param className
   */
  function addClass(el, className) {
    if (el.classList) {
      el.classList.add(className);
    } else {
      el.className += ' ' + className;
    }
  }
  /**
   * Removes a class from an element
   * @private
   * @param el
   * @param className
   */
  function removeClass(el, className) {
    if (el.classList) {
      el.classList.remove(className);
    } else {
      var regex = new RegExp('(^|\\b)' + className.split(' ').join('|') + '(\\b|$)', 'gi');
      el.className = el.className.replace(regex, ' ');
    }
  }
  /**
   * The Caret function-object on which we work on
   * @constructor
   */
  function Caret() {
    this.caretEl = createElement();
    this.hide();
  }
  /**
   *
   * @param textNode
   * @param offset
   * @returns {Caret}
   */
  Caret.prototype.setTextNode = function (textNode, offset) {
    if (!(textNode instanceof Node) || textNode.nodeType !== Node.TEXT_NODE) {
      throw new Error('textNode parameter must be a Node of type Node.TEXT_NODE');
    }
    if (textNode === this.textNode && offset === null) {
      return this;
    }
    this.textNode = textNode;
    this.offset = offset || 0;
    // todo should trigger event that positions the caret visually
    var rect = getRect(this.textNode, this.offset);
    //this.positionByOffset(); // todo trigger by event
    var x = this.offset === 0 ? rect.left : rect.right;
    this.moveTo(x, rect.top);
    this.resetBlink();
    return this;
  };
  function range(node, start, end, endNode) {
    var r = window.document.createRange();
    r.setEnd(endNode || node, end);
    r.setStart(node, start);
    return r;
  }
  function getRect(textNode, offset) {
    var rects = range(textNode, offset, offset + 1).getClientRects();
    return rects[0];
  }
  Caret.prototype.moveLeft = function () {
    if (this.offset <= 0) {
      return this;
    }
    this.offset -= 1;
    var rect = getRect(this.textNode, this.offset);
    //this.positionByOffset(); // todo trigger by event
    var x = this.offset === 0 ? rect.left : rect.right;
    this.moveTo(x, rect.top);
    this.resetBlink();
    return this;
  };
  Caret.prototype.moveRight = function () {
    if (this.offset + 1 >= this.textNode.length) {
      return this;
    }
    var rect = getRect(this.textNode, this.offset);
    this.offset += 1;
    //this.positionByOffset(); // todo trigger by event
    this.moveTo(rect.right, rect.top);
    this.resetBlink();
    return this;
  };
  Caret.prototype.moveUp = function () {
    var searched, current = getRect(this.textNode, this.offset), charOffset = this.offset;
    do {
      searched = getRect(this.textNode, charOffset);
      charOffset--;
      if (charOffset < 0) {
        return this;
      }
    } while (searched.top === current.top || searched.right > current.right);
    this.offset = charOffset;
    this.moveTo(searched.right, searched.top);
    this.resetBlink();
    return this;
  };
  Caret.prototype.moveDown = function () {
    var searched, current = getRect(this.textNode, this.offset), charOffset = this.offset;
    do {
      searched = getRect(this.textNode, charOffset);
      charOffset++;
      if (charOffset >= this.textNode.length) {
        return this;
      }
    } while (searched.top === current.top || searched.right < current.right);
    this.offset = charOffset;
    this.moveTo(searched.right, searched.top);
    this.resetBlink();
    return this;
  };
  Caret.prototype.insertAtOffset = function (value) {
    var str = this.textNode.nodeValue;
    if (this.offset > 0) {
      this.textNode.nodeValue = str.substring(0, this.offset) + value + str.substring(this.offset, str.length);
    } else {
      this.textNode.nodeValue = value + str;
    }
    this.moveRight();
  };
  Caret.prototype.removeAtOffset = function () {
    var offset = this.offset, str = this.textNode.nodeValue;
    this.moveLeft();
    this.moveLeft();
    if (offset > 0) {
      this.textNode.nodeValue = str.substring(0, offset - 1) + str.substring(offset, str.length);
    }
    this.moveRight();
  };
  /**
   * Moves the caret to the given position
   * @param x
   * @param y
   */
  Caret.prototype.moveTo = function (x, y) {
    this.caretEl.style.left = x + 'px';
    this.caretEl.style.top = y + 'px';
  };
  /**
   * Makes the caret blink
   */
  Caret.prototype.blink = function () {
    removeClass(this.caretEl, 'hide');
    addClass(this.caretEl, 'blink');
  };
  Caret.prototype.resetBlink = function () {
    var newCaret = this.caretEl.cloneNode(true);
    this.caretEl.parentNode.replaceChild(newCaret, this.caretEl);
    this.caretEl = newCaret;
  };
  /**
   * Hides the caret
   */
  Caret.prototype.hide = function () {
    removeClass(this.caretEl, 'blink');
    addClass(this.caretEl, 'hide');
  };
  /**
   * Removes the caret from the dom
   */
  Caret.prototype.destroy = function () {
    var container = getElementContainer();
    container.removeChild(this.caretEl);
    if (!container.hasChildNodes()) {
      container.parentNode.removeChild(container);
    }
  };
  /**
   * Module exports
   * @type {Caret}
   */
  exports = Caret;
  return exports;
}(input_caret);
type = function (exports) {
  var Type = core;
  //require('./range');
  //require('./cmd');
  window.Caret = input_caret;
  window.Type = Type;
  return exports;
}(type);
//# sourceMappingURL=./type_dist.js.map
