'use strict';
var Socket = require("./Socket.js");
var net = require('net');

module.exports = class UDPSocket extends Socket {
  constructor(address, port) {
    super(address, port);
  }
  
  connect() {
    return new Promise((resolve, reject) => {
      this.socket = net.createConnection({
        host: this.ipAddress,
        port: this.port
      });
      this.socket.on("connect", () => {
        this.open = true;
        //console.log("connected");
        resolve();
      });
      this.socket.on("error", () => {
        reject();
      });
    })
  }
  
  close() {
    return new Promise((resolve, reject) => {
      this.socket.on("end", () => resolve());
      this.socket.end();
    })
  }
  
  send(buffer) {
    if(typeof buffer.toBuffer == "function") buffer = buffer.toBuffer();
    
     //console.log("tcpsocket.js send", buffer);
    
    return new Promise((resolve, reject) => {
      this.socket.write(buffer, (err) => {
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
    var returned = false;
    return new Promise((resolve, reject) => {
      this.socket.on("data", (data, rinfo) => {
        if(returned){
          return;
        }

        var done = fn(data, rinfo);
        if(done !== false) {
          returned = true;
          resolve(done);
        }
      });
      this.socket.on("error", (err) => {
        reject(err);
      });
    });
  }
};
