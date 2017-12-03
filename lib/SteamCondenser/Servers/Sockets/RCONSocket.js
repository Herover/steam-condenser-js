"use strict";
var SteamSocket = require("./SteamSocket.js"),
    TCPSocket = require("./../../TCPSocket.js"),
    RCONPacketFactory = require("./../Packets/RCON/RCONPacketFactory"),
    ByteBuffer = require("./../../ByteBuffer.js");

class RCONSocket extends SteamSocket {
  constructor(ipAddress, portNumber) {
    super(ipAddress, portNumber);
    this.buffer = ByteBuffer.allocate(1400);
    
    
  }
  
  close() {
    if(typeof this.socket != "undefined") {
      return super.close();
    }
    return new Promise((resolve) => {resolve();});
  }
  
  send(dataPacket) {
    var supersend = super.send;
    var ssend = () => {return supersend.call(this, dataPacket)};
    if(typeof this.socket == "undefined" || !this.socket.isOpen()) {
      this.socket = new TCPSocket(this.ipAddress, this.portNumber);
      return this.socket.connect(this.ipAddress, this.portNumber, SteamSocket.timeout)
        .then(() => {return ssend.call();});
    }
    else return ssend();
  }
  
  getReply() {
    var packetSize, remainingBytes = 4, packetData = Buffer.from("");
    /*return this.receivePacket(4)
      .then(function(bytes) {
        if(bytes == 0) {
          this.socket.close();
          //console.log("boohoo");
          return null;
        }*/
        
        var rec = () => {
          return new Promise((resolve, reject) => {
            if(remainingBytes > 0) {
              this.receivePacket(4096 ) // 0
                .then((bytesRead) => {
                  packetSize = this.buffer.getLong();
                  remainingBytes = packetSize + 4;
                  
                  remainingBytes -= bytesRead;
                  this.buffer.position(4);
                  packetData = Buffer.concat([packetData, this.buffer.get()]);
                  
                  resolve(rec());
                })
                .catch((e) => {
                  reject(e);
                });
            }
            else {
              var packet = RCONPacketFactory.getPacketFromData(packetData);
              resolve(packet);
            }
          });
        }
        return rec();
      /*})
      .catch((e) => {
        // TODO: exception types
        //console.log("RCONSocket getReply", e);
      })*/
  }
}

module.exports = RCONSocket;
