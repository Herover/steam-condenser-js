"use strict";
import SteamPacket from "./SteamPacket";
import SteamPlayer from "../SteamPlayer";

export default class S2A_PLAYER_Packet extends SteamPacket {
  private playerHash: SteamPlayer[];

  constructor(contentData: Buffer) {
    if(typeof contentData == "undefined") {
      throw new Error("Wrong formatted S2A_PLAYER packet.");
    }
    super(SteamPacket.S2A_PLAYER_HEADER, contentData);
    
    this.contentData.getByte();
    
    this.playerHash = [];
    
    let playerData: any[];

    while(this.contentData.remaining() > 0) {
      playerData = [this.contentData.getByte(), this.contentData.getString(), this.contentData.getLong(), this.contentData.getFloat()];
      // id playerData[0] is always 0?
      this.playerHash[playerData[1]] = new SteamPlayer(playerData[0], playerData[1], playerData[2], playerData[3]);
    }
  }
  
  getPlayerHash() {
    return this.playerHash;
  }
}
