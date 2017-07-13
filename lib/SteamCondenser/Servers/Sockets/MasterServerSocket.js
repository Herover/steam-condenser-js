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
    return new Promise(function(resolve, reject){
      var timeoutTimer = setTimeout(function() {reject(new Error("TimeoutException"))}, me.timeout);
      return me.receivePacket(1500)
        .then(function(bytesRead){
          if(me.buffer.getLong() != -1) {
            clearTimeout(timeoutTimer);
            reject(new Error("Master query response has wrong packet header."));
          }

          var packet = SteamPacketFactory.getPacketFromData(me.buffer.get());

          clearTimeout(timeoutTimer);
          resolve(packet);
        })
    })
  }
}

module.exports = MasterServerSocket;
