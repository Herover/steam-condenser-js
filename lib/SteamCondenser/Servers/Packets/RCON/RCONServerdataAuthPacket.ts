
import RCONPacket from './RCONPacket';

export default class RCONServerdataAuthPacket extends RCONPacket {
  constructor(id: number, pw: string) {
    super(id, pw, 0x03);
  }
}
