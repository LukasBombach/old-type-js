'use strict';

// Load core editor class
var Type = require('./core');

// Load plugins
//require('./events'); // todo rewrite events as commented and get rid of this

// load core modules
require('./type_range');

// Expose Type
window.Type = Type;
