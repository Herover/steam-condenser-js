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
    return new Promise(function(resolve){resolve();});
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
    var packetSize, remainingBytes = 4, packetData = Buffer.from(""),
        me = this;
    /*return this.receivePacket(4)
      .then(function(bytes) {
        if(bytes == 0) {
          me.socket.close();
          //console.log("boohoo");
          return null;
        }*/
        
        function rec() {
          return new Promise(function(resolve, reject) {
            if(remainingBytes > 0) {
              me.receivePacket(4096 ) // 0
                .then(function(bytesRead) {
                  packetSize = me.buffer.getLong();
                  remainingBytes = packetSize + 4;
                  
                  remainingBytes -= bytesRead;
                  me.buffer.position(4);
                  packetData = Buffer.concat([packetData, me.buffer.get()]);
                  
                  resolve(rec());
                })
                .catch(function(e){
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
      .catch(function(e) {
        // TODO: exception types
        //console.log("RCONSocket getReply", e);
      })*/
  }
}

module.exports = RCONSocket;
