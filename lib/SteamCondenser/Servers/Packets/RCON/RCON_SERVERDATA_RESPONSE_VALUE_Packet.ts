'use strict';
import RCONPacket from "./RCONPacket";

export default class SERVERDATA_RESPONSE_VALUE_Packet extends RCONPacket {
  constructor(id: number, body: Buffer) {
    super(id, body, 0x00);
  }
  
  getResponse() {
    return this.body;
  }
}