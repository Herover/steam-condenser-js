
import RCONPacket from './RCONPacket';

export default class RCONServerdataResponseValuePacket extends RCONPacket {
  constructor(id: number, body: Buffer) {
    super(id, body, 0x00);
  }

  getResponse(): string {
    return this.body;
  }
}
