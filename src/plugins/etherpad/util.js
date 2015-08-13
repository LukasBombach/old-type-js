'use strict';

/**
 * Creates a new Type.Etherpad.Util instance
 *
 * @param etherpad
 * @constructor
 */
Type.Etherpad.Util = function () {
};

(function () {

  /**
   * Returns a random string starting with 't.' that can be used as a token for
   * connecting to an Etherpad server.
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

