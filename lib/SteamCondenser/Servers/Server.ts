'use strict';

export default class Server {
  protected ipAddress: string;
  protected port: number;

  constructor(address: string, port = 27015) {
    if(address.indexOf(":") != -1) {
      const parts = address.split(":");
      address = parts[0];
      port = Number.parseInt(parts[1]);
    }
    this.ipAddress = address;
    this.port = port;
  }
  
  
  disconnect() {throw new Error("Not implemented disconnect");}
  initSocket(): Promise<void> {throw new Error("Not implemented initSocket");}
}