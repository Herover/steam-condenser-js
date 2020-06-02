"use strict";
import ByteBuffer from "../../ByteBuffer.js";
import UDPSocket from "../../UDPSocket.js";
import SteamPacket from "../Packets/SteamPacket.js";
import TCPSocket from "../../TCPSocket.js";
import RCONPacket from "../Packets/RCON/RCONPacket.js";
    
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
  
  getReply(): Promise<SteamPacket | RCONPacket> {throw new Error("Not implemented.");}
  
  receivePacket(bufferLength?: number) {
    if(typeof bufferLength == "undefined") {
      bufferLength = 0;
    }
    
    if(bufferLength == 0) {
      this.buffer.clear();
    } else {
      this.buffer = ByteBuffer.Allocate(bufferLength);
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
  
  send(dataPacket: SteamPacket | RCONPacket) {
    return this.socket.send(dataPacket.toBuffer());
  }
}
