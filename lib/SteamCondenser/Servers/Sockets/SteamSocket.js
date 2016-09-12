"use strict";
var ByteBuffer = require("./../../ByteBuffer.js");
    
class SteamSocket {
  setTimeout(timeout) {
    SteamSocket.timeout = timeout;
  }
  
  constructor(ipAddress, portNumber) {
    if(typeof portNumber == "undefined") {
      portNumber = 27015;
    }
    
    this.ipAddress = ipAddress;
    this.portNumber = portNumber;
  }
  
  connect() {
    return this.socket.connect(this.ipAddress, this.portNumber, 0);
  }
  
  close() {
    if(typeof this.socket != "undefined" && this.socket.isOpen()) {
      return this.socket.close();
    }
    else {
      return new Promise(function(resolve) {resolve();});
    }
  }
  
  getReply() {throw new Error("Not implemented.");}
  
  receivePacket(bufferLength) {
    if(typeof bufferLength == "undefined") {
      bufferLength = 0;
    }
    
    if(bufferLength == 0) {
      this.buffer.clear();
    } else {
      this.buffer = ByteBuffer.allocate(bufferLength);
    }
    var me = this;
    return this.socket.recv(function(data) {
      var bytesRead = 0;
      me.buffer.put(data);
      bytesRead ++;
      //if(me.buffer.length == bufferLength || !(me.buffer.remaining() && data.length != bytesRead)) {
      //if(me.buffer.remaining() >= 0 || !(me.buffer.remaining() && data.length != bytesRead)) {
        //console.log("tt",me.buffer.position(), bufferLength, me.buffer.remaining(), data.length, bytesRead);
      //  return false;
      //} else {
        return true;
      //}
    })
    .then(function() {
      var bytesRead = me.buffer.position();
      me.buffer.rewind();
      me.buffer.limit(bytesRead);
      return bytesRead;
    });
  }
  
  send(dataPacket) {
    return this.socket.send(dataPacket.toBuffer());
  }
}

module.exports = SteamSocket;