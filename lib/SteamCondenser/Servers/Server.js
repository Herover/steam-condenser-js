'use strict';

module.exports = class Server {
  constructor(address, port) {
    if(address.indexOf(":") != -1) {
      var parts = address.split(":");
      address = parts[0];
      port = parts[1];
    }
    this.ipAddress = address;
    this.port = Number.parseInt(port);
    
    //this.initSocket();
  }
  
  
  disconnect() {throw new Error("Not implemented");}
  initSocket() {throw new Error("Not implemented");}
}