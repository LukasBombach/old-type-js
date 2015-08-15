'use strict';

var Type = require('../../core');

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
  Type.Etherpad.Util.nl2br = function(str)
  {
    return (str + '').replace(/([^>\r\n]?)(\r\n|\n\r|\r|\n)/g, '<br ' + '/>');
  };

  /**
   * Returns a random string starting with 't.' that can be used as a token for
   * connecting to an Etherpad server.
   *
   * @returns {string}
   */
  Type.Etherpad.Util.getRandomToken = function()
  {
    var chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz',
      stringLength = 20,
      randNumber,
      str = '';
    for (var i = 0; i < stringLength; i++)
    {
      randNumber = Math.floor(Math.random() * chars.length);
      str += chars.substring(randNumber, randNumber + 1);
    }
    return 't.' + str;
  };

}).call(Type.Etherpad.Util.prototype);


module.exports = Type.Etherpad.Util;

