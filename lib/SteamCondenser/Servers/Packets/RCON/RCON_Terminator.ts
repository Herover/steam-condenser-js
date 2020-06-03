'use strict';
import RCONPacket from "./RCONPacket";

export default class RCON_Terminator extends RCONPacket {
  constructor(id: number) {
    super(id, "", 0x00);
  }
}
