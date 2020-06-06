"use strict";
import SteamPacket from "./SteamPacket";

export default class M2A_SERVER_BATCH_Packet extends SteamPacket {
  private serverArray: string[];

  constructor(contentData: Buffer) {
    super(SteamPacket.M2A_SERVER_BATCH_HEADER, contentData);
    if(this.contentData.getByte() != 10) {
      throw new Error("Master query response is missing additional 0x0A byte.");
    }

    this.serverArray = [];
    
    while(this.contentData.remaining() > 0) {
      const ip = (this.contentData.getByte() & 0xFF) + "." +
          (this.contentData.getByte() & 0xFF) + "." +
          (this.contentData.getByte() & 0xFF) + "." +
          (this.contentData.getByte() & 0xFF);
      let port = this.contentData.getUShort() ;
      port = ((port & 0xFF) << 8) + (port >> 8);

      this.serverArray.push(ip + ":" + port);
    }
  }
  
  getServers(): string[] {
    return this.serverArray;
  }
}
