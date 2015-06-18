'use strict';

var Type = require('./core');


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

}).call(Type.fn);


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

}).call(Type);
