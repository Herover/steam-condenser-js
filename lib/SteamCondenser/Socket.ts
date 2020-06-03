'use strict';
import net from 'net';
import dgram from 'dgram';
import SteamPacket from './Servers/Packets/SteamPacket';

export default class Socket {
  protected ipAddress: string;
  protected port: number;
  protected open: boolean;
  protected socket?: net.Socket | dgram.Socket;

  constructor(address: string, port: number) {
    if(address.indexOf(":") != -1) {
      var parts = address.split(":");
      address = parts[0];
      port = Number.parseInt(parts[1]);
    }
    this.ipAddress = address;
    this.port = port;
    this.open = false;
  }
  
  // Open connection
  connect() {throw new Error("Not implemented connect");}
  
  // Close connection, remove listeners
  close() {throw new Error("Not implemented close");}
  
  // Send buffer
  send(buffer: Buffer | SteamPacket): Promise<void> {throw new Error("Not implemented send");}
  
  // Receive data
  // fn returns true when no more packets are expected
  recv(fn: (buffer: Buffer, rinfo: any) => boolean) {throw new Error("Not implemented recv");}
  
  select(timeout: number) {throw new Error("Not implemented select");}
  
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