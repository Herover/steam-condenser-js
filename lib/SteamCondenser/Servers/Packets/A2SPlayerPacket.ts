
import SteamPacket from './SteamPacket';

export default class A2SPlayerPacket extends SteamPacket {
  constructor(challengeNumber = -0x01) { // This is 0xFFFFFFFF
    super(SteamPacket.A2S_PLAYER_HEADER, challengeNumber);
  }
}
