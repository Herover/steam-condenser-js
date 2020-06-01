"use strict";
var UDPSocket = require("../../UDPSocket.js"),
    SteamSocket = require("./SteamSocket.js"),
    ByteBuffer = require("../../ByteBuffer.js"),
    SteamPacketFactory = require("./../Packets/SteamPacketFactory.js");

class MasterServerSocket extends SteamSocket {
  constructor(ipAddress, portNumber) {
    super(ipAddress, portNumber);

    this.socket = new UDPSocket(ipAddress, portNumber);
    this.socket.connect();
  }

  getReply() {
    var packetSize, remainingBytes = 4, packetData = Buffer.from("");
    return new Promise((resolve, reject) => {
      var timeoutTimer = setTimeout(() => {reject(new Error("TimeoutException"))}, this.timeout);
      return this.receivePacket(1500)
        .then((bytesRead) => {
          if(this.buffer.getLong() != -1) {
            clearTimeout(timeoutTimer);
            reject(new Error("Master query response has wrong packet header."));
          }

          var packet = SteamPacketFactory.getPacketFromData(this.buffer.get());

          clearTimeout(timeoutTimer);
          resolve(packet);
        })
    })
  }
}

module.exports = MasterServerSocket;
