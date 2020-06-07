
import SteamPacket from './SteamPacket';

export default class S2CChallengePacket extends SteamPacket {
  constructor(challengeNumber: Buffer) {
    super(SteamPacket.S2C_CHALLENGE_HEADER, challengeNumber);
  }

  getChallengeNumber(): number {
    return this.contentData.rewind().getLong();
  }
}
