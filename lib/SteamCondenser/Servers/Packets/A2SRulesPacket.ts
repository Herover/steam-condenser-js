
import SteamPacket from './SteamPacket';

export default class A2SRulesPacket extends SteamPacket {
  constructor(challengeNumber = -0x01) { // This means 0xFFFFFFFF
    super(SteamPacket.A2S_RULES_HEADER, challengeNumber);
  }
}
