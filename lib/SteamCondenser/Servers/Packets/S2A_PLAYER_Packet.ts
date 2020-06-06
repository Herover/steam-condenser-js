"use strict";
import SteamPacket from "./SteamPacket";
import SteamPlayer from "../SteamPlayer";

export default class S2A_PLAYER_Packet extends SteamPacket {
  private playerHash: {[key: string]: SteamPlayer};

  constructor(contentData: Buffer) {
    if(typeof contentData == "undefined") {
      throw new Error("Wrong formatted S2A_PLAYER packet.");
    }
    super(SteamPacket.S2A_PLAYER_HEADER, contentData);
    
    this.contentData.getByte();
    
    this.playerHash = {};

    while(this.contentData.remaining() > 0) {
      const id = this.contentData.getByte()
      const name = this.contentData.getString()
      const score = this.contentData.getLong()
      const connectTime = this.contentData.getFloat()

      // id playerData[0] is always 0?
      this.playerHash[name] = new SteamPlayer(id, name, score, connectTime);
    }
  }
  
  getPlayerHash(): {[key: string]: SteamPlayer} {
    return this.playerHash;
  }
}
