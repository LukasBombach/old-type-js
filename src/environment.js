'use strict';

var Type = require('./core');

Type.Environment = function () {
};

(function () {

  /**
   * Is the user's computer a Macintosh computer
   * @type {boolean}
   */
  Type.Environment.mac = navigator.appVersion.indexOf("Mac") !== -1;

}).call(Type.Environment);

module.exports = Type.Environment;
