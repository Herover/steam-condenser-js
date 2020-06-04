import SERVERDATA_RESPONSE_VALUE_Packet from "./RCON_SERVERDATA_RESPONSE_VALUE_Packet";
import SERVERDATA_AUTH_RESPONSE_Packet from "./RCON_SERVERDATA_AUTH_RESPONSE_Packet";

export default class RCONPacketFactory {
  static GetPacketFromData(buffer: Buffer) {
    //var size = buffer.readInt32LE(0);
    var requestID = buffer.readInt32LE(0);
    var type = buffer.readInt32LE(4);
    var body = buffer.slice(8, buffer.length - 2); 
    switch(type) {
      case 0x00:
        return new SERVERDATA_RESPONSE_VALUE_Packet(requestID, body);
        break;
      case 0x02:
        return new SERVERDATA_AUTH_RESPONSE_Packet(requestID);
        break;
      default:
        throw new Error("Unknown packet type " + type);
    }
  }
}
