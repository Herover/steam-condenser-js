
import ByteBuffer from '../../ByteBuffer';

export default class SteamPacket {
  protected headerData: number;

  protected contentData: ByteBuffer;

  constructor(headerData: number, contentData?: Buffer | number) {
    this.headerData = headerData;
    let buffer;
    if (typeof contentData === 'number') {
      buffer = Buffer.alloc(4);
      buffer.writeInt32LE(contentData, 0);
    } else {
      buffer = contentData;
    }
    this.contentData = new ByteBuffer(buffer);
  }

  getData(): Buffer {
    return this.contentData.getBuffer();
  }

  getHeader(): number {
    return this.headerData;
  }

  toBuffer(): Buffer {
    return Buffer.concat([Buffer.from([0xFF, 0xFF, 0xFF, 0xFF, this.getHeader()]), this.getData()]);
  }

  static S2A_INFO_DETAILED_HEADER = 0x6D;

  static A2S_INFO_HEADER = 0x54;

  static S2A_INFO2_HEADER = 0x49;

  static A2S_PLAYER_HEADER = 0x55;

  static S2A_PLAYER_HEADER = 0x44;

  static A2S_RULES_HEADER = 0x56;

  static S2A_RULES_HEADER = 0x45;

  static A2S_SERVERQUERY_GETCHALLENGE_HEADER = 0x57;

  static S2C_CHALLENGE_HEADER = 0x41;

  static A2M_GET_SERVERS_BATCH2_HEADER = 0x31;

  static C2M_CHECKMD5_HEADER = 0x4D;

  static M2A_SERVER_BATCH_HEADER = 0x66;

  static M2C_ISVALIDMD5_HEADER = 0x4E;

  static M2S_REQUESTRESTART_HEADER = 0x4F;

  static RCON_GOLDSRC_CHALLENGE_HEADER = 0x63;

  static RCON_GOLDSRC_NO_CHALLENGE_HEADER = 0x39;

  static RCON_GOLDSRC_RESPONSE_HEADER = 0x6C;

  static S2A_LOGSTRING_HEADER = 0x52;

  static S2M_HEARTBEAT2_HEADER = 0x30;
}
