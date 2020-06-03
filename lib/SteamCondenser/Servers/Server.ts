'use strict';

export default class Server {
  protected ipAddress: string;
  protected port: number;

  constructor(address: string, port: number) {
    if(address.indexOf(":") != -1) {
      var parts = address.split(":");
      address = parts[0];
      port = Number.parseInt(parts[1]);
    }
    this.ipAddress = address;
    this.port = port;
    
    //this.initSocket();
  }
  
  
  disconnect() {throw new Error("Not implemented disconnect");}
  initSocket(): Promise<void> {throw new Error("Not implemented initSocket");}
}