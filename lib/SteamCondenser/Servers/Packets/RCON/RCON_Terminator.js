'use strict';
var RCONPacket = require("./RCONPacket.js");

module.exports = class RCON_Terminator extends RCONPacket {
  constructor(id) {
    super(id, "", 0x00);
  }
}