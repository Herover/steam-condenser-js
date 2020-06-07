import ServerdataResponseValuePacket from './RCONServerdataResponseValuePacket';
import ServerdataAuthResponsePacket from './RCONServerdataAuthResponsePacket';
import RCONPacket from './RCONPacket';

export default class RCONPacketFactory {
  static GetPacketFromData(buffer: Buffer): RCONPacket {
    // var size = buffer.readInt32LE(0);
    const requestID = buffer.readInt32LE(0);
    const type = buffer.readInt32LE(4);
    const body = buffer.slice(8, buffer.length - 2);
    switch (type) {
      case 0x00:
        return new ServerdataResponseValuePacket(requestID, body);
      case 0x02:
        return new ServerdataAuthResponsePacket(requestID);
      default:
        throw new Error(`Unknown packet type ${type}`);
    }
  }
}
