"use strict";

import M2A_SERVER_BATCH_Packet from "./Packets/M2A_SERVER_BATCH_Packet";

import Server from "./Server";
import A2M_GET_SERVERS_BATCH2_Packet from "./Packets/A2M_GET_SERVERS_BATCH2_Packet";
import MasterSErverSocket from "./Sockets/MasterServerSocket";

export default class MasterServer extends Server {
  private retries = 0;
  private socket?: MasterSErverSocket;

  constructor(address: string, port?: number) {
    super(address, port);
    this.retries = 3;
  }

  async getServers(regionCode: number = MasterServer.REGION_ALL, filter: string = "", force: boolean = false,
    maxPages: number = 1, after: string = "0.0.0.0:0"
  ) {
    if (typeof this.socket == "undefined") {
      await this.initSocket();
    }

    // Allow unlimited loading
    if (maxPages <= 0) {
      maxPages = -1;
    }

    let failCount = 0,
        page = 0,
        finished = false,
        lastResult = after,
        serverArray: (string|number)[][] = [];

    while (true) {
      failCount = 0;
      do {
        await this.socket?.send(new A2M_GET_SERVERS_BATCH2_Packet(regionCode, lastResult, filter));
        
        try {
          if (typeof this.socket == "undefined") {
            throw new Error("Socket not ready");
          }
          const serverStrArray = (await this.socket.getReply() as M2A_SERVER_BATCH_Packet).getServers();
          page ++;
          for (const serverStr of serverStrArray) {
            lastResult = serverStr;

            if (lastResult !== "0.0.0.0:0") {
              const parts = serverStr.split(":");
              serverArray.push([parts[0], Number.parseInt(parts[1])])
            } else {
              finished = true;
            }
          }
        } catch(e) {
          // TODO: Timeouts only
          failCount ++;
          if(failCount == this.retries) {
            throw e;
          }
        }
        await new Promise(resolve => setTimeout(resolve, 500))
      } while (!finished && page == maxPages);
      break;
    }

    return serverArray;
  }

  async initSocket(): Promise<void> {
    this.socket = new MasterSErverSocket(this.ipAddress, this.port);
    await this.socket.connect();
  }

  async disconnect() {
    if (typeof this.socket != "undefined") {
      await this.socket.close();
    }
  }

  static GOLDSRC_MASTER_SERVER = "hl1master.steampowered.com:27011";
  static SOURCE_MASTER_SERVER = "hl2master.steampowered.com:27011";
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
