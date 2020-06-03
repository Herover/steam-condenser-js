"use strict";
import SteamPacket from "./SteamPacket";

export default class S2C_CHALLENGE_Packet extends SteamPacket {
  constructor(challengeNumber: Buffer) {
    super(SteamPacket.S2C_CHALLENGE_HEADER, challengeNumber);
  }
  
  getChallengeNumber() {
    return this.contentData.rewind().getLong();
  }
};
/*
module.exports = class S2C_CHALLENGE_Packet extends SteamPacket {
  constructor(challenge) {
    if(typeof challenge == "undefined")
      challenge = -1;
    var challengeBuffer = new Buffer(4);
    challengeBuffer.writeInt32LE(challenge);
    super(Buffer.concat([
      Buffer.from([0xFF, 0xFF, 0xFF, 0xFF, SteamPacket.S2C_CHALLENGE_HEADER]),
      challengeBuffer
     ]));
  }
};
*/
