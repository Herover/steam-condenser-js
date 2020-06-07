
import RCONPacket from './RCONPacket';

export default class RCONServerdataAuthResponsePacket extends RCONPacket {
  constructor(id: number) {
    super(id, '', 0x02);
  }
}
