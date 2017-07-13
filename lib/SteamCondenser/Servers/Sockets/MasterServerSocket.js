"use strict";
var UDPSocket = require("./../../UDPSocket.js"),
    SteamSocket = require("./SteamSocket.js"),
    ByteBuffer = require("./../../ByteBuffer.js"),
    SteamPacketFactory = require("./../Packets/SteamPacketFactory.js");

class MasterServerSocket extends SteamSocket {
  constructor(ipAddress, portNumber) {
    super(ipAddress, portNumber);

    this.socket = new UDPSocket(ipAddress, portNumber);
    this.socket.connect();
  }

  getReply() {
    var packetSize, remainingBytes = 4, packetData = Buffer.from(""),
        me = this;
    /*return this.receivePacket(4)
      .then(function(bytes) {
        if(bytes == 0) {
          me.socket.close();
          //console.log("boohoo");
          return null;
        }*/
    return this.receivePacket(1500)
      .then(function(bytesRead){
        if(me.buffer.getLong() != -1) {
          throw new Error("Master query response has wrong packet header.");
        }

        var packet = SteamPacketFactory.getPacketFromData(me.buffer.get());

        return packet;
      })
  }
}

module.exports = MasterServerSocket;
