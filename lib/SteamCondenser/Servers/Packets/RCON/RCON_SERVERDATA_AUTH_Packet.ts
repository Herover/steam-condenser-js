'use strict';
import RCONPacket from "./RCONPacket";

export default class RCON_SERVERDATA_AUTH_Packet extends RCONPacket {
  constructor(id: number, pw: string) {
    super(id, pw, 0x03);
  }
}