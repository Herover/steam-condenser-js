'use strict';
var Socket = require("./Socket.js");
var dgram = require("dgram");

module.exports = class UDPSocket extends Socket {
  constructor(address, port) {
    super(address, port);
  }
  
  connect() {
    var me = this;
    return new Promise(function(resolve, reject) {
      me.socket = dgram.createSocket("udp4");
      me.open = true;
      resolve();
    });
  }
  
  close() {
    var me = this;
    return new Promise(function(resolve, reject) {
      function onClose() {
        me.socket.removeListener("close", onClose);
        me.open = false;
        resolve();
      };
      me.socket.close();
      me.socket.on("close", onClose);
    })
  }
  
  send(buffer) {
    var me = this;
    if(typeof buffer.toBuffer == "function") buffer = buffer.toBuffer();
    
    // console.log("udpsocket.js send", buffer);
    
    return new Promise(function(resolve, reject) {
      me.socket.send(buffer, 0, buffer.length, me.port, me.ipAddress, function(err) {
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
      function onData(data, rinfo) {
        
        // console.log("udpsocket.js recv", data);
        
        var done = fn(data, rinfo);
        if(done !== false) {
          me.socket.removeListener("message", onData);
          me.socket.removeListener("error", onErr);
          resolve(done);
        }
      }
      function onErr(err) {
        me.socket.removeListener("message", onData);
        me.socket.removeListener("error", onErr);
        reject(err);
      }
      
      me.socket.on("message", onData);
      me.socket.on("error", onErr);
    });
  }
};
