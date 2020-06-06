
import SteamPacket from './SteamPacket';

export default class A2S_RULES_Packet extends SteamPacket {
  constructor(challengeNumber = -0x01) { // This means 0xFFFFFFFF
    super(SteamPacket.A2S_RULES_HEADER, challengeNumber);
  }
}
