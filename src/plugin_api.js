'use strict';

var Type = require('./core');

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
      this._plugins[name] = new (Function.prototype.bind.apply(value, params));

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

}).call(Type.fn);

