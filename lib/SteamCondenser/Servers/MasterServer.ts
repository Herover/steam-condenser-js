/* eslint-disable no-await-in-loop */

import M2A_SERVER_BATCH_Packet from './Packets/M2A_SERVER_BATCH_Packet';

import Server from './Server';
// eslint-disable-next-line import/no-cycle
import A2M_GET_SERVERS_BATCH2_Packet from './Packets/A2M_GET_SERVERS_BATCH2_Packet';
import MasterSErverSocket from './Sockets/MasterServerSocket';

class MasterServer extends Server {
  private retries = 0;

  private socket?: MasterSErverSocket;

  constructor(address: string, port?: number) {
    super(address, port);
    this.retries = 3;
  }

  async getServers(regionCode: number = MasterServer.REGION_ALL, filter = '', maxPages = 1, after = '0.0.0.0:0'): Promise<(string | number)[][]> {
    if (typeof this.socket === 'undefined') {
      await this.initSocket();
    }

    let failCount = 0;
    let page = 0;
    let finished = false;
    let lastResult = after;
    const serverArray: (string|number)[][] = [];

    for (;;) {
      failCount = 0;
      do {
        await this.socket?.send(new A2M_GET_SERVERS_BATCH2_Packet(regionCode, lastResult, filter));

        try {
          if (typeof this.socket === 'undefined') {
            throw new Error('Socket not ready');
          }
          const serverStrArray = (await this.socket.getReply() as M2A_SERVER_BATCH_Packet)
            .getServers();
          page += 1;
          for (let i = 0; i < serverStrArray.length; i += 1) {
            const serverStr = serverStrArray[i];
            lastResult = serverStr;

            if (lastResult !== '0.0.0.0:0') {
              const parts = serverStr.split(':');
              serverArray.push([parts[0], Number.parseInt(parts[1], 10)]);
            } else {
              finished = true;
            }
          }
        } catch (e) {
          // TODO: Timeouts only
          failCount += 1;
          if (failCount === this.retries) {
            throw e;
          }
        }
        await new Promise((resolve) => setTimeout(resolve, 500));
      } while (!finished && page === maxPages);
      break;
    }

    return serverArray;
  }

  async initSocket(): Promise<void> {
    this.socket = new MasterSErverSocket(this.ipAddress, this.port);
    await this.socket.connect();
  }

  async disconnect(): Promise<void> {
    if (typeof this.socket !== 'undefined') {
      await this.socket.close();
    }
  }

  static GOLDSRC_MASTER_SERVER = 'hl1master.steampowered.com:27011';

  static SOURCE_MASTER_SERVER = 'hl2master.steampowered.com:27011';

  static REGION_US_EAST_COAST = 0x00;

  static REGION_US_WEST_COAST = 0x01;

  static REGION_SOUTH_AMERICA = 0x02;

  static REGION_EUROPE = 0x03;

  static REGION_ASIA = 0x04;

  static REGION_AUSTRALIA = 0x05;

  static REGION_MIDDLE_EAST = 0x06;

  static REGION_AFRICA = 0x07;

  static REGION_ALL = 0xFF;
}

export { MasterServer };
