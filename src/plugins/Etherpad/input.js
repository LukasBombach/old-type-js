'use strict';

var Etherpad = require('./EtherpadLite');
var Caret = require('../../input/Caret');

/**
 * Loads a document from an Etherpad Pad
 * @constructor
 */
function EtherpadInput(options) {

  //this.etherpad = new Etherpad({apikey: '6535d0f30f0ce73a5a183dd1ee1909b5a233ed5d024bc0bc09bf35ee78ca0671'});

  this.options = options || {};

  var self = this;

  this.caret = new Caret();

  var url = 'http://localhost:9001/';
  var baseURL = '/';
  var resource = 'socket.io';

  this.socket = io.connect(url, {
    'path': baseURL + "socket.io",
    'resource': resource,
    'max reconnection attempts': 3,
    'sync disconnect on unload' : false
  });

  this.socket.once('connect', function () {
    self.sendClientReady(false);
  });

  this.socket.on('message', this.handleMessage.bind(this));

}

(function () {

  this.padId = 'Test';

  this.handleMessage = function(response) {
    console.log('message', response);

    if(response.type === 'CLIENT_VARS') {
      this.initEditor(response.data);
    } else {
      switch(response.data.type) {
        case 'NEW_CHANGES':
          this.updateContent(response.data);
          break;
        default:
          break;
      }
    }
  };

  this.initEditor = function(response) {
    var contents = response.collab_client_vars.initialAttributedText.text;
    if(this.options.onContentLoaded) {
      this.options.onContentLoaded(contents, this);
    }
  };

  this.updateContent = function(data) {

    var changeSet = data.changeset,
      attribtues, operator, value, match;

    // Matches an array of results for each operation
    var regex = /((?:\*[0-9a-z]+)*)(?:\|([0-9a-z]+))?([-+=])([0-9a-z]+)|\?|/g,
      opsEnd = changeSet.indexOf('$') + 1,
      charBank = opsEnd >= 0 ? changeSet.substring(opsEnd) : null;

    while ((match = regex.exec(changeSet)) !== null) {
      if (match.index === regex.lastIndex) {
        regex.lastIndex++;
      }
      if(match[0] != '') {
        attribtues = match[1];
        operator = match[3];
        value = match[4];
        switch(operator) {
          case '=':
            this.caret._setOffset(this.caret.offset + parseInt(value, 36));
            break;
          case '+':
            this.caret.insertText(charBank)
        }
      }
    }
  };

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

  this.randomString = function()
  {
    var chars = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
    var string_length = 20;
    var randomstring = '';
    for (var i = 0; i < string_length; i++)
    {
      var rnum = Math.floor(Math.random() * chars.length);
      randomstring += chars.substring(rnum, rnum + 1);
    }
    return "t." + randomstring;
  };

  this.readCookie = function(name)
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

  this.createCookie = function(name, value, days, path){ /* Warning Internet Explorer doesn't use this it uses the one from pad_utils.js */
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

}).call(EtherpadInput.prototype);

module.exports = EtherpadInput;
