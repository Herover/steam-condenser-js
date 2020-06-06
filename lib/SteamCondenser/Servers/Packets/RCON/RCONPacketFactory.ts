import SERVERDATA_RESPONSE_VALUE_Packet from "./RCON_SERVERDATA_RESPONSE_VALUE_Packet";
import SERVERDATA_AUTH_RESPONSE_Packet from "./RCON_SERVERDATA_AUTH_RESPONSE_Packet";
import RCONPacket from "./RCONPacket";

export default class RCONPacketFactory {
  static GetPacketFromData(buffer: Buffer): RCONPacket {
    //var size = buffer.readInt32LE(0);
    const requestID = buffer.readInt32LE(0);
    const type = buffer.readInt32LE(4);
    const body = buffer.slice(8, buffer.length - 2); 
    switch(type) {
      case 0x00:
        return new SERVERDATA_RESPONSE_VALUE_Packet(requestID, body);
      case 0x02:
        return new SERVERDATA_AUTH_RESPONSE_Packet(requestID);
      default:
        throw new Error("Unknown packet type " + type);
    }
  }
}
