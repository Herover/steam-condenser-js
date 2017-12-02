"use strict";
var MasterServer = require("./MasterServer.js"),
    GameServer = require("./GameServer.js"),
    RCONSocket = require("./Sockets/RCONSocket.js"),
    SourceSocket = require("./Sockets/SourceSocket.js"),
    RCON_SERVERDATA_AUTH_Packet = require("./Packets/RCON/RCON_SERVERDATA_AUTH_Packet.js"),
    RCON_SERVERDATA_EXECCOMMAND_Packet = require("./Packets/RCON/RCON_SERVERDATA_EXECCOMMAND_Packet.js"),
    RCON_Terminator = require("./Packets/RCON/RCON_Terminator.js");

class SourceServer extends GameServer {
  
  constructor(ipAddress, portNumber) {super(ipAddress, portNumber);}
  disconnect() {
    var me = this;
    return Promise.all([
      new Promise(function(resolve, reject) {me.rconSocket.close().then(function(){resolve();});}),
      new Promise(function(resolve, reject) {me.socket.close().then(function(){resolve();});}),
    ]);
  }
  
  generateRconRequestId() {
    return Math.floor(Math.random() * Math.pow(2, 16));
  }
  
  initSocket() {
    this.rconSocket = new RCONSocket(this.ipAddress, this.port);
    this.socket = new SourceSocket(this.ipAddress, this.port);
    var me = this;
    return Promise.all([
      me.socket.connect()
    ]);
  }
  
  rconAuth(password) {
    this.rconRequestId = this.generateRconRequestId();
    
    var me = this;
    return this.rconSocket.send(new RCON_SERVERDATA_AUTH_Packet(this.rconRequestId, password))
      .then(function() {
        return me.rconSocket.getReply();
      })
      .then(function(reply) {
        /*if(typeof reply == "undefined") {
          throw new Error("RCONBanException");
        }*/
        return me.rconSocket.getReply();
      })
      .then(function(reply) {
        //me.rconAuthenticated == reply.getRequestId() == this.rconRequestId;
        me.rconAuthenticated = reply.ID == me.rconRequestId;
        return me.rconAuthenticated;
      });
  }
  
  rconExec(command) {
    if(!this.rconAuthenticated) {
      throw new Error("RCONNoAuthException");
    }
    
    var me = this;
    var isMulti = false,
        response = [];
    return this.rconSocket.send(new RCON_SERVERDATA_EXECCOMMAND_Packet(this.rconRequestId, command))
      .then(function(){
        function handleReply() {
          return me.rconSocket.getReply()
          .then(function(responsePacket) {
            if(typeof responsePacket == "undefined" ||
                responsePacket instanceof RCON_SERVERDATA_AUTH_Packet) {
              me.rconAuthenticated = false;
              throw new Error("RCONNoAuthException");
            }
            
            if(!isMulti && responsePacket.getResponse().length > 0) {
              isMulti = true;
              me.rconSocket.send(new RCON_Terminator(me.rconRequestId));
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
              return response;
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
      .then(function() {
        return response.join().trim();
      })
         
  }
    
}

SourceServer.getMaster = function() {
  return new MasterServer(MasterServer.SOURCE_MASTER_SERVER);
};

module.exports = SourceServer;
