/* eslint-disable no-bitwise */
import SteamSocket from './SteamSocket';
import SteamPacket from '../Packets/SteamPacket';
import SteamPacketFactory from '../Packets/SteamPacketFactory';

class GoldSrcSocket extends SteamSocket {
  private isHLTV = false;

  constructor(address: string, port = 27015, isHLTV = false) {
    super(address, port);

    this.isHLTV = isHLTV;
  }

  async getReply(): Promise<SteamPacket> {
    let packet: SteamPacket;
    let bytesRead = await this.receivePacket();

    const splitPackets: Buffer[] = [];

    if (this.buffer.getLong() === -2) {
      do {
        /* const requestId = */ this.buffer.getLong();
        const packetCountAndNumber = this.buffer.getByte();
        const packetCount = packetCountAndNumber & 0xF;
        const packetNumber = (packetCountAndNumber >> 4) + 1;

        splitPackets[packetNumber - 1] = this.buffer.get();

        if (splitPackets.length < packetCount) {
          try {
            // eslint-disable-next-line no-await-in-loop
            bytesRead = await this.receivePacket();
          } catch (error) {
            bytesRead = 0;
          }
        } else {
          bytesRead = 0;
        }
      } while (bytesRead > 0 && this.buffer.getLong() === -2);

      packet = SteamPacketFactory.ReassemblePacket(splitPackets);
    } else {
      packet = SteamPacketFactory.GetPacketFromData(this.buffer.get());
    }

    return packet;
  }

  /* eslint-disable */
  rconExec(password: string, command: string): Promise<string> {
    throw new Error('Not implemented');
  }
  /* eslint-enable */
}

export { GoldSrcSocket };
