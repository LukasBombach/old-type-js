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
      this.sendClientReady(false);
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
      "padId"     : this._etherpad.options('padId'),
      "sessionID" : decodeURIComponent(this._readCookie('sessionID')),
      "password"  : this._readCookie('password'),
      "token"     : this._getRandomToken(),
      "protocolVersion": 2
    };

    this._socket.json.send(msg);

    return this;

  };

  /**
   * Returns a random string starting with 't.' that can be used as a token for
   * connecting to an Etherpad server.
   * @returns {string}
   * @private
   */
  this._getRandomToken = function()
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
   *
   * @param name
   * @returns {*}
   */
  this._readCookie = function(name)
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
   *
   * @param name
   * @param value
   * @param days
   * @param path
   */
  this._createCookie = function(name, value, days, path){ /* Warning Internet Explorer doesn't use this it uses the one from pad_utils.js */
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

  /**
   * Returns the options to connect to an Etherpad server with socket.io
   * @returns {{path: string, resource: string, max reconnection attempts: number,
   *     sync disconnect on unload: boolean}}
   * @private
   */
  this._socketIoOptions = function () {

    var baseURL = '/',
      resource  = 'socket.io';

    return {
      'path' : baseURL + "socket.io",
      'resource' : resource,
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

/**
 *
 * @param options
 * @constructor
 */
Type.fromEtherpad = function(options) {



};

module.exports = Type.Etherpad.Client;

