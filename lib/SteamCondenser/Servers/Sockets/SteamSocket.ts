"use strict";
var ByteBuffer = require("../../ByteBuffer.js");
    
class SteamSocket {
  setTimeout(timeout) {
    this.timeout = timeout;
  }
  
  constructor(ipAddress, portNumber) {
    if(typeof portNumber == "undefined") {
      portNumber = 27015;
    }
    
    this.ipAddress = ipAddress;
    this.portNumber = portNumber;

    this.timeout = 15000;
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

    return this.socket.recv((data) => {
      var bytesRead = 0;
      this.buffer.put(data);
      bytesRead ++;
      //if(this.buffer.length == bufferLength || !(this.buffer.remaining() && data.length != bytesRead)) {
      //if(this.buffer.remaining() >= 0 || !(this.buffer.remaining() && data.length != bytesRead)) {
        //console.log("tt",this.buffer.position(), bufferLength, this.buffer.remaining(), data.length, bytesRead);
      //  return false;
      //} else {
        return true;
      //}
    })
    .then(() => {
      var bytesRead = this.buffer.position();
      this.buffer.rewind();
      this.buffer.limit(bytesRead);
      return bytesRead;
    });
  }
  
  send(dataPacket) {
    return this.socket.send(dataPacket.toBuffer());
  }
}

module.exports = SteamSocket;