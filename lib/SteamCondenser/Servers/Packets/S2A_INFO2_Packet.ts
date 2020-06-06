"use strict";
import S2A_INFO_BasePacket from "./S2A_INFO_BasePacket";
import SteamPacket from "./SteamPacket";

export default class S2A_INFO2_Packet extends S2A_INFO_BasePacket {
  constructor(data: Buffer) {
    super(SteamPacket.S2A_INFO2_HEADER, data);
    
    this.info.networkVersion = this.contentData.getByte();
    this.info.serverName = this.contentData.getString();
    this.info.mapName = this.contentData.getString();
    this.info.gameDir = this.contentData.getString();
    this.info.gameDesc = this.contentData.getString();
    this.info.appId = this.contentData.getShort();
    this.info.numberOfPlayers = this.contentData.getByte();
    this.info.maxPlayers = this.contentData.getByte();
    this.info.botNumber = this.contentData.getByte();
    this.info.dedicated = String.fromCharCode(this.contentData.getByte());
    this.info.operatingSystem = String.fromCharCode(this.contentData.getByte());
    this.info.passwordProtected = this.contentData.getByte() == 1;
    this.info.secureServer = this.contentData.getByte() == 1;
    this.info.gameVersion = this.contentData.getString();

    if(this.contentData.remaining() > 0) {
      const extraDataFlag = this.contentData.getByte();
      if (extraDataFlag & S2A_INFO2_Packet.EDF_GAME_PORT) {
        this.info.serverPort = this.contentData.getShort();
      }
      if (extraDataFlag & S2A_INFO2_Packet.EDF_SERVER_ID) {
        this.info.serverId = this.contentData.getUnsignedLong() | (this.contentData.getUnsignedLong() << 32);
      }
      if (extraDataFlag & S2A_INFO2_Packet.EDF_SOURCE_TV) {
        this.info.tvPort = this.contentData.getShort();
        this.info.tvName = this.contentData.getString();
      }
      if (extraDataFlag & S2A_INFO2_Packet.EDF_SERVER_TAGS) {
        this.info.serverTags = this.contentData.getString();
      }
      if (extraDataFlag & S2A_INFO2_Packet.EDF_GAME_ID) {
        this.info.gameId = this.contentData.getUnsignedLong() | (this.contentData.getUnsignedLong() << 32);
      }
    }
  }

  static EDF_GAME_ID     = 0x01;
  static EDF_GAME_PORT   = 0x80;
  static EDF_SERVER_ID   = 0x10;
  static EDF_SERVER_TAGS = 0x20;
  static EDF_SOURCE_TV   = 0x40;
}
