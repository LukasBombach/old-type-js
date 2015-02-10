'use strict';

var Cmd = require('./modules/cmd.js');

var cmd = new Cmd();

/**
 * The main class required to set up a Type instance in the browser.
 *
 * @class Type
 * @constructor
 */
var Type = function() {
  console.log('HELLO');
  cmd.bold();
};


global.Type = Type;