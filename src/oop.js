'use strict';

var Type = require('./core');

Type.OOP = function () {};

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

}).call(Type.OOP);

module.exports = Type.OOP;
