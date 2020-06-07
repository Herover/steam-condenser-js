
import SteamPacket from './SteamPacket';

export default class A2SInfoPacket extends SteamPacket {
  constructor() {
    super(SteamPacket.A2S_INFO_HEADER, Buffer.from('Source Engine Query\0'));
  }
}
