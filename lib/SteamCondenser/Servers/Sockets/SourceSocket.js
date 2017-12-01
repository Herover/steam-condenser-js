"use strict";
var UDPSocket = require("./../../UDPSocket.js"),
    SteamSocket = require("./SteamSocket.js"),
    SteamPacketFactory = require("./../Packets/SteamPacketFactory.js");

class SourceSocket extends SteamSocket {
  
  constructor(ipAddress, portNumber) {
    if(typeof portNumber == "undefined") {
      portNumber = 27015;
    }
    super(ipAddress, portNumber);
    
    this.socket = new UDPSocket(ipAddress, portNumber);
  }
  
  getReply() {
    var isCompressed = false,
        receivedPackets = 0,
        packet,
        requestId,
        packetCount,
        packetNumber,
        splitPackets = [],
        splitSize, packetChecksum, bytesRead;
    return this.receivePacket(1400)
      .then((bytes) => {
        bytesRead = bytes;
        var handleMultiPacket = (bytes) => {
          return new Promise((resolve, reject) => {
            bytesRead = bytes;
            
              requestId = this.buffer.getLong();
              packetCount = this.buffer.getByte();
              packetNumber = this.buffer.getByte() + 1;
              isCompressed = ((requestId & 0x80000000) != 0);

              if(isCompressed) {
                splitSize = this.buffer.getLong();
                packetChecksum = this.buffer.getUnsignedLong();
              } else {
                splitSize = this.buffer.getShort();
              }
              
              splitPackets[packetNumber - 1] = Buffer.from(this.buffer.get());
              receivedPackets++;
              
              if(receivedPackets < packetCount) {
                try {
                  return this.receivePacket()
                    .then((bytes) => {
                      if(this.buffer.getLong() == -2 && bytes > 0) {
                        return handleMultiPacket(bytes).then(() => {resolve();});
                      }
                      else {
                        resolve();
                      }
                    })
                    .catch((e) => {
                      console.log(e);
                    });
                }
                catch(e) { //FIXME: Use proper error class
                  if(e.message != "TimeoutException") {
                    throw e;
                  }
                  bytesRead = 0;
                }
              }
              else {
                resolve();
              }
              /*
              if(bytesRead > 0 && me.buffer.getLong() == -2) {
                return false;
              } else {
                resolve();
              }
              */
              
          });
        }
        
        return new Promise((resolve, reject) => {
          if(this.buffer.getLong() == -2) {
            return handleMultiPacket(bytes)
              .then(() => {
                if(isCompressed) {
                  packet = SteamPacketFactory.reassemblePacket(splitPackets, true, packetChecksum);
                } else {
                  packet = SteamPacketFactory.reassemblePacket(splitPackets);
                }
                resolve(packet);
              })
              .catch((e) => {
                reject(e);
              });
          } else {
            packet = SteamPacketFactory.getPacketFromData(this.buffer.get());
            
            resolve(packet);
          }
        });
      });
    }
}

module.exports = SourceSocket;
