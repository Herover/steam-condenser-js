
import SteamPacket from './SteamPacket';
import S2CChallengePacket from './S2CChallengePacket';
import S2AInfo2Packet from './S2AInfo2Packet';
import S2APlayerPacket from './S2APlayerPacket';
import S2ARulesPacket from './S2ARulesPacket';
import A2SInfoPacket from './A2SInfoPacket';
import M2AServerBatchPacket from './M2AServerBatchPacket';
import S2AInfoDetailedPacket from './S2AInfoDetailedPacket';

export default class SteamPacketFactory {
  static GetPacketFromData(rawData: Buffer): SteamPacket { // TODO
    const header = rawData[0];
    const data = rawData.slice(1);
    switch (header) {
      case SteamPacket.A2S_INFO_HEADER:
        return new A2SInfoPacket();

      case SteamPacket.S2A_INFO_DETAILED_HEADER:
        return new S2AInfoDetailedPacket(data);

      case SteamPacket.S2A_INFO2_HEADER:
        return new S2AInfo2Packet(data);

      case SteamPacket.A2S_PLAYER_HEADER:
        throw new Error('Inimplemented A2S_PLAYER_HEADER packet recieved'); // return new A2SPlayerPacket(Helper.integerFromByteArray(data));

      case SteamPacket.S2A_PLAYER_HEADER:
        return new S2APlayerPacket(data);

      case SteamPacket.A2S_RULES_HEADER:
        throw new Error('Inimplemented packet A2S_RULES_HEADER recieved'); // return return new A2SRulesPacket(Helper.integerFromByteArray(data));

      case SteamPacket.S2A_RULES_HEADER:
        return new S2ARulesPacket(data);

      case SteamPacket.A2S_SERVERQUERY_GETCHALLENGE_HEADER:
        throw new Error('Inimplemented A2S_SERVERQUERY_GETCHALLENGE_HEADER packet recieved'); // return new A2S_SERVERQUERY_GETCHALLENGE_Packet();

      case SteamPacket.S2C_CHALLENGE_HEADER:
        return new S2CChallengePacket(data);

      case SteamPacket.M2A_SERVER_BATCH_HEADER:
        return new M2AServerBatchPacket(data);

      case SteamPacket.RCON_GOLDSRC_CHALLENGE_HEADER:
      case SteamPacket.RCON_GOLDSRC_NO_CHALLENGE_HEADER:
      case SteamPacket.RCON_GOLDSRC_RESPONSE_HEADER:
        throw new Error('Inimplemented RCON_GOLDSRC_RESPONSE_HEADER packet recieved'); // return new RCONGoldSrcResponsePacket(data);

      default:
        throw new Error(`Unknown packet with header 0x${
          header.toString(16)} received.`);
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  static ReassemblePacket(splitPackets: Buffer[], isCompressed = false, packetChecksum = 0):
  SteamPacket {
    let packetData = Buffer.concat(splitPackets);

    if (isCompressed) {
      throw new Error('Uncompressing is unimplemented.'); // TODO
    }
    // TODO: verify checksum

    packetData = packetData.slice(4);

    return SteamPacketFactory.GetPacketFromData(packetData);
  }
}
