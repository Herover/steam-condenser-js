"use strict";
import SteamPacket from "./SteamPacket";

export default class S2A_INFO_BasePacket extends SteamPacket {
  protected info: any;

  constructor(headerData: number, contentData: Buffer) {
    super(headerData, contentData);
    this.info = {};
  }
  
  getInfo() {
    return this.info;
  }
}
