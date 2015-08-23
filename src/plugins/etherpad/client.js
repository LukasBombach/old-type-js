'use strict';

var Type = require('../../core');

/**
 * Creates a new Type.Etherpad.Client instance
 *
 * @param etherpad
 * @constructor
 */
Type.Etherpad.Client = function (etherpad) {
  this._etherpad = etherpad;
  this._msgHandlers = {};
};

(function () {

  /**
   * The default URL the client connects to if no URL has been set
   * @type {string}
   * @private
   */
  this._defaultUrl = 'http://localhost:9001/';

  /**
   * Connects to an Etherpad server
   * @returns {Type.Etherpad.Client} - This instance
   */
  this.connect = function () {
    this._socket = io.connect(this._url(), this._socketIoOptions());
    this._socket.once('connect', this._sendClientReady.bind(this));
    this._socket.on('message', this._handleMessage.bind(this));
    return this;
  };

  /**
   * Sets a function that will be called when this client connects to
   * a server. The pad contents from the server will be passed to the
   * handler.
   * @param {Function} handler - The function that will be called
   * @returns {Type.Etherpad.Client} - This instance
   */
  this.onInit = function (handler) {
    this._onInitHandler = handler;
    return this;
  };

  /**
   * Registers a handler that will be called for a given message
   * @param {string} msg - The message on which the handler should be called
   * @param {Function} handler - The handler that should be called
   * @returns {Type.Etherpad.Client} - This instance
   */
  this.registerMessageHandler = function (msg, handler) {
    this._msgHandlers[msg] = this._msgHandlers[msg] || [];
    this._msgHandlers[msg].push(handler);
    return this;
  };

  /**
   * Removes a handler for a given message
   * @param {string} msg - The message on which the handler is called
   * @param {Function} handler - The handler that should be removed
   * @returns {Type.Etherpad.Client} - This instance
   */
  this.unregisterMessageHandler = function (msg, handler) {
    var index;
    if (this._msgHandlers[msg]) {
      index = this._msgHandlers[msg].indexOf(handler);
      if (index > -1) {
        this._msgHandlers[msg].splice(index, 1);
      }
    }
    return this;
  };

  /**
   * Will call the message handlers registered for Etherpad messages
   * @param {Object} response - The message from the server
   * @returns {Type.Etherpad.Client} - This instance
   * @private
   */
  this._handleMessage = function(response) {

    // Required variables
    var msg = response.data.type,
      len, i;

    // Dev code
    Type.Development.debug('message', response);

    // This message will be received when connecting to the server
    if(response.type === 'CLIENT_VARS') {
      this._init(response.data);
      return this;
    }

    // Notify developers on unhandled messages from the server
    if (!this._msgHandlers[msg]) {
      Type.Development.debug('Unhandled etherpad message', response);
      return this;
    }

    // For all other messsages call the according message handlers
    len = this._msgHandlers[msg].length;
    for (i = 0; i < len; i += 1) {
      this._msgHandlers[msg][i](response.data);
    }

    // Chaining
    return this;

  };

  /**
   * Will be called when this client successfully connected to an
   * Etherpad server.
   * @param {Object} data - The data that ther server sent
   * @returns {Type.Etherpad.Client} - This instance
   * @private
   */
  this._init = function(data) {
    this._revision = data.collab_client_vars.rev;
    this._userId = data.userId;
    if (this._onInitHandler) {
      this._onInitHandler(data.collab_client_vars.initialAttributedText, data.collab_client_vars.apool);
    }
    return this;
  };

  /**
   * Sends a 'CLIENT_READY' message to an Etherpad server
   * @returns {Type.Etherpad.Client} - This instance
   */
  this._sendClientReady = function() {
    var msg = {
      "isReconnect" : false,
      "component"   : 'pad',
      "type"        : 'CLIENT_READY',
      "token"       : Type.Etherpad.Util.getRandomToken(),
      "padId"       : this._etherpad.options('pad'),
      "sessionID"   : "null",
      "password"    : null,
      "protocolVersion": 2
    };
    this._socket.json.send(msg);
    return this;
  };

  /**
   * Returns the options to connect to an Etherpad server with socket.io
   * @returns {{path: string, resource: string, max reconnection attempts: number, sync disconnect on unload: boolean}}
   * @private
   */
  this._socketIoOptions = function () {
    return {
      'path' : '/socket.io',
      'resource' : 'socket.io',
      'max reconnection attempts' : 3,
      'sync disconnect on unload' : false
    };
  };

  /**
   * Returns the URL this client connects to
   * @returns {string}
   * @private
   */
  this._url = function () {
    return this._etherpad.options('url') || this._defaultUrl;
  }

}).call(Type.Etherpad.Client.prototype);


module.exports = Type.Etherpad.Client;

