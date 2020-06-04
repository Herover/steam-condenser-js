"use strict";
import MasterServer from "./MasterServer";
import GameServer from "./GameServer";
import RCONSocket from "./Sockets/RCONSocket";
import SourceSocket from "./Sockets/SourceSocket";
import RCON_SERVERDATA_AUTH_Packet from "./Packets/RCON/RCON_SERVERDATA_AUTH_Packet";
import RCON_SERVERDATA_EXECCOMMAND_Packet from "./Packets/RCON/RCON_SERVERDATA_EXECCOMMAND_Packet";
import SERVERDATA_RESPONSE_VALUE_Packet from "./Packets/RCON/RCON_SERVERDATA_RESPONSE_VALUE_Packet";
import RCON_Terminator from "./Packets/RCON/RCON_Terminator";
import RCONPacket from "./Packets/RCON/RCONPacket";
import SteamPacket from "./Packets/SteamPacket";

export class SourceServer extends GameServer {
  private rconSocket?: RCONSocket;
  protected socket?: SourceSocket;
  private rconRequestId: number = -1;
  
  constructor(ipAddress: string, portNumber: number) {super(ipAddress, portNumber);}

  async disconnect() {
    await Promise.all([
      new Promise((resolve) => {
        if (typeof this.rconSocket === "undefined") {
          throw new Error("rconSocket not ready");
        }
        this.rconSocket.close().then(function(){resolve();});
      }),
      new Promise((resolve) => {
        if (typeof this.socket === "undefined") {
          throw new Error("socket not ready");
        }
        this.socket.close().then(function(){resolve();});
      }),
    ]);
  }
  
  generateRconRequestId() {
    return Math.floor(Math.random() * Math.pow(2, 16));
  }
  
  async initSocket(): Promise<void> {
    this.rconSocket = new RCONSocket(this.ipAddress, this.port);
    this.socket = new SourceSocket(this.ipAddress, this.port);
    if (typeof this.socket === "undefined") {
      throw new Error("socket not ready");
    }
    await this.socket.connect();
  }
  
  async rconAuth(password: string) {
    this.rconRequestId = this.generateRconRequestId();

    if (typeof this.rconSocket === "undefined") {
      throw new Error("rconSocket not set up");
    }
    
    await this.rconSocket.send(new RCON_SERVERDATA_AUTH_Packet(this.rconRequestId, password))

    if (typeof this.rconSocket === "undefined") {
      throw new Error("rconSocket not set up");
    }
    let reply = await this.rconSocket.getReply();
    
    if(!reply) {
      throw new Error("RCONBanException");
    }
    if (typeof this.rconSocket === "undefined") {
      throw new Error("rconSocket not set up");
    }
    reply = await this.rconSocket.getReply();

    if (!reply) {
      throw new Error("Received no 2'nd rcon response");
    }
    
    this.rconAuthenticated = reply.ID == this.rconRequestId;
    return this.rconAuthenticated;
  }
  
  async rconExec(command: string) {
    if(!this.rconAuthenticated) {
      throw new Error("RCONNoAuthException");
    }

    var isMulti = false,
        responsePacket: RCONPacket | void,
        response: string[] = [];
    if (typeof this.rconSocket === "undefined") {
      throw new Error("rconSocket not ready");
    }
    await this.rconSocket.send(new RCON_SERVERDATA_EXECCOMMAND_Packet(this.rconRequestId, command));
    
    do {
      responsePacket = await this.rconSocket.getReply();
      
      if(typeof responsePacket == "undefined" || responsePacket instanceof RCON_SERVERDATA_AUTH_Packet) {
        this.rconAuthenticated = false;
        throw new Error("RCONNoAuthException");
      }
      
      if(!isMulti && responsePacket.body.length > 0) {
        isMulti = true;
        if (typeof this.rconSocket === "undefined") {
          throw new Error("rconSocket not set up");
        }
        this.rconSocket.send(new RCON_Terminator(this.rconRequestId));
      }

      response.push(responsePacket.body);
    } while (isMulti
      && !(
        response.length > 2
        // FIXME: Final 2 packets should be empty, 
        && response[response.length - 2] == ""
        && response[response.length - 1].endsWith("\u0000\u0000")
      )
    );

    return response.slice(0, response.length-2).join().trim(); 
  }

  static GetMaster = function() {
    return new MasterServer(MasterServer.SOURCE_MASTER_SERVER);
  };
    
}
