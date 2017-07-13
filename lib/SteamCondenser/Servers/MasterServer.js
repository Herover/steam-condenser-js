"use strict";
var Server = require("./Server.js"),
    A2M_GET_SERVERS_BATCH2_Packet = require("./Packets/A2M_GET_SERVERS_BATCH2_Packet.js"),
    MasterSErverSocket = require("./Sockets/MasterServerSocket.js");

class MasterServer extends Server {
  constructor(address, port) {
    super(address, port);
    this.retries = 3;
  }

  getServers(regionCode, filter, force) {
    if(typeof regionCode == "undefined") {
      regionCode = MasterServer.REGION_ALL;
    }
    if(typeof filter == "undefined") {
      filter = "";
    }
    if(typeof force == "undefined") {
      force = false;
    }

    var failCount = 0,
        finished = false,
        portNumber = 0,
        hostName = "0.0.0.0",
        serverArray = [];

    if(typeof this.socket == "undefined") {
      this.initSocket();
    }
    var me = this;
    var _getServers = function() {
      return me.socket.send(new A2M_GET_SERVERS_BATCH2_Packet(regionCode, hostName + ":" + portNumber, filter))
        .then(function(){
          return me.socket.getReply();
        })
        .then(function(reply){
          failCount = 0;
          var serverStringArray = reply.getServers();

          for(var server in serverStringArray) {
            var serverString = serverStringArray[server].split(":");
            hostName = serverString[0];
            portNumber = serverString[1];

            if(hostName != "0.0.0.0" && portNumber != 0) {
              serverArray.push([hostName, portNumber]);
            } else {
              finished = true;
            }
          }
          if(!finished) {
            return _getServers();
          }
          else {
            return serverArray;
          }
        })
        .catch(function(e){
          if(e.messahe == "TimeoutException") {
            failCount ++;
            if(!force && failCount == me.retries) {
              throw e;
            }
            else {
              if(!finished) {
                return _getServers();
              }
            }
          }
          else {
            throw e;
          }
        })
    }
    return _getServers();
  }

  initSocket() {
    this.socket = new MasterSErverSocket(this.ipAddress, this.port);
  }
}

MasterServer.GOLDSRC_MASTER_SERVER = "hl1master.steampowered.com:27011";
MasterServer.SOURCE_MASTER_SERVER = "hl2master.steampowered.com:27011";
MasterServer.REGION_US_EAST_COAST = 0x00;
MasterServer.REGION_US_WEST_COAST = 0x01;
MasterServer.REGION_SOUTH_AMERICA = 0x02;
MasterServer.REGION_EUROPE = 0x03;
MasterServer.REGION_ASIA = 0x04;
MasterServer.REGION_AUSTRALIA = 0x05;
MasterServer.REGION_MIDDLE_EAST = 0x06;
MasterServer.REGION_AFRICA = 0x07;
MasterServer.REGION_ALL = 0xFF;

module.exports = MasterServer;