'use strict';
var Socket = require("./Socket.js");
var dgram = require("dgram");

module.exports = class UDPSocket extends Socket {
  constructor(address, port) {
    super(address, port);
  }
  
  connect() {
    return new Promise((resolve, reject) => {
      this.socket = dgram.createSocket("udp4");
      this.open = true;
      resolve();
    });
  }
  
  close() {
    return new Promise((resolve, reject) => {
      this.socket.close();
      this.socket.on("close", () => {
        this.open = false;
        resolve();
      });
    })
  }
  
  send(buffer) {
    if(typeof buffer.toBuffer == "function") buffer = buffer.toBuffer();
    
    // console.log("udpsocket.js send", buffer);
    
    return new Promise((resolve, reject) => {
      this.socket.send(buffer, 0, buffer.length, this.port, this.ipAddress, function(err) {
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
    let returned = false;
    return new Promise((resolve, reject) => {
      this.socket.on("message", (data, rinfo) => {
        if(returned) {
          // TODO: why do we recieve too many packets sometimes?
          // Look into getPlayers maybe
          return;
        }

        var done = fn(data, rinfo);
        if(done !== false) {
          returned = true;
          resolve(done);
        }
      });
      this.socket.on("error", (err) => {
        if(returned) {
          return;
        }

        returned = true;
        reject(err);
      });
    });
  }
};
