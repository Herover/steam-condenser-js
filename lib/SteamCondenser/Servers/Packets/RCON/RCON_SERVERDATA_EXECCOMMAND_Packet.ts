'use strict';
import RCONPacket from "./RCONPacket";

export default class RCON_SERVERDATA_EXECCOMMAND_Packet extends RCONPacket {
  constructor(id: number, body: string) {
    super(id, body, 0x02);
  }
}