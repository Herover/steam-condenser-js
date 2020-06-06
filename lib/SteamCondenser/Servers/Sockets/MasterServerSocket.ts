"use strict";
import UDPSocket from "../../UDPSocket";
import SteamSocket from "./SteamSocket";
import SteamPacketFactory from "./../Packets/SteamPacketFactory";
import SteamPacket from "../Packets/SteamPacket";

export default class MasterServerSocket extends SteamSocket {
  constructor(ipAddress: string, portNumber: number) {
    super(ipAddress, portNumber);

    this.socket = new UDPSocket(ipAddress, portNumber);
  }

  async connect(): Promise<void> {
    await this.socket.connect();
  }

  async getReply(): Promise<SteamPacket> {
    await this.receivePacket();

    if (this.buffer.getLong() != -1) {
      throw new Error("Master query response has wrong packet header.")
    }

    const packet = SteamPacketFactory.GetPacketFromData(this.buffer.get());
    return packet;
  }
}
