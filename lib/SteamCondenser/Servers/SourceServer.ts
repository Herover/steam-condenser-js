"use strict";
import MasterServer from "./MasterServer";
import GameServer from "./GameServer";
import RCONSocket from "./Sockets/RCONSocket";
import SourceSocket from "./Sockets/SourceSocket";
import RCON_SERVERDATA_AUTH_Packet from "./Packets/RCON/RCON_SERVERDATA_AUTH_Packet";
import RCON_SERVERDATA_EXECCOMMAND_Packet from "./Packets/RCON/RCON_SERVERDATA_EXECCOMMAND_Packet";
import RCON_Terminator from "./Packets/RCON/RCON_Terminator";
import RCONPacket from "./Packets/RCON/RCONPacket";

export class SourceServer extends GameServer {
  private rconSocket?: RCONSocket;
  protected socket?: SourceSocket;
  private rconRequestId = -1;
  
  constructor(ipAddress: string, portNumber: number) {super(ipAddress, portNumber);}

  async disconnect(): Promise<void> {
    await Promise.all([
      new Promise((resolve) => {
        if (typeof this.rconSocket === "undefined") {
          throw new Error("rconSocket not ready");
        }
        this.rconSocket.close().then(resolve);
      }),
      new Promise((resolve) => {
        if (typeof this.socket === "undefined") {
          throw new Error("socket not ready");
        }
        this.socket.close().then(resolve);
      }),
    ]);
  }
  
  generateRconRequestId(): number {
    return Math.floor(Math.random() * Math.pow(2, 16));
  }
  
  async initSocket(): Promise<void> {
    this.rconSocket = new RCONSocket(this.ipAddress, this.port);
    this.socket = new SourceSocket(this.ipAddress, this.port);
    if (typeof this.socket === "undefined") {
      throw new Error("socket not ready");
    }

    this.socket.setTimeout(this.timeout);
    this.rconSocket.setTimeout(this.timeout);

    await this.socket.connect();
  }
  
  async rconAuth(password: string): Promise<boolean> {
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
  
  async rconExec(command: string): Promise<string> {
    if(!this.rconAuthenticated) {
      throw new Error("RCONNoAuthException");
    }

    let isMulti = false,
        responsePacket: RCONPacket | void;
    const response: string[] = [];
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
  setTimeout(time: number): void {
    super.setTimeout(time);
    this.socket?.setTimeout(time);
    this.rconSocket?.setTimeout(time);
  }

  static GetMaster(): MasterServer {
    return new MasterServer(MasterServer.SOURCE_MASTER_SERVER);
  }
    
}
