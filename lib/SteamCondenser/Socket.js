'use strict';

module.exports = class Socket {
  constructor(address, port) {
    if(address.indexOf(":") != -1) {
      var parts = address.split(":");
      address = parts[0];
      port = parts[1];
    }
    this.ipAddress = address;
    this.port = Number.parseInt(port);
    this.open = false;
  }
  
  // Open connection
  connect() {throw new Error("Not implemented.");}
  
  // Close connection, remove listeners
  close() {throw new Error("Not implemented.");}
  
  // Send buffer
  send(buffer) {throw new Error("Not implemented.");}
  
  // Receive data
  // fn returns true when no more packets are expected
  recv(fn) {throw new Error("Not implemented.");}
  
  select(timeout) {throw new Error("Not implemented.");}
  
  isOpen() {
    if(typeof this.socket == "undefined") {
      return false;
    }
    return this.open;
  }
  
  resource() {
    return this.socket;
  }
}