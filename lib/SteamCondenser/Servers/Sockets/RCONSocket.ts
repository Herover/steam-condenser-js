
import SteamSocket from './SteamSocket';
import TCPSocket from '../../TCPSocket';
import RCONPacketFactory from '../Packets/RCON/RCONPacketFactory';
import ByteBuffer from '../../ByteBuffer';
import RCONPacket from '../Packets/RCON/RCONPacket';

export default class RCONSocket extends SteamSocket {
  constructor(ipAddress: string, portNumber: number) {
    super(ipAddress, portNumber);
    this.buffer = ByteBuffer.Allocate(1400);
  }

  async send(dataPacket: RCONPacket): Promise<void> {
    const supersend = super.send;
    const ssend = () => supersend.call(this, dataPacket);
    if (typeof this.socket === 'undefined' || !this.socket.isOpen()) {
      this.socket = new TCPSocket(this.ipAddress, this.portNumber);
      return this.socket.connect()
        .then(() => ssend.call(this));
    }
    return ssend();
  }

  async getReply(): Promise<RCONPacket | void> {
    if (await this.receivePacket(4) === 0) {
      await this.close();
      return;
    }
    const packetSize = this.buffer.getLong();
    let remainingBytes = packetSize;

    const packetData = Buffer.alloc(packetSize);
    let receivedBytes;
    do {
      // eslint-disable-next-line no-await-in-loop
      receivedBytes = await this.receivePacket(remainingBytes);
      const bf = this.buffer.get();
      bf.copy(packetData, packetSize - remainingBytes, 0, receivedBytes);
      remainingBytes -= receivedBytes;
    } while (remainingBytes > 0);

    const packet = RCONPacketFactory.GetPacketFromData(packetData);

    return packet;
  }
}
