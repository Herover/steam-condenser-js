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

  disconnect() {
    return Promise.all([
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
  
  initSocket(): Promise<void> {
    this.rconSocket = new RCONSocket(this.ipAddress, this.port);
    this.socket = new SourceSocket(this.ipAddress, this.port);
    return Promise.all([
      new Promise(resolve => {
        if (typeof this.socket === "undefined") {
          throw new Error("socket not ready");
        }
        this.socket.connect();
        resolve();
      }),
    ])
      .then(() => { return; });
  }
  
  rconAuth(password: string) {
    this.rconRequestId = this.generateRconRequestId();

    if (typeof this.rconSocket === "undefined") {
      throw new Error("rconSocket not set up");
    }
    
    return this.rconSocket.send(new RCON_SERVERDATA_AUTH_Packet(this.rconRequestId, password))
      .then(()  => {
        if (typeof this.rconSocket === "undefined") {
          throw new Error("rconSocket not set up");
        }
        return this.rconSocket.getReply();
      })
      .then((reply: RCONPacket) => {
        /*if(typeof reply == "undefined") {
          throw new Error("RCONBanException");
        }*/
        if (typeof this.rconSocket === "undefined") {
          throw new Error("rconSocket not set up");
        }
        return this.rconSocket.getReply();
      })
      .then((reply: RCONPacket) => {
        //this.rconAuthenticated == reply.getRequestId() == this.rconRequestId;
        this.rconAuthenticated = reply.ID == this.rconRequestId;
        return this.rconAuthenticated;
      });
  }
  
  rconExec(command: string) {
    if(!this.rconAuthenticated) {
      throw new Error("RCONNoAuthException");
    }
    
    var isMulti = false,
        response: string[] = [];
    if (typeof this.rconSocket === "undefined") {
      throw new Error("rconSocket not ready");
    }
    return this.rconSocket.send(new RCON_SERVERDATA_EXECCOMMAND_Packet(this.rconRequestId, command))
      .then(() => {
        var handleReply = (): Promise<string> => {
          if (typeof this.rconSocket === "undefined") {
            throw new Error("rconSocket not set up");
          }
          return this.rconSocket.getReply()
            .then((responsePacket: any) => { // TODO: Fix type
              if(typeof responsePacket == "undefined" ||
                  responsePacket instanceof RCON_SERVERDATA_AUTH_Packet) {
                this.rconAuthenticated = false;
                throw new Error("RCONNoAuthException");
              }
              
              if(!isMulti && responsePacket.getResponse().length > 0) {
                isMulti = true;
                if (typeof this.rconSocket === "undefined") {
                  throw new Error("rconSocket not set up");
                }
                this.rconSocket.send(new RCON_Terminator(this.rconRequestId));
              }
              
              // Check if full response have been received
              // FIXME: This mirrors code from steam-condenser-php, are we 
              //        actually testing this, or if all expected packets are 
              //        received? 
              // https://developer.valvesoftware.com/wiki/Source_RCON_Protocol#Multiple-packet_Responses
              if(
                  isMulti
              //&& typeof response[response.length - 2] != "undefined"
              //&& typeof response[response.length - 1] != "undefined"
              && responsePacket.body == "\u0000\u0000"
              || !isMulti
              ) {
                console.log("DID IT WORK?", response.join);
                return response.join();
              }
              else {
                // FIXME: RCON packets after the first full RCON response sometimes send this packet.
                // I don't know what it indicates.
                if(responsePacket.body == "\u0000\u0001\u0000\u0000\u0000\u0000") {return handleReply();}
                response.push(responsePacket.body);
                return handleReply();
              }
            })
        }
        return handleReply();
      })
      .then(() => {
        return response.join().trim();
      })
         
  }

  static GetMaster = function() {
    return new MasterServer(MasterServer.SOURCE_MASTER_SERVER);
  };
    
}
