"use strict";
import ByteBuffer from "../../ByteBuffer";
import UDPSocket from "../../UDPSocket";
import SteamPacket from "../Packets/SteamPacket";
import TCPSocket from "../../TCPSocket";
import RCONPacket from "../Packets/RCON/RCONPacket";
    
export default class SteamSocket {
  protected ipAddress: string;
  protected portNumber: number;

  protected socket: UDPSocket | TCPSocket;
  protected buffer: ByteBuffer = new ByteBuffer();

  protected timeout = 30000;

  setTimeout(timeout: number): void {
    this.timeout = timeout;
    this.socket.setTimeout(timeout);
  }
  
  constructor(ipAddress: string, portNumber: number) {
    if(typeof portNumber == "undefined") {
      portNumber = 27015;
    }
    
    this.ipAddress = ipAddress;
    this.portNumber = portNumber;

    this.socket = new UDPSocket(ipAddress, portNumber);
    this.socket.setTimeout(this.timeout);
  }
  
  async connect(): Promise<void> {
    return this.socket.connect();
  }
  
  async close(): Promise<void> {
    if(typeof this.socket != "undefined" && this.socket.isOpen()) {
      return this.socket.close();
    }
  }
  
  getReply(): Promise<SteamPacket | RCONPacket | void> {throw new Error("Not implemented.");}
  
  async receivePacket(bufferLength?: number): Promise<number> {
    if(typeof bufferLength == "undefined") {
      bufferLength = 0;
    }
    
    if(bufferLength == 0) {
      this.buffer.clear();
    } else {
      this.buffer = ByteBuffer.Allocate(bufferLength);
    }
    const data = await this.socket.recvBytes(bufferLength);
    this.buffer.clear();
    this.buffer.put(data);
    this.buffer = ByteBuffer.Wrap(data);
    const bytesRead = data.length;
    this.buffer.rewind();
    return bytesRead;
  }
  
  send(dataPacket: SteamPacket | RCONPacket): Promise<void> {
    return this.socket.send(dataPacket.toBuffer());
  }
}
