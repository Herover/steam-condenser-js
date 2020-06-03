"use strict";
import SteamPacket from "./SteamPacket";

export default class A2S_PLAYER_Packet extends SteamPacket {
  constructor(challengeNumber?: number) {
    if(typeof challengeNumber == "undefined") {
      challengeNumber = -1; // This is 0xFFFFFFFF
    }
    super(SteamPacket.A2S_PLAYER_HEADER, challengeNumber);
  }
};

/*
Packet = require("./Packet.js");

module.exports = class A2S_PLAYER_Packet extends Packet {
  constructor() {
    super(Buffer.from([0xFF, 0xFF, 0xFF, 0xFF, 0x55, 0xFF, 0xFF, 0xFF, 0xFF]));
  }
};
*/
