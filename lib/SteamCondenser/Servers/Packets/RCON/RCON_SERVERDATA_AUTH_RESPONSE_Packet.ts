'use strict';
import RCONPacket from "./RCONPacket";

export default class SERVERDATA_AUTH_RESPONSE_Packet extends RCONPacket {
  constructor(id: number) {
    super(id, "", 0x02);
  }
}

