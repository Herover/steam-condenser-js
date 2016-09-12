'use strict';
var Socket = require("./Socket.js");
var net = require('net');

module.exports = class UDPSocket extends Socket {
  constructor(address, port) {
    super(address, port);
  }
  
  connect() {
    var me = this;
    return new Promise(function(resolve, reject) {
      function onConnected() {
        me.socket.removeListener("connect", onConnected);
        me.socket.removeListener("error", onErr);
        me.open = true;
        //console.log("connected");
        resolve();
      };
      function onErr() {
        me.socket.removeListener("connect", onConnected);
        me.socket.removeListener("error", onErr);
        reject();
      }
      me.socket = net.createConnection({
        host: me.ipAddress,
        port: me.port
      });
      me.socket.on("connect", onConnected);
      me.socket.on("error", onErr);
    })
  }
  
  close() {
    var me = this;
    return new Promise(function(resolve, reject) {
      function onErr(err) {
        me.socket.removeListener("error", onErr);
        me.socket.removeListener("end", onErr);
        reject(err);
      }
      function onEnd() {
        me.socket.removeListener("error", onErr);
        me.socket.removeListener("end", onErr);
        resolve();
      }
      me.socket.on("end", onEnd);
      me.socket.end();
    })
  }
  
  send(buffer) {
    var me = this;
    if(typeof buffer.toBuffer == "function") buffer = buffer.toBuffer();
    
     //console.log("tcpsocket.js send", buffer);
    
    return new Promise(function(resolve, reject) {
      me.socket.write(buffer, function(err) {
        if(err) {
          reject(err);
        }
        else {
          resolve();
        }
      });
    });
  }
  
  recv(fn) {
    var me = this;
    return new Promise(function(resolve, reject) {
      function onErr(err) {
        me.socket.removeListener("data", onData);
        me.socket.removeListener("error", onErr);
        reject(err);
      }
      function onData(data, rinfo) {
        
         //console.log("tcpsocket.js recv", data);
        
        var done = fn(data, rinfo);
        if(done !== false) {
          me.socket.removeListener("data", onData);
          me.socket.removeListener("error", onErr);
          resolve(done);
        }
      }
      
      me.socket.on("data", onData);
      me.socket.on("error", onErr);
    });
  }
};
