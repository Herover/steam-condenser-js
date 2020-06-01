"use strict";
var SteamPacket = require("./SteamPacket.js"),
    SteamPlayer = require("../SteamPlayer.js");

module.exports = class S2A_PLAYER_Packet extends SteamPacket {
  constructor(contentData) {
    if(typeof contentData == "undefined") {
      throw new Error("Wrong formatted S2A_PLAYER packet.");
    }
    super(SteamPacket.S2A_PLAYER_HEADER, contentData);
    
    this.contentData.getByte();
    
    this.playerHash = [];
    
    var playerData;
    while(this.contentData.remaining() > 0) {
      playerData = [this.contentData.getByte(), this.contentData.getString(), this.contentData.getLong(), this.contentData.getFloat()];
      // id playerData[0] is always 0?
      this.playerHash[playerData[1]] = new SteamPlayer(playerData[0], playerData[1], playerData[2], playerData[3]);
    }
  }
  
  getPlayerHash() {
    return this.playerHash;
  }
};
