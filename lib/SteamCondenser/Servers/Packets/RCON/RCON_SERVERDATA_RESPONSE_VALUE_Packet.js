'use strict';
var RCONPacket = require("./RCONPacket.js");

module.exports = class SERVERDATA_RESPONSE_VALUE_Packet extends RCONPacket {
  constructor(id, body) {
    super(id, body, 0x00);
  }
  
  getResponse() {
    return this.body;
  }
};