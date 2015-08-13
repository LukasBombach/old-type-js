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
   * Connects to an Etherpad server
   * @returns {Type.Etherpad.Client} - This instance
   */
  this.connect = function () {

    var url = this._etherpad.options('url') || 'http://localhost:9001/';

    this._socket = io.connect(url, this._socketIoOptions());

    this._socket.once('connect', function () {
      this.sendClientReady(false);
    }.bind(this));

    this._socket.on('message', this.handleMessage.bind(this));

    return this;

  };

  /**
   * 
   * @param isReconnect
   * @param messageType
   */
  this.sendClientReady = function(isReconnect, messageType)
  {
    messageType = typeof messageType !== 'undefined' ? messageType : 'CLIENT_READY';
    var padId = this.padId;               //document.location.pathname.substring(document.location.pathname.lastIndexOf("/") + 1);
                                          //padId = decodeURIComponent(padId); // unescape neccesary due to Safari and Opera interpretation of spaces

    if(!isReconnect)
    {
      var titleArray = document.title.split('|');
      var title = titleArray[titleArray.length - 1];
      document.title = padId.replace(/_+/g, ' ') + " | " + title;
    }

    var token = this.readCookie("token");
    if (token == null)
    {
      token = "t." + this.randomString();
      this.createCookie("token", token, 60);
    }

    var sessionID = decodeURIComponent(this.readCookie("sessionID"));
    var password = this.readCookie("password");

    var msg = {
      "component": "pad",
      "type": messageType,
      "padId": padId,
      "sessionID": sessionID,
      "password": password,
      "token": token,
      "protocolVersion": 2
    };

    //this is a reconnect, lets tell the server our revisionnumber
    //if(isReconnect == true)
    //{
    //  msg.client_rev=pad.collabClient.getCurrentRevisionNumber();
    //  msg.reconnect=true;
    //}

    this.socket.json.send(msg);
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

