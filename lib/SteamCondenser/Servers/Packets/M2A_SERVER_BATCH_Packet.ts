"use strict";
import SteamPacket from "./SteamPacket";
import MasterServer from "../MasterServer";

export default class M2A_SERVER_BATCH_Packet extends SteamPacket {
  private serverArray: string[];

  constructor(contentData: Buffer) {
    super(MasterServer.M2A_SERVER_BATCH_HEADER, contentData);
    if(this.contentData.getByte() != 10) {
      throw new Error("Master query response is missing additional 0x0A byte.");
    }

    this.serverArray = [];
    
    while(this.contentData.remaining() > 0) {
      var ip = (this.contentData.getByte() & 0xFF) + "." +
          (this.contentData.getByte() & 0xFF) + "." +
          (this.contentData.getByte() & 0xFF) + "." +
          (this.contentData.getByte() & 0xFF),
        port = this.contentData.getShort() ;
      port = ((port & 0xFF) << 8) + (port >> 8);

      this.serverArray.push(ip + ":" + port);
    }
  }
  
  getServers() {
    return this.serverArray;
  }
};
