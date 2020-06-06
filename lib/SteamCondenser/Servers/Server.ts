'use strict';

export default abstract class Server {
  protected ipAddress: string;
  protected port: number;

  protected timeout = 30000;

  constructor(address: string, port = 27015) {
    if(address.indexOf(":") != -1) {
      const parts = address.split(":");
      address = parts[0];
      port = Number.parseInt(parts[1]);
    }
    this.ipAddress = address;
    this.port = port;
  }
  
  setTimeout(time: number): void {
    this.timeout = time;
  }
  
  abstract disconnect(): Promise<void>;
  abstract initSocket(): Promise<void>;
}