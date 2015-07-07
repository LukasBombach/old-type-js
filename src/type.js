'use strict';

// Load core editor class
var Type = require('./core');

// Load core modules
require('./settings');
require('./event_api');
require('./plugin_api');
require('./environment');
require('./utilities');
require('./dom_utilities');
require('./dom_walker');
require('./text_walker');
require('./range');
require('./contents');
require('./formatting');
require('./caret');
require('./selection_overlay');
require('./selection');
require('./events/input');
require('./input_filters/caret');
require('./input_filters/command');
require('./input_filters/remove');
require('./input');

// Expose Type
window.Type = Type;
