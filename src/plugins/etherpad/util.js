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

  /**
   * For demo purposes taken from Etherpad
   * From https://github.com/ether/etherpad-lite
   * License: MIT
   * @param name
   * @returns {*}
   */
  Type.Etherpad.Util.readCookie = function(name)
  {
    var nameEQ = name + "=";
    var ca = document.cookie.split(';');
    for (var i = 0; i < ca.length; i++)
    {
      var c = ca[i];
      while (c.charAt(0) == ' ') c = c.substring(1, c.length);
      if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length, c.length);
    }
    return null;
  };

  /**
   * For demo purposes taken from Etherpad
   * From https://github.com/ether/etherpad-lite
   * License: MIT
   * @param name
   * @param value
   * @param days
   * @param path
   */
  Type.Etherpad.Util.createCookie = function(name, value, days, path){ /* Warning Internet Explorer doesn't use this it uses the one from pad_utils.js */
    if (days)
    {
      var date = new Date();
      date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
      var expires = "; expires=" + date.toGMTString();
    }
    else{
      var expires = "";
    }

    if(!path){ // If the path isn't set then just whack the cookie on the root path
      path = "/";
    }

    //Check if the browser is IE and if so make sure the full path is set in the cookie
    if((navigator.appName == 'Microsoft Internet Explorer') || ((navigator.appName == 'Netscape') && (new RegExp("Trident/.*rv:([0-9]{1,}[\.0-9]{0,})").exec(navigator.userAgent) != null))){
      document.cookie = name + "=" + value + expires + "; path="+document.location;
    }
    else{
      document.cookie = name + "=" + value + expires + "; path=" + path;
    }
  };

}).call(Type.Etherpad.Util.prototype);


module.exports = Type.Etherpad.Util;

