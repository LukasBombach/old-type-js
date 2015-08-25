var core = {}, development = {}, settings = {}, oop = {}, event_api = {}, plugin_api = {}, environment = {}, utilities = {}, dom_utilities = {}, dom_walker = {}, text_walker = {}, range = {}, writer = {}, formatter = {}, caret = {}, selection_overlay = {}, selection = {}, input = {}, events_type = {}, events_input = {}, input_filters_caret = {}, input_filters_undo = {}, input_filters_command = {}, input_filters_remove = {}, input_filters_line_breaks = {}, undo_manager = {}, content = {}, actions_type = {}, actions_insert = {}, actions_remove = {}, actions_format = {}, core_api = {}, plugins_etherpad_typeetherpad = {}, plugins_etherpad_util = {}, plugins_etherpad_client = {}, plugins_etherpad_content = {}, plugins_etherpad_changeset = {}, plugins_etherpad_changes_change = {}, plugins_etherpad_changes_movement = {}, plugins_etherpad_changes_insertion = {}, plugins_etherpad_changes_removal = {}, plugins_etherpad_changes_formatting = {}, plugins_etherpad_changeset_serializer = {}, type = {};
core = function (exports) {
  /**
   * Creates a new Type editor and sets up the core
   * modules used for WYSIWYG editing. The core
   * class only holds methods for setting and retrieving
   * options as well getters and setters for instances
   * of core modules.
   *
   * @param {{}|Element} options - Either pass
   *     an associative array with options for this
   *     editor or the root element that should be
   *     used to modify its contents for WYSIWYG
   *     editing
   * @param {Element} options.el The root element
   *     that should be used to modify its contents
   *     for WYSIWYG editing
   * @constructor
   */
  function Type(options) {
    // Allow passing an element as only parameter
    if (Type.DomUtilities.isNode(options)) {
      options = { el: options };
    }
    // If no element has been passed, interrupt
    if (!options.el) {
      throw new Error('You must provide an element as root node for the editor\'s TypeContents.');
    }
    // Set settings for this editor
    this._root = null;
    this.options(options);
    // Set up core modules
    this._writer = new Type.Writer(this);
    this._formatter = new Type.Formatter(this);
    this._undoManager = new Type.UndoManager(this);
    //this._content      = new Type.Content(this);
    this._caret = new Type.Caret(this);
    this._selection = new Type.Selection(this);
    this._input = new Type.Input(this);
    // Trigger events
    Type.trigger('ready', this);
  }
  (function () {
    /**
     * Allows fast detection if an object is a Type Editor
     * instance (or class)
     *
     * @type {boolean}
     */
    this.typeEditor = true;
    /**
     * Holds the default options for every editor. These options
     * will be extended by the options passed to each instance
     * on instantiation.
     *
     * @type {{el: null, undoSteps: number}}
     * @private
     */
    this._defaultOptions = {
      el: null,
      undoSteps: 20
    };
    /**
     * Sets or gets the options to be used by this Type instance.
     * Parameters can be passed as you know it from jQuery:
     *
     * Pass a single string to get an option:
     * this.options('el')
     * returns your editor's TypeContents baseelement
     *
     * Pass a name value combination to set a specific option
     * this.options('el', myElement)
     * sets the base element
     *
     * Pass an object to set multiple options
     * this.options({el: myElement, foo:bar})
     * sets both parameters
     *
     * @param {(string|Object)} options - Either a plain object
     *     with keys and values to be set or a string that will
     *     be used as a name for a option. If you pass a string,
     *     pass a second parameter to set that option or no
     *     second parameter to retrieve that option.
     * @param {*} [value] - If the first parameter is a string,
     *     this value will be set to the key of the given first
     *     parameter. Any arbitrary value can be set.
     * @returns {Type|*} Returns the type instance if you set an
     *     option or the according value if you get an option
     */
    this.options = function (options, value) {
      // Load default options if there are no instance options yet
      this._options = this._options || Type.Utilities.extend({}, this._defaultOptions);
      // Pass a single option name to fetch it
      if (typeof options === 'string' && arguments.length === 1) {
        return this._options[options];
      }
      // Pass an option name and a value to set it
      if (typeof options === 'string' && arguments.length === 2) {
        options = { options: value };
      }
      // Pass an object of key-values to set them
      if (typeof options === 'object') {
        Type.Utilities.extend(this._options, options);
      }
      // If the el option has been passed copy it for quick access
      if (options.el) {
        this._root = options.el;
      }
      // Chaining
      return arguments.length ? this : this._options;  //return this;
    };
    /**
     * Creates a {Type.DomWalker} that ist constrained to this
     * instance's root element unless you explicitly pass a
     * constrainingNode as argument. All other DomWalker options
     * can also be passed to this as usual.
     *
     * @param {Node} node - Any DOM {Node} to be set as starting
     *     node for the DomWalker
     * @param {Node|string|Function|{constrainingNode: Node, filter: string|Function}} [options]
     *     See {Type.DomWalker} for a description of possible arguments
     * @returns {Type.DomWalker}
     */
    this.createDomWalker = function (node, options) {
      options = Type.DomWalker.loadOptions(options || {});
      options.constrainingNode = options.constrainingNode || this._root;
      return new Type.DomWalker(node, options);
    };
    /**
     * Getter for this instance's root element, i.e. the
     * element that contains this editor's text.
     * @returns {Element}
     */
    this.getRoot = function () {
      return this._root;
    };
    /**
     * Getter for this instance's caret.
     * @returns {Type.Caret}
     */
    this.getCaret = function () {
      return this._caret;
    };
    /**
     * Getter for this instance's selection.
     * @returns {Type.Selection}
     */
    this.getSelection = function () {
      return this._selection;
    };
    /**
     * Getter for this instance's content.
     * @returns {Type.UndoManager}
     */
    this.getUndoManager = function () {
      return this._undoManager;
    };
    /**
     * Getter for this instance's content.
     * @returns {Type.Content}
     */
    //this.getContent = function () {
    //  return this._content;
    //};
    /**
     * Getter for this instance's writer.
     * @returns {Type.Writer}
     */
    this.getWriter = function () {
      return this._writer;
    };
    /**
     * Getter for this instance's formatter.
     * @returns {Formatter}
     */
    this.getFormatter = function () {
      return this._formatter;
    };
    /**
     * Getter for this instance's input.
     * @returns {Type.Input}
     */
    this.getInput = function () {
      return this._input;
    };
  }.call(Type.prototype));
  /**
   * Exposes Type's prototype as jQuery-style shorthand variable
   * @type {Object}
   */
  Type.fn = Type.prototype;
  /**
   * The namespace for Type events
   * @type {{}}
   */
  Type.Events = {};
  /**
   * The namespace for Type actions
   * @type {{}}
   */
  Type.Actions = {};
  /**
   * Module Exports for CommonJs
   * @type {Type}
   */
  exports = Type;
  return exports;
}(core);
development = function (exports) {
  var Type = core;
  /**
   * Holds messages for developing and debugging Type
   * @constructor
   */
  Type.Development = function () {
  };
  (function () {
    /**
     * Prints a message to the console if the browser's
     * console offers the log method.
     *
     * @param {...*} messages - Any number and type of arguments
     *     you want to pass to console.debug
     */
    Type.Development.log = function (messages) {
      if (console && console.log) {
        console.log.apply(console, arguments);
      }
      return Type.Development;
    };
    /**
     * Prints a debug message to the console if the browser's
     * console offers a debug method.
     *
     * @param {...*} messages - Any number and type of arguments
     *     you want to pass to console.debug
     */
    Type.Development.debug = function (messages) {
      if (console && console.debug) {
        console.debug.apply(console, arguments);
      }
      return Type.Development;
    };
  }.call(Type.Development));
  exports = Type.Development;
  return exports;
}(development);
settings = function (exports) {
  var Type = core;
  Type.Settings = { prefix: 'typejs-' };
  exports = Type.Settings;
  return exports;
}(settings);
oop = function (exports) {
  var Type = core;
  Type.OOP = function () {
  };
  (function () {
    /**
     * Implements classical inheritance for the constructor pattern
     *
     * @param {Function} constructor - The child class that shall
     *     inherit attributes and methods
     * @param {Function} parentConstructor - The parent class that
     *     shall be inherited from
     * @returns {Function} The child class that inherited
     */
    Type.OOP.inherits = function (constructor, parentConstructor) {
      // Required variables
      var key;
      // Inherit instance attributes and methods
      constructor.prototype = Object.create(parentConstructor.prototype);
      constructor.prototype.constructor = constructor;
      // Inherit static attributes and methods
      for (key in parentConstructor) {
        if (parentConstructor.hasOwnProperty(key))
          constructor[key] = parentConstructor[key];
      }
      // Add parent / super property
      constructor._super = parentConstructor;
      // Return the inheriting class for convenience
      return constructor;
    };
  }.call(Type.OOP));
  exports = Type.OOP;
  return exports;
}(oop);
event_api = function (exports) {
  var Type = core;
  // todo Write a method that takes an object (Type and Type.prototype) and attaches these event methods to it <- no
  // todo Eine Klasse schreiben die die unteren funktionen im Prototype hat. Dann kann Type core seinen prototype und sein function object mit dem prototype extenden (dafür muss es eine extend methode geben die nur diese funkionen und nicht den ganzen autmoatischen müll mitkopiert).
  /**
   * Methods for Type.js instance events
   */
  (function () {
    /**
     * Register a callback for a Type specific event
     *
     * @param {String} eventName - The name of the event on which you wish the
     *     function to be called
     * @param {Function} cb - The function you wish to be called on the event
     * @returns {Type}
     */
    this.on = function (eventName, cb) {
      this.eventCallbacks = this.eventCallbacks || {};
      this.eventCallbacks[eventName] = this.eventCallbacks[eventName] || [];
      this.eventCallbacks[eventName].push(cb);
      return this;
    };
    /**
     * Unregister a callback for a Type specific event
     *
     * @param {String} eventName - The name of the event on which you wish the
     *     for which you no longer wish to call the function
     * @param {Function} cb - The function you no longer wish to be called
     * @returns {Type}
     */
    this.off = function (eventName, cb) {
      this.eventCallbacks = this.eventCallbacks || {};
      var index = this.eventCallbacks[eventName] ? this.eventCallbacks[eventName].indexOf(cb) : -1;
      if (index > -1) {
        this.eventCallbacks[eventName].splice(index, 1);
      }
      return this;
    };
    /**
     * Trigger a Type specific event to call all callbacks for
     *
     * @param {String} eventName - The name of the event on which you wish to
     *     call its callbacks for
     * @param {...*} params - Arbitrary parameters you wish to pass to the
     *     callbacks
     * @returns {Type}
     */
    this.trigger = function (eventName, params) {
      var i;
      this.eventCallbacks = this.eventCallbacks || {};
      if (this.eventCallbacks[eventName]) {
        for (i = 0; i < this.eventCallbacks[eventName].length; i += 1) {
          this.eventCallbacks[eventName][i].apply(this, params);
        }
      }
      return this;
    };
  }.call(Type.fn));
  /**
   * Global Type.js events
   * Todo Remove code duplication
   */
  (function () {
    /**
     * Register a callback for a global Type event
     *
     * @param {String} eventName - The name of the event on which you wish the
     *     function to be called
     * @param {Function} cb - The function you wish to be called on the event
     * @returns {Type}
     */
    this.on = function (eventName, cb) {
      this.eventCallbacks = this.eventCallbacks || {};
      this.eventCallbacks[eventName] = this.eventCallbacks[eventName] || [];
      this.eventCallbacks[eventName].push(cb);
      return this;
    };
    /**
     * Unregister a callback for a global Type event
     *
     * @param {String} eventName - The name of the event on which you wish the
     *     for which you no longer wish to call the function
     * @param {Function} cb - The function you no longer wish to be called
     * @returns {Type}
     */
    this.off = function (eventName, cb) {
      this.eventCallbacks = this.eventCallbacks || {};
      var index = this.eventCallbacks[eventName] ? this.eventCallbacks[eventName].indexOf(cb) : -1;
      if (index > -1) {
        this.eventCallbacks[eventName].splice(index, 1);
      }
      return this;
    };
    /**
     * Trigger a global Type event to call all callbacks for
     *
     * @param {String} eventName - The name of the event on which you wish to
     *     call its callbacks for
     * @param {...*} params - Arbitrary parameters you wish to pass to the
     *     callbacks
     * @returns {Type}
     */
    this.trigger = function (eventName, params) {
      var i;
      this.eventCallbacks = this.eventCallbacks || {};
      if (this.eventCallbacks[eventName]) {
        for (i = 0; i < this.eventCallbacks[eventName].length; i += 1) {
          this.eventCallbacks[eventName][i].apply(this, params);
        }
      }
      return this;
    };
  }.call(Type));
  return exports;
}(event_api);
plugin_api = function (exports) {
  var Type = core;
  (function () {
    /**
     * Get or set a plugin. Will return the plugin with the given
     * name. Pass a second parameter to set the plugin to the
     * given name.
     *
     * @param {string} name - The name of the plugin that should
     *     be gotten or set
     * @param {*} [value] - The value to be set for the plugin
     * @returns {*}
     */
    this.plugin = function (name, value) {
      this._plugins = this._plugins || {};
      if (value !== null) {
        this._plugins[name] = value;
      }
      return this._plugins[name];
    };
    /**
     * Get or set a plugin. There are 2 essential differences to
     * this.plugin.
     *
     * 1) If the plugin given as name already exists, it will not
     * be set, even if you pass subsequent parameters.
     *
     * 2) If the value passed is a Function object (not an instance)
     * it will be instantiated with the given params and saved
     * under the given name. If value is an instantiated object it
     * will simply be written to name, just as this.plugin would.
     *
     * @param {string} name - The name of the plugin that should
     *     be gotten and set
     * @param {*} [value] - The value to be set for the plugin.
     *     If you pass an instance of a function, this instance
     *     will be set. If you pass an uninstantiated function,
     *     it will be instantiated.
     * @param {...*} [params] - Arguments passed to the instance
     *     that will be created for value
     * @returns {*}
     */
    this.pluginInstance = function (name, value, params) {
      params = Array.prototype.slice.call(arguments, 2);
      this._plugins = this._plugins || {};
      if (this._plugins[name]) {
        return this._plugins[name];
      }
      if (value instanceof Function) {
        this._plugins[name] = new (Function.prototype.bind.apply(value, params))();
      } else {
        this._plugins[name] = value;
      }
      return this._plugins[name];
    };
    /**
     * Call a method from an object (usually a plugin). If the called
     * method returns the plugin, return this type instance instead.
     * If the given method name is not a method in the object, call the
     * given callback.
     *
     * callMethodFrom purpose is to provide a shorthand way to expose
     * the API of a plugin as API of Type
     *
     * @param module
     * @param method
     * @param params
     * @param fallback
     * @returns {Type|*}
     */
    this.callMethodFrom = function (module, method, params, fallback) {
      var result = null;
      if (module.hasOwnProperty(method)) {
        result = module[method].apply(module, params);
      } else if (fallback) {
        result = fallback.apply(module, [method].concat(params));
      } else {
        throw new Error('Method ' + method + 'cannot be found in given module');
      }
      return result === module ? this : result;
    };
  }.call(Type.fn));
  return exports;
}(plugin_api);
environment = function (exports) {
  var Type = core;
  Type.Environment = function () {
  };
  (function () {
    /**
     * Is the user's computer a Macintosh computer
     * @type {boolean}
     */
    Type.Environment.mac = navigator.appVersion.indexOf('Mac') !== -1;
  }.call(Type.Environment));
  exports = Type.Environment;
  return exports;
}(environment);
utilities = function (exports) {
  var Type = core;
  /**
   * @constructor
   */
  Type.Utilities = function () {
  };
  (function () {
    /**
     * This behaves similar to jQuery's extend method. Writes all properties
     * from the objects passed as copyFrom to the object passed  as copyTo.
     * Copying starts from left to right and will overwrite each setting
     * subsequently.
     *
     * @param {Object} copyTo
     * @param {...Object} copyFrom
     * @returns {Object}
     */
    Type.Utilities.extend = function (copyTo, copyFrom) {
      var i, key;
      for (i = 1; i < arguments.length; i += 1) {
        for (key in arguments[i]) {
          if (arguments[i].hasOwnProperty(key)) {
            arguments[0][key] = arguments[i][key];
          }
        }
      }
      return arguments[0];
    };
    /**
     * Tests and returns if a given object is a function instance
     * todo this should be called isFunctionInstance otherwise typeof obj === 'Function' should be used
     *
     * @param obj
     * @returns {boolean}
     */
    Type.Utilities.isFunction = function (obj) {
      return !!(obj && obj.constructor && obj.call && obj.apply);
    };
  }.call(Type.Utilities));
  exports = Type.Utilities;
  return exports;
}(utilities);
dom_utilities = function (exports) {
  var Type = core;
  /**
   * @constructor
   */
  Type.DomUtilities = function () {
  };
  (function () {
    /**
     * The id attribute of the container element where all the helper
     * elements including carets and input fields of type will be
     * appended to
     *
     * @type {string}
     * @private
     */
    Type.DomUtilities._containerId = Type.Settings.prefix + 'container';
    /**
     * Matches a single HTML tag
     * @type {RegExp}
     * @private
     */
    Type.DomUtilities._singleTag = /^<([\w-]+)\s*\/?>(?:<\/\1>|)$/;
    /**
     * Todo Use me wherever you find document.createElement or this.elementsContainer
     * @param {string} tagName
     * @param {string} [className]
     * @returns {Element}
     */
    Type.DomUtilities.addElement = function (tagName, className) {
      var el = document.createElement(tagName);
      if (className)
        el.className = Type.Settings.prefix + className;
      this.getElementsContainer().appendChild(el);
      return el;
    };
    /**
     * Removes a DOM element
     * @param {Element} el
     * @returns {*}
     */
    Type.DomUtilities.removeElement = function (el) {
      el.parentNode.removeChild(el);
      return this;
    };
    /**
     * Will remove a node and each parent (recursively) if removing
     * leaves the parent with no *visible* content
     *
     * @param {Node} node - The node to remove
     * @param {Node} [constrainingNode] - The algorithm will stop and
     *     not remove this node if it reaches it
     * @returns {Node|null} - Will return the parent node where this
     *     algorithm stopped (The node it did *not* delete)
     */
    Type.DomUtilities.removeVisible = function (node, constrainingNode) {
      var parent = node.parentNode;
      if (node === constrainingNode)
        return node;
      if (node === document.body)
        return node;
      if (parent === null)
        return null;
      parent.removeChild(node);
      if (!this.isVisible(parent))
        return this.removeVisible(parent, constrainingNode);
      return parent;
    };
    /**
     * Recursively unwraps the given tag from the element passed an all its children
     * Note to self and future developers, querySelectorAll can be used for this when
     * we drop IE 8 support.
     *
     * @param el
     * @param tag
     * @param deep
     * @returns {Type.DomUtilities}
     */
    Type.DomUtilities.removeTag = function (el, tag, deep) {
      var i;
      if (deep && el.childNodes.length) {
        for (i = 0; i < el.childNodes.length; i += 1) {
          this.removeTag(el.childNodes[i], tag, deep);
        }
      }
      if (el.nodeType === 1 && el.tagName.toLowerCase() === tag.toLowerCase()) {
        this.unwrap(el);
      }
      return this;
    };
    /**
     * Converts a string of HTML to a corresponding {NodeList}
     *
     * @param {String} htmlString - A string containing HTML
     * @returns {NodeList} - The elements represented by the string
     */
    Type.DomUtilities.parseHTML = function (htmlString) {
      var fragment = document.createDocumentFragment(), div = fragment.appendChild(document.createElement('div'));
      div.innerHTML = htmlString;
      return div.childNodes;
    };
    /**
     *
     * By Dave Atchley, taken (and modified) from
     * {@link https://gist.github.com/datchley/11383482}
     * No license given. I asked for the license by mail.
     * Still waiting.
     *
     * @param tag
     * @param elms
     * @returns {Element}
     */
    Type.DomUtilities.wrap = function (tag, elms) {
      // Even out parameters
      elms = elms.length ? elms : [elms];
      // Prepare vars and cache the current parent
      // and sibling of the first element.
      var el = elms[0], parent = el.parentNode, sibling = el.nextSibling, wrapper = document.createElement(tag), i;
      // If the first element had a sibling, insert the wrapper before the
      // sibling to maintain the HTML structure; otherwise, just append it
      // to the parent.
      if (sibling) {
        parent.insertBefore(wrapper, sibling);
      } else {
        parent.appendChild(wrapper);
      }
      // Move all elements to the wrapper. Each element is
      // automatically removed from its current parent and
      // from the elms array.
      for (i = 0; i < elms.length; i += 1) {
        wrapper.appendChild(elms[i]);
      }
      // Remove the tag we want to wrap from TypeContents
      // so we don't have the same tag nested
      for (i = 0; i < elms.length; i += 1) {
        this.removeTag(elms[i], tag, true);
      }
      // Return newly created element
      return wrapper;
    };
    /**
     * Todo use this.moveAfter()
     * @param {Node} el
     * @returns {Type.DomUtilities}
     */
    Type.DomUtilities.unwrap = function (el) {
      var next = el.nextSibling, parent = el.parentNode, childNodes = el.childNodes;
      if (next) {
        while (childNodes.length) {
          parent.insertBefore(el.lastChild, next);
        }
      } else {
        while (childNodes.length) {
          parent.appendChild(el.firstChild);
        }
      }
      parent.removeChild(el);
      parent.normalize();
      return this;
    };
    /**
     *
     * @param reference
     * @param elems
     * @returns {*}
     */
    Type.DomUtilities.moveAfter = function (reference, elems) {
      var i;
      var next = reference.nextSibling, parent = reference.parentNode;
      elems = !elems.length ? [elems] : Array.prototype.slice.call(elems, 0);
      if (next) {
        for (i = 0; i < elems.length; i += 1) {
          parent.insertBefore(elems[i], next);
        }
      } else {
        for (i = 0; i < elems.length; i += 1) {
          parent.appendChild(elems[i]);
        }
      }
      return this;
    };
    /**
     * Todo move to dom walker??
     *
     * @param {Node} el
     * @param {String} selector
     * @param {Node} [constrainingNode]
     * @returns {HTMLElement|null}
     */
    Type.DomUtilities.parent = function (el, selector, constrainingNode) {
      while (el.parentNode && (!constrainingNode || el !== constrainingNode)) {
        if (this.matches(el, selector)) {
          return el;
        }
        el = el.parentNode;
      }
      return null;
    };
    /**
     * Returns true if el matches the CSS selector given as second argument,
     * otherwise false
     *
     * Todo http://davidwalsh.name/element-matches-selector
     *
     * @param el
     * @param selector
     * @returns {boolean}
     */
    Type.DomUtilities.matches = function (el, selector) {
      var _matches = el.matches || el.matchesSelector || el.msMatchesSelector || el.mozMatchesSelector || el.webkitMatchesSelector || el.oMatchesSelector;
      if (_matches) {
        return _matches.call(el, selector);
      } else {
        var nodes = el.parentNode.querySelectorAll(selector);
        for (var i = nodes.length; i--;) {
          if (nodes[i] === el)
            return true;
        }
        return false;
      }
    };
    /**
     *
     * @returns {Element}
     */
    Type.DomUtilities.getElementsContainer = function () {
      var container = window.document.getElementById(this._containerId);
      if (container === null) {
        container = window.document.createElement('div');
        container.setAttribute('id', this._containerId);
        window.document.body.appendChild(container);
      }
      return container;
    };
    /**
     *
     * @param {Node} container
     * @param {Node} node
     * @returns {boolean}
     */
    Type.DomUtilities.containsButIsnt = function (container, node) {
      return container !== node && container.contains(node);
    };
    /**
     *
     * @param obj
     * @returns {boolean}
     */
    Type.DomUtilities.isNode = function (obj) {
      return !!(obj && obj.nodeType);
    };
    /**
     * Returns true if the given node is visible to the user.
     *
     * @param {Element} el - The element to be checked
     * @returns {boolean}
     * @private
     */
    Type.DomUtilities.isVisible = function (el) {
      return !!el.offsetHeight;
    };
    /**
     * Compares the document positions of two DOM nodes
     *
     * @param {Node} a - A DOM node to compare with the given other node
     * @param {Node} b - A DOM node to compare with the given other node
     * @returns {number} - Returns -1 if a precedes b, 1 if it is the
     *     other way around and 0 if they are equal.
     */
    Type.DomUtilities.order = function (a, b) {
      if (a === b) {
        return 0;
      }
      if (a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING) {
        return -1;
      }
      return 1;
    };
  }.call(Type.DomUtilities));
  exports = Type.DomUtilities;
  return exports;
}(dom_utilities);
dom_walker = function (exports) {
  var Type = core;
  /**
   * @param {Node} node - The node to be used as the starting point for the
   *     first traversal operation.
   * @param {Object|Node} [options] - If an object is passed, it should
   *     contain settings determining what node to return, see specifics
   *     below. If a {Node} is passed, this acts as options.constrainingNode
   * @param {Function|string} [options.filter] - nextNode traverses
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
  Type.DomWalker = function (node, options) {
    this.setNode(node);
    this.options(options);
  };
  (function () {
    /**
     * Returns the next node in the document flow and sets the internal reference
     * to the current node to that node.
     * @returns {null|Node}
     */
    this.next = function (returnMe) {
      return this._setNodeIfNotNull(Type.DomWalker._nextNode(this._node, this._options, returnMe));
    };
    /**
     * Returns the next node in the document flow but does not set the internal
     * reference to the current node to that node.
     * @returns {null|Node}
     */
    this.prefetchNext = function (returnMe) {
      return Type.DomWalker._nextNode(this._node, this._options, returnMe);
    };
    /**
     * Returns the previous node in the document flow and sets the internal reference
     * to the current node to that node.
     * @returns {null|Node}
     */
    this.prev = function (returnMe) {
      return this._setNodeIfNotNull(Type.DomWalker._prevNode(this._node, this._options, returnMe));
    };
    /**
     * Returns the previous node in the document flow but does not set the internal
     * reference to the current node to that node.
     * @returns {null|Node}
     */
    this.prefetchPrev = function (returnMe) {
      return Type.DomWalker._prevNode(this._node, this._options, returnMe);
    };
    /**
     * Returns the first child node matching the given filter or the node passed itself
     * if it matches the filter too. Sets the internal reference for the current node to
     * the node found.
     * @returns {null|Node}
     */
    this.first = function () {
      var node = Type.DomWalker.first(this._node, this._options.filter);
      return this._setNodeIfNotNull(node);
    };
    /**
     * Returns the last child node matching the given filter or the node passed itself
     * if it matches the filter too. Sets the internal reference for the current node to
     * the node found.
     * @returns {null|Node}
     */
    this.last = function () {
      var node = Type.DomWalker.last(this._node, this._options.filter);
      return this._setNodeIfNotNull(node);
    };
    /**
     * Sets the internal node from which traversal is made to the given node.
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
     * Sets the options used for traversal by this walker
     * @param options
     * @returns {*}
     */
    this.options = function (options) {
      this._options = Type.DomWalker.loadOptions(options);
      return this;
    };
    /**
     * Returns the current node the walker is on.
     * @returns {Node}
     */
    this.getNode = function () {
      return this._node;
    };
    /**
     * Will set this _node to the given node unless null is passed.
     * Will also return either null or the node, depending on what
     * has been passed. This method is used to process the return
     * values by the DomWalker traversal methods.
     *
     * @param {Node|null} node
     * @returns {Node|null}
     * @private
     */
    this._setNodeIfNotNull = function (node) {
      if (node === null) {
        return null;
      }
      this._node = node;
      return node;
    };
  }.call(Type.DomWalker.prototype));
  /**
   * todo replace Type.DomWalker with "this" where possible
   */
  (function () {
    /**
     *
     * @type {Object}
     * @private
     */
    Type.DomWalker._filterFunctions = {
      text: '_isTextNodeWithContents',
      textNode: '_isTextNode',
      textual: '_resemblesText',
      visible: '_isVisible'
    };
    /**
     *
     * @param node
     * @param options
     * @returns {null|Node}
     */
    Type.DomWalker.next = function (node, options) {
      return Type.DomWalker._nextNode(node, Type.DomWalker.loadOptions(options));
    };
    /**
     *
     * @param node
     * @param options
     * @returns {null|Node}
     */
    Type.DomWalker.prev = function (node, options) {
      return Type.DomWalker._prevNode(node, Type.DomWalker.loadOptions(options));
    };
    /**
     *
     * @param node
     * @param filter
     * @returns {null|Node}
     */
    Type.DomWalker.first = function (node, filter) {
      var options = Type.DomWalker.loadOptions(filter);
      options.constrainingNode = node;
      return Type.DomWalker._nextNode(node, options, true);
    };
    /**
     *
     * @param node
     * @param filter
     * @returns {null|Node}
     */
    Type.DomWalker.last = function (node, filter) {
      var options = Type.DomWalker.loadOptions(filter);
      options.constrainingNode = node;
      return Type.DomWalker._prevNode(node, options, true);
    };
    /**
     *
     * @param options
     * @returns {*}
     */
    Type.DomWalker.loadOptions = function (options) {
      // If no options parameter has been passed
      options = options || {};
      // If a node has been passed as options parameter
      if (options.nodeType) {
        options = { constrainingNode: options };
      }
      // If a function has been passed as ooptions parameter
      if (typeof options === 'string' || Type.Utilities.isFunction(options)) {
        options = { filter: options };
      }
      // Load internal filter function if filter param is a string
      if (options.filter) {
        options.filter = Type.DomWalker._loadFilter(options.filter);
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
    Type.DomWalker._loadFilter = function (filter) {
      var funcName;
      if (typeof filter === 'string') {
        funcName = Type.DomWalker._filterFunctions[filter];
        return Type.DomWalker[funcName];
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
     * @param {Function} [options.filter] - nextNode traverses the
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
     *     set to true will return that node (given that the filter
     *     also returns true for that node)
     * @returns {null|Node} The next node in the DOM tree found or null
     *     if none is found for the options.filter criteria or
     *     options.constrainingNode has been hit.
     */
    Type.DomWalker._nextNode = function (node, options, returnMe) {
      // For later use
      var parent = node.parentNode;
      // If a node is found in this call, return it, stop the recursion
      if (returnMe === true && (!options.filter || options.filter(node))) {
        return node;
      }
      // 1. If this node has children, go down the tree
      if (node.childNodes.length) {
        return Type.DomWalker._nextNode(node.childNodes[0], options, true);
      }
      // 2. If this node has siblings, move right in the tree
      if (node.nextSibling !== null) {
        return Type.DomWalker._nextNode(node.nextSibling, options, true);
      }
      // 3. Move up in the node's parents until a parent has a sibling or the constrainingNode is hit
      while (parent !== options.constrainingNode) {
        if (parent.nextSibling !== null) {
          return Type.DomWalker._nextNode(parent.nextSibling, options, true);
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
     * @param {Function} [options.filter] - nextNode traverses the
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
     *     set to true will return that node (given that the filter
     *     also returns true for that node)
     * @returns {null|Node} The next node in the DOM tree found or null
     *     if none is found for the options.filter criteria or
     *     options.constrainingNode has been hit.
     */
    Type.DomWalker._prevNode = function (node, options, returnMe) {
      // For later use
      var parent = node.parentNode;
      // If a node is found in this call, return it, stop the recursion
      if (returnMe === true && (!options.filter || options.filter(node))) {
        return node;
      }
      // 1. If this node has children, go down the tree
      if (node.childNodes.length) {
        return Type.DomWalker._prevNode(node.lastChild, options, true);
      }
      // 2. If this node has siblings, move right in the tree
      if (node.previousSibling !== null) {
        return Type.DomWalker._prevNode(node.previousSibling, options, true);
      }
      // 3. Move up in the node's parents until a parent has a sibling or the constrainingNode is hit
      while (parent !== options.constrainingNode) {
        if (parent.previousSibling !== null) {
          return Type.DomWalker._prevNode(parent.previousSibling, options, true);
        }
        parent = parent.parentNode;
      }
      // We have not found a node we were looking for
      return null;
    };
    /**
     * Returns true if a given node is a text node
     *
     * @param {Node} node The node to be checked.
     * @returns {boolean}
     * @private
     */
    Type.DomWalker._isTextNode = function (node) {
      return node.nodeType === Node.TEXT_NODE;
    };
    /**
     * Returns true if a given node is a text node and its contents are not
     * entirely whitespace.
     *
     * @param {Node} node The node to be checked.
     * @returns {boolean}
     * @private
     */
    Type.DomWalker._isTextNodeWithContents = function (node) {
      return node.nodeType === Node.TEXT_NODE && /[^\t\n\r ]/.test(node.textContent);
    };
    /**
     * Returns true if a given node is displayed as text on the screen
     *
     * @param {Node} node The node to be checked.
     * @returns {boolean}
     * @private
     */
    Type.DomWalker._resemblesText = function (node) {
      return node.nodeName.toLocaleLowerCase() === 'br' || Type.DomWalker._isTextNodeWithContents(node);
    };
    /**
     * Returns true if the given node is visible to the user.
     *
     * @param {Element} node - The node to be checked
     * @returns {boolean}
     * @private
     */
    Type.DomWalker._isVisible = function (node) {
      return !!node.offsetHeight;
    };
  }.call(Type.DomWalker));
  exports = Type.DomWalker;
  return exports;
}(dom_walker);
text_walker = function (exports) {
  var Type = core;
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
      var dom = new Type.DomWalker(fromNode, 'textual'), node = dom.next(true), offsetWalked = 0;
      fromOffset = fromOffset || 0;
      toOffset = toOffset || 0;
      do {
        if (node === toNode) {
          return offsetWalked + toOffset - fromOffset;
        }
        //offsetWalked += node.nodeValue.trim().length;
        offsetWalked += Type.TextWalker._textLength(node);
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
      var walker = new Type.DomWalker(fromNode, 'textual'),
        //var walker = new Type.DomWalker(fromNode, 'text'),
        node = walker.first(),
        //Type.DomWalker.first(fromNode, 'text'),
        offsetWalked = 0, length;
      startOffset = startOffset || 0;
      offset += startOffset;
      //if (fromNode.nodeType === 3 && offset >= 0 && offset <= fromNode.nodeValue.trim().length) {
      //  return { node: fromNode, offset: offset };
      //}
      //if (offset >= 0 && offset <= node.nodeValue.trim().length) {
      if (offset >= 0 && offset <= Type.TextWalker._textLength(node)) {
        return {
          node: node,
          offset: offset
        };
      }
      if (offset < 0) {
        while (node = walker.prev()) {
          //length = node.nodeValue.trim().length;
          length = Type.TextWalker._textLength(node);
          if (offsetWalked - length <= offset) {
            return {
              node: node,
              offset: length + (offset - offsetWalked)
            };
          }
          offsetWalked -= length;
        }
      } else {
        do {
          //length = node.nodeValue.trim().length;
          length = Type.TextWalker._textLength(node);
          if (offsetWalked + length >= offset) {
            return {
              node: node,
              offset: offset - offsetWalked
            };
          }
          offsetWalked += length;
        } while (node = walker.next());
      }
      return null;
    };
    Type.TextWalker._textLength = function (node) {
      if (node.nodeName.toLocaleLowerCase() === 'br') {
        return 1;
      } else {
        return node.nodeValue.trim().length;
      }
    };  /**
         *
         * @param a
         * @param b
         */
        //this.mergeTexts = function (a, b) {
        //if (a.nodeType === Node.TEXT_NODE) {
        //
        //  }
        //  }
        //};
  }.call(Type.TextWalker));
  exports = Type.TextWalker;
  return exports;
}(text_walker);
range = function (exports) {
  var Type = core;
  /**
   * Crates a new Type.Range
   *
   * Type.Range is a shim for the browsers' native {Range} objects and
   * is being used in Type for anything related to text ranges.
   *
   * Native ranges are often buggy, lack essential features and should
   * not be used other than for performance reasons. This class avoids
   * and / or fixes common issues with ranges and adds many methods
   * useful for text editing.
   *
   * Among many other factory methods, you can use the {Type.Range.fromRange}
   * method to create a {Type.Range} from a native {Range}.
   *
   * @param {Node} startContainer - A text node that the range should start in.
   * @param {number} startOffset - The offset (of characters) inside the
   *     startContainer where the range should begin.
   * @param {Node} endContainer - A text node that the range should end in.
   * @param {number} endOffset - The offset (of characters) inside the
   *     endContainer where the range should stop.
   * @constructor
   */
  Type.Range = function (startContainer, startOffset, endContainer, endOffset) {
    this.startContainer = startContainer;
    this.startOffset = startOffset;
    this.endContainer = endContainer;
    this.endOffset = endOffset;
    this.ensureStartNodePrecedesEndNode();
  };
  (function () {
    /**
     * If the startContainer and the endContainer are enclosed by
     * the same element matching the selector, that element will
     * be returned. Otherwise null will be returned.
     *
     * todo call this commonAncestor and make the selector optional
     *
     * @param {String} selector - This method will only return a
     *     common ancestor matched by this selector.
     * @param {HTMLElement} [constrainingNode] - If given, this
     *     method will stop traversing the DOM tree when it hits
     *     this element.
     * @returns {HTMLElement|null} - Will either return the common
     *     ancestor matching the selector or null otherwise.
     */
    this.elementEnclosingStartAndEnd = function (selector, constrainingNode) {
      var tagEnclosingStartNode = Type.DomUtilities.parent(this.startContainer, selector, constrainingNode), tagEnclosingEndNode;
      if (tagEnclosingStartNode === null) {
        return null;
      }
      tagEnclosingEndNode = Type.DomUtilities.parent(this.endContainer, selector, constrainingNode);
      if (tagEnclosingStartNode === tagEnclosingEndNode) {
        return tagEnclosingStartNode;
      }
      return null;
    };
    /**
     * Will return whether or not the whole range (the
     * startContainer and the endContainer are both children
     * of the given element.
     *
     * @param {Node} node - The node to check if it
     *     is a parent to the start and endContainer.
     * @returns {boolean}
     */
    this.isInside = function (node) {
      return node.contains(this.startContainer) && node.contains(this.endContainer);
    };
    /**
     * Will throw an error if the start and endContainer are
     * not children to the given element. Returns true if
     * they are.
     *
     * @param {HTMLElement} el - The element to check if it
     *     is a parent to the start and endContainer.
     * @returns {boolean}
     */
    this.ensureIsInside = function (el) {
      if (this.isInside(el)) {
        return true;
      }
      throw new Error('Range is not contained by given node.');
    };
    /**
     * Will swap start and end containers as well as offsets if
     * either the containers or the offsets are in the wrong
     * order (the start container / offset should precede the end)
     *
     * @returns {Type.Range} - This instance
     */
    this.ensureStartNodePrecedesEndNode = function () {
      var startIsEnd, startPrecedesEnd;
      startIsEnd = this.startContainer === this.endContainer;
      if (startIsEnd && this.startOffset <= this.endOffset) {
        return this;
      }
      if (startIsEnd && this.startOffset > this.endOffset) {
        return this._swapOffsets();
      }
      startPrecedesEnd = this.startContainer.compareDocumentPosition(this.endContainer);
      startPrecedesEnd = startPrecedesEnd & Node.DOCUMENT_POSITION_FOLLOWING;
      if (!startPrecedesEnd) {
        this._swapStartAndEnd();
      }
      return this;
    };
    /**
     * Will split the startContainer text node at the startOffset and set
     * this' startContainer to the right node the resulting nodes of the
     * split and the startOffset to 0. Will return the new startContainer.
     *
     * @returns {Node} - The new startContainer
     */
    this.splitStartContainer = function () {
      var startsAndEndsInSameNode;
      if (this.startOffset === 0) {
        return this.startContainer;
      }
      startsAndEndsInSameNode = this.startsAndEndsInSameNode();
      this.startContainer = this.startContainer.splitText(this.startOffset);
      if (startsAndEndsInSameNode) {
        this.endContainer = this.startContainer;
        this.endOffset -= this.startOffset;
      }
      this.startOffset = 0;
      return this.startContainer;
    };
    /**
     * Will split the endContainer text node at the endOffset and set
     * this' endContainer to the left node the resulting nodes of the
     * split and the endOffset to the end of the endContainer.
     * Will return the new endContainer.
     *
     * @returns {Node} - The new endContainer
     */
    this.splitEndContainer = function () {
      if (this.endOffset !== this.endContainer.length) {
        this.endContainer = this.endContainer.splitText(this.endOffset).previousSibling;
        this.endOffset = this.endContainer.length;
      }
      return this.endContainer;
    };
    /**
     * Creates a native {Range} object and returns it.
     * @returns {Range}
     */
    this.getNativeRange = function () {
      var range = document.createRange();
      range.setEnd(this.endContainer, this.endOffset);
      range.setStart(this.startContainer, this.startOffset);
      return range;
    };
    /**
     * Looks up the number of characters (offsets) where this range starts
     * and ends relative to a given {Element}. Returns an {Object} containing
     * the element itself and the offsets. This object can be used to restore
     * the range by using the {@link Type.Range.load} factory.
     *
     * @param {Element} fromNode
     * @returns {{from: Element, start: number, end: number}}
     */
    this.save = function (fromNode) {
      var start, end;
      start = this.getStartOffset(fromNode);
      end = this.startsAndEndsInSameNode() ? start - this.startOffset + this.endOffset : this.getEndOffset(fromNode);
      return {
        from: fromNode,
        start: start,
        end: end
      };
    };
    /**
     * Returns the length of this range as numbers of characters.
     * @returns {number}
     */
    this.getLength = function () {
      return Type.TextWalker.offset(this.startContainer, this.endContainer, this.startOffset, this.endOffset);
    };
    /**
     * Returns the offset (number of visible characters) from the given node
     * to the startContainer and its startOffset. If no node has been passed
     * this will return the startOffset
     *
     * @param {Node} [from] - The node to start counting characters from
     * @returns {number|null}
     */
    this.getStartOffset = function (from) {
      if (from) {
        return Type.TextWalker.offset(from, this.startContainer, 0, this.startOffset);
      }
      return parseInt(this.startOffset, 10);
    };
    /**
     * Returns the offset (number of visible characters) from the given node
     * to the endContainer and its endOffset. If no node has been passed
     * this will return the endOffset
     *
     * @param {Node} [from] - The node to start counting characters from
     * @returns {number|null}
     */
    this.getEndOffset = function (from) {
      if (from) {
        return Type.TextWalker.offset(from, this.endContainer, 0, this.endOffset);
      }
      return parseInt(this.endOffset, 10);
    };
    /**
     * Returns the element containing the startContainer.
     *
     * @returns {Node}
     */
    this.getStartElement = function () {
      return this.startContainer.parentNode;
    };
    /**
     * Returns the element containing the endContainer.
     *
     * @returns {Node}
     */
    this.getEndElement = function () {
      return this.endContainer.parentNode;
    };
    /**
     * Returns the tag name of the element containing the
     * startContainer.
     *
     * @returns {string}
     */
    this.getStartTagName = function () {
      return this.getStartElement().tagName.toLowerCase();
    };
    /**
     * Returns the tag name of the element containing the
     * endContainer.
     *
     * @returns {string}
     */
    this.getEndTagName = function () {
      return this.getEndElement().tagName.toLowerCase();
    };
    /**
     * Returns whether or not the the element containing the
     * startContainer is of the given tagName.
     *
     * @param {string} tagName - The tag name to compare.
     * @returns {boolean}
     */
    this.startTagIs = function (tagName) {
      return this.getStartTagName() === tagName.toLowerCase();
    };
    /**
     * Returns whether or not the the element containing the
     * endContainer is of the given tagName.
     *
     * @param {string} tagName - The tag name to compare.
     * @returns {boolean}
     */
    this.endTagIs = function (tagName) {
      return this.getEndTagName() === tagName.toLowerCase();
    };
    /**
     * Returns whether or not the startContainer equals the
     * endContainer.
     *
     * @returns {boolean}
     */
    this.startsAndEndsInSameNode = function () {
      return this.startContainer === this.endContainer;
    };
    /**
     * Returns whether or not this range spans over no characters
     * at all.
     *
     * @returns {boolean}
     */
    this.isCollapsed = function () {
      return this.startOffset === this.endOffset && this.startsAndEndsInSameNode();
    };
    /**
     * Merges another range with this range and returns this range.
     *
     * @param {Type.Range} that - The range that should be added to
     *     this range.
     * @returns {Type.Range} - This instance
     */
    this.mergeWith = function (that) {
      var startOrder, endOrder;
      startOrder = Type.DomUtilities.order(this.startContainer, that.startContainer);
      endOrder = Type.DomUtilities.order(this.endContainer, that.endContainer);
      if (startOrder === 0) {
        this.startOffset = Math.min(this.startOffset, that.startOffset);
      } else if (startOrder === 1) {
        this.startContainer = that.startContainer;
      }
      if (endOrder === 0) {
        this.endOffset = Math.max(this.endOffset, that.endOffset);
      } else if (startOrder === -1) {
        this.endContainer = that.endContainer;
      }
      return this;
    };
    /**
     * Internal method to swap the start and end containers as well
     * as their offsets when it is initialized with the endContainer
     * preceding the startContainer.
     *
     * @returns {Type.Range} - This instance
     * @private
     */
    this._swapStartAndEnd = function () {
      this._swapContainers();
      this._swapOffsets();
      return this;
    };
    /**
     * Will swap the startContainer with the endContainer
     *
     * @returns {Type.Range} - This instance
     * @private
     */
    this._swapContainers = function () {
      var swapContainer = this.startContainer;
      this.startContainer = this.endContainer;
      this.endContainer = swapContainer;
      return this;
    };
    /**
     * Will swap the startOffset with the endOffset
     *
     * @returns {Type.Range} - This instance
     * @private
     */
    this._swapOffsets = function () {
      var swapOffset = this.startOffset;
      this.startOffset = this.endOffset;
      this.endOffset = swapOffset;
      return this;
    };
  }.call(Type.Range.prototype));
  (function () {
    /**
     * The implementation of {Range#getClientRects} is broken in WebKit
     * browsers. {@link Type.Range._getClientRectsNeedsFix} tests for
     * wrong behaviour and stores if it is broken in this variable.
     *
     * @type {null|boolean}
     */
    Type.Range._getClientRectsIsBroken = null;
    /**
     * Will create a range spanning from the offset given as start to the
     * offset given as end, counting the characters contained by the given
     * el. This function should be used with the save method of {Type.Range}.
     *
     * @param {{from: HTMLElement, start: number, end: number}} bookmark -
     *     An object as returned by {Type.Range#save}
     * @param {HTMLElement} bookmark.from - The root element from which the
     *     start and end offsets should be counted
     * @param {number} bookmark.start - The offsets (number of characters)
     *     where the selection should start
     * @param {number} bookmark.end - The offsets (number of characters)
     *     where the selection should end
     * @returns {Type.Range} - A {Type.Range} instance
     */
    Type.Range.load = function (bookmark) {
      return Type.Range.fromPositions(bookmark.from, bookmark.start, bookmark.end);
    };
    /**
     * Will create a range spanning from the offset given as start to the
     * offset given as end, counting the characters contained by the given
     * el.
     *
     * @param {HTMLElement|Node} el - The root element from which the start
     *     and end offsets should be counted
     * @param {number} startOffset - The offsets (number of characters) where the
     *     selection should start
     * @param {number} endOffset - The offsets (number of characters) where the
     *     selection should end
     * @returns {Type.Range} - A {Type.Range} instance
     */
    Type.Range.fromPositions = function (el, startOffset, endOffset) {
      var start = Type.TextWalker.nodeAt(el, startOffset), end = Type.TextWalker.nodeAt(el, endOffset);
      return new Type.Range(start.node, start.offset, end.node, end.offset);
    };
    /**
     * Will read the current {Selection} on the document and create a {Type.Range}
     * spanning over the {Range}(s) contained by the selection. Will return
     * null if there is no selection on the document.
     *
     * todo Check if selection is actually inside editor and return null if not
     *
     * @returns {Type.Range|null} - A {Type.Range} instance or null
     */
    Type.Range.fromCurrentSelection = function () {
      var sel = document.getSelection();
      return sel.isCollapsed ? null : Type.Range.fromRange(sel.getRangeAt(0));
    };
    /**
     * Will create a {Type.Range} based on the start and end containers and
     * offsets of the given {Range}. This will also take care of browser
     * issues (especially WebKit) when the range is fetched from a selection
     * that ends at the end of an element.
     *
     * todo The "fix" is a solution for a single case
     * todo find the pattern of this and process all cases
     *
     * @param {Range} range - The {Range} that should be <em>migrated</em>
     *     to a {Type.Range}
     * @returns {Type.Range} - The {Type.Range} corresponding to the given
     *     {Range}
     */
    Type.Range.fromRange = function (range) {
      var endContainer = range.endContainer, endOffset = range.endOffset;
      if (endOffset === 0 && endContainer === Type.DomWalker.next(range.startContainer.parentNode.nextSibling, 'visible')) {
        endContainer = Type.DomWalker.last(range.startContainer.parentNode, 'text');
        endOffset = endContainer.length;
      }
      return new Type.Range(range.startContainer, range.startOffset, endContainer, endOffset);
    };
    /**
     * Will create a {Type.Range} spanning from the offset of the given {Caret}
     * over a number of characters passed as selectedChars. If selectedChars is
     * a positive number, the range's start will be set to the cursor position
     * and the end spanning to the characters to its right. If selectedChars is
     * negative it will span to the characters to its left.
     *
     * @param {Caret} caret
     * @param {number} selectedChars
     * @returns {Type.Range}
     */
    Type.Range.fromCaret = function (caret, selectedChars) {
      var startNode = caret.getNode(), startOffset = caret.getNodeOffset(), end = Type.TextWalker.nodeAt(startNode, selectedChars, startOffset);
      return new Type.Range(startNode, startOffset, end.node, end.offset);
    };
    /**
     * Will create a {Type.Range} containing the given element's text by
     * finding the first and last text nodes inside the element and spanning
     * a range beginning at the start of the first text node and at the end
     * of the last text node.
     *
     * @param {HTMLElement} el - The element that should be <em>covered</em>
     *     by the returned {Type.Range}.
     * @returns {Type.Range} - A {Type.Range} spanning over the contents of the
     *     given element.
     */
    Type.Range.fromElement = function (el) {
      var startNode = Type.DomWalker.first(el, 'text'), endNode = Type.DomWalker.last(el, 'text');
      return new Type.Range(startNode, 0, endNode, endNode.nodeValue.length);
    };
    /**
     * Will return a new {Type.Range} at the position read from a given
     * {MouseEvent}. Will return null if the event was not triggerd from
     * within a text node.
     *
     * @param {MouseEvent} e - The mouse event to read positions from
     * @returns {Type.Range|null} - Returns a new Type.Range or null if the
     *     event has not been triggered from inside a text node
     */
    Type.Range.fromMouseEvent = function (e) {
      return Type.Range.fromPoint(e.clientX, e.clientY);
    };
    /**
     * Will create a {Type.Range} at the offset and inside the text node
     * found at the x and y positions relative to the document. The range
     * will be collapsed. Will return null
     *
     * @param {number} x - The horizontal position relative to the document
     * @param {number} y - The vertical position relative to the document
     * @returns {Type.Range|null} - Returns a new Type.Range or null if the
     *     position is not inside a text node
     */
    Type.Range.fromPoint = function (x, y) {
      var range, node, offset;
      if (document.caretPositionFromPoint) {
        range = document.caretPositionFromPoint(x, y);
        node = range.offsetNode;
        offset = range.offset;
      } else if (document.caretRangeFromPoint) {
        range = document.caretRangeFromPoint(x, y);
        node = range.startContainer;
        offset = range.startOffset;
      } else {
        Type.Development.debug('This browser does not support caretPositionFromPoint or caretRangeFromPoint.');
        return null;
      }
      // only split TEXT_NODEs
      if (node.nodeType === Node.TEXT_NODE) {
        return new Type.Range(node, offset, node, offset);
      }
      Type.Development.debug('User clicked in a non-text node, cannot create range');
      return null;
    };
    /**
     * WebKit browsers sometimes create unnecessary and overlapping {ClientRect}s in
     * {Range.prototype.getClientRects}. This method creates 2 elements, creates a
     * range and tests for this behaviour.
     *
     * From {@link https://github.com/edg2s/rangefix}
     * (modified)
     *
     * Copyright (c) 2014 Ed Sanders under the
     * terms of The MIT License (MIT)
     *
     * @returns {boolean}
     * @private
     */
    Type.Range._testGetClientRectsNeedsFix = function () {
      var range = document.createRange(), p1 = Type.DomUtilities.addElement('p'), p2 = Type.DomUtilities.addElement('p'), needsFix;
      p1.appendChild(document.createTextNode('aa'));
      p2.appendChild(document.createTextNode('aa'));
      range.setStart(p1.firstChild, 1);
      range.setEnd(p2.firstChild, 1);
      needsFix = range.getClientRects().length > 2;
      Type.DomUtilities.removeElement(p1);
      Type.DomUtilities.removeElement(p2);
      return needsFix;
    };
    /**
     * Will return if the browser has a broken model for {Range.prototype.getClientRects}.
     * This is usually the case with WebKit.
     *
     * @returns {boolean}
     * @private
     */
    Type.Range._getClientRectsNeedsFix = function () {
      if (typeof Type.Range._getClientRectsIsBroken !== 'boolean') {
        Type.Range._getClientRectsIsBroken = this._testGetClientRectsNeedsFix();
      }
      return Type.Range._getClientRectsIsBroken;
    };
    /**
     * WebKit browsers sometimes create unnecessary and overlapping {ClientRect}s
     * in {Range.prototype.getClientRects}. This method takes a {Range}, fixes
     * the {ClientRect}s (if necessary) and returns them.
     *
     * From {@link https://github.com/edg2s/rangefix}
     * (modified)
     *
     * Copyright (c) 2014 Ed Sanders under the
     * terms of The MIT License (MIT)
     *
     * @param {Range} range - A native {Range}
     * @return {ClientRect[]} ClientRectList or list of
     *     ClientRect objects describing range
     */
    Type.Range.getClientRects = function (range) {
      if (!Type.Range._getClientRectsNeedsFix()) {
        return range.getClientRects();
      }
      var partialRange = document.createRange(), endContainer = range.endContainer, endOffset = range.endOffset, rects = [];
      while (endContainer !== range.commonAncestorContainer) {
        partialRange.setStart(endContainer, 0);
        partialRange.setEnd(endContainer, endOffset);
        Array.prototype.push.apply(rects, partialRange.getClientRects());
        endOffset = Array.prototype.indexOf.call(endContainer.parentNode.childNodes, endContainer);
        endContainer = endContainer.parentNode;
      }
      partialRange = range.cloneRange();
      partialRange.setEnd(endContainer, endOffset);
      Array.prototype.push.apply(rects, partialRange.getClientRects());
      return rects;
    };
  }.call());
  exports = Type.Range;
  return exports;
}(range);
writer = function (exports) {
  var Type = core;
  /**
   *
   * @param {Type} type
   * @constructor
   */
  Type.Writer = function (type) {
    this._type = type;
    this._root = type.getRoot();
  };
  (function () {
    /**
     * Inserts a string in a text node at a given offset
     *
     * @param {Text} textNode - The text node into which str will be inserted.
     * @param {Number} offset - The character offset at which str will be inserted.
     * @param {String} str - The text that will be inserted
     * @returns {Type.Writer} - This instance
     */
    this.insertText = function (textNode, offset, str) {
      var nodeText = textNode.nodeValue;
      if (offset > 0) {
        textNode.nodeValue = nodeText.substring(0, offset) + str + nodeText.substring(offset, nodeText.length);
      } else {
        textNode.nodeValue = str + nodeText;
      }
      return this;
    };
    /**
     * Inserts DOM nodes at the offset of a text node
     *
     * @param {Text} textNode - The text node which will be split and in which
     *     the DOM will be inserted.
     * @param {Number} offset - The text offset at which the DOM should be
     *     inserted.
     * @param {Node|[Node]|NodeList|String} nodes - Either a {Node}, an array
     *     of {Node}s, a {NodeList} or a string containing HTML that will be
     *     inserted at the given offset in  a text node.
     * @returns {Type.Writer} - This instance
     */
    this.insertHTML = function (textNode, offset, nodes) {
      // Required variables
      var i, parent, insertBeforeNode;
      // Parse string (if given) to retrieve DOM nodes
      nodes = typeof nodes === 'string' ? Type.DomUtilities.parseHTML(nodes) : nodes;
      // Make array if single DOM node was given
      nodes = nodes.length ? nodes : [nodes];
      // Make nodes an array (in case it is a NodeList)
      nodes = Array.prototype.slice.call(nodes);
      // Split text and prepare insertion
      insertBeforeNode = textNode.splitText(offset);
      parent = insertBeforeNode.parentNode;
      // If last given DOM node is a text, concat it with the text behind insertion
      if (nodes[nodes.length - 1].nodeType === Node.TEXT_NODE) {
        insertBeforeNode.nodeValue = nodes.pop().nodeValue + insertBeforeNode.nodeValue;
        if (!nodes.length) {
          textNode.nodeValue += insertBeforeNode.nodeValue;
          Type.DomUtilities.removeElement(insertBeforeNode);
        }
      }
      // Insert DOM nodes between split texts
      for (i = nodes.length - 1; i >= 1; i -= 1) {
        parent.insertBefore(nodes[i], insertBeforeNode);
        insertBeforeNode = nodes[i];
      }
      // If first given DOM node is a text, concat it with the text before insertion
      if (nodes.length && nodes[0].nodeType === Node.TEXT_NODE) {
        textNode.nodeValue += nodes[0].nodeValue;
      } else if (nodes.length) {
        parent.insertBefore(nodes[0], insertBeforeNode);
      }
      // Chaining
      return this;
    };
    /**
     * todo refactor var names "a" and "b"
     * todo distinguish block from inline tags
     *
     * TODO CONSTRAIN TO TYPE ROOT !!! !  !   !!!
     *
     * remove(range)
     * remove(caret, -1)
     *
     * @param {Type.Range|Caret} range
     * @param {number} [numChars]
     */
    this.remove = function (range, numChars) {
      //var startNode, endNode, startParent, walker, current, prev, startRemoved, currentParent, a, b;
      var startNode, endNode, walker, current, startParent, startRemoved, currentParent, a, b;
      if (arguments.length === 2) {
        range = Type.Range.fromCaret(range, numChars);
      }
      startNode = range.splitStartContainer();
      endNode = range.splitEndContainer();
      startParent = startNode.parentNode;
      walker = this._type.createDomWalker(endNode, 'textNode');
      //current      = endNode;
      startRemoved = false;
      //prev = endNode;
      if (!this._root.contains(startNode) || !this._root.contains(endNode)) {
        Type.Development.debug('The give startNode and endNode are not contained by the editor.');
        return this;
      }
      while (!startRemoved) {
        current = walker.getNode();
        walker.prev();
        a = current === endNode && range.endOffset === 0;
        b = current !== startNode && current === Type.DomWalker.first(current.parentNode, 'textNode');
        if (a || b) {
          currentParent = current.parentNode;
          Type.DomUtilities.moveAfter(walker.getNode(), current.parentNode.childNodes);
          Type.DomUtilities.removeVisible(currentParent);
        }
        startRemoved = current === startNode;
        Type.DomUtilities.removeVisible(current);  //current = walker.getNode();
      }
      /*while (!startRemoved) {
      
            prev = Type.DomWalker.prev(current, 'text');
      
            a = (current === endNode && range.endOffset === 0);
            b = (current !== startNode && current === Type.DomWalker.first(current.parentNode, 'text'));
      
            if (a || b) {
              currentParent = current.parentNode;
              Type.DomUtilities.moveAfter(prev, current.parentNode.childNodes);
              Type.DomUtilities.removeVisible(currentParent);
            }
      
            startRemoved = current === startNode;
            Type.DomUtilities.removeVisible(current);
            current = prev;
      
          }*/
      startParent.normalize();
      //startNode.parentNode.normalize();
      return this;
    };
  }.call(Type.Writer.prototype));
  exports = Type.Writer;
  return exports;
}(writer);
formatter = function (exports) {
  var Type = core;
  /**
   *
   * @param {Type} type
   * @constructor
   */
  Type.Formatter = function (type) {
    this._type = type;
  };
  (function () {
    /**
     * A list of tags that are displayed inline. We generate different markup
     * for inline and block tags. We use this array as reference to determine
     * what kind of markup to generate.
     *
     * todo move me to dom utils
     *
     * @type {string[]}
     * @private
     */
    this._inlineTags = [
      'strong',
      'em',
      'u',
      's'
    ];
    /**
     * A list of tags that are displayed as block elements. We generate different
     * markup for inline and block tags. We use this array as reference to determine
     * what kind of markup to generate.
     *
     * todo move me to dom utils
     *
     * @type {string[]}
     * @private
     */
    this._blockTags = [
      'h1',
      'h2',
      'h3',
      'h4',
      'h5',
      'h6',
      'blockquote'
    ];
    /**
     * Will call either this.inline, this.block or this._noop depending on
     * whether the given tag is an inline or block element or we do not know
     * this tag yet (the latter would call _noop which would utter no action).
     *
     * @param {String} tag - The tag that we want to format the text with
     * @param {Type.Range} typeRange - An object containing data on which part
     *     of the text to format
     * @param {...*} params - Any number of arguments that specify attributes
     *     for the tag
     * @returns {Element[]} - The elements created by the formatting function
     */
    this.format = function (tag, typeRange, params) {
      typeRange.ensureIsInside(this._type.getRoot());
      return this._handlerFor(tag).apply(this, arguments);
    };
    /**
     *
     * @param tag
     * @param range
     * @returns {*}
     */
    this.removeFormat = function (tag, range) {
      var startNode = this._getStartNode(tag, range), dom = this._type.createDomWalker(startNode), next;
      do {
        Type.DomUtilities.removeTag(dom.getNode(), tag, false);
        next = dom.next();
      } while (next && !next.contains(range.endContainer));
      // !== range.endContainer);
      return this;
    };
    /**
     *
     * @param tag
     * @param typeRange
     * @param params
     * @returns {Type.Formatter|Element[]}
     */
    this.inline = function (tag, typeRange, params) {
      var args, startNode, endNode, enclosingTag, selPositions;
      // If the selection is enclosed the tag we want to format with
      // remove formatting from selected area
      if (enclosingTag = typeRange.elementEnclosingStartAndEnd(tag)) {
        return this.removeInline(enclosingTag, typeRange);  // Otherwise add formatting to selected area
      } else {
        startNode = this._getStartNode(tag, typeRange);
        endNode = this._getEndNode(tag, typeRange);
        params = Array.prototype.slice.call(arguments, 2);
        args = [
          tag,
          startNode,
          endNode
        ].concat(params);
        return this.insertInline.apply(this, args);
      }
    };
    /**
     * This method will wrap the given tag around (and including) all elements
     * between the startNode and endNode and try to maintain simple and valid
     * HTML. The tag should be an "inline"-element, for "block" elements use
     * {block}. Both methods have a different behaviour when generating markup.
     *
     * @param {String} tag
     * @param {Node} startNode
     * @param {Node} endNode
     * @param {...*} [params]
     * @returns {Element[]} - The elements created by the formatting function
     */
    this.insertInline = function (tag, startNode, endNode, params) {
      // Required variables
      var currentNode = startNode, createdNodes = [], nodesToWrap = [], nextNode;
      // Collect the startNode and all its siblings until we
      // found the endNode or a node containing it
      while (currentNode && !currentNode.contains(endNode)) {
        nodesToWrap.push(currentNode);
        currentNode = currentNode.nextSibling;
      }
      // If the node where we stopped is the endNode, add it
      // to our collection of nodes
      if (currentNode === endNode) {
        nodesToWrap.push(currentNode);
      }
      // If the node where we stopped contains the endNode,
      // apply this algorithm on it recursively
      if (currentNode && Type.DomUtilities.containsButIsnt(currentNode, endNode)) {
        createdNodes.concat(this.insertInline(tag, currentNode.firstChild, endNode));
      }
      // If we did not find the endNode but there are no more
      // siblings, find the next node in the document flow and
      // apply this algorithm on it recursively
      if (currentNode === null) {
        nextNode = Type.DomWalker.next(startNode.parentNode.lastChild, this._type.getRoot());
        createdNodes.concat(this.insertInline(tag, nextNode, endNode));
      }
      // Wrap the nodes we got so far in the provided tag
      createdNodes.push(Type.DomUtilities.wrap(tag, nodesToWrap));
      // Return all nodes that have been created
      return createdNodes;
    };
    /**
     *
     * @param {Node} enclosingTag
     * @param {Type.Range} typeRange
     * @returns {Type.Formatter}
     */
    this.removeInline = function (enclosingTag, typeRange) {
      var tagName = enclosingTag.tagName, tagPositions = Type.Range.fromElement(enclosingTag).save(this._type.getRoot()), selPositions = typeRange.save(this._type.getRoot()), leftRange, rightRange;
      Type.DomUtilities.unwrap(enclosingTag);
      leftRange = Type.Range.fromPositions(this._type.getRoot(), tagPositions.start, selPositions.start);
      if (!leftRange.isCollapsed()) {
        this.inline(tagName, leftRange);
      }
      rightRange = Type.Range.fromPositions(this._type.getRoot(), selPositions.end, tagPositions.end);
      if (!rightRange.isCollapsed()) {
        this.inline(tagName, rightRange);
      }
      return this;
    };
    /**
     *
     * @param cmd
     * @param typeRange
     * @param params
     * @returns {Type.Formatter}
     * @private
     */
    this.block = function (cmd, typeRange, params) {
      return this.inline.apply(this, arguments);
    };
    /**
     *
     * @param tag
     * @param typeRange
     * @returns {*}
     * @private
     */
    this._getStartNode = function (tag, typeRange) {
      return typeRange.startTagIs(tag) ? typeRange.getStartElement() : typeRange.splitStartContainer();
    };
    /**
     *
     * @param tag
     * @param typeRange
     * @returns {*}
     * @private
     */
    this._getEndNode = function (tag, typeRange) {
      return typeRange.endTagIs(tag) ? typeRange.getEndElement() : typeRange.splitEndContainer();
    };
    /**
     * Takes a tag name and returns the handler function for formatting
     * the DOM with this tag by checking if it is an inline or block tag.
     *
     * Todo Maybe use fallback http://stackoverflow.com/a/2881008/1183252 if tag is not found
     *
     * @param {String} tag - The name of the tag that the DOM should be
     *     formatted with.
     * @returns {inline|block|_noop} - The handler function for inline
     *     or block tags, or _noop if the tag is unknown.
     * @private
     */
    this._handlerFor = function (tag) {
      tag = tag.toLowerCase();
      if (this._inlineTags.indexOf(tag) > -1)
        return this.inline;
      if (this._blockTags.indexOf(tag) > -1)
        return this.block;
      Type.Development.debug('Tag "' + tag + '" not implemented');
      return this._noop;
    };
    /**
     * Multi-purpose no-op handler
     *
     * @returns {Type.Formatter}
     * @private
     */
    this._noop = function () {
      return this;
    };
  }.call(Type.Formatter.prototype));
  exports = Type.Formatter;
  return exports;
}(formatter);
caret = function (exports) {
  var Type = core;
  /**
   * An editor's caret. We cannot use the browser's native caret since we do not utilize
   * native inputs (a textarea or an element that is set to contenteditable). We emulate
   * a caret with a blinking div. This class manages that div and provides methods to
   * position it.
   *
   * Creates a new Caret and adds a hidden div (visual representation of the caret) to
   * the DOM
   *
   * @param {Node|{constrainingNode:Node,color:string}|Type} options
   * @class Caret
   * @constructor
   */
  Type.Caret = function (options) {
    options = options || {
      constrainingNode: null,
      color: null
    };
    if (options.typeEditor === true) {
      options = {
        constrainingNode: options.getRoot(),
        color: null
      };
    }
    if (Type.DomUtilities.isNode(options)) {
      options = {
        constrainingNode: options,
        color: null
      };
    }
    this.callbacks = {};
    this._constrainingNode = options.constrainingNode || document.body;
    this.caretEl = this._createElement(options.color);  //this.moveTo(this._constrainingNode);
                                                        //this._hide();
  };
  (function () {
    /**
     * The id attribute of the caret container element as created by
     * _getElementContainer()
     *
     * @type {string}
     * @private
     */
    this._containerId = Type.Settings.prefix + 'caret-container';
    /**
     * Moves the caret left by one character
     *
     * @returns {Type.Caret}
     */
    this.moveLeft = function () {
      if (this.offset <= this._visibleTextOffsets(this.textNode).start) {
        var prevTextNode = this._prevTextNode(this.textNode);
        if (prevTextNode !== null)
          this.moveTo(prevTextNode, this._visibleTextOffsets(prevTextNode).end);
      } else {
        this._setOffset(this.offset - 1);
      }
      return this;
    };
    /**
     * Moves the caret right by one character
     *
     * @returns {Type.Caret}
     */
    this.moveRight = function () {
      if (this.offset >= this._visibleTextOffsets(this.textNode).end) {
        var nextTextNode = this._nextTextNode(this.textNode);
        if (nextTextNode !== null)
          this.moveTo(nextTextNode, this._visibleTextOffsets(nextTextNode).start);
      } else {
        this._setOffset(this.offset + 1);
      }
      return this;
    };
    /**
     * Moves the caret up by one line.
     * Tries to preserve horizontal position.
     *
     * Todo prevNode handling not nice
     * Todo should only walk 1 line
     *
     * Internally, this will create a collapsed range at the caret's offset and move
     * it left, character by character, and stop in the line above the caret when it's
     * horizontally aligned with it. The caret will then be moved to that position.
     *
     * @returns {Type.Caret}
     */
    this.moveUp = function () {
      // Shorthand variables
      var node = this.textNode, offset = this.offset, prevNode = node;
      // Initial range and positions
      var range = this._createRange(node, offset), rangePos = this._getPositionsFromRange(range), caretPos = this._getRectAtOffset(this.offset), lastRangeLeft;
      // Move the range as described in the method's description
      while (prevNode !== null  // && offset > 0 &&
&& (!rangePos || (rangePos.top == caretPos.top || rangePos.left > caretPos.left))) {
        if (offset <= 0) {
          prevNode = this._prevTextNode(node);
          if (prevNode !== null) {
            node = prevNode;
            offset = prevNode.length;  // TODO Check auf !rangePos ist nicht nötig wenn _visibleTextOffsets verwendet werden, da unsichtbarer text nie selektiert wird
          }
        } else {
          offset--;
        }
        range.setStart(node, offset);
        range.collapse(true);
        lastRangeLeft = rangePos.left;
        rangePos = this._getPositionsFromRange(range);
      }
      // If the range moved up, check 2 characters above the caret to find a precise pos.
      if (rangePos.top < caretPos.top) {
        if (this._compareDeltaTo(caretPos.left, lastRangeLeft, rangePos.left) == -1) {
          offset += 1;
        }
        this.moveTo(node, offset);
      }
      // Chaining
      return this;
    };
    /**
     * Moves the caret down by one line.
     * Tries to preserve horizontal position.
     *
     * Todo nextNode handling not nice
     * Todo should only walk 1 line
     *
     * @returns {Type.Caret}
     */
    this.moveDown = function () {
      // Shorthand variables
      var node = this.textNode, offset = this.offset, nextNode = node;
      // We are gonna create a range and move it through
      // the text until it is positioned 1 line below
      // the caret's position at around the same horizontal
      // position
      var range = this._createRange(node, offset), rangePos = this._getPositionsFromRange(range), caretPos = this._getRectAtOffset(this.offset), visibleText = this._visibleTextOffsets(node), lastRangeRight;
      // Move the range right letter by letter. The range will start
      // in the same line and we keep moving it until it reaches the
      // next line and stop moving when it has moved further right
      // than the caret. That means the range will be one line below
      // the caret and in about the same horizontal position.
      while (nextNode !== null  // && offset < node.length &&
&& (!rangePos || (rangePos.bottom == caretPos.bottom || rangePos.right < caretPos.right))) {
        // TODO gucken ob sich das noch irgendwie aufhängen kann wenn caret am ende des textes ist und rangePos nicht gesetzt ist
        if (offset >= visibleText.end) {
          nextNode = this._nextTextNode(node);
          if (nextNode !== null) {
            node = nextNode;
            visibleText = this._visibleTextOffsets(node);
            offset = 0;
          }
        } else {
          offset++;
        }
        range.setEnd(node, offset);
        range.collapse(false);
        lastRangeRight = rangePos.right;
        rangePos = this._getPositionsFromRange(range);
      }
      // The text might have only one line, we check to see if the range
      // has actually moved lower than the caret and then move the caret
      // In any case we moved the offset too far by 1 character so we
      // we need to subtract it
      if (rangePos.bottom > caretPos.bottom) {
        if (this._compareDeltaTo(caretPos.right, lastRangeRight, rangePos.right) == -1) {
          offset -= 1;
        }
        this.moveTo(node, offset);
      }
      // Chaining
      return this;
    };
    /**
     * Moves the charet by the number of chars passed to as numChars
     * @param {number} numChars - The number of chars the caret should be moved by.
     *     Accepts negative values.
     * @returns {*}
     */
    this.moveBy = function (numChars) {
      var offset = this.getOffset();
      if (offset === null)
        return this;
      this.setOffset(Math.max(0, this.getOffset() + numChars));
      return this;
    };
    /**
     * Places the caret in a text node at a given position
     *
     * @param {Node} node - The (text) {Node} in which the caret should be placed
     * @param {number} [offset=0] - The character offset where the caret should be moved to
     * @returns {Type.Caret}
     */
    this.moveTo = function (node, offset) {
      if (node.nodeType !== Node.TEXT_NODE) {
        node = Type.DomWalker.first(node, 'text');
      }
      if (node === null) {
        throw new Error('Node parameter must be or contain a text node');
      }
      if (node === this.textNode && offset === null) {
        return this;
      }
      this.textNode = node;
      this._setOffset(offset || 0);
      return this;
    };
    /**
     * Inserts a given {string} at the caret's current offset in the caret's
     * current text node
     *
     * Todo this method needs to go somewhere else
     *
     * @param {string} str - The {string} that will be be inserted
     * @returns {Type.Caret}
     */
    this.insertText = function (str) {
      this._callbacksFor('insertText', str);
      if (/^[\n\r]+$/.test(str)) {
        var newNode = this.textNode.splitText(this.offset);
        newNode.parentNode.insertBefore(document.createElement('br'), newNode);
        this.moveTo(newNode, 0);
        return this;
      } else {
        var nodeText = this.textNode.nodeValue;
        if (this.offset > 0) {
          this.textNode.nodeValue = nodeText.substring(0, this.offset) + str + nodeText.substring(this.offset, nodeText.length);
        } else {
          this.textNode.nodeValue = str + nodeText;
        }
        this._setOffset(this.offset + str.length);
        return this;
      }  /*
              var nodeText = this.textNode.nodeValue,
              splitText, i, newTextNodes = [],
              parentNode = this.textNode.parentNode,
              tmpNode;
         
              if (this.offset > 0) {
               nodeText = nodeText.substring(0, this.offset)
                 + str
                 + nodeText.substring(this.offset, nodeText.length);
             } else {
               nodeText = str + nodeText;
             }
         
             splitText = nodeText.split(/(?:\r\n|\r|\n)/g);
         
             this.textNode.nodeValue = splitText[0];
         
             for(i=1; i<splitText.length; i++) {
               tmpNode = document.createTextNode(splitText[i]);
               parentNode.insertBefore(tmpNode, this.textNode.nextSibling);
               if(i < splitText.length - 1)
                 parentNode.insertBefore(document.createElement('br'), this.textNode.nextSibling);
             }
         
             this.moveTo(tmpNode, tmpNode.length);
             */
    };
    /**
     * Removes one character left from the current offset
     * and moves the caret accordingly
     *
     * Todo this method needs to go somewhere else
     *
     * @param {number} [numChars] - Home many characters should be removed
     *     from the caret's position. A negative number will remove
     *     characters left from the caret, a positive number from the right.
     * @returns {Type.Caret}
     */
    this.removeCharacter = function (numChars) {
      numChars = numChars || -1;
      if (this.offset <= 0 && numChars < 0 || this.offset >= this.textNode.length && numChars > 0) {
        return this;
      }
      this._callbacksFor('removeCharacter', numChars);
      var str = this.textNode.nodeValue;
      if (numChars < 0) {
        this.textNode.nodeValue = str.substring(0, this.offset + numChars) + str.substring(this.offset, str.length);
        this._setOffset(this.offset + numChars);
      } else {
        this.textNode.nodeValue = str.substring(0, this.offset) + str.substring(this.offset + numChars, str.length);
      }
      return this;
    };
    /**
     * Todo JSDOC
     *
     * @param functionName
     * @param callback
     * @returns {Type.Caret}
     */
    this.registerCallback = function (functionName, callback) {
      this.callbacks[functionName] = this.callbacks[functionName] || [];
      this.callbacks[functionName].push(callback);
      return this;
    };
    /**
     * Removes the caret div from the DOM. Also removes the caret
     * container if there are no more carets in it
     *
     * @returns {Type.Caret}
     */
    this.destroy = function () {
      if (typeof this.caretEl !== 'object') {
        return this;
      }
      var container = this._getElementContainer();
      container.removeChild(this.caretEl);
      if (!container.hasChildNodes()) {
        container.parentNode.removeChild(container);
      }
      this.caretEl = null;
      return this;
    };
    /**
     * Returns the offset of the caret in the text
     * To be specific, this returns the character offset relative to the
     * given constraining element.
     *
     * @returns {number|null}
     */
    this.getOffset = function () {
      if (!this.textNode)
        return null;
      return Type.TextWalker.offset(this._constrainingNode, this.textNode, 0, this.offset);
    };
    /**
     * todo unify with moveTo API
     * @param offset
     * @returns {*}
     */
    this.setOffset = function (offset) {
      var t = Type.TextWalker.nodeAt(this._constrainingNode, offset);
      this.moveTo(t.node, t.offset);
      return this;
    };
    /**
     * Returns the offset of the caret relative to its current text node
     * todo Use this method on every public access to this variable
     * todo make offset private
     * @returns {number|null}
     */
    this.getNodeOffset = function () {
      return this.offset;
    };
    /**
     * Getter for this instance's text node
     * todo Use this method on every public access to this variable
     * todo make textNode private
     * @returns {Node|null}
     */
    this.getNode = function () {
      return this.textNode;
    };
    /**
     * Sets the offset and displays the caret at the according
     * position
     *
     * @param {number} offset - The offset that should be set
     * @returns {Type.Caret}
     */
    this._setOffset = function (offset) {
      this.offset = offset;
      this._moveElToOffset();
      this._resetBlink();
      this._scrollIntoView();
      this._callbacksFor('_setOffset');
      return this;
    };
    /**
     * Moves the caret div to the position of the current offset
     *
     * @returns {Type.Caret}
     * @private
     */
    this._moveElToOffset = function () {
      var rect = this._getRectAtOffset(this.offset);
      this._moveElTo(rect.left, rect.top);
      this._setElHeight(rect.bottom - rect.top);
      return this;
    };
    /**
     * Moves the caret to the given position
     *
     * @param {number} x Horizontal position the caret should be moved to
     * @param {number} y Vertical position the caret should be moved to
     * @returns {Type.Caret}
     * @private
     */
    this._moveElTo = function (x, y) {
      this.caretEl.style.left = x + 'px';
      this.caretEl.style.top = y + 'px';
      return this;
    };
    /**
     * Todo jsdoc
     *
     * @param h
     * @returns {*}
     * @private
     */
    this._setElHeight = function (h) {
      this.caretEl.style.height = h + 'px';
      return this;
    };
    /**
     * Scrolls page to show caret
     *
     * @returns {Type.Caret}
     * @private
     */
    this._scrollIntoView = function () {
      //this.caretEl.scrollIntoView();
      return this;
    };
    /**
     * Makes the caret blink
     *
     * @returns {Type.Caret}
     */
    this._blink = function () {
      this._removeClass(this.caretEl, 'hide');
      this._addClass(this.caretEl, 'blink');
      return this;
    };
    /**
     * Hides the caret
     *
     * @returns {Type.Caret}
     */
    this._hide = function () {
      this._removeClass(this.caretEl, 'blink');
      this._addClass(this.caretEl, 'hide');
      return this;
    };
    /**
     * Resets the blink animation by recreating the caret div element
     * Todo Maybe find a better way to reset the blink animation, DOM = slow
     *
     * @returns {Type.Caret}
     * @private
     */
    this._resetBlink = function () {
      var newCaret = this.caretEl.cloneNode(true);
      this.caretEl.parentNode.replaceChild(newCaret, this.caretEl);
      this.caretEl = newCaret;
      return this;
    };
    /**
     * Todo Maybe make a magic function that calls callbacks for functions automatically
     *
     * @param functionName
     * @param params
     * @private
     */
    this._callbacksFor = function (functionName, params) {
      var i;
      params = Array.prototype.slice.call(arguments, 1);
      if (this.callbacks[functionName]) {
        for (i = 0; i < this.callbacks[functionName].length; i++) {
          this.callbacks[functionName][i].apply(this, params);
        }
      }
    };
    /**
     * TODO Possible code duplication with other code operating on the DOM like {BrowserInput}
     * TODO Caching instead of traversing every time
     * TODO We check for the _constrainingNode but this concept isn't really/properly used by other parts of the code
     *
     * @param el
     * @param returnMe
     * @returns {*}
     * @private
     */
    this._nextTextNode = function (el, returnMe) {
      var parent = el.parentNode;
      if (returnMe === true && this._isTextNodeWithContents(el)) {
        return el;
      }
      if (el.childNodes.length) {
        return this._nextTextNode(el.childNodes[0], true);
      }
      if (el.nextSibling !== null) {
        return this._nextTextNode(el.nextSibling, true);
      }
      while (parent !== this._constrainingNode) {
        if (parent.nextSibling !== null) {
          return this._nextTextNode(parent.nextSibling, true);
        }
        parent = parent.parentNode;
      }
      return null;
    };
    /**
     * TODO Possible code duplication with other code operating on the DOM like {BrowserInput}
     * TODO Caching instead of traversing every time
     * TODO We check for the _constrainingNode but this concept isn't really/properly used by other parts of the code
     *
     * @param el
     * @param returnMe
     * @returns {*}
     * @private
     */
    this._prevTextNode = function (el, returnMe) {
      var parent = el.parentNode;
      if (returnMe === true && this._isTextNodeWithContents(el)) {
        return el;
      }
      if (el.childNodes.length) {
        return this._prevTextNode(el.childNodes[el.childNodes.length - 1], true);
      }
      if (el.previousSibling !== null) {
        return this._prevTextNode(el.previousSibling, true);
      }
      while (parent !== this._constrainingNode) {
        if (parent.previousSibling !== null) {
          return this._prevTextNode(parent.previousSibling, true);
        }
        parent = parent.parentNode;
      }
      return null;
    };
    /**
     * Todo: code duplication in browser.js, there should be a dom util module
     * @param node
     * @returns {boolean}
     * @private
     */
    this._isTextNodeWithContents = function (node) {
      return node.nodeType == 3 && /[^\t\n\r ]/.test(node.textContent);
    };
    /**
     * Finds the whitespace at the beginning and the end of a text node and
     * returns their lengths
     *
     * @param textNode
     * @returns {{start: number, end: number}}
     * @private
     */
    this._visibleTextOffsets = function (textNode) {
      var startWhitespace = textNode.nodeValue.match(/^[\t\n\r ]+/g) || [''];
      var endWhitespace = textNode.nodeValue.match(/[\t\n\r ]+$/g) || [''];
      return {
        start: startWhitespace[0].length,
        end: textNode.nodeValue.length - endWhitespace[0].length
      };
    };
    /**
     * Utility method to add a class to an element
     * Todo There should be a separate utility module for stuff like this - yes dom_utilities
     *
     * @param {Element} el - The {Element} that the class should be added to
     * @param {string} className - The class to be removed
     * @returns {Type.Caret}
     * @private
     */
    this._addClass = function (el, className) {
      if (el.classList) {
        el.classList.add(className);
      } else {
        el.className += ' ' + className;
      }
      return this;
    };
    /**
     * Utility method to remove a class from an element
     * Todo There should be a separate utility module for stuff like this - yes dom_utilities
     *
     * @param {Element} el - The {Element} that the class should be removed from
     * @param {string} className - The class to be removed
     * @returns {Type.Caret}
     * @private
     */
    this._removeClass = function (el, className) {
      if (el.classList) {
        el.classList.remove(className);
      } else {
        var regex = new RegExp('(^|\\b)' + className.split(' ').join('|') + '(\\b|$)', 'gi');
        el.className = el.className.replace(regex, ' ');
      }
      return this;
    };
    /**
     * Calculates The delta between a given the pivot (a {number}) and a as
     * well as b (both {number}s) and returns -1 if a is closer to pivot,
     * 1 of b is closer to pivot and 0 if both numbers are equally close.
     *
     *
     * @param {number} pivot - A number to which a and be will be compared to
     * @param {number} a - An arbitrary number
     * @param {number} b - An arbitrary number
     * @returns {number}
     * @private
     */
    this._compareDeltaTo = function (pivot, a, b) {
      var deltaA = Math.abs(pivot - a), deltaB = Math.abs(pivot - b);
      if (deltaA == deltaB)
        return 0;
      return deltaA < deltaB ? -1 : 1;
    };
    /**
     * Returns a {ClientRect} with the boundaries enclosing a character at a
     * given offset in a text node
     *
     * @param {Node} [node=this.textNode] - The text node which containing the
     *     character we which to fetch the boundaries of.
     * @param {number} offset - The offset of the character we which to fetch
     *     the boundaries of
     * @returns {{top: number, right: number, bottom: number, left: number}}
     * @private
     */
    this._getRectAtOffset = function (node, offset) {
      if (typeof node === 'number') {
        offset = node;
        node = this.textNode;
      }
      return this._getPositionsFromRange(this._createRange(node, offset));
    };
    /**
     * Returns the positions from a {ClientRect} relative to the scroll
     * position
     *
     * @param {Range} range The {Range} that should be measured
     * @returns {{top: number, right: number, bottom: number, left: number}}
     * @private
     */
    this._getPositionsFromRange = function (range) {
      var scroll = this._getScrollPosition();
      var rect = range.getClientRects()[0];
      if (!rect) {
        return false;
      }
      return {
        top: rect.top + scroll.top,
        right: rect.right + scroll.left,
        bottom: rect.bottom + scroll.top,
        left: rect.left + scroll.left
      };
    };
    /**
     * Return's the window's horizontal an vertical scroll positions
     *
     * @returns {{top: (number), left: (number)}}
     * @private
     */
    this._getScrollPosition = function () {
      return {
        top: window.pageYOffset || document.documentElement.scrollTop,
        left: window.pageXOffset || document.documentElement.scrollLeft
      };
    };
    /**
     * Creates a {Range} and returns it
     *
     * @param {Node} startNode - The node in which the created range should begin
     * @param {number} start - The offset at which the range should start
     * @param {number} [end=start] - The offset at which the range should end
     *     Optional. Defaults to the start offset.
     * @param {Node} [endNode=node] - The node in which the created range should end.
     *     Optional. Defaults to the start node.
     * @returns {Range}
     * @private
     */
    this._createRange = function (startNode, start, end, endNode) {
      var range = window.document.createRange();
      range.setEnd(endNode || startNode, end || start);
      range.setStart(startNode, start);
      return range;
    };
    /**
     * Creates a div (the visual representation of the caret) and returns it.
     *
     * @returns {HTMLElement}
     * @private
     */
    this._createElement = function (color) {
      var container = this._getElementContainer(), el = window.document.createElement('div');
      el.className = Type.Settings.prefix + 'caret ' + color;
      container.appendChild(el);
      return el;
    };
    /**
     * All div representations of carets will be appended to a single
     * container. This method returns this container and creates it
     * if it has not been created yet.
     *
     * Todo use container from dom_utilites
     *
     * @returns {HTMLElement}
     * @private
     */
    this._getElementContainer = function () {
      var container = window.document.getElementById(this._containerId);
      if (container === null) {
        container = window.document.createElement('div');
        container.setAttribute('id', this._containerId);
        window.document.body.appendChild(container);
      }
      return container;
    };
  }.call(Type.Caret.prototype));
  exports = Type.Caret;
  return exports;
}(caret);
selection_overlay = function (exports) {
  var Type = core;
  /**
   *
   * todo internal differenciation / abstraction of x and y *and scroll positions* for easier redrawing
   *
   * @param {number} [x1] - Horizontal position of the overlay
   * @param {number} [y1] - Vertical position of the overlay
   * @param {number} [x2] - x2 of the overlay
   * @param {number} [y2] - y2 of the overlay
   * @param {boolean} [show] - Set to false if you do not wish
   *     for the element to be shown. Defaults to true
   * @constructor
   */
  Type.SelectionOverlay = function (x1, y1, x2, y2, show) {
    if (show !== false) {
      this.show(x1, y1, x2, y2);
    }
    this._setValues(x1, y1, x2, y2);
    this._anchor = {
      x: x1,
      y: y1
    };
  };
  (function () {
    /**
     * Will set the position and dimension values and update
     * the div styles
     *
     * @param {number|string} [x1] - Horizontal position of the overlay
     *     or either one of the strings 'left', 'right' or 'line', which
     *     will span the overlay to the left side of the line of the
     *     textNode, the right side or the entire line
     * @param {number} [y1] - Vertical position of the overlay
     * @param {number} [x2] - x2 of the overlay
     * @param {number} [y2] - y2 of the overlay
     * @returns {Type.SelectionOverlay} - This instance
     */
    this.set = function (x1, y1, x2, y2) {
      if (x1 === 'left') {
        x1 = this._textleft();
        x2 = null;
      }
      if (x1 === 'right') {
        x1 = null;
        x2 = this._textRight();
      }
      if (x1 === 'line') {
        x1 = this._textleft();
        x2 = this._textRight();
      }
      x1 = x1 === undefined ? null : x1;
      y1 = y1 === undefined ? null : y1;
      x2 = x2 === undefined ? null : x2;
      y2 = y2 === undefined ? null : y2;
      this._draw(x1, y1, x2, y2);
      this._setValues(x1, y1, x2, y2);
      return this;
    };
    /**
     *
     * @param x1
     * @param y1
     * @param x2
     * @param y2
     * @returns {Type.SelectionOverlay} - This instance
     */
    this.show = function (x1, y1, x2, y2) {
      this._el = this._createElement();
      this._draw(x1, y1, x2, y2);
      return this;
    };
    /**
     *
     * @returns {Type.SelectionOverlay} - This instance
     */
    this.hide = function () {
      Type.DomUtilities.removeElement(this._el);
      this._el = null;
      return this;
    };
    /**
     *
     * @param {number|string} x
     * @param {number} [y]
     * @returns {Type.SelectionOverlay} - This instance
     */
    /*this.anchor = function (x, y) {
    
        if (x === 'left') {
          x = this._textleft();
          y = null;
        }
    
        if (x === 'right') {
          x = this._textRight();
          y = null;
        }
    
        if (x !== null && x !== undefined) {
          this._anchor.x = x;
        }
    
        if (y !== null && y !== undefined) {
          this._anchor.y = y;
        }
    
        return this;
    
      };*/
    /**
     * Sets the horizontal start or end of this overlay depending
     * whether the value given is left or right of the anchor.
     * Will also set the other end to the anchor's position.
     *
     * @param {number} x - The horizontal position
     * @returns {Type.SelectionOverlay} - This instance
     */
    /*this.setXFromAnchor = function (x) {
      if (x === null || x === undefined) {
        this.set(this._anchor.x, null, this._anchor.x, null);
      } else {
        if (x < this._anchor.x) this.set(x, null, this._anchor.x, null);
        if (x > this._anchor.x) this.set(this._anchor.x, null, x, null);
      }
      return this;
    };*/
    /**
     * Returns whether or not this overlay is actually visible
     *
     * @returns {boolean}
     */
    this.visible = function () {
      return !(this.x1 === this.x2 || this.y1 === this.y2);
    };
    /**
     * Removes the overlay div and resets all position and
     * dimension values
     *
     * @returns {Type.SelectionOverlay} - This instance
     */
    this.remove = function () {
      if (this._el) {
        Type.DomUtilities.removeElement(this._el);
      }
      this._el = null;
      this.x1 = null;
      this.y1 = null;
      this.x2 = null;
      this.y2 = null;
      this._anchor = null;
      return this;
    };
    /**
     * Sets all dimension and position values to the given
     * values unless null is given
     *
     * @param {number} [x1] - Horizontal position of the overlay
     * @param {number} [y1] - Vertical position of the overlay
     * @param {number} [x2] - x2 of the overlay
     * @param {number} [y2] - y2 of the overlay
     * @returns {Type.SelectionOverlay} - This instance
     * @private
     */
    this._setValues = function (x1, y1, x2, y2) {
      if (x1 !== null)
        this.x1 = x1;
      if (y1 !== null)
        this.y1 = y1;
      if (x2 !== null)
        this.x2 = x2;
      if (y2 !== null)
        this.y2 = y2;
      return this;
    };
    /**
     * Sets dimension and position values to th element's style
     * unless they are not different to the current values.
     *
     * @param {number} [x1] - Horizontal position of the overlay
     * @param {number} [y1] - Vertical position of the overlay
     * @param {number} [x2] - x2 of the overlay
     * @param {number} [y2] - y2 of the overlay
     * @returns {Type.SelectionOverlay} - This instance
     * @private
     */
    this._draw = function (x1, y1, x2, y2) {
      if (!this._el) {
        return this;
      }
      // If x1 has changed, reposition
      if (x1 !== null && x1 !== this.x1) {
        this._el.style.left = x1 + 'px';
      }
      // If x1 or x2 have changed, recalculate the width
      if (x1 !== null && x1 !== this.x1 || x2 !== null && x2 !== this.x2) {
        x1 = x1 !== null ? x1 : this.x1;
        x2 = x2 !== null ? x2 : this.x2;
        this._el.style.width = x2 - x1 + 'px';
      }
      // If y1 has changed, reposition
      if (y1 !== null && y1 !== this.y1) {
        this._el.style.top = y1 + 'px';
      }
      // If y1 or y2 have changed, recalculate the height
      if (y1 !== null && y1 !== this.y1 || y2 !== null && y2 !== this.y2) {
        y1 = y1 !== null ? y1 : this.y1;
        y2 = y2 !== null ? y2 : this.y2;
        this._el.style.height = y2 - y1 + 'px';
      }
      return this;
    };
    /**
     * Creates and returns the visible selection overlay element
     *
     * @returns {Element}
     * @private
     */
    this._createElement = function () {
      return Type.DomUtilities.addElement('div', 'selection');
    };
  }.call(Type.SelectionOverlay.prototype));
  /**
   *
   * @param {Range} range
   * @returns {Type.SelectionOverlay}
   */
  Type.SelectionOverlay.fromRange = function (range) {
    var rect = Type.SelectionOverlay._getPositionsFromRange(range);
    return new Type.SelectionOverlay(rect.left, rect.top, rect.right, rect.bottom, true, range.startContainer);
  };
  /**
   *
   * @param x
   * @param y
   * @returns {Type.SelectionOverlay}
   * @deprecated
   */
  //Type.SelectionOverlay.fromPosition = function (x, y) {
  //  var range = document.caretRangeFromPoint(x, y);
  //  return Type.SelectionOverlay.fromRange(range)
  //};
  /**
   * Return's the window's horizontal an vertical scroll positions
   *
   * todo code duplication to caret._getScrollPosition
   *
   * @returns {{top: (number), left: (number)}}
   * @private
   */
  Type.SelectionOverlay._getScrollPosition = function () {
    return {
      top: window.pageYOffset || document.documentElement.scrollTop,
      left: window.pageXOffset || document.documentElement.scrollLeft
    };
  };
  /**
   * Returns the positions from a {ClientRect} relative to the scroll
   * position
   *
   * todo code duplication to caret._getPositionsFromRange
   *
   * @param {Range} range The {Range} that should be measured
   * @returns {{top: number, right: number, bottom: number, left: number}}
   * @private
   */
  Type.SelectionOverlay._getPositionsFromRange = function (range) {
    var scroll = Type.SelectionOverlay._getScrollPosition();
    var rect = range.getClientRects()[0];
    if (!rect) {
      return null;
    }
    return {
      top: rect.top + scroll.top,
      right: rect.right + scroll.left,
      bottom: rect.bottom + scroll.top,
      left: rect.left + scroll.left
    };
  };
  exports = Type.SelectionOverlay;
  return exports;
}(selection_overlay);
selection = function (exports) {
  var Type = core;
  /**
   *
   * @param {Type} type
   * @constructor
   */
  Type.Selection = function (type) {
    this._init(type);
  };
  (function () {
    /**
     * Resets (removes) the current selection if there is one, sets a new anchor at
     * the given coordinates and sets up a new selection at the node and offset found
     * at the coordinates.
     *
     * @param {number} x - Absolute horizontal position on the document
     * @param {number} y - Absolute vertical position on the document
     * @returns {Type.Selection} - This instance
     */
    this.beginAt = function (x, y) {
      this.unselect();
      this._setAnchor(x, y);
      return this._startRangeAt(this._anchor.node, this._anchor.offset);
    };
    /**
     * Will move the end or the start of the selection to the node and offset found at
     * the given coordinates. Whether the start or the end will be moved depends on
     * whether the coordinates are on top / left of this selection's anchor or below /
     * right of it.
     *
     * @param {number} x - Absolute horizontal position on the document
     * @param {number} y - Absolute vertical position on the document
     * @returns {Type.Selection} - This instance
     */
    this.moveTo = function (x, y) {
      var range = Type.Range.fromPoint(x, y);
      this._addElement(range.endContainer);
      if (x < this._anchor.x || y < this._anchor.y) {
        this._moveStartTo(range.endContainer, range.endOffset);
      } else {
        this._moveEndTo(range.endContainer, range.endOffset);
      }
      return this;
    };
    /**
     * Returns the contents of the selection or null if there is no selection
     *
     * @returns {DocumentFragment}
     */
    this.getContent = function () {
      return this._range ? this._range.cloneContents() : null;
    };
    /**
     * todo we should really use type ranges and much of this implementation should go there
     * todo this does not work when spanning over multiple text nodes (for instance in case of formatting)
     * todo since multiple nodes making up a single text or sometimes even words, maybe there should be an abstraction and layer / class for this
     * @param x
     * @param y
     * @returns {*}
     */
    this.selectWordAt = function (x, y) {
      var charAtStart, charAtEnd, whitespace = new RegExp('\\s'), endLength = this._range.endContainer.nodeValue.length, startOffset = this._range.startOffset, endOffset = this._range.endOffset, startFound = false, endFound = false;
      this.beginAt(x, y);
      do {
        charAtStart = this._range.startContainer.nodeValue.charAt(this._range.startOffset - 1);
        if (startOffset > 1 && !whitespace.test(charAtStart)) {
          if (startOffset > 1) {
            startOffset -= 1;
            this._range.setStart(this._range.startContainer, startOffset);
          }
        } else {
          startFound = true;
        }
      } while (!startFound);
      do {
        charAtEnd = this._range.endContainer.nodeValue.charAt(this._range.endOffset);
        if (endOffset < endLength && !whitespace.test(charAtEnd)) {
          if (endOffset < endLength) {
            endOffset += 1;
            this._range.setEnd(this._range.endContainer, endOffset);
          }
        } else {
          endFound = true;
        }
      } while (!endFound);
      this._imitateRangeAppending();
      return this;
    };
    /**
     * Removes all selection overlays and resets internal variables.
     * @returns {Type.Selection} - This instance
     */
    this.unselect = function () {
      this._removeOverlays();
      this._elements = {};
      this._range = null;
      this._anchor = null;
      return this;
    };
    /**
     * Returns an object that can be used to recreate the current
     * selection using {@link Type.Selection#restore}
     * @returns {{from: Element, start: number, end: number}}
     */
    this.save = function () {
      return this.getRange().save(this._root);
    };
    /**
     * Selects text from an object returned by {@link Type.Selection#save}
     * or {@link Type.Range#save}
     * @param bookmark
     * @returns {Type.Selection} - This instance
     */
    this.restore = function (bookmark) {
      this.unselect();
      this._range = Type.Range.load(bookmark).getNativeRange();
      this._imitateRangeAppending();
      return this;
    };
    /**
     * Returns a {Type.Range} spanning over the currently selected text.
     * @returns {Type.Range}
     */
    this.getRange = function () {
      return Type.Range.fromRange(this._range);
    };
    /**
     * Returns the {Range} this selection spans over or null if nothing has been
     * selected yet.
     * @returns {Range|null}
     */
    this.getNativeRange = function () {
      return this._range;
    };
    /**
     * Returns the start node and offset of this selection.
     * @returns {{node: Node, offset: number}|null}
     */
    this.getStart = function () {
      if (this._range) {
        return {
          node: this._range.startContainer,
          offset: this._range.startOffset
        };
      }
      return null;
    };
    /**
     * Returns the end node and offset of this selection.
     * @returns {{node: Node, offset: number}|null}
     */
    this.getEnd = function () {
      if (this._range) {
        return {
          node: this._range.endContainer,
          offset: this._range.endOffset
        };
      }
      return null;
    };
    /**
     * Returns whether or not this selection is visible. By checking if there currently
     * are any overlays and if the first overlay is actually visible. There should be
     * no case where there are visible overlays but the first overlay wouldn't be visible,
     * so this is a quick and performant way to check for the selection's visibility.
     *
     * @returns {boolean} - True if selection is hidden, false if there is a selection
     */
    this.collapsed = function () {
      return !this._overlays.length || !this._overlays[0].visible();
    };
    /**
     * Alias method for select() for better code readability. For initialization
     * all variables should be set to their default values. This is what select
     * does for us.
     *
     * @param {Type} type
     * @returns {Type.Selection} - This instance
     * @private
     */
    this._init = function (type) {
      this._root = type.getRoot();
      return this.unselect();
    };
    /**
     * Creates a new {Range}, which will be the basis for drawing and this selection.
     * todo Use {Type.Range}? Should be cool if we don't use getRects or we make Type.Range more performant
     *
     * @param {Node} node - The text node that the selection should start in
     * @param {number} offset - The offset in the text node that the selection should start in
     * @returns {Type.Selection} - This instance
     */
    this._startRangeAt = function (node, offset) {
      this._range = window.document.createRange();
      this._range.setStart(node, offset);
      this._range.setEnd(node, offset);
      return this;
    };
    /**
     *
     * @param {Node} node - The text node that the selection should end in
     * @param {number} offset - The offset in the text node that the selection should end in
     * @returns {Type.Selection} - This instance
     */
    this._moveStartTo = function (node, offset) {
      this._range.setStart(node, offset);
      this._range.setEnd(this._anchor.node, this._anchor.offset);
      this._imitateRangePrepending();
      return this;
    };
    /**
     *
     * @param {Node} node - The text node that the selection should end in
     * @param {number} offset - The offset in the text node that the selection should end in
     * @returns {Type.Selection} - This instance
     */
    this._moveEndTo = function (node, offset) {
      this._range.setStart(this._anchor.node, this._anchor.offset);
      this._range.setEnd(node, offset);
      this._imitateRangeAppending();
      return this;
    };
    /**
     * Sets the anchor node, offset and position in this screen for this selection.
     * When a user draws a selection, what is being selected depends on whether he /
     * she moves his / her mouse before or behind the point he / she started to draw
     * the selection. The information in the anchor needs to be saved to implement
     * this behaviour.
     *
     * @param {number} x - Absolute horizontal position on the document
     * @param {number} y - Absolute vertical position on the document
     * @returns {Type.Selection} - This instance
     * @private
     */
    this._setAnchor = function (x, y) {
      var range = Type.Range.fromPoint(x, y);
      this._anchor = {
        x: x,
        y: y,
        node: range.startContainer,
        offset: range.startOffset
      };
      this._addElement(this._anchor.node);
      return this;
    };
    /**
     * Creates {Type.SelectionOverlay}s that mimic the appearance of
     * the selection as drawn by {this._range}
     *
     * @returns {Type.Selection} - This instance
     * @private
     */
    this._imitateRangePrepending = function () {
      // Required variables
      var rects = Type.Range.getClientRects(this._range),
        //this._range.getClientRects(),
        draw, overlay, i;
      // Resize and add overlays to match the range's rects
      for (i = rects.length - 1; i >= 0; i -= 1) {
        if (this._overlays[i]) {
          this._overlays[i].set(rects[i].left, rects[i].top, rects[i].right, rects[i].bottom);
        } else {
          draw = !this._matchesElementDimensions(rects[i]);
          overlay = new Type.SelectionOverlay(rects[i].left, rects[i].top, rects[i].right, rects[i].bottom, draw);
          this._overlays.unshift(overlay);
        }
      }
      // Remove overlays prepending the current range's rects
      while (this._overlays.length > rects.length) {
        this._overlays.shift().remove();
      }
      // Chaining
      return this;
    };
    /**
     * Creates {Type.SelectionOverlay}s that mimic the appearance of
     * the selection as drawn by {this._range}
     *
     * @returns {Type.Selection} - This instance
     * @private
     */
    this._imitateRangeAppending = function () {
      // Required variables
      var rects = this._range.getClientRects(), draw, overlay, i;
      // Resize and add overlays to match the range's rects
      for (i = 0; i < rects.length; i += 1) {
        if (this._overlays[i]) {
          this._overlays[i].set(rects[i].left, rects[i].top, rects[i].right, rects[i].bottom);
        } else {
          draw = !this._matchesElementDimensions(rects[i]);
          overlay = new Type.SelectionOverlay(rects[i].left, rects[i].top, rects[i].right, rects[i].bottom, draw);
          this._overlays.push(overlay);
        }
      }
      // Remove overlays coming after the current range's rects
      while (this._overlays.length > rects.length) {
        this._overlays.pop().remove();
      }
      // Chaining
      return this;
    };
    /**
     * Todo scrolling
     *
     * @param {Node|Element} el - An element or a text node
     * @returns {Type.Selection} - This instance
     * @private
     */
    this._addElement = function (el) {
      var rect, key;
      el = el.nodeType === 3 ? el.parentNode : el;
      rect = el.getBoundingClientRect();
      key = this._stringifyRect(rect);
      this._elements[key] = rect;
      return this;
    };
    /**
     *
     * @param {ClientRect} rect
     * @private
     */
    this._matchesElementDimensions = function (rect) {
      var key = this._stringifyRect(rect);
      return this._elements.hasOwnProperty(key);
    };
    /**
     * Removes all selection overlays
     *
     * @returns {Type.Selection} - This instance
     * @private
     */
    this._removeOverlays = function () {
      var i;
      this._overlays = this._overlays || [];
      for (i = 0; i < this._overlays.length; i += 1) {
        this._overlays[i].remove();
      }
      this._overlays = [];
      return this;
    };
    /**
     *
     * @param {ClientRect} rect
     * @returns {string}
     * @private
     */
    this._stringifyRect = function (rect) {
      var top = rect.top.toString(), left = rect.left.toString(), bottom = rect.bottom.toString(), right = rect.right.toString();
      return top + left + bottom + right;
    };
  }.call(Type.Selection.prototype));
  exports = Type.Selection;
  return exports;
}(selection);
input = function (exports) {
  var Type = core;
  /**
   * todo pasting
   * todo trigger events
   *
   * @param {Type} type
   * @constructor
   */
  Type.Input = function (type) {
    this._type = type;
    //this._content = type.getContent();
    this._content = new Type.Content(type);
    this._writer = type.getWriter();
    this._caret = type.getCaret();
    this._selection = this._type.getSelection();
    this._el = this._createElement();
    this._elStyle = this._el.style;
    this._caretStyle = this._caret.caretEl.style;
    this._loadFilters();
    this._bindEvents();
  };
  (function () {
    /**
     * Adds a filter to the input pipeline
     *
     * @param {String} name - An identifier for the filter
     * @param {Object} filter - A filter
     * @returns {Type.Input}
     */
    this.addFilter = function (name, filter) {
      this._filters = this._filters || {};
      this._filters[name] = filter;
      return this;
    };
    /**
     * Removes a filter from the input pipeline
     *
     * @param {String} name - An identifier for the filter
     * @returns {Type.Input}
     */
    this.removeFilter = function (name) {
      this._filters = this._filters || {};
      if (this._filters.name) {
        delete this._filters.name;
      }
      return this;
    };
    /**
     * Getter for this instance's content.
     * @returns {Type.Content}
     */
    this.getContent = function () {
      return this._content;
    };
    /**
     *
     * @returns {Type.Input}
     * @private
     */
    this._loadFilters = function () {
      this._filters = this._filters || {};
      this._filters.undo = new Type.Input.Filter.Undo(this._type, this);
      this._filters.cmd = new Type.Input.Filter.Command(this._type, this);
      this._filters.caret = new Type.Input.Filter.Caret(this._type, this);
      this._filters.remove = new Type.Input.Filter.Remove(this._type, this);
      this._filters.lineBreaks = new Type.Input.Filter.LineBreaks(this._type, this);
      return this;
    };
    /**
     * Binds events on type's root element to catch keyboard
     * and mouse input.
     *
     * @returns {Type.Input}
     * @private
     */
    this._bindEvents = function () {
      this._bindKeyDownEvents();
      this._bindInputEvents();
      this._bindMouseEvents();
      return this;
    };
    /**
     * Some inputs needs to be interrupted and caught before it gets inserted
     * to the input element. This includes return keys for example
     *
     * @returns {Type.Input}
     * @private
     */
    this._bindKeyDownEvents = function () {
      this._el.addEventListener('keydown', function (e) {
        this._processFilterPipeline(e);
      }.bind(this), false);
      return this;
    };
    /**
     * Todo x-browser http://stackoverflow.com/a/8694125/1183252
     * Todo x-browser http://jsfiddle.net/MBags/ (?)
     *
     * @returns {Type.Input}
     * @private
     */
    this._bindInputEvents = function () {
      this._el.addEventListener('input', function (e) {
        this._onInput(e);
      }.bind(this), false);
      return this;
    };
    /**
     * Todo Legacy Internet Explorer and attachEvent https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/addEventListener
     *
     * @returns {Type.Input}
     * @private
     */
    this._bindMouseEvents = function () {
      var self = this;
      function dragSelection(e) {
        self._selection.moveTo(e.clientX, e.clientY);
      }
      function stopDraggingSelection() {
        document.removeEventListener('mousemove', dragSelection, false);
        document.removeEventListener('mouseup', stopDraggingSelection, false);
        self._el.innerHTML = '';
        self._el.appendChild(self._selection.getContent());
        document.execCommand('selectAll', false, null);
      }
      function startDraggingSelection(e) {
        if (e.which === 1) {
          e.preventDefault();
          self._caret._hide();
          self._selection.beginAt(e.clientX, e.clientY);
          document.addEventListener('mousemove', dragSelection, false);
          document.addEventListener('mouseup', stopDraggingSelection, false);
        }
      }
      function caret(e) {
        if (self._selection.collapsed()) {
          self._moveCaretToMousePosition(e.clientX, e.clientY);
          self._caret._blink();
        }
        self._focusInput();
      }
      function selectWord(e) {
        self._selection.selectWordAt(e.clientX, e.clientY);
      }
      function contextmenu(e) {
        if (e.which === 3) {
          self._moveCaretToMousePosition(e.clientX, e.clientY);
          self._caret._blink();
          self._moveElToPosition(e.clientX - 3, e.clientY - 3);
          self._el.focus();
          document.execCommand('selectAll', false, null);
        }
      }
      this._type.getRoot().addEventListener('contextmenu', contextmenu, false);
      this._type.getRoot().addEventListener('mousedown', startDraggingSelection, false);
      this._type.getRoot().addEventListener('mouseup', caret, false);
      this._type.getRoot().addEventListener('dblclick', selectWord, false);
      return this;
    };
    /**
     * Takes a {KeyboardEvent} and creates a {Type.Events.Input}. Then
     * iterates over all registered input filters in the pipeline and
     * has them process it in order. Will stop processing the event
     * when any handler of an input filter cancels the event. Returns
     * the resulting {Type.Events.Input}
     *
     * @param {KeyboardEvent} e
     * @returns {Type.Events.Input}
     * @private
     */
    this._processFilterPipeline = function (e) {
      var inputEvent = Type.Events.Input.fromKeyDown(e), name;
      for (name in this._filters) {
        if (this._filters.hasOwnProperty(name)) {
          this._processFilter(this._filters[name], inputEvent);
          if (inputEvent.canceled) {
            e.preventDefault();
            break;
          }
        }
      }
      if (!inputEvent.canceled) {
        if (this._el.textContent.length > 2) {
          this._type.trigger('paste', [inputEvent]);
        } else {
          this._type.trigger('input', [inputEvent]);
        }
      }
      return inputEvent;
    };
    /**
     *
     * @param filter
     * @param {Type.Events.Input} e
     * @returns {Type.Events.Input}
     * @private
     */
    this._processFilter = function (filter, e) {
      var func = filter.keys[e.key];
      if (func) {
        filter[func](e);
      }
      if (!e.canceled && filter.keys.all) {
        filter[filter.keys.all](e);
      }
      return e;
    };
    /**
     *
     * @param {InputEvent} e
     * @returns {Type.Input}
     * @private
     */
    this._onInput = function (e) {
      this._content.insert(this._caret.textNode, this._caret.offset, this._el.textContent);
      this._caret._setOffset(this._caret.offset + this._el.textContent.length);
      // todo better api
      this._el.innerHTML = '';
      return this;
    };
    /**
     *
     * @param x
     * @param y
     * @returns {*}
     * @private
     */
    this._moveCaretToMousePosition = function (x, y) {
      var range = Type.Range.fromPoint(x, y);
      if (range.startContainer.nodeType === 3) {
        this._caret.moveTo(range.startContainer, range.startOffset);
        this._caret._blink();
      }
      return this;
    };
    /**
     *
     * @param x
     * @param y
     * @returns {*}
     * @private
     */
    this._moveElToPosition = function (x, y) {
      this._el.style.left = x + 'px';
      this._el.style.top = y + 'px';
      return this;
    };
    /**
     *
     * @param sync
     * @returns {*}
     * @private
     */
    this._focusInput = function (sync) {
      if (sync) {
        this._el.focus();
      } else {
        window.setTimeout(function () {
          this._el.focus();
        }.bind(this), 0);
      }
      return this;
    };
    /**
     * Todo generalise and formalise and normalise adding elements to the domUtil.elementsContainer
     * @returns {Element}
     * @private
     */
    this._createElement = function () {
      var div = document.createElement('div');
      div.setAttribute('contenteditable', 'true');
      div.className = Type.Settings.prefix + 'input';
      Type.DomUtilities.getElementsContainer().appendChild(div);
      return div;
    };
  }.call(Type.Input.prototype));
  Type.Input.Filter = {};
  exports = Type.Input;
  return exports;
}(input);
events_type = function (exports) {
  var Type = core;
  /**
   * Creates a new Type event
   * @constructor
   */
  Type.Events.Type = function () {
    this.canceled = false;
  };
  (function () {
    /**
     * Sets or gets data for this event. Parameters can be set
     * and retrieved like in jQuery:
     *
     * Call data with no params to retrieve all data set:
     * this.data() -> {}
     *
     * Pass a single string to get specific data:
     * this.data('foo')
     *
     * Pass a name value combination to set data
     * this.data('foo', 'bar')
     *
     * Pass an object to set multiple data
     * this.data({foo: 'foo', 'bar':'bar'})
     *
     * @param {(string|Object)} data - Either a plain object
     *     with keys and values to be set or a string that will
     *     be used as a name for a data setting. If you pass a
     *     string, pass a second parameter to set that data
     *     or no second parameter to retrieve that data.
     * @param {*} [value] - If the first parameter is a string,
     *     this value will be set to the key of the given first
     *     parameter. Any arbitrary value can be set.
     * @returns {Type.Events.Type|{}|*} Returns this instance
     *     if you set data or the according value if you get
     *     data. Will return all data in an object of you pass
     *     no parameters.
     */
    this.data = function (data, value) {
      // Initialize data object if not initialized yet
      this._data = this._data || {};
      // Pass a single option name to fetch it
      if (typeof data === 'string' && arguments.length === 1) {
        return this._data[data];
      }
      // Pass an option name and a value to set it
      if (typeof data === 'string' && arguments.length === 2) {
        data = { options: value };
      }
      // Pass an object of key-values to set them
      if (typeof data === 'object') {
        Type.Utilities.extend(this._data, data);
      }
      // Data of no params have been passed, otherwise this for chaining
      return arguments.length ? this : this._data;
    };
    /**
     * Sets this event instance to be cancelled
     *
     * @param {boolean} [doCancel] - Set to false to uncancel
     *     the event. All other values or no value at all
     *     will set the event to be cancelled
     * @returns {Type.Events.Type} - This instance
     */
    this.cancel = function (doCancel) {
      this.canceled = doCancel !== false;
      return this;
    };
  }.call(Type.Events.Type.prototype));
  exports = Type.Events.Type;
  return exports;
}(events_type);
events_input = function (exports) {
  var Type = core;
  /**
   * Creates a new Type input event.
   * This is an abstraction for browser events that lead to an input in
   * the editor.
   *
   * @param {Object} options - Object holding parameters for the event
   * @param {string} [options.key] - A descriptive name for the key
   *     pressed as set in {@link Type.Events.Input.keyDownNames}.
   * @param {number} [options.keyCode] - The key code of the key pressed
   * @param {boolean} [options.shift] - Whether or not the shift key has
   *     been pressed together with the given key.
   * @param {boolean} [options.alt] - Whether or not the alt key has
   *     been pressed together with the given key.
   * @param {boolean} [options.ctrl] - Whether or not the control key has
   *     been pressed together with the given key.
   * @param {boolean} [options.meta] - Whether or not the command key has
   *     been pressed together with the given key (for os x users).
   * @constructor
   */
  Type.Events.Input = function (options) {
    options = options || {};
    this.key = options.key || null;
    this.keyCode = options.keyCode || null;
    this.shift = options.shift || false;
    this.alt = options.alt || false;
    this.ctrl = options.ctrl || false;
    this.meta = options.meta || false;
    this.cmd = !Type.Environment.mac && options.ctrl || Type.Environment.mac && options.meta;
    this.canceled = false;
  };
  /**
   * Inherit from general Type event
   */
  Type.OOP.inherits(Type.Events.Input, Type.Events.Type);
  /**
   * Maps character codes from key down events to readable names
   * @type {Object}
   */
  Type.Events.Input.keyDownNames = {
    8: 'backspace',
    9: 'tab',
    13: 'enter',
    32: 'space',
    37: 'left',
    38: 'up',
    39: 'right',
    40: 'down',
    46: 'del'
  };
  /**
   * Factory to create a {Type.Events.Input} from an {InputEvent}
   *
   * @param {InputEvent} e
   * @returns {Type.Events.Input}
   */
  Type.Events.Input.fromInput = function (e) {
    return Type.Events.Input.fromKeyDown(e);
  };
  /**
   * Factory to create a {Type.Events.Input} from a {KeyboardEvent}
   *
   * @param {KeyboardEvent} e
   * @returns {Type.Events.Input}
   */
  Type.Events.Input.fromKeyDown = function (e) {
    var charCode = typeof e.which === 'number' ? e.which : e.keyCode, options = {
        key: Type.Events.Input.keyDownNames[charCode] || charCode,
        keyCode: charCode,
        shift: e.shiftKey,
        alt: e.altKey,
        ctrl: e.ctrlKey,
        meta: e.metaKey
      };
    return new Type.Events.Input(options);
  };
  exports = Type.Events.Input;
  return exports;
}(events_input);
input_filters_caret = function (exports) {
  var Input = input;
  /**
   * Creates a caret filter. Will catch arrow key inputs,
   * move the editor's caret and cancel the event.
   *
   * @param {Type} type
   * @constructor
   */
  Input.Filter.Caret = function (type) {
    this._caret = type.getCaret();
  };
  (function () {
    this.keys = {
      left: 'moveLeft',
      up: 'moveUp',
      right: 'moveRight',
      down: 'moveDown'
    };
    /**
     * Moves the caret left
     *
     * @param {Type.Events.Input} e
     */
    this.moveLeft = function (e) {
      this._caret.moveLeft();
      e.cancel();
    };
    /**
     * Moves the caret up
     *
     * @param {Type.Events.Input} e
     */
    this.moveUp = function (e) {
      this._caret.moveUp();
      e.cancel();
    };
    /**
     * Moves the caret right
     *
     * @param {Type.Events.Input} e
     */
    this.moveRight = function (e) {
      this._caret.moveRight();
      e.cancel();
    };
    /**
     * Moves the caret down
     *
     * @param {Type.Events.Input} e
     */
    this.moveDown = function (e) {
      this._caret.moveDown();
      e.cancel();
    };
  }.call(Input.Filter.Caret.prototype));
  exports = Input.Filter.Caret;
  return exports;
}(input_filters_caret);
input_filters_undo = function (exports) {
  var Input = input;
  /**
   * Creates a caret filter. Will catch arrow key inputs,
   * move the editor's caret and cancel the event.
   *
   * @param {Type} type
   * @param {Type.Input} [input]
   * @constructor
   */
  Input.Filter.Undo = function (type, input) {
    this._undoManager = type.getUndoManager();
    this._sourceId = input.getContent().getSourceId();
  };
  (function () {
    this.keys = {
      90: 'undoRedo'  // z
    };
    /**
     * Performs undo and redo commands
     *
     * @param {Type.Events.Input} e
     */
    this.undoRedo = function (e) {
      if (e.cmd && e.shift) {
        this._undoManager.redo(this._sourceId);
        e.cancel();
      } else if (e.cmd) {
        this._undoManager.undo(this._sourceId);
        e.cancel();
      }
    };
  }.call(Input.Filter.Undo.prototype));
  exports = Input.Filter.Undo;
  return exports;
}(input_filters_undo);
input_filters_command = function (exports) {
  var Input = input;
  /**
   * Creates a command filter. Will fetch common
   * text formatting keyboard shortcuts and call
   * the according formatting methods.
   *
   * todo should listen for key codes and not keys
   *
   * @param type
   * @param {Type.Input} input
   * @constructor
   */
  Input.Filter.Command = function (type, input) {
    this._selection = type.getSelection();
    //this._formating = type.getFormatter();
    this._content = input.getContent();
  };
  (function () {
    this.keys = {
      66: 'command',
      // b
      73: 'command',
      // i
      83: 'command',
      // s
      85: 'command'  // u
    };
    this.tags = {
      66: 'strong',
      73: 'em',
      83: 's',
      85: 'u'
    };
    /**
     * todo format stuff when nothing is selected
     * @param {Type.Events.Input} e
     */
    this.command = function (e) {
      var sel;
      if (e.cmd) {
        sel = this._selection.save();
        this._content.format(this.tags[e.key], this._selection.getRange());
        this._selection.restore(sel);
        e.cancel();
      }
    };
  }.call(Input.Filter.Command.prototype));
  exports = Input.Filter.Command;
  return exports;
}(input_filters_command);
input_filters_remove = function (exports) {
  var Input = input;
  /**
   * Creates a remove filter. Will catch backspace and del key
   * inputs and remove either the currently selected text or
   * the character next to the caret.
   *
   * @param {Type} type
   * @param {Type.Input} [input]
   * @constructor
   */
  Input.Filter.Remove = function (type, input) {
    this._root = type.getRoot();
    //this._writer = type.getWriter();
    this._content = input.getContent();
    this._caret = type.getCaret();
    this._selection = type.getSelection();
  };
  (function () {
    this.keys = {
      backspace: 'remove',
      del: 'remove'
    };
    /**
     *
     * @param {Type.Events.Input} e
     */
    this.remove = function (e) {
      var range, newOffset, removeChars, moveChars;
      if (this._selection.collapsed()) {
        removeChars = e.key === 'backspace' ? -1 : 1;
        moveChars = e.key === 'backspace' ? -1 : 0;
        range = Type.Range.fromCaret(this._caret, removeChars);
        newOffset = this._caret.getOffset() + moveChars;
      } else {
        range = this._selection.getRange();
        newOffset = range.getStartOffset(this._root);
        this._selection.unselect();
        this._caret._blink();
      }
      this._caret.setOffset(newOffset);
      this._content.remove(range);  //e.cancel();
    };
  }.call(Input.Filter.Remove.prototype));
  exports = Input.Filter.Remove;
  return exports;
}(input_filters_remove);
input_filters_line_breaks = function (exports) {
  var Input = input;
  /**
   * Creates a caret filter. Will catch arrow key inputs,
   * move the editor's caret and cancel the event.
   *
   * @param {Type} type
   * @param {Type.Input} [input]
   * @constructor
   */
  Input.Filter.LineBreaks = function (type, input) {
    this._writer = type.getWriter();
    this._caret = type.getCaret();
  };
  (function () {
    /**
     * This filter will react to enter keys
     * @type {{enter: string}}
     */
    this.keys = { enter: 'insertLineBreak' };
    /**
     * Inserts a br tag
     * @param e
     */
    this.insertLineBreak = function (e) {
      var br = document.createElement('br');
      this._writer.insertHTML(this._caret.textNode, this._caret.offset, br);
      this._caret.moveRight();
      e.cancel();
    };
  }.call(Input.Filter.LineBreaks.prototype));
  exports = Input.Filter.LineBreaks;
  return exports;
}(input_filters_line_breaks);
undo_manager = function (exports) {
  var Type = core;
  /**
   *
   * @param {Type} type
   * @constructor
   */
  Type.UndoManager = function (type) {
    this._type = type;
    this._stack = [];
    this._pointer = 0;
    this.lastActionReceived = null;
    this.mergeDebounce = 500;
  };
  (function () {
    /**
     *
     * @param {Type.Actions.Type|Type.Actions.Insert|*} action
     * @returns {Type.UndoManager}
     */
    this.push = function (action) {
      this._stack.length = this._stack.length === 0 ? 0 : this._pointer + 1;
      if (this.shouldBeMerged(action)) {
        this._stack[this._pointer].merge(action);
      } else {
        this._stack.push(action);
        this._pointer = this._stack.length - 1;
      }
      this.lastActionReceived = Date.now();
      return this;
    };
    /**
     *
     * @param action
     * @returns {boolean}
     */
    this.shouldBeMerged = function (action) {
      if (this.lastActionReceived === null) {
        return false;
      }
      if (Date.now() > this.lastActionReceived + this.mergeDebounce) {
        return false;
      }
      return !!(this._stack.length && this._stack[this._pointer].mergeable(action));
    };
    /**
     *
     * @param {*} [sourceId]
     * @param {number} [steps]
     * @returns {Type.UndoManager}
     */
    this.undo = function (sourceId, steps) {
      steps = steps === undefined ? 1 : steps;
      //for (steps; steps > 0; steps -= 1) {
      //  if (this._pointer < 0) {
      //    this._pointer = -1;
      //    break;
      //  }
      //  this._stack[this._pointer].undo(this._getCharacterShift());
      //  this._pointer--;
      //}
      while (steps > 0 && this._pointer > -1) {
        if (this._stack[this._pointer].sourceId === sourceId || sourceId === undefined) {
          this._stack[this._pointer].undo(this._getCharacterShift());
          steps -= 1;
        }
        this._pointer -= 1;
      }
      return this;
    };
    /**
     *
     * @param {*} [sourceId]
     * @param {number} [steps]1
     * @returns {Type.UndoManager}
     */
    this.redo = function (sourceId, steps) {
      var stackLen = this._stack.length;
      steps = steps === undefined ? 1 : steps;
      //for (steps; steps > 0; steps -= 1) {
      //  this._pointer++;
      //  if (this._pointer > this._stack.length - 1) {
      //    this._pointer = this._stack.length - 1;
      //    break;
      //  }
      //  this._stack[this._pointer].execute(this._getCharacterShift());
      //}
      while (steps > 0 && this._pointer < stackLen) {
        this._pointer++;
        if (this._pointer > this._stack.length - 1) {
          this._pointer = this._stack.length - 1;
          break;
        }
        if (this._stack[this._pointer].sourceId === sourceId || sourceId === undefined) {
          this._stack[this._pointer].execute(this._getCharacterShift());
          steps--;
        }
      }
      return this;
    };
    /**
     * Will iterate through the stack (beginning from its end)
     * and collect all character insertions and removals and
     * return them. This can be used bei actions to shift the
     * their character offset to which they apply their changes.
     *
     * @param {number} [targetPointer] - The stack pointer
     *     to which all character shifts shall be collected
     * @returns {number[][]} - A map of insertions and removals
     *     First dimensions is at which offsets characters have
     *     changed. Second dimension is the number of characters
     *     that have been added or removed.
     * @private
     */
    this._getCharacterShift = function (targetPointer) {
      targetPointer = targetPointer === undefined ? this._pointer + 1 : targetPointer;
      var len = this._stack.length - 1, shifts = [], shift, i, j;
      for (i = len; i >= targetPointer; i -= 1) {
        shift = this._stack[i].getCharacterShift();
        for (j = 0; j < shift.length; j++) {
          shifts.push(shift[j]);
        }  //shifts.concat(shift);
      }
      return shifts;
    };
  }.call(Type.UndoManager.prototype));
  exports = Type.UndoManager;
  return exports;
}(undo_manager);
content = function (exports) {
  var Type = core;
  /**
   * Creates a new Content class
   *
   * This class can be used to manipulate the editor's
   * contents and will make sure any action performed
   * is undoable and re-doable.
   *
   * @param {Type} type
   * @constructor
   */
  Type.Content = function (type) {
    this._sourceId = this._createUniqueSourceId();
    this._undoManager = type.getUndoManager();
    this._writer = type.getWriter();
    this._formatter = type.getFormatter();
    this._root = type.getRoot();
    this._type = type;
  };
  (function () {
    /**
     * Inserts text to the editor's contents and pushes an
     * action to the undo manager{}
     *
     * @param {Text|Number} textNode - The text node in which the
     *     contents should be inserted
     * @param {Number|String} offset - The character offset in the
     *     text node at which the contents should be inserted
     * @param {String} [content] - The text that should be
     *     inserted
     * @returns {Type.Content} - This instance
     */
    this.insert = function (textNode, offset, content) {
      // If only an offset and contents were given
      if (arguments.length === 2) {
        var nodeInfo = Type.TextWalker.nodeAt(this._root, textNode);
        content = offset;
        offset = nodeInfo.offset;
        textNode = nodeInfo.node;
      }
      // Change contents
      this._writer.insertText(textNode, offset, content);
      // Undo capabilities
      var absOffset = Type.TextWalker.offset(this._root, textNode, 0, offset);
      var insertion = new Type.Actions.Insert(this._sourceId, this._type, absOffset, content);
      this._undoManager.push(insertion);
      // Chaining
      return this;
    };
    /**
     * Removes the text inside a given range from the contents
     *
     * @param {Type.Range|Number} range - The text range that should
     *     be removed from the contents. This parameter can also be
     *     the start offset
     * @param {Number} numCharacters - If this parameter is set the
     *     first parameter will be interpreted as a number and is the
     *     start offset in the text. This parameter will be the number
     *     of character to be removed beginning from the start offset.
     * @returns {Type.Content} - This instance
     */
    this.remove = function (range, numCharacters) {
      // If only an offset numCharacters were given
      if (arguments.length === 2) {
        range = Type.Range.fromPositions(this._root, range, range + numCharacters);
      }
      // Undo capabilities
      var removal = Type.Actions.Remove.fromRange(this._sourceId, this._type, range);
      this._undoManager.push(removal);
      // Change contents
      this._writer.remove(range);
      // Chaining
      return this;
    };
    /**
     * Formats a given text range
     *
     * @param {String} tag - The HTML tag the text should
     *     be formatted with
     * @param {Type.Range|number} range - The range of text
     *     that should be formatted or a number that will be
     *     the start offset of the formatting
     * @param {number} [end] - If the second parameter that
     *     was given is a start offset, this will be the end
     *     offset in the text that will be formatted.
     * @returns {Type.Content} - This instance
     */
    this.format = function (tag, range, end) {
      // If positions instead of a range were given
      if (arguments.length === 3) {
        range = Type.Range.fromPositions(this._root, range, end);
      }
      // Change contents
      var nodes = this._formatter.format(tag, range);
      // Undo capabilities
      var formatting = new Type.Actions.Format.fromRange(this._sourceId, this._type, range, tag, nodes);
      this._undoManager.push(formatting);
      // Chaining
      return this;
    };
    /**
     * Formats a given text range
     *
     * @param {String} tag - The HTML tag the text should
     *     be formatted with
     * @param {Type.Range|number} range - The range of text
     *     that should be formatted or a number that will be
     *     the start offset of the formatting
     * @param {number} [end] - If the second parameter that
     *     was given is a start offset, this will be the end
     *     offset in the text that will be formatted.
     * @returns {Type.Content} - This instance
     */
    this.removeFormat = function (tag, range, end) {
      // If positions instead of a range were given
      if (arguments.length === 3) {
        range = Type.Range.fromPositions(this._root, range, end);
      }
      // Change contents
      this._formatter.removeFormat(tag, range);
      // Chaining
      return this;
    };
    /**
     * Getter for this content's source id
     * @returns {number}
     */
    this.getSourceId = function () {
      return this._sourceId;
    };
    /**
     * Getter for this instance's root element, i.e. the
     * element that contains this editor's text.
     * @returns {Element}
     */
    this.getRoot = function () {
      return this._root;
    };
    /**
     *
     * @returns {*|number}
     * @private
     */
    this._createUniqueSourceId = function () {
      Type.Content._lastSourceId = Type.Content._lastSourceId || 0;
      Type.Content._lastSourceId += 1;
      return Type.Content._lastSourceId;
    };
  }.call(Type.Content.prototype));
  exports = Type.Content;
  return exports;
}(content);
actions_type = function (exports) {
  var Type = core;
  /**
   * Creates a new Type action
   * @param {*} sourceId - An arbitrary key identifying the author
   *     of this action
   * @param {boolean} [undone] - The state of this action
   * @constructor
   */
  Type.Actions.Type = function (sourceId, undone) {
    this.sourceId = sourceId;
    this.undone = undone || false;
  };
  (function () {
    /**
     * Performs this action
     *
     * @returns {Type.Actions.Type} - This instance
     */
    this.execute = function () {
      this.undone = false;
      return this;
    };
    /**
     * Revokes this action
     *
     * @returns {Type.Actions.Type} - This instance
     */
    this.undo = function () {
      this.undone = true;
      return this;
    };
    /**
     * Returns if a given action can be merged with this
     * action
     *
     * @param {Type.Actions.Type|*} that
     * @returns {boolean}
     */
    this.mergeable = function (that) {
      return false;
    };
    /**
     * Merges a given action with this action
     *
     * @param {Type.Actions.Type|*} that
     * @returns {Type.Actions.Type} - This instance
     */
    this.merge = function (that) {
      return this;
    };
    /**
     * Returns the offsets and number of characters
     * this actions inserts or removes
     *
     * @returns {number[][]}
     */
    this.getCharacterShift = function () {
      return [[
          0,
          0
        ]];
    };
    /**
     * Calculates the number of characters a given
     * offset must be adjusted based on the given
     * character shifts.
     *
     * @param {number} offset - The character offset
     *     for which the number of characters must
     *     be added or removed to account for the
     *     given shifts
     * @param {number[][]} shifts - The character
     *     shifts that must be accounted for
     * @returns {number} - The number of characters
     *     that an offset must be addded to or
     *     removed from to account fot the given
     *     shifts.
     * @private
     */
    this._getShiftTo = function (offset, shifts) {
      var adjustment = 0, len = shifts.length, i;
      for (i = 0; i < len; i += 1)
        if (shifts[i][0] <= offset)
          adjustment += shifts[i][1];
      return adjustment;
    };
  }.call(Type.Actions.Type.prototype));
  exports = Type.Actions.Type;
  return exports;
}(actions_type);
actions_insert = function (exports) {
  var Type = core;
  /**
   * Creates a new Type action
   * @param {*} sourceId - An arbitrary key identifying the author
   *     of this action
   * @param {Type} type - A type instance on which the action
   *     should be executed
   * @param {Number} offset - The character offset at which the
   *     text should be inserted
   * @param {String} text - The text (containing HTML) that
   *     should be inserted
   * @param {boolean} [undone] - The state of this action
   * @constructor
   */
  Type.Actions.Insert = function (sourceId, type, offset, text, undone) {
    this.sourceId = sourceId;
    this.undone = undone || false;
    this._writer = type.getWriter();
    this._caret = type.getCaret();
    this._root = type.getRoot();
    this.add(offset, text);
  };
  /**
   * Inherit from general Type action
   */
  Type.OOP.inherits(Type.Actions.Insert, Type.Actions.Type);
  (function () {
    /**
     * Inserts text in the editor
     * @param {Number[][]} shifts
     * @returns {Type.Actions.Insert} - This instance
     */
    this.execute = function (shifts) {
      var len = this._stack.length, nodeInfo, i, adj;
      for (i = 0; i < len; i += 1) {
        adj = this._getShiftTo(this._stack[i].start, shifts);
        nodeInfo = Type.TextWalker.nodeAt(this._root, this._stack[i].start + adj);
        this._writer.insertText(nodeInfo.node, nodeInfo.offset, this._stack[i].text);
      }
      this._caret.setOffset(this._stack[len - 1].end + adj);
      this.undone = false;
      return this;
    };
    /**
     * Revokes this action
     * @param {Number[][]} shifts
     * @returns {Type.Actions.Insert} - This instance
     */
    this.undo = function (shifts) {
      var len = this._stack.length, range, i, adj;
      for (i = len - 1; i >= 0; i -= 1) {
        adj = this._getShiftTo(this._stack[i].start, shifts);
        range = Type.Range.fromPositions(this._root, this._stack[i].start + adj, this._stack[i].end + adj);
        this._writer.remove(range);
      }
      this._caret.setOffset(this._stack[0].start + adj);
      this.undone = true;
      return this;
    };
    /**
     * Returns if a given action can be merged with this
     * action
     * @param {*} that
     * @returns {boolean}
     */
    this.mergeable = function (that) {
      return that instanceof Type.Actions.Insert;
    };
    /**
     * Merges a given action with this action
     * @param {Type.Actions.Insert|*} that
     * @returns {Type.Actions.Insert} - This instance
     */
    this.merge = function (that) {
      var stack = that.getStack(), length = stack.length, i;
      for (i = 0; i < length; i += 1) {
        this.add(stack[i].start, stack[i].text);
      }
      return this;
    };
    /**
     * Returns the offsets and number of characters
     * this actions inserts
     * @returns {number[][]}
     */
    this.getCharacterShift = function () {
      var shifts, shift, len, stck, i;
      if (this.undone) {
        return [[
            0,
            0
          ]];
      }
      shifts = [];
      len = this._stack.length;
      for (i = 0; i < len; i += 1) {
        stck = this._stack[i];
        shift = [
          stck.start,
          stck.end - stck.start
        ];
        shifts.push(shift);
      }
      return shifts;
    };
    /**
     *
     * @param {Number} start
     * @param {String} text
     * @returns {Type.Actions.Insert} - This instance
     */
    this.add = function (start, text) {
      // Required vars
      var length = text.length, end = start + length, stackText, insertPosition, i;
      // Create stack if not exists
      this._stack = this._stack || [];
      // Add to stack if stack is empty
      if (this._stack.length === 0) {
        this._stack.push({
          start: start,
          end: end,
          text: text
        });
        return this;
      }
      // Iterate over stack and insert maintaining order
      for (i = 0; i < this._stack.length; i++) {
        // Insert at beginning
        if (this._stack[i].start > end) {
          this._stack.splice(i, 0, {
            start: start,
            end: end,
            text: text
          });
          break;
        }
        // Add to insertion if it overlaps with another instertion
        if (start >= this._stack[i].start && start <= this._stack[i].end) {
          stackText = this._stack[i].text;
          insertPosition = start - this._stack[i].start;
          this._stack[i].text = stackText.substr(0, insertPosition) + text + stackText.substr(insertPosition);
          this._stack[i].end += length;
          break;
        }
        // Add to end
        if (i + 1 >= this._stack.length) {
          this._stack.push({
            start: start,
            end: end,
            text: text
          });
          break;
        }
        // Insert between other insertions
        if (this._stack[i].end < start && this._stack[i + 1].start < end) {
          this._stack.splice(i, 0, {
            start: start,
            end: end,
            text: text
          });
          break;
        }
      }
      // Chaining
      return this;
    };
    /**
     * Getter for this instance's stack
     * @returns {Array}
     */
    this.getStack = function () {
      return this._stack || [];
    };
  }.call(Type.Actions.Insert.prototype));
  exports = Type.Actions.Insert;
  return exports;
}(actions_insert);
actions_remove = function (exports) {
  var Type = core;
  /**
   * Creates a new Type action
   * @param {*} sourceId - An arbitrary key identifying the author
   *     of this action
   * @param {Type} type - A type instance on which the action
   *     should be executed
   * @param {Number} start - The character offset from which the
   *     text should be removed
   * @param {Number} end - The character offset to which the
   *     text should be removed
   * @param {boolean} [undone] - The state of this action
   * @constructor
   */
  Type.Actions.Remove = function (sourceId, type, start, end, undone) {
    this.sourceId = sourceId;
    this.undone = undone || false;
    this._writer = type.getWriter();
    this._caret = type.getCaret();
    this._root = type.getRoot();
    this.start = start;
    this.end = end;
    this._contents = this._getContents();
  };
  /**
   * Inherit from general Type action
   */
  Type.OOP.inherits(Type.Actions.Remove, Type.Actions.Type);
  (function () {
    /**
     * Removes text from the editor
     * @param {Number[][]} shifts
     * @returns {Type.Actions.Remove} - This instance
     */
    this.execute = function (shifts) {
      var adj = this._getShiftTo(this.start, shifts), range = Type.Range.fromPositions(this._root, this.start + adj, this.end + adj);
      this._writer.remove(range);
      this._caret.setOffset(this.start + adj);
      this.undone = false;
      return this;
    };
    /**
     * Inserts the removed text again
     * @param {Number[][]} shifts
     * @returns {Type.Actions.Remove} - This instance
     */
    this.undo = function (shifts) {
      var adj = this._getShiftTo(this.start, shifts), nodeInfo = Type.TextWalker.nodeAt(this._root, this.start + adj);
      this._writer.insertHTML(nodeInfo.node, nodeInfo.offset, this._contents);
      this._caret.setOffset(this.end + adj);
      this.undone = true;
      return this;
    };
    /**
     * Returns if a given action can be merged with this
     * action
     * @param {*} that
     * @returns {boolean}
     */
    this.mergeable = function (that) {
      return false;
      // Deactivated
      return that instanceof Type.Actions.Remove && (that.end == this.start || that.start == this.end);
    };
    /**
     * Merges another remove action with this remove action
     * @param {Type.Actions.Remove|*} that
     * @returns {Type.Actions.Remove} - This instance
     */
    this.merge = function (that) {
      this.start = Math.min(this.start, that.start);
      this.end = Math.max(this.end, that.end);
      this._contents = this._getContents();
      return this;
    };
    /**
     * Returns the offsets and number of characters
     * this actions inserts or removes
     * @returns {number[][]}
     */
    this.getCharacterShift = function () {
      var len = this.start - this.end;
      return this.undone ? [[
          0,
          0
        ]] : [[
          this.start,
          len
        ]];
    };
    /**
     * Returns the contents between the text offsets of
     * this action.
     * @private
     */
    this._getContents = function () {
      var range = Type.Range.fromPositions(this._root, this.start, this.end);
      return range.getNativeRange().cloneContents().childNodes;
    };
  }.call(Type.Actions.Remove.prototype));
  /**
   * Creates a new Type action
   * @param {*} sourceId - An arbitrary key identifying the author
   *     of this action
   * @param {Type} type - A type instance on which the action
   *     should be executed
   * @param {Type.Range} range - The text range that should
   *     be removed from the contents.
   * @constructor
   */
  Type.Actions.Remove.fromRange = function (sourceId, type, range) {
    var bookmark = range.save(type.getRoot());
    return new Type.Actions.Remove(sourceId, type, bookmark.start, bookmark.end);
  };
  exports = Type.Actions.Remove;
  return exports;
}(actions_remove);
actions_format = function (exports) {
  var Type = core;
  /**
   * Creates a new Type action
   * @param {*} sourceId - An arbitrary key identifying the author
   *     of this action
   * @param {Type} type - A type instance on which the action
   *     should be executed
   * @param {Number} start - The character offset from which the
   *     text should be formatted
   * @param {Number} end - The character offset to which the
   *     text should be formatted
   * @param {Element[]} nodes - The initial elements that have been
   *     affected by performing this action
   * @param {Number} tag - The tag the text should be formatted
   *     with
   * @param {boolean} [undone] - The state of this action
   * @constructor
   */
  Type.Actions.Format = function (sourceId, type, start, end, tag, nodes, undone) {
    this.sourceId = sourceId;
    this.undone = undone || false;
    this._formatter = type.getFormatter();
    this._caret = type.getCaret();
    this._root = type.getRoot();
    this._start = start;
    this._end = end;
    this._tag = tag;
    this._nodes = nodes;
  };
  /**
   * Inherit from general Type action
   */
  Type.OOP.inherits(Type.Actions.Format, Type.Actions.Type);
  (function () {
    /**
     * Removes text from the editor
     * @param {Number[][]} shifts
     * @returns {Type.Actions.Format} - This instance
     */
    this.execute = function (shifts) {
      var adjStart = this._getShiftTo(this._start, shifts), adjEnd = this._getShiftTo(this._end, shifts), range = Type.Range.fromPositions(this._root, this._start + adjStart, this._end + adjEnd);
      this._nodes = this._formatter.format(this._tag, range);
      this.undone = false;
      return this;
    };
    /**
     * Inserts the removed text again
     * @param {Number[][]} shifts
     * @returns {Type.Actions.Format} - This instance
     */
    this.undo = function (shifts) {
      var len = this._nodes.length, i;
      for (i = 0; i < len; i += 1) {
        Type.DomUtilities.unwrap(this._nodes[i]);
      }
      this.undone = true;
      return this;
    };
  }.call(Type.Actions.Format.prototype));
  /**
   * Creates a new Type action
   * @param {*} sourceId - An arbitrary key identifying the author
   *     of this action
   * @param {Type} type - A type instance on which the action
   *     should be executed
   * @param {Type.Range} range - The text range that should be
   *     formatted.
   * @param {Number} tag - The tag the text should be formatted
   *     with
   * @constructor
   */
  Type.Actions.Format.fromRange = function (sourceId, type, range, tag, nodes) {
    var bookmark = range.save(type.getRoot());
    return new Type.Actions.Format(sourceId, type, bookmark.start, bookmark.end, tag, nodes);
  };
  exports = Type.Actions.Format;
  return exports;
}(actions_format);
core_api = function (exports) {
  var Type = core;
  (function () {
    /**
     * Returns the offset of the caret
     * type.caret()
     *
     * Show the caret
     * type.caret('show')
     *
     * Hides the caret
     * type.caret('hide')
     *
     * Moves the caret to the 10th character
     * type.caret(10)
     *
     * Convenience function for type.select(10, 20)
     * type.caret(10, 20)
     *
     * @param {...*} params - Various parameters are possible.
     *     See examples in the block comment.
     * @returns {Type} - The editor instance
     */
    this.caret = function (params) {
      // type.caret() todo was ist bei selektion?
      if (!arguments.length) {
        return this._caret.getOffset();
      }
      // type.caret('show')
      if (arguments[0] === 'show') {
        this._caret.show();
        return this;
      }
      // type.caret('hide')
      if (arguments[0] === 'hide') {
        this._caret.hide();
        return this;
      }
      // type.caret(10)
      if (arguments.length === 1 && typeof arguments[0] === 'number') {
        this._caret.setOffset(arguments[0]);
        return this;
      }
      // type.caret(10, 20)
      if (arguments.length === 2) {
        return this.selection(arguments[0], arguments[1]);
      }
      return this;
    };
    /**
     * Same as type.selection('text')
     * type.selection()
     *
     * Returns the unformatted (plain) contents of the current selection
     * type.selection('text')
     *
     * Return the currently selected HTML
     * type.selection('html')
     *
     * Convenience function for type.caret(10)
     * type.selection(10)
     *
     * Selects characters 10 to 20
     * type.selection(10, 20)
     *
     * Select an element
     * type.selection(element)
     *
     * Creates a selection between 2 elements
     * type.selection(element1, element2)
     *
     * Creates a selection between the first and last element in the jQuery Collection
     * type.selection(jQueryCollection)
     *
     * Returns an object that can be passed to type.selection('restore') to store and recreate a selection
     * type.selection('save')
     *
     * Takes an object returned by type.selection('save') as a second argument to recreate a stored selection
     * type.selection('restore', sel)
     *
     * @param {...*} params - Various parameters are possible.
     *     See examples in the block comment.
     * @returns {Type} - The editor instance
     */
    this.selection = function (params) {
      // type.selection() || type.selection('text')
      if (!arguments.length || arguments[0] === 'text') {
        return Type.Range.fromCurrentSelection().text();
      }
      // type.selection('html')
      if (arguments[0] === 'html') {
        return Type.Range.fromCurrentSelection().html();
      }
      // type.selection(10)
      if (arguments.length === 1 && typeof arguments[0] === 'number') {
        return this.caret(arguments[0]);
      }
      // type.selection(10, 20)
      if (arguments.length === 2 && typeof arguments[0] === 'number') {
        new Type.Range(this.root, arguments[0], arguments[1]).select();
        return this;
      }
      // type.selection(element)
      if (DomUtil.isNode(arguments[0])) {
        new Type.Range(arguments[0]).select();
        return this;
      }
      // type.selection(element1, element2)
      if (arguments.length === 2 && DomUtil.isNode(arguments)) {
        new Type.Range(arguments[0], arguments[1]).select();
        return this;
      }
      // type.selection(jQueryCollection) || type.selection([Array])
      if (arguments[0].jQuery) {
        new Type.Range(arguments[0], arguments[1]).select();
        return this;
      }
      // type.selection('save')
      if (arguments[0] === 'save') {
        return Type.Range.fromCurrentSelection().save();
      }
      // type.selection('restore', sel)
      if (arguments[0] === 'restore') {
        return Type.Range.fromCurrentSelection().restore(arguments[1]);
      }
      return this;
    };
    /**
       * Inserts plain text at the caret's position, regardless if str contains html. Will overwrite the current
       * type.insert(str)* selection if there is one.
       *
       *
       * Inserts formatted text at the caret's position. Will overwrite the current selection if there is one.
       * type.insert('html', str)
       *
       * Inserts str at the offset given as second parameter
       * type.insert(str, 10)
    
       * Same as type.insert(str, 10) but inserts formatted text given as html string
       * type.insert('html', str, 10)
       *
       * @param {...*} params - Various parameters are possible.
       *     See examples in the block comment.
       * @returns {Type} - The editor instance
       */
    this.insert = function (params) {
      // type.insert(str)
      if (arguments.length === 1) {
        this.getInput().getContent().insert(this.getCaret().getOffset(), arguments[0]);
        return this;
      }
      // type.insert(str, 'text')
      if (arguments.length === 2 && arguments[1] === 'text') {
        // this._writer.insertText(arguments[0]);
        this.getInput().getContent().insert(this.getCaret().getOffset(), arguments[0]);
        return this;
      }
      // type.insert(str, 10)
      if (arguments.length === 2 && typeof arguments[1] === 'number') {
        this._writer.insertText(arguments[0], arguments[1]);
        return this;
      }
      // type.insert('html', str, 10)
      if (arguments.length === 3 && arguments[0] === 'html') {
        this._writer.insertHTML(arguments[1], arguments[2]);
        return this;
      }
      return this;
    };
    /**
     * Formats the currently selected text with the given tag.
     * type.format(tagName, [...params])* E.g. use type.cmd('strong') to format the currently selected text bold
     *
     * Applies type.format to a specific text range
     * type.format(startOffset, endOffset, tagName, [...params])
     *
     * @param {...*} params - Various parameters are possible.
     *     See examples in the block comment.
     * @returns {Type} - The editor instance
     */
    this.format = function (params) {
      var sel, range;
      if (arguments.length === 1) {
        sel = this._selection.save();
        this.getInput().getContent().format(arguments[0], this._selection.getRange());
        this._selection.restore(sel);
        return this;
      }
      if (arguments.length === 3) {
        range = Type.Range.fromPositions(this.getRoot(), arguments[1], arguments[2]);
        this.getInput().getContent().format(arguments[0], range);
        return this;
      }
      return this;
    };
    /**
     * Deletes the currently selected text. Does nothing if there is no selection.
     * type.remove()
     *
     * Removes a number of characters from the caret's position. A negative number will remove characters left
     * of the caret, a positive number from the right. If there is a selection, the characters will be removed
     * from the end of the selection.
     * type.remove(numChars)
     *
     * Will remove characters between the given offsets
     * type.remove(startOffset, endOffset)
     *
     * @param {...*} params - Various parameters are possible.
     *     See examples in the block comment.
     * @returns {Type} - The editor instance
     */
    this.remove = function (params) {
      if (arguments.length < 2) {
        this.getInput().getContent().remove(this.getCaret().getOffset(), arguments[0] || -1);
      }
      if (arguments.length === 2) {
        this.getInput().getContent().remove(arguments[0], arguments[1]);
      }
      return this;
    };
    /**
     * Revokes the last user input
     *
     * @param {Number} [steps] - The number of actions to revoke
     * @returns {Type} - The editor instance
     */
    this.undo = function (steps) {
      var sourceId = this.getInput().getContent().getSourceId();
      this.getUndoManager().undo(sourceId, steps);
      return this;
    };
    /**
     * Reapplies a revoked input
     * @param {Number} [steps] - The number of actions to reapply
     * @returns {Type} - The editor instance
     */
    this.redo = function (steps) {
      var sourceId = this.getInput().getContent().getSourceId();
      this.getUndoManager().redo(sourceId, steps);
      return this;
    };
  }.call(Type.fn));
  return exports;
}(core_api);
plugins_etherpad_typeetherpad = function (exports) {
  var Type = core;
  /**
   * Creates a new Type.Etherpad instance
   *
   * @param {Type} type - A Type instance Etherpad should
   *     use for collaboration
   * @constructor
   */
  Type.Etherpad = function (type) {
    this.options(type.options('etherpad') || {});
    this._type = type;
    this._caret = type.getCaret();
    this._client = new Type.Etherpad.Client(this);
    this._client.onInit(this._initEditor.bind(this));
    this._client.connect();
    this._content = new Type.Etherpad.Content(this);
  };
  (function () {
    /**
     * Object that holds the default settings for communicating with an
     * Etherpad server.
     *
     * @type {{host: string, port: number, rootPath: string, apikey: null}}
     */
    this._defaultOptions = {
      host: 'localhost',
      port: 9001,
      rootPath: '/api/1.2.1/'
    };
    /**
     * Sets the options to be used for communicating with an
     * Etherpad server. Takes either a plain object or a key
     * value combination to set a single, specific option.
     * In the latter case, the key must be a {string}.
     *
     * @param {(string|Object)} options - Either a plain object
     *     with keys and values to be set or a string that will
     *     be used as a name for a option. If you pass a string,
     *     pass a second parameter to set that option or no
     *     second parameter to retrieve that option.
     * @param {*} [value] - If the first parameter is a string,
     *     this value will be set to the key of the given first
     *     parameter. Any arbitrary value can be set.
     * @returns {Type|*} Returns the type instance if you set an
     *     option or the according value if you get an option
     */
    this.options = function (options, value) {
      // Load default options if there are no instance options yet
      this._options = this._options || Type.Utilities.extend({}, this._defaultOptions);
      // Pass a single option name to fetch it
      if (typeof options === 'string' && arguments.length === 1) {
        return this._options[options];
      }
      // Pass an option name and a value to set it
      if (typeof options === 'string' && arguments.length === 2) {
        options = { options: value };
      }
      // Pass an object of key-values to set them
      if (typeof options === 'object') {
        Type.Utilities.extend(this._options, options);
      }
      // Chaining / Returning data
      return arguments.length ? this : this._options;
    };
    /**
     * Getter for the Type instance
     * @returns {Type}
     */
    this.getType = function () {
      return this._type;
    };
    /**
     * Getter for the Etherpad client
     * @returns {Type.Etherpad.Client}
     */
    this.getClient = function () {
      return this._client;
    };
    /**
     * Getter for the Etherpad content
     * @returns {Type.Etherpad.Content}
     */
    this.getContent = function () {
      return this._content;
    };
    /**
     * Will load the pad contents from an Etherpad connection message
     * to the Type editor contents.
     *
     * @param {{attribs: string, text: string}} contents - The contents
     *     of the editor sent by the server
     * @returns {Type.Etherpad} - This instance
     * @private
     */
    this._initEditor = function (contents, apool) {
      var changeset = this._initChangeset(contents);
      Type.Development.log(changeset);
      this._type.getRoot().innerHTML = Type.Etherpad.Util.nl2br(contents.text);
      this._content.applyChangeset(changeset, apool);
      this._startSending();
      return this;
    };
    /**
     * Listens to Type Events and sends changesets to the connected Etherpad
     * Server.
     *
     * @returns {Type.Etherpad} - This instance
     * @private
     */
    this._startSending = function () {
      this._type.on('input', function (e) {
        var char, insertion, deletion, offset;
        char = String.fromCharCode(e.keyCode);
        char = e.shift ? char : char.toLowerCase();
        Type.Development.log(char, e.keyCode);
        if (e.keyCode == 8 || e.keyCode == 46) {
          offset = this._caret.getOffset();
          deletion = new Type.Etherpad.Changeset.Changes.Removal(offset, 1);
          this._client.send(deletion);
        } else if (/[a-zA-Z]/.test(char)) {
          offset = this._caret.getOffset();
          insertion = new Type.Etherpad.Changeset.Changes.Insertion(offset, char);
          this._client.send(insertion);
        }
      }.bind(this));
      return this;
    };
    /**
     * Creates a regular changeset from the initial attributes of an Etherpad
     * server.
     *
     * @param {{attribs: string, text: string}} contents - The contents
     *     of the editor sent by the server
     * @returns {string} - A regularly formatted changeset
     * @private
     */
    this._initChangeset = function (contents) {
      var prefix = 'Z:' + contents.text.length.toString(36) + '>0', body = contents.attribs.replace(/\+/g, '='), appendix = '$';
      return prefix + body + appendix;
    };
  }.call(Type.Etherpad.prototype));
  /**
   * Creates a new Type instance connected to an Etherpad server
   *
   * @param {{}|Element} options - The options you would pass to instantiate a
   *     Type instance
   * @param {{}} options.etherpad - The options for the Type.Etherpad
   *     constructor
   * @param {{}|string} [etherpadOpts] - Either the parameters for the
   *     Type.Etherpad constructor or a pad name as a string
   * @param {string} [server] - The URL for the Etherpad server
   * @constructor
   */
  Type.fromEtherpad = function (options, etherpadOpts, server) {
    options = Type.Etherpad.prepareOptions(options, etherpadOpts, server);
    var type = new Type(options);
    new Type.Etherpad(type);
    return type;
  };
  /**
   * Used for the Type.fromEtherpad constructor to process its parameters
   *
   * @param {{}} options - The options you would pass to instantiate a
   *     Type instance
   * @param {{}} options.etherpad - The options for the Type.Etherpad
   *     constructor
   * @param {{}|string} [etherpadOpts] - Either the parameters for the
   *     Type.Etherpad constructor or a pad name as a string
   * @param {string} [server] - The URL for the Etherpad server
   * @returns {{}}
   */
  Type.Etherpad.prepareOptions = function (options, etherpadOpts, server) {
    options = options || {};
    etherpadOpts = etherpadOpts || {};
    if (Type.DomUtilities.isNode(options)) {
      options = { el: options };
    }
    if (arguments.length === 3) {
      etherpadOpts = {
        pad: etherpadOpts,
        server: server
      };
    }
    if (typeof etherpadOpts === 'string') {
      etherpadOpts = { pad: etherpadOpts };
    }
    options.etherpad = etherpadOpts;
    return options;
  };
  exports = Type.Etherpad;
  return exports;
}(plugins_etherpad_typeetherpad);
plugins_etherpad_util = function (exports) {
  var Type = core;
  /**
   * Creates a new Type.Etherpad.Util instance
   * Contains utility methods for Type.Etherpad
   * @constructor
   */
  Type.Etherpad.Util = function () {
  };
  (function () {
    /**
     * Replaces newlines with <br /> tags
     *
     * @param {string} str - The original string containing newlines
     * @returns {string} - The altered string containing <br /> tags
     */
    Type.Etherpad.Util.nl2br = function (str) {
      return (str + '').replace(/([^>\r\n]?)(\r\n|\n\r|\r|\n)/g, '$1<br ' + '/>$2');
    };
    /**
     * Returns a random string starting with 't.' that can be used as a token for
     * connecting to an Etherpad server.
     *
     * @returns {string}
     */
    Type.Etherpad.Util.getRandomToken = function () {
      var chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz', stringLength = 20, randNumber, str = '';
      for (var i = 0; i < stringLength; i++) {
        randNumber = Math.floor(Math.random() * chars.length);
        str += chars.substring(randNumber, randNumber + 1);
      }
      return 't.' + str;
    };
  }.call(Type.Etherpad.Util.prototype));
  exports = Type.Etherpad.Util;
  return exports;
}(plugins_etherpad_util);
plugins_etherpad_client = function (exports) {
  var Type = core;
  /**
   * Creates a new Type.Etherpad.Client instance
   *
   * @param etherpad
   * @constructor
   */
  Type.Etherpad.Client = function (etherpad) {
    this._etherpad = etherpad;
    this._msgHandlers = {};
    this._accepted = true;
    this._lastSent = Date.now();
    this._changeset = new Type.Etherpad.Changeset();
    this.registerMessageHandler('ACCEPT_COMMIT', this._acceptCommit.bind(this));
  };
  (function () {
    /**
     * The default URL the client connects to if no URL has been set
     * @type {string}
     * @private
     */
    this._defaultUrl = 'http://localhost:9001/';
    /**
     * The interval in which chagesets will be sent
     *
     * @type {number}
     * @private
     */
    this._debounceTime = 0;
    /**
     * Connects to an Etherpad server
     * @returns {Type.Etherpad.Client} - This instance
     */
    this.connect = function () {
      this._socket = io.connect(this._url(), this._socketIoOptions());
      this._socket.once('connect', this._sendClientReady.bind(this));
      this._socket.on('message', this._handleMessage.bind(this));
      return this;
    };
    /**
     * Sets a function that will be called when this client connects to
     * a server. The pad contents from the server will be passed to the
     * handler.
     * @param {Function} handler - The function that will be called
     * @returns {Type.Etherpad.Client} - This instance
     */
    this.onInit = function (handler) {
      this._onInitHandler = handler;
      return this;
    };
    /**
     * Registers a handler that will be called for a given message
     * @param {string} msg - The message on which the handler should be called
     * @param {Function} handler - The handler that should be called
     * @returns {Type.Etherpad.Client} - This instance
     */
    this.registerMessageHandler = function (msg, handler) {
      this._msgHandlers[msg] = this._msgHandlers[msg] || [];
      this._msgHandlers[msg].push(handler);
      return this;
    };
    /**
     * Removes a handler for a given message
     * @param {string} msg - The message on which the handler is called
     * @param {Function} handler - The handler that should be removed
     * @returns {Type.Etherpad.Client} - This instance
     */
    this.unregisterMessageHandler = function (msg, handler) {
      var index;
      if (this._msgHandlers[msg]) {
        index = this._msgHandlers[msg].indexOf(handler);
        if (index > -1) {
          this._msgHandlers[msg].splice(index, 1);
        }
      }
      return this;
    };
    /**
     *
     * @param change
     */
    this.send = function (change) {
      var root, changestr;
      this._changeset._mergeOrPush(change);
      if (this._accepted && Date.now() - this._debounceTime > this._lastSent) {
        this._accepted = false;
        root = this._etherpad.getContent().getRoot();
        changestr = this._changeset.getString(root);
        this._sendChangeset(changestr);
        this._changeset = new Type.Etherpad.Changeset();
        this._lastSent = Date.now();
      }
      return this;
    };
    /**
     *
     * @param msg
     * @private
     */
    this._acceptCommit = function (msg) {
      this._etherpad.getContent().setRevision(msg.newRev);
      this._accepted = true;
    };
    /**
     *
     * @param changeset
     * @private
     */
    this._sendChangeset = function (changeset) {
      this._sendMessage({
        type: 'USER_CHANGES',
        baseRev: this._etherpad.getContent().getRevision(),
        changeset: changeset,
        apool: {
          nextNum: 1,
          numToAttrib: {
            0: [
              'author',
              this._userId
            ]
          }
        }
      });
    };
    /**
     *
     * @param msg
     */
    this._sendMessage = function (msg) {
      this._socket.json.send({
        type: 'COLLABROOM',
        component: 'pad',
        data: msg
      });
    };
    /**
     * Will call the message handlers registered for Etherpad messages
     * @param {Object} response - The message from the server
     * @returns {Type.Etherpad.Client} - This instance
     * @private
     */
    this._handleMessage = function (response) {
      // Required variables
      var msg = response.data.type, len, i;
      // Dev code
      Type.Development.debug('message', response);
      // This message will be received when connecting to the server
      if (response.type === 'CLIENT_VARS') {
        this._init(response.data);
        return this;
      }
      // Notify developers on unhandled messages from the server
      if (!this._msgHandlers[msg]) {
        Type.Development.debug('Unhandled etherpad message', response);
        return this;
      }
      // For all other messsages call the according message handlers
      len = this._msgHandlers[msg].length;
      for (i = 0; i < len; i += 1) {
        this._msgHandlers[msg][i](response.data);
      }
      // Chaining
      return this;
    };
    /**
     * Will be called when this client successfully connected to an
     * Etherpad server.
     * @param {Object} data - The data that ther server sent
     * @returns {Type.Etherpad.Client} - This instance
     * @private
     */
    this._init = function (data) {
      this._etherpad.getContent().setRevision(data.collab_client_vars.rev);
      this._userId = data.userId;
      if (this._onInitHandler) {
        this._onInitHandler(data.collab_client_vars.initialAttributedText, data.collab_client_vars.apool);
      }
      return this;
    };
    /**
     * Sends a 'CLIENT_READY' message to an Etherpad server
     * @returns {Type.Etherpad.Client} - This instance
     */
    this._sendClientReady = function () {
      var msg = {
        'isReconnect': false,
        'component': 'pad',
        'type': 'CLIENT_READY',
        'token': Type.Etherpad.Util.getRandomToken(),
        'padId': this._etherpad.options('pad'),
        'sessionID': 'null',
        'password': null,
        'protocolVersion': 2
      };
      this._socket.json.send(msg);
      return this;
    };
    /**
     * Returns the options to connect to an Etherpad server with socket.io
     * @returns {{path: string, resource: string, max reconnection attempts: number, sync disconnect on unload: boolean}}
     * @private
     */
    this._socketIoOptions = function () {
      return {
        'path': '/socket.io',
        'resource': 'socket.io',
        'max reconnection attempts': 3,
        'sync disconnect on unload': false
      };
    };
    /**
     * Returns the URL this client connects to
     * @returns {string}
     * @private
     */
    this._url = function () {
      return this._etherpad.options('url') || this._defaultUrl;
    };
  }.call(Type.Etherpad.Client.prototype));
  exports = Type.Etherpad.Client;
  return exports;
}(plugins_etherpad_client);
plugins_etherpad_content = function (exports) {
  var Type = core;
  /**
   * Creates a new Type.Etherpad.Content instance
   *
   * @param {Type.Etherpad} etherpad - The Etherpad instance this
   *     class will manage content collaboration for
   * @constructor
   */
  Type.Etherpad.Content = function (etherpad) {
    this._client = etherpad.getClient();
    this._localCaret = etherpad.getType().getCaret();
    this._typeContent = new Type.Content(etherpad.getType());
    this._root = this._typeContent.getRoot();
    this._client.registerMessageHandler('NEW_CHANGES', this.updateContent.bind(this));
  };
  (function () {
    /**
     * Applies a change to the editor's contents
     *
     * @param {{newRev: number, changeset: string, apool:{}}} data - The data received from a NEW_CHANGES message
     * @returns {Type.Etherpad.Content} - This instance
     */
    this.updateContent = function (data) {
      this.revision = data.newRev;
      this.applyChangeset(data.changeset, data.apool);
      return this;
    };
    /**
     * Applies a serialized changeset to the editor's contents
     *
     * @param {string} changesetString - A serialized Changeset
     * @returns {*}
     */
    this.applyChangeset = function (changesetString, apool) {
      var changeset = new Type.Etherpad.Changeset.fromString(changesetString, apool, this._root.textContent);
      changeset.apply(this._typeContent, this._localCaret);
      return this;
    };
    /**
     * Getter for the document revision
     * @returns {number}
     */
    this.getRevision = function () {
      return this.revision;
    };
    /**
     * Setter for the document revision
     * @returns {Type.Etherpad.Content} - This instance
     */
    this.setRevision = function (rev) {
      this.revision = rev;
      return this;
    };
    /**
     * Getter for the root element
     * @returns {number}
     */
    this.getRoot = function () {
      return this._root;
    };
  }.call(Type.Etherpad.Content.prototype));
  exports = Type.Etherpad.Content;
  return exports;
}(plugins_etherpad_content);
plugins_etherpad_changeset = function (exports) {
  var Type = core;
  /**
   * Creates a new Type.Etherpad.Changeset instance
   *
   * @constructor
   */
  Type.Etherpad.Changeset = function () {
    this._stack = [];
  };
  (function () {
    /**
     * Matches a changeset to an array of results for
     * an each operation
     *
     * @type {RegExp}
     * @private
     */
    this._changesetRegex = /((?:\*[0-9a-z]+)*)(?:\|([0-9a-z]+))?([-+=])([0-9a-z]+)|\?|/g;
    /**
     * Returns a serialized changeset string based on the length of
     * a given string or the text contents of a given element
     *
     * @param {string|Element} base - Either a string or an element
     * @returns {string}
     */
    this.getString = function (base) {
      var serializer = new Type.Etherpad.ChangesetSerializer(this);
      return serializer.getString(base);
    };
    /**
     * Applies this changeset to a given content
     *
     * Todo Insertions and removals must be executed in order
     * Todo not after one another
     *
     * @param {Type.Content} content - The content this changeset
     *     should be applied to
     * @param {Type.Caret} localCaret - The local user's caret
     * @returns {Type.Etherpad.Changeset} - This instance
     */
    this.apply = function (content, localCaret) {
      var i, len = this._stack.length;
      for (i = 0; i < len; i += 1) {
        this._stack[i].apply(content, localCaret);
      }
      return this;
    };
    /**
     * Adds a serialized changeset (as a string) to this
     * changeset instance
     *
     * @param {string} str - A serialized changeset
     * @param {Object} apool - An Etherpad attribute pool
     * @param {string} base - Text contents
     * @returns {Type.Etherpad.Changeset} - This instance
     */
    this.addString = function (str, apool, base) {
      var charbank = this._getCharbank(str), nlIndices = this._getNlIndices(base), offsets = {
          absolute: 0,
          stack: []
        }, rawMatch, match;
      while ((rawMatch = this._changesetRegex.exec(str)) !== null) {
        if (match = this._parseMatch(rawMatch))
          this._addMatchToStack(offsets, charbank, match, apool, nlIndices);
      }
      return this;
    };
    /**
     * Returns the indices of newlines in a string
     *
     * @param {string} str - The string to return the indexes of newlines for
     * @returns {number[]} - An array in indexes of the newlines in the text
     * @private
     */
    this._getNlIndices = function (str) {
      var regex = /[\n]/gi, result, indices = [];
      while (result = regex.exec(str)) {
        indices.push(result.index);
      }
      return indices;
    };
    /**
     * Getter for the operation stack
     * @returns {Array}
     */
    this.getStack = function () {
      return this._stack;
    };
    /**
     *
     * @param {{ absolute: number, stack: number[] }} offset - An object
     *     containing offset information
     * @param {string} charbank - The charbank of a string changeset
     * @param {{attrs: string, operator: string, value: string, nl: number}} match
     *     A match as returned by _parseMatch
     * @param {Object} apool - An Etherpad attribute pool
     * @param {number[]} nlIndices -
     * @private
     */
    this._addMatchToStack = function (offset, charbank, match, apool, nlIndices) {
      var delta;
      this._mergeOrPush(this._createFromMatch(offset, charbank, match, apool));
      if (match.operator === '=') {
        delta = parseInt(match.value, 36);
        delta += match.nl ? 1 : 0;
        offset.absolute += delta;
        offset.stack.push(offset);
      }
      return this;
    };
    /**
     *
     * @param offset
     * @param charbank
     * @param match
     * @param apool
     * @returns {*}
     * @private
     */
    this._createFromMatch = function (offset, charbank, match, apool) {
      var attrs = this._getAttributesFromMatch(match, apool);
      switch (match.operator) {
      case '*':
        return Type.Etherpad.Changeset.Changes.Command.fromAPool(apool);
      case '=':
        return this._operationOrMovement(offset, charbank, match, attrs);
      case '+':
        return new Type.Etherpad.Changeset.Changes.Insertion(offset.absolute, charbank);
      case '-':
        return Type.Etherpad.Changeset.Changes.Removal.fromMatch(offset, match);
      default:
        Type.Development.debug('Cannot match operator ' + match.operator, match);
        return null;
      }
    };
    /**
     *
     * @param offset
     * @param charbank
     * @param match
     * @param attrs
     * @returns {Type.Etherpad.Changeset.Changes.Formatting}
     * @private
     */
    this._operationOrMovement = function (offset, charbank, match, attrs) {
      if (!attrs.length) {
        return Type.Etherpad.Changeset.Changes.Movement.fromOffsetObject(offset, match);
      } else {
        return Type.Etherpad.Changeset.Changes.Formatting.fromAttrs(attrs, offset.absolute, match);
      }
    };
    /**
     *
     * @param {Type.Etherpad.Changeset.Changes.Change} change - A change
     *     instance or an inheriting class
     * @returns {Type.Etherpad.Changeset} - This instance
     * @private
     */
    this._mergeOrPush = function (change) {
      var last = this._stack[this._stack.length - 1];
      if (!!last && last.mergable(change)) {
        last.merge(change);
      } else if (!(change instanceof Type.Etherpad.Changeset.Changes.Movement)) {
        this._stack.push(change);
      }
      return this;
    };
    /**
     * Parses a regex match and returns a readable object
     *
     * @param {Array|{index: number, input: string}} match - A
     *     RegEx match
     * @returns {{attrs: string, operator: string, value: string}}
     * @private
     */
    this._parseMatch = function (match) {
      if (match.index === this._changesetRegex.lastIndex)
        this._changesetRegex.lastIndex++;
      if (match[0] === '')
        return false;
      return {
        attrs: match[1],
        nl: match[2],
        operator: match[3],
        value: match[4]
      };
    };
    /**
     * Returns the attributes from a match and an apool
     *
     * @param {{attrs: string, operator: string, value: string}} match - A
     *     match parsed by this._parseMatch
     * @param {{numToAttrib: array}} apool - An attribute pool from an
     *     Etherpad server
     * @returns {*[]}
     * @private
     */
    this._getAttributesFromMatch = function (match, apool) {
      var i;
      if (!match.attrs.length)
        return [];
      i = parseInt(match.attrs.substr(1));
      return [apool.numToAttrib[i]];
    };
    /**
     * Reads the charbank from a changeset string
     *
     * @param {string} str - A serialized changeset
     * @returns {string|null} - The charbank or null
     *     if there is no charbank
     * @private
     */
    this._getCharbank = function (str) {
      var opsEnd = str.indexOf('$') + 1;
      return opsEnd >= 0 ? str.substring(opsEnd) : null;
    };
  }.call(Type.Etherpad.Changeset.prototype));
  /**
   * Creates a new {Type.Etherpad.Changeset} from a serialized
   * changeset string
   *
   * @param {string} str - A serialized changeset string
   * @returns {Type.Etherpad.Changeset}
   */
  Type.Etherpad.Changeset.fromString = function (str, apool, base) {
    var changeset = new Type.Etherpad.Changeset();
    changeset.addString(str, apool, base);
    return changeset;
  };
  /**
   * Namespace for changes
   * @type {{}}
   */
  Type.Etherpad.Changeset.Changes = {};
  exports = Type.Etherpad.Changeset;
  return exports;
}(plugins_etherpad_changeset);
plugins_etherpad_changes_change = function (exports) {
  var Type = core;
  /**
   * Creates a new Type.Etherpad.Changeset instance
   *
   * @constructor
   */
  Type.Etherpad.Changeset.Changes.Change = function () {
  };
  (function () {
    this.apply = function (content, localCaret) {
      return this;
    };
    this.mergable = function (that) {
      return false;
    };
    this.merge = function (that) {
      return this;
    };
    this.getCharbank = function () {
      return '';
    };
    this.getOperation = function () {
      return '';
    };
    this.getLength = function () {
      return 0;
    };
  }.call(Type.Etherpad.Changeset.Changes.Change.prototype));
  Type.Etherpad.Changeset.Changes.Change.fromMatch = function (match) {
    return new Type.Etherpad.Changeset.Changes.Change();
  };
  exports = Type.Etherpad.Changeset.Changes.Change;
  return exports;
}(plugins_etherpad_changes_change);
plugins_etherpad_changes_movement = function (exports) {
  var Type = core;
  /**
   * Creates a new Type.Etherpad.Changeset instance
   *
   * @param {number} delta - The relative movement
   * @param {number} [absolute] - The absolute text position
   * @constructor
   */
  Type.Etherpad.Changeset.Changes.Movement = function (delta, absolute) {
    this.delta = delta;
    this.absolute = absolute || null;
  };
  /**
   * Inherit from Etherpad change
   */
  Type.OOP.inherits(Type.Etherpad.Changeset.Changes.Movement, Type.Etherpad.Changeset.Changes.Change);
  (function () {
    /**
     * Etherpad's serialized string for this operation
     * @type {string}
     */
    this.op = '=';
  }.call(Type.Etherpad.Changeset.Changes.Movement.prototype));
  /**
   *
   * @param match
   * @returns {Type.Etherpad.Changeset.Changes.Movement}
   * @constructor
   */
  Type.Etherpad.Changeset.Changes.Movement.fromMatch = function (match) {
    return new Type.Etherpad.Changeset.Changes.Movement(parseInt(match.value, 36));
  };
  /**
   * Creates a new Movement instance from an object containing the delta
   * and the absolute text offset.
   *
   * @param {{ absolute: number, stack: number[] }} offset - An object
   *     containing offset information
   */
  Type.Etherpad.Changeset.Changes.Movement.fromOffsetObject = function (offset, match) {
    var delta = offset.stack[offset.stack.length - 1];
    return new Type.Etherpad.Changeset.Changes.Movement(delta, offset.absolute + parseInt(match.value));
  };
  exports = Type.Etherpad.Changeset.Changes.Movement;
  return exports;
}(plugins_etherpad_changes_movement);
plugins_etherpad_changes_insertion = function (exports) {
  var Type = core;
  /**
   * Creates a new Type.Etherpad.Changeset instance
   *
   * @constructor
   */
  Type.Etherpad.Changeset.Changes.Insertion = function (offset, text) {
    this.start = offset;
    this.length = text.length;
    this.end = offset + text.length;
    this.text = text;
  };
  /**
   * Inherit from Etherpad change
   */
  Type.OOP.inherits(Type.Etherpad.Changeset.Changes.Insertion, Type.Etherpad.Changeset.Changes.Change);
  (function () {
    /**
     * Etherpad's serialized string for this operation
     * @type {string}
     */
    this.op = '+';
    /**
     *
     * @returns {string}
     */
    this.getOperation = function () {
      return this.op + this.text.length;
    };
    /**
     *
     * @returns {number}
     */
    this.getLength = function () {
      return this.length;
    };
    /**
     * @param {Type.Content} content - The content this changeset
     *     should be applied to
     * @param {Type.Caret} localCaret - The local user's caret
     * @returns {Type.Etherpad.Changeset.Changes.Insertion} - This instance
     */
    this.apply = function (content, localCaret) {
      content.insert(this.start, this.text);
      localCaret.moveBy(this.length);
      return this;
    };
    /**
     *
     * @param {Type.Etherpad.Changeset.Changes.Insertion} that - Another Insertion
     *     instance
     * @returns {boolean}
     */
    this.mergable = function (that) {
      return that instanceof Type.Etherpad.Changeset.Changes.Insertion && this.start <= that.start && that.start <= this.end;
    };
    /**
     *
     * @param {Type.Etherpad.Changeset.Changes.Insertion} that - Another Insertion
     *     instance
     * @returns {Type.Etherpad.Changeset.Changes.Insertion} - This instance
     */
    this.merge = function (that) {
      var offset = that.start - this.start;
      this.text = this.text.substr(0, offset) + that.text + this.text.substr(offset);
      return this;
    };
  }.call(Type.Etherpad.Changeset.Changes.Insertion.prototype));
  exports = Type.Etherpad.Changeset.Changes.Insertion;
  return exports;
}(plugins_etherpad_changes_insertion);
plugins_etherpad_changes_removal = function (exports) {
  var Type = core;
  /**
   * Creates a new Type.Etherpad.Changeset instance
   *
   * @constructor
   */
  Type.Etherpad.Changeset.Changes.Removal = function (offset, length) {
    this.start = offset;
    this.length = length;
    this.end = offset + length;
  };
  /**
   * Inherit from Etherpad change
   */
  Type.OOP.inherits(Type.Etherpad.Changeset.Changes.Removal, Type.Etherpad.Changeset.Changes.Change);
  (function () {
    /**
     * Etherpad's serialized string for this operation
     * @type {string}
     */
    this.op = '-';
    /**
     *
     * @returns {string}
     */
    this.getOperation = function () {
      return this.op + this.length;
    };
    /**
     *
     * @returns {number}
     */
    this.getLength = function () {
      return this.length * -1;
    };
    /**
     * @param {Type.Content} content - The content this changeset
     *     should be applied to
     * @param {Type.Caret} localCaret - The local user's caret
     * @returns {Type.Etherpad.Changeset.Changes.Insertion} - This instance
     */
    this.apply = function (content, localCaret) {
      content.remove(this.start, this.length);
      if (this.end <= localCaret.getOffset())
        localCaret.moveBy(this.length * -1);
      return this;
    };
  }.call(Type.Etherpad.Changeset.Changes.Removal.prototype));
  /**
   *
   * @param {{ absolute: number, stack: number[] }} offset - An object
   *     containing offset information
   * @param {{attrs: string, operator: string, value: string}} match
   * @returns {Type.Etherpad.Changeset.Changes.Removal}
   */
  Type.Etherpad.Changeset.Changes.Removal.fromMatch = function (offset, match) {
    return new Type.Etherpad.Changeset.Changes.Removal(offset.absolute, parseInt(match.value, 36));
  };
  exports = Type.Etherpad.Changeset.Changes.Removal;
  return exports;
}(plugins_etherpad_changes_removal);
plugins_etherpad_changes_formatting = function (exports) {
  var Type = core;
  /**
   * Creates a new Type.Etherpad.Changeset instance
   *
   * @constructor
   */
  Type.Etherpad.Changeset.Changes.Formatting = function (command, offset, length, remove) {
    this.command = command;
    this.start = offset;
    this.length = length;
    this.end = offset + length;
    this.remove = !!remove;
  };
  /**
   * Inherit from Etherpad change
   */
  Type.OOP.inherits(Type.Etherpad.Changeset.Changes.Formatting, Type.Etherpad.Changeset.Changes.Change);
  (function () {
    /**
     * Etherpad's serialized string for this operation
     *
     * @type {string}
     */
    this.op = '=';
    /**
     * Maps Etherpad commands to tags to apply in the editor
     *
     * @type {{bold: string}}
     * @private
     */
    this._tagMap = {
      bold: 'strong',
      italic: 'em',
      underline: 'u',
      strikethrough: 's'
    };
    /**
     * @param {Type.Content} content - The content this changeset
     *     should be applied to
     * @param {Type.Caret} [localCaret] - The local user's caret
     * @returns {Type.Etherpad.Changeset.Changes.Insertion} - This instance
     */
    this.apply = function (content, localCaret) {
      if (this.command !== 'author') {
        content.format(this._tagMap[this.command], this.start, this.end);
      }
      return this;
    };
  }.call(Type.Etherpad.Changeset.Changes.Formatting.prototype));
  /**
   *
   * @param attrs
   * @param offset
   * @param match
   * @returns {Type.Etherpad.Changeset.Changes.Formatting}
   */
  Type.Etherpad.Changeset.Changes.Formatting.fromAttrs = function (attrs, offset, match) {
    return new Type.Etherpad.Changeset.Changes.Formatting(attrs[0][0], offset, parseInt(match.value), !attrs[0][1]);
  };
  exports = Type.Etherpad.Changeset.Changes.Formatting;
  return exports;
}(plugins_etherpad_changes_formatting);
plugins_etherpad_changeset_serializer = function (exports) {
  var Type = core;
  /**
   * Creates a new Type.Etherpad.ChangesetSerializer instance
   *
   * This class can be used to serialize a Type.Etherpad.Changeset
   * to a string for an Etherpad server
   *
   * @param {Type.Etherpad.Changeset} changeset
   * @constructor
   */
  Type.Etherpad.ChangesetSerializer = function (changeset) {
    this._operations = this._getOperations(changeset);
  };
  (function () {
    /**
     * Returns a serialized changeset string based on the length of
     * a given string or the text contents of a given element
     *
     * @param {string|Element} base - Either a string or an element
     * @returns {string} - The changeset string
     */
    this.getString = function (base) {
      var changeset, len, i;
      len = this._operations.length;
      changeset = this._baseLengthString(base);
      changeset += this._lengthChangeString();
      changeset += this._operationString(this._operations[0], null, base);
      for (i = 1; i < len; i += 1) {
        changeset += this._operationString(this._operations[i], this._operations[i - 1]);
      }
      changeset += this._charbankString();
      return changeset;
    };
    /**
     * Returns the length parameter for the changeset string
     *
     * Returns the length of either a string or the text inside
     * an element as a 36 base encoded number, prepended by 'Z:'
     *
     * @param {string|Element} base - Either a string or an element
     * @returns {string} - The 36 base encoded number
     * @private
     */
    this._baseLengthString = function (base) {
      return 'Z:' + this._lengthFor(base).toString(36);
    };
    /**
     * Returns the parameter for the changeset string that determines
     * the change in the length of the text.
     *
     * @returns {string}
     * @private
     */
    this._lengthChangeString = function () {
      var count = this._countLengthChange();
      return (count > 0 ? '>' : '<') + Math.abs(count).toString();
    };
    /**
     * Returns a serialized operation as a string
     *
     * @param {{op: string, start: number, end: number, text: string}|{op: string, start: number, numChars: number}} operation
     *     An insertion or removal object
     * @param {{op: string, start: number, end: number, text: string}|{op: string, start: number, numChars: number}} [prev]
     *     The operation before this operation
     * @returns {string} - The serialized string for the operation
     * @private
     */
    this._operationString = function (operation, prev, base) {
      var offset, hack, operatorSnd;
      offset = this._offsetString(operation, prev, base);
      hack = operation.op == '+' ? '*0' : '';
      if (/^[\n\r]+$/.test(operation.text || '')) {
        operatorSnd = '|1+1';  // todo Only works if charbank === a single newline
      } else {
        operatorSnd = operation.getOperation();
      }
      return offset + hack + operatorSnd;
    };
    /**
     * Returns the serialized charbank string from all
     * operations
     *
     * @returns {string}
     * @private
     */
    this._charbankString = function () {
      var charbank, len, i;
      charbank = '$';
      len = this._operations.length;
      for (i = 0; i < len; i += 1) {
        charbank += this._operationCharbankString(this._operations[i]);
      }
      return charbank;
    };
    /**
     * Return the text of an operation or an empty string
     *
     * @param {{op: string, start: number, end: number, text: string}|{op: string, start: number, numChars: number}} operation
     *     An insertion or removal object
     * @returns {string} - The text of the operation or an empty string
     * @private
     */
    this._operationCharbankString = function (operation) {
      return operation.text ? operation.text : '';
    };
    /**
     * Returns a serialized string calculating the delta
     * offset of 2 operations.
     *
     * @param {{op: string, start: number, end: number, text: string}|{op: string, start: number, numChars: number}} operation
     *     An insertion or removal object
     * @param {{op: string, start: number, end: number, text: string}|{op: string, start: number, numChars: number}} [prev]
     *     The operation before this operation
     * @returns {string} - The serialized offset string for the operation
     *     relative to is prev operation
     * @private
     */
    this._offsetString = function (operation, prev, base) {
      var offset = operation.start - (prev ? prev.start : 0);
      return offset > 0 ? '=' + offset.toString(36) : '';
    };
    /**
     *
     * @param str
     * @returns {Array}
     * @private
     */
    this._getNlIndices = function (str) {
      var regex = /[\n]/gi, result, indices = [];
      while (result = regex.exec(str)) {
        indices.push(result.index);
      }
      return indices;
    };
    /**
     * Returns the length of a string or the text inside an element
     *
     * @param {string|Element} base - Either a string or an element
     * @returns {number|null} - Will return the text length or null
     *     if the argument passed is not a string or an element
     * @private
     */
    this._lengthFor = function (base) {
      var change = 0, len, i;
      len = this._operations.length;
      for (i = 0; i < len; i += 1) {
        change += this._operations[i].getLength() || 0;
      }
      if (change < 0)
        change += 3;
      if (typeof base === 'string') {
        return base.length + change;
      }
      if (base.textContent) {
        return base.textContent.length - 1 + change;
      }
      return null;
    };
    /**
     * Returns if the sum of all characters added and removed in this
     * changeset
     *
     * @returns {number} - The sum of all characters added and removed
     *     in this changeset
     * @private
     */
    this._countLengthChange = function () {
      var change = 0, len, i;
      len = this._operations.length;
      for (i = 0; i < len; i += 1) {
        change += this._operations[i].getLength() || 0;
      }
      return change;
    };
    /**
     * Returns an array of all operations of a changeset
     * ordered by the start offset
     *
     * @param {Type.Etherpad.Changeset} changeset
     * @returns {Array}
     * @private
     */
    this._getOperations = function (changeset) {
      var operations = changeset.getStack().slice(0);
      operations.sort(this._compareOperations);
      return operations;
    };
    /**
     * Compares the offsets of two insertions. This method can be
     * used with Array.prototype.sort
     *
     * @param {{start: number, end: number, text: string}|{start: number, numChars: number}} a
     *     An insertion or removal object
     * @param {{start: number, end: number, text: string}|{start: number, numChars: number}} b
     *     An insertion or removal object
     * @returns {number}
     * @private
     */
    this._compareOperations = function (a, b) {
      if (a.start < b.start)
        return -1;
      if (a.start > b.start)
        return 1;
      return 0;
    };
  }.call(Type.Etherpad.ChangesetSerializer.prototype));
  exports = Type.Etherpad.ChangesetSerializer;
  return exports;
}(plugins_etherpad_changeset_serializer);
type = function (exports) {
  // Load core editor class
  var Type = core;
  // Load core modules
  development;
  settings;
  oop;
  event_api;
  plugin_api;
  environment;
  utilities;
  dom_utilities;
  dom_walker;
  text_walker;
  range;
  writer;
  formatter;
  caret;
  selection_overlay;
  selection;
  input;
  events_type;
  events_input;
  input_filters_caret;
  input_filters_undo;
  input_filters_command;
  input_filters_remove;
  input_filters_line_breaks;
  undo_manager;
  content;
  actions_type;
  actions_insert;
  actions_remove;
  actions_format;
  core_api;
  // Packaging Etherpad for development and demo
  plugins_etherpad_typeetherpad;
  plugins_etherpad_util;
  plugins_etherpad_client;
  plugins_etherpad_content;
  plugins_etherpad_changeset;
  plugins_etherpad_changes_change;
  plugins_etherpad_changes_movement;
  plugins_etherpad_changes_insertion;
  plugins_etherpad_changes_removal;
  plugins_etherpad_changes_formatting;
  plugins_etherpad_changeset_serializer;
  // Expose Type
  window.Type = Type;
  return exports;
}(type);
//# sourceMappingURL=.././src/type.js.map