
import RCONPacket from './RCONPacket';

export default class RCONServerdataExeccommandPacket extends RCONPacket {
  constructor(id: number, body: string) {
    super(id, body, 0x02);
  }
}
