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
  protected buffer: ByteBuffer = new ByteBuffer();;

  protected timeout: number;

  setTimeout(timeout: number) {
    this.timeout = timeout;
  }
  
  constructor(ipAddress: string, portNumber: number) {
    if(typeof portNumber == "undefined") {
      portNumber = 27015;
    }
    
    this.ipAddress = ipAddress;
    this.portNumber = portNumber;

    this.socket = new UDPSocket(ipAddress, portNumber);

    this.timeout = 15000;
  }
  
  connect() {
    return this.socket.connect();
  }
  
  close() {
    if(typeof this.socket != "undefined" && this.socket.isOpen()) {
      return this.socket.close();
    }
    else {
      return new Promise(function(resolve) {resolve();});
    }
  }
  
  getReply(): Promise<SteamPacket | RCONPacket | void> {throw new Error("Not implemented.");}
  
  async receivePacket(bufferLength?: number) {
    if(typeof bufferLength == "undefined") {
      bufferLength = 0;
    }
    
    if(bufferLength == 0) {
      this.buffer.clear();
    } else {
      this.buffer = ByteBuffer.Allocate(bufferLength);
    }
    return this.socket.recvBytes(bufferLength)
      .then((data) => {
        this.buffer.clear();
        this.buffer.put(data);
        this.buffer = ByteBuffer.Wrap(data);
        var bytesRead = data.length;
        this.buffer.rewind();
        return bytesRead;
      });
  }
  
  send(dataPacket: SteamPacket | RCONPacket) {
    return this.socket.send(dataPacket.toBuffer());
  }
}
