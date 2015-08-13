'use strict';

/**
 * Creates a new Type.Etherpad.Client instance
 *
 * @param etherpad
 * @constructor
 */
Type.Etherpad.Client = function (etherpad) {
  this._etherpad = etherpad;
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
    this._socket.once('connect', function () {
      this.sendClientReady();
    }.bind(this));
    this._socket.on('message', this.handleMessage.bind(this));
    return this;
  };

  /**
   * Sends a 'CLIENT_READY' message to an Etherpad server
   * @returns {Type.Etherpad.Client} - This instance
   */
  this.sendClientReady = function() {
    var msg = {
      "component" : 'pad',
      "type"      : 'CLIENT_READY',
      "token"     : Type.Etherpad.Util.getRandomToken(),
      "padId"     : this._etherpad.options('padId'),
      "sessionID" : null,
      "password"  : null,
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

