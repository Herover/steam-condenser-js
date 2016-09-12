'use strict';
var RCONPacket = require("./RCONPacket.js");

class RCON_SERVERDATA_AUTH_Packet extends RCONPacket {
  constructor(id, pw) {
    super(id, pw, 0x03);
  }
}

module.exports = RCON_SERVERDATA_AUTH_Packet;