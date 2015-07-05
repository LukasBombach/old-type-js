'use strict';

var singleton;

/**
 * todo use static methods instead of singleton
 * @constructor
 */
function Utilities() {

  /**
   * This behaves similar to jQuery's extend method. Writes all properties
   * from the objects passed as copyFrom to the object passed  as copyTo.
   * Copying starts from left to right and will overwrite each setting
   * subsequently.
   *
   * @param {*} copyTo
   * @param {...{}} copyFrom
   * @returns {*}
   */
  this.extend = function (copyTo, copyFrom) {
    var i, key;
    for (i = 1; i < arguments.length; i += 1)
      for (key in arguments[i])
        if (arguments[i].hasOwnProperty(key))
          arguments[0][key] = arguments[i][key];
    return arguments[0];
  };

  /**
   *
   * @param obj
   * @returns {boolean}
   */
  this.isFunction = function(obj) {
    return !!(obj && obj.constructor && obj.call && obj.apply);
  };

}

(function () {
}).call(Utilities.prototype);

singleton = new Utilities();

module.exports = singleton;
