
import SteamPacket from './SteamPacket';
// This should be OK since we dont directly use MasterServer instances here
// eslint-disable-next-line import/no-cycle
import { MasterServer } from '../MasterServer';

export default class A2M_GET_SERVERS_BATCH2_Packet extends SteamPacket {
  private filter: string;

  private regionCode: number;

  private startIp: string;

  constructor(regionCode = MasterServer.REGION_ALL, startIp = '0.0.0.0', filter = '') {
    super(SteamPacket.A2M_GET_SERVERS_BATCH2_HEADER);

    this.filter = filter;
    this.regionCode = regionCode;
    this.startIp = startIp;
  }

  toBuffer(): Buffer {
    return Buffer.concat([
      Buffer.from([this.headerData, this.regionCode]),
      Buffer.from(this.startIp),
      Buffer.from([0x00]),
      Buffer.from(this.filter),
      Buffer.from([0x00]),
    ]);
  }
}
