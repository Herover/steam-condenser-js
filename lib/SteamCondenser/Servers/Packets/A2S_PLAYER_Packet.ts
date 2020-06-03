"use strict";
import SteamPacket from "./SteamPacket";

export default class A2S_PLAYER_Packet extends SteamPacket {
  constructor(challengeNumber?: number) {
    if(typeof challengeNumber == "undefined") {
      challengeNumber = -1; // This is 0xFFFFFFFF
    }
    super(SteamPacket.A2S_PLAYER_HEADER, challengeNumber);
  }
}
