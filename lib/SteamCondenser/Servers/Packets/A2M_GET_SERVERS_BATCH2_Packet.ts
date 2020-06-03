"use strict";
import SteamPacket from "./SteamPacket";
import MasterServer from "../MasterServer";

export default class A2M_GET_SERVERS_BATCH2_Packet extends SteamPacket {
  private filter: string;
  private regionCode: number;
  private startIp: string;

  constructor(regionCode: number, startIp: string, filter: string) {
    super(SteamPacket.A2M_GET_SERVERS_BATCH2_HEADER);

    if(typeof regionCode == "undefined") {
        regionCode = MasterServer.REGION_ALL;
    }
    if(typeof startIp == "undefined") {
        startIp = "0.0.0.0";
    }
    if(typeof filter == "undefined") {
        filter = "";
    }

    this.filter = filter;
    this.regionCode = regionCode;
    this.startIp = startIp;
  }

  toBuffer() {
    return Buffer.concat([Buffer.from([this.headerData, this.regionCode]), Buffer.from(this.startIp), Buffer.from([0x00]), Buffer.from(this.filter), Buffer.from([0x00])]);
  }
};