"use strict";
import SteamPacket from "./SteamPacket";

export default class S2A_INFO_BasePacket extends SteamPacket {
  protected info: IInfo; // FIXME: type

  constructor(headerData: number, contentData: Buffer) {
    super(headerData, contentData);
    this.info = {} as IInfo;
  }
  
  getInfo(): IInfo {
    return this.info;
  }
}

export interface IInfo {
  networkVersion: number;
  serverName: string;
  mapName: string;
  gameDir: string;
  gameDesc: string;
  appId: number;
  numberOfPlayers: number;
  maxPlayers: number;
  botNumber: number;
  dedicated: string;
  operatingSystem: string;
  passwordProtected: boolean;
  secureServer: boolean;
  gameVersion: string;

  serverPort?: number;
  serverId?: number;
  tvPort?: number;
  tvName?: string;
  serverTags?: string;
  gameId?: number;
}