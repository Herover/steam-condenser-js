"use strict";
import SteamSocket from "./SteamSocket.js";
import TCPSocket from "../../TCPSocket.js";
import RCONPacketFactory from "../Packets/RCON/RCONPacketFactory";
import ByteBuffer from "../../ByteBuffer.js";
import SteamPacket from "../Packets/SteamPacket.js";
import RCONPacket from "../Packets/RCON/RCONPacket.js";

export default class RCONSocket extends SteamSocket {
  constructor(ipAddress: string, portNumber: number) {
    super(ipAddress, portNumber);
    this.buffer = ByteBuffer.Allocate(1400);
  }
  
  close() {
    if(typeof this.socket != "undefined") {
      return super.close();
    }
    return new Promise((resolve) => {resolve();});
  }
  
  send(dataPacket: RCONPacket) {
    var supersend = super.send;
    var ssend = () => {return supersend.call(this, dataPacket)};
    if(typeof this.socket == "undefined" || !this.socket.isOpen()) {
      this.socket = new TCPSocket(this.ipAddress, this.portNumber);
      return this.socket.connect()
        .then(() => {return ssend.call(this);});
    }
    else return ssend();
  }
  
  getReply(): Promise<RCONPacket> {
    var packetSize, remainingBytes = 4, packetData = Buffer.from("");
        var rec = (): Promise<RCONPacket> => {
          return new Promise((resolve, reject) => {
            if(remainingBytes > 0) {
              this.receivePacket(0)
                .then((bytesRead) => {
                  packetSize = this.buffer.getLong();
                  remainingBytes = packetSize + 4;
                  
                  remainingBytes -= bytesRead;
                  this.buffer.position(4);
                  packetData = Buffer.concat([packetData, this.buffer.get()]);
                  
                  resolve(rec());
                })
                .catch((e) => {
                  reject(e);
                });
            }
            else {
              var packet = RCONPacketFactory.GetPacketFromData(packetData);
              resolve(packet);
            }
          });
        }
        return rec();
  }
}
