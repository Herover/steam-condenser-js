"use strict";
var SteamPacket = require("./SteamPacket.js");

module.exports = class S2A_INFO_BasePacket extends SteamPacket {
  constructor(headerData, contentData) {
    super(headerData, contentData);
    this.info = {};
  }
  
  getInfo() {
    return this.info;
  }
};
