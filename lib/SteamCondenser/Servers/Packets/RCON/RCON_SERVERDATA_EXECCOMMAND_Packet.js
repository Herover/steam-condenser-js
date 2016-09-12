'use strict';
var RCONPacket = require("./RCONPacket.js");

module.exports = class RCON_SERVERDATA_EXECCOMMAND_Packet extends RCONPacket {
  constructor(id, body) {
    super(id, body, 0x02);
  }
}