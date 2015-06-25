'use strict';

var DomUtil = require('./dom_utilities');
var TypeInput = require('./type_input');


/**
 * The main class and entry point to set up a Type instance in the browser.
 *
 * @class Type
 * @param options
 * @constructor
 */
function Type(options) {

  // Allow passing an element as only parameter
  if (DomUtil.isEl(options)) {
    options = { el: options };
  }

  // If no element has been passed, interrupt
  if (!options.el) {
    throw new Error('You must provide an element as root node for the editor\'s contents.');
  }

  // Save settings for this editor
  this.setOptions(options); // todo -> this.root = options.el;

  // Set up core editor modules
  this._plugins = {};
  this.input = new TypeInput(this);

  // Trigger events
  Type.trigger('ready', this);

}

(function () {

  /**
   * Holds the default options for every editor. These options
   * will be extended by the options passed to each instance
   * on instantiation.
   *
   * @type {{el: null}}
   * @private
   */
  this._defaultoOptions = {
    el : null
  };

  /**
   * Sets or gets the options to be used by this Type instance.
   *
   * Pass a single string to get an option:
   * this.options('el')
   * -> returns your editor's contents baseelement
   *
   * Pass a name value combination to set a specific option
   * this.options('el', myElement)
   * -> sets the base element
   *
   * Pass an object to set multiple options
   * this.options({el: myElement, foo:bar})
   * -> sets both parameters
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

    this._options = this._options || this._extend({}, this._defaultoOptions);

    if (typeof options === "string" && arguments.length === 1) {
      return this._options[options];
    }

    if (typeof options === "string" && arguments.length === 2) {
      options = {options: value};
    }

    if (typeof options === "object") {
      this._extend(this._options, options);
    }

    if (options.el) {
      this.root = options.el;
    }

    return this;

  };

  /**
   * Get or set a plugin
   *
   * @param {string} name - The name of the plugin that should
   *     be gotten and set
   * @param {*} [value] - The value to be set for the plugin
   * @returns {*}
   */
  this.plugin = function (name, value) {
    if (value !== null) this._plugins[name] = value;
    return this._plugins[name];
  };

  /**
   * Get or set a plugin
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

    if (this._plugins[name])
      return this._plugins[name];

    if (value instanceof Function) {
      this._plugins[name] = new (Function.prototype.bind.apply(value, params));
    } else {
      this._plugins[name] = value;
    }

    return this._plugins[name];
  };

  /**
   *
   * @param module
   * @param method
   * @param params
   * @param fallback
   * @returns {Type|*}
   */
  this.callMethodFrom = function (module, method, params, fallback) {

    var result = null;

    if (method in module) {
      result = module[method].apply(module, params);
    } else if (fallback) {
      result = fallback.apply(module, [method].concat(params));
    } else {
      throw new Error('Method ' + method + 'cannot be found in given module');
    }

    return result === module ? this : result;

  };

  /**
   * Setter for the internal document representation
   *
   * @param doc
   * @returns {Type}
   * @private
   */
  this._setDocument = function(doc) {
    this._document = doc;
    return this;
  };

  /**
   * Etherpad Dev code
   *
   * @returns {EtherpadInput}
   */
  /*
  this.etherpad = function(options) {

    //var reader = new EtherpadReader();
    //reader.getDocument(function(document) {
    //  console.log(document);
    //  var renderer = new Renderer(document);
    //  renderTo.appendChild(renderer.output());
    //});

    return new EtherpadInput({
      onContentLoaded : function(text, input) {
        var node = new DocumentNode('P');
        node.childNodes.push(new DocumentNode('TEXT', text));
        var document = new TypeDocument(node);
        var renderer = new Renderer(document);
        options.renderTo.appendChild(renderer.output());
        input.caret.moveTo(options.renderTo.childNodes[0].childNodes[0], 0)._blink();
        options.onload(input);
      }
    });

  }
 */

  /**
   *
   * @param {...{}} objects
   * @returns {*}
   * @private
   */
  this._extend = function(objects) {
    for(var i=1; i<arguments.length; i++)
      for(var key in arguments[i])
        if(arguments[i].hasOwnProperty(key))
          arguments[0][key] = arguments[i][key];
    return arguments[0];
  }



}).call(Type.prototype);

/**
 *
 * @param options
 * @constructor
 */
Type.fromEtherpad = function(options) {
  var etherpadInput = new EtherpadInput({
    onContentLoaded : function(text, input) {

      //var node = new DocumentNode('P');
      //node.childNodes.push(new DocumentNode('TEXT', text));
      //var document = new TypeDocument(node);
      //var renderer = new Renderer(document);
      //options.renderTo.appendChild(renderer.output());
      //input.caret.moveTo(options.renderTo.childNodes[0].childNodes[0], 0)._blink();
      //options.onload(input);

      var p = window.document.createElement('p');

      text = text.replace(/(?:\r\n|\r|\n)/g, '<br />');

      p.innerHTML = text;

      //var textNode = window.document.createTextNode(text);
      //p.appendChild(textNode);
      options.root.appendChild(p);
      input.caret.moveTo(options.root.childNodes[0].childNodes[0], 0)._blink();

      var type = new Type({
        root : options.root
      });

      var typeCaret = type._input._caret;

      typeCaret.registerCallback('_setOffset', function() {
        input.progagateCaret(this.offset, 0);
      });

      // todo numChars
      typeCaret.registerCallback('removeCharacter', function(numChars) {
        input.propagateUpdate(p, '-', typeCaret.offset - 1, 1);
      });

      typeCaret.registerCallback('insertText', function(val) {
        input.propagateUpdate(p, '+', typeCaret.offset, val.length, val);
      });

      return type;

    }
  });
};

/**
 * Exposes Type's prototype as jQuery-style shorthand
 *
 * @type {Object}
 */
Type.fn = Type.prototype;

/**
 * Module Exports for CommonJs
 *
 * @type {Type}
 */
module.exports = Type;
