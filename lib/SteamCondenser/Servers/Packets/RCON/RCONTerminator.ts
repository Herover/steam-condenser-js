
import RCONPacket from './RCONPacket';

export default class RCONTerminator extends RCONPacket {
  constructor(id: number) {
    super(id, '', 0x00);
  }
}
