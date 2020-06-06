'use strict';
import net from 'net';
import dgram from 'dgram';
import SteamPacket from './Servers/Packets/SteamPacket';

export default abstract class Socket {
  protected ipAddress: string;
  protected port: number;
  protected open: boolean;
  protected socket?: net.Socket | dgram.Socket;

  constructor(address: string, port: number) {
    if(address.indexOf(":") != -1) {
      const parts = address.split(":");
      address = parts[0];
      port = Number.parseInt(parts[1]);
    }
    this.ipAddress = address;
    this.port = port;
    this.open = false;
  }
  
  // Open connection
  connect(): Promise<void> {throw new Error("Not implemented connect");}
  
  // Close connection, remove listeners
  close(): Promise<void> {throw new Error("Not implemented close");}
  
  // Send buffer
  abstract send(buffer: Buffer | SteamPacket): Promise<void>;

  abstract recvBytes(bytes: number): Promise<Buffer>;
  
  // Receive data
  // fn returns true when no more packets are expected
  abstract recv(fn: (buffer: Buffer) => boolean): Promise<boolean>;
  
  isOpen(): boolean {
    if(typeof this.socket == "undefined") {
      return false;
    }
    return this.open;
  }
  
  resource(): net.Socket | dgram.Socket | void {
    return this.socket;
  }
}