'use strict';
var RCONPacket = require("./RCONPacket.js");

module.exports = class SERVERDATA_AUTH_RESPONSE_Packet extends RCONPacket {
  constructor(id) {
    super(id, "", 0x02);
  }
};

