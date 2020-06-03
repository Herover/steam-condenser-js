"use strict";
import UDPSocket from "../../UDPSocket";
import SteamSocket from "./SteamSocket";
import ByteBuffer from "../../ByteBuffer";
import SteamPacketFactory from "./../Packets/SteamPacketFactory";
import SteamPacket from "../Packets/SteamPacket";

export default class MasterServerSocket extends SteamSocket {
  constructor(ipAddress: string, portNumber: number) {
    super(ipAddress, portNumber);

    this.socket = new UDPSocket(ipAddress, portNumber);
    this.socket.connect();
  }

  getReply(): Promise<SteamPacket> {
    var packetSize, remainingBytes = 4, packetData = Buffer.from("");
    return new Promise((resolve, reject) => {
      var timeoutTimer = setTimeout(() => {reject(new Error("TimeoutException"))}, this.timeout);
      return this.receivePacket(1500)
        .then((bytesRead: number) => {
          if(this.buffer.getLong() != -1) {
            clearTimeout(timeoutTimer);
            reject(new Error("Master query response has wrong packet header."));
          }

          var packet = SteamPacketFactory.GetPacketFromData(this.buffer.get());

          clearTimeout(timeoutTimer);
          resolve(packet);
        })
    })
  }
}
