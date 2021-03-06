'use strict';

var Type = require('./core');

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
      console.log.apply(console, arguments)
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
      console.debug.apply(console, arguments)
    }
    return Type.Development;
  };

}).call(Type.Development);

module.exports = Type.Development;

