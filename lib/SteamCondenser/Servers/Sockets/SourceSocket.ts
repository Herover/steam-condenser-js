"use strict";
import UDPSocket from "../../UDPSocket";
import SteamSocket from "./SteamSocket";
import SteamPacketFactory from "./../Packets/SteamPacketFactory";
import SteamPacket from "../Packets/SteamPacket";

export default class SourceSocket extends SteamSocket {
  
  constructor(ipAddress: string, portNumber: number) {
    if(typeof portNumber == "undefined") {
      portNumber = 27015;
    }
    super(ipAddress, portNumber);
    
    this.socket = new UDPSocket(ipAddress, portNumber);
  }
  
  async getReply(): Promise<SteamPacket> {
    let isCompressed = false,
        receivedPackets = 0,
        packet,
        requestId,
        packetCount,
        packetNumber,
        splitPackets: Buffer[] = [],
        packetChecksum = -1,
        splitSize, bytesRead;

    bytesRead = await this.receivePacket(0);

    if (this.buffer.getLong() == -2) {
      let isMulti;
      do {
        requestId = this.buffer.getLong();
        packetCount = this.buffer.getByte();
        packetNumber = this.buffer.getByte() + 1;
        isCompressed = ((requestId & 0x80000000) != 0);
        
        if(isCompressed) {
          splitSize = this.buffer.getLong();
          packetChecksum = this.buffer.getUnsignedLong();
        } else {
          splitSize = this.buffer.getShort();
        }
        splitPackets[packetNumber - 1] = Buffer.from(this.buffer.get());
        receivedPackets++;

        if (packetCount != packetNumber) {
          try {
            bytesRead = await this.receivePacket();
          } catch(e) {
            // TODO: only handly timeouts silently
            bytesRead = 0;
          }
        } else {
          bytesRead = 0;
        }
      } while (bytesRead > 0 && this.buffer.getLong() == -2);
      
      if(isCompressed) {
        packet = SteamPacketFactory.ReassemblePacket(splitPackets, true, packetChecksum);
      } else {
        packet = SteamPacketFactory.ReassemblePacket(splitPackets);
      }
    } else {
      packet = SteamPacketFactory.GetPacketFromData(this.buffer.get());
    }
    return packet;
  }
}
