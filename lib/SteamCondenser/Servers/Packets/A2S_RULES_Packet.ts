"use strict";
var SteamPacket = require("./SteamPacket.js");

module.exports = class A2S_RULES_Packet extends SteamPacket {
  constructor(challengeNumber) {
    if(typeof challengeNumber == "undefined") {
      challengeNumber = -0x01; // This means 0xFFFFFFFF
    }
    
    super(SteamPacket.A2S_RULES_HEADER, challengeNumber);
  }
};
/*
Packet = require("./Packet.js");

module.exports = class A2S_RULES_Packet extends Packet {
  constructor(challenge) {
    if(typeof challenge == "undefined")
      challenge = -1;
    var challengeBuffer = new Buffer(4);
    challengeBuffer.writeInt32LE(challenge);
    super(Buffer.concat([
      Buffer.from([0xFF, 0xFF, 0xFF, 0xFF, 0x56]),
      challengeBuffer
     ]));
  }
};
*/
