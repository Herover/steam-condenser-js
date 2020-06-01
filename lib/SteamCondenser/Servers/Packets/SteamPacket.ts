"use strict";
var ByteBuffer = require("../../ByteBuffer.js");

class SteamPacket {
  constructor(headerData, contentData) {
    this.headerData = headerData;
    var buffer;
    if(typeof contentData == "number") {
      buffer = Buffer.alloc(4);
      buffer.writeInt32LE(contentData, 0);
    } 
    else {
      buffer = contentData;
    }
    this.contentData = new ByteBuffer(buffer);
  }
  
  getData() {
    return this.contentData.buffer;
  }
  
  getHeader() {
    return this.headerData;
  }
  
  toBuffer() {
    return Buffer.concat([Buffer.from([0xFF, 0xFF, 0xFF, 0xFF, this.getHeader()]), this.getData()]);
  }
}

SteamPacket.S2A_INFO_DETAILED_HEADER = 0x6D;
SteamPacket.A2S_INFO_HEADER = 0x54;
SteamPacket.S2A_INFO2_HEADER = 0x49;
SteamPacket.A2S_PLAYER_HEADER = 0x55;
SteamPacket.S2A_PLAYER_HEADER = 0x44;
SteamPacket.A2S_RULES_HEADER = 0x56;
SteamPacket.S2A_RULES_HEADER = 0x45;
SteamPacket.A2S_SERVERQUERY_GETCHALLENGE_HEADER = 0x57;
SteamPacket.S2C_CHALLENGE_HEADER = 0x41;
SteamPacket.A2M_GET_SERVERS_BATCH2_HEADER = 0x31;
SteamPacket.C2M_CHECKMD5_HEADER = 0x4D;
SteamPacket.M2A_SERVER_BATCH_HEADER = 0x66;
SteamPacket.M2C_ISVALIDMD5_HEADER = 0x4E;
SteamPacket.M2S_REQUESTRESTART_HEADER = 0x4F;
SteamPacket.RCON_GOLDSRC_CHALLENGE_HEADER = 0x63;
SteamPacket.RCON_GOLDSRC_NO_CHALLENGE_HEADER = 0x39;
SteamPacket.RCON_GOLDSRC_RESPONSE_HEADER = 0x6C;
SteamPacket.S2A_LOGSTRING_HEADER = 0x52;
SteamPacket.S2M_HEARTBEAT2_HEADER = 0x30;

module.exports = SteamPacket;