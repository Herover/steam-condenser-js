import S2AInfoBasePacket from './S2AInfoBasePacket';
import SteamPacket from './SteamPacket';

export default class S2AInfoDetailedPacket extends S2AInfoBasePacket {
  constructor(contentData: Buffer) {
    super(SteamPacket.S2A_INFO_DETAILED_HEADER, contentData);

    this.info.serverIp = this.contentData.getString();
    this.info.serverName = this.contentData.getString();
    this.info.mapName = this.contentData.getString();
    this.info.gameDir = this.contentData.getString();
    this.info.gameDesc = this.contentData.getString();
    this.info.numberOfPlayers = this.contentData.getByte();
    this.info.maxPlayers = this.contentData.getByte();
    this.info.networkVersion = this.contentData.getByte();
    this.info.dedicated = String.fromCharCode(this.contentData.getByte());
    this.info.operatingSystem = String.fromCharCode(this.contentData.getByte());
    this.info.passwordProtected = this.contentData.getByte() === 1;
    const isMod = this.contentData.getByte() === 1;
    this.info.isMod = isMod;

    if (isMod) {
      const modInfo: { [key: string]: number | string | boolean } = {};
      modInfo.urlInfo = this.contentData.getString();
      modInfo.urlDl = this.contentData.getString();
      if (this.contentData.remaining() === 12) {
        modInfo.modVersion = this.contentData.getShort();
        modInfo.modSize = this.contentData.getShort();
        modInfo.svOnly = this.contentData.getByte() === 1;
        modInfo.clDll = this.contentData.getByte() === 1;
        this.info.secureServer = this.contentData.getByte() === 1;
        this.info.botNumber = this.contentData.getByte();
      }
      this.info.modInfo = modInfo;
    } else {
      this.info.secureServer = this.contentData.getByte() === 1;
      this.info.botNumber = this.contentData.getByte();
    }
  }
}
