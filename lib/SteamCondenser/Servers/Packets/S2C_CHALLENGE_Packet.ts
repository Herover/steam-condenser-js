"use strict";
import SteamPacket from "./SteamPacket";

export default class S2C_CHALLENGE_Packet extends SteamPacket {
  constructor(challengeNumber: Buffer) {
    super(SteamPacket.S2C_CHALLENGE_HEADER, challengeNumber);
  }
  
  getChallengeNumber() {
    return this.contentData.rewind().getLong();
  }
}
