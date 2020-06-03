"use strict";
import SteamPacket from"./SteamPacket";

export default class A2S_INFO_Packet extends SteamPacket {
  constructor() {
    super(SteamPacket.A2S_INFO_HEADER, Buffer.from("Source Engine Query\0"));
  }
};
/*
Packet = require("./Packet");

module.exports = class A2S_INFO_Packet extends Packet {
  constructor() {
    super(Buffer.from([0xFF, 0xFF, 0xFF, 0xFF, 0x54, 0x53, 0x6F, 0x75, 0x72, 0x63, 0x65, 0x20, 0x45, 0x6E, 0x67, 0x69, 0x6E, 0x65, 0x20, 0x51, 0x75, 0x65, 0x72, 0x79, 0x00]));
  }
};
*/
