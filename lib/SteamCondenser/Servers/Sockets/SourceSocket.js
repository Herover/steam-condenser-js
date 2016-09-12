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
        me = this,
        requestId,
        packetCount,
        packetNumber,
        splitPackets = [],
        splitSize, packetChecksum, bytesRead;
    return this.receivePacket(1400)
      .then(function(bytes) {
        bytesRead = bytes;
        function handleMultiPacket(bytes){
          return new Promise(function(resolve, reject) {
            bytesRead = bytes;
            
              requestId = me.buffer.getLong();
              packetCount = me.buffer.getByte();
              packetNumber = me.buffer.getByte() + 1;
              isCompressed = ((requestId & 0x80000000) != 0);

              if(isCompressed) {
                splitSize = me.buffer.getLong();
                packetChecksum = me.buffer.getUnsignedLong();
              } else {
                splitSize = me.buffer.getShort();
              }
              
              splitPackets[packetNumber - 1] = Buffer.from(me.buffer.get());
              receivedPackets++;
              
              if(receivedPackets < packetCount) {
                try {
                  return me.receivePacket()
                    .then(function(bytes){
                      if(me.buffer.getLong() == -2 && bytes > 0) {
                        return handleMultiPacket(bytes).then(function(){resolve();});
                      }
                      else {
                        resolve();
                      }
                    })
                    .catch(function(e) {
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
        
        return new Promise(function(resolve, reject) {
          if(me.buffer.getLong() == -2) {
            return handleMultiPacket(bytes)
              .then(function() {
                if(isCompressed) {
                  packet = SteamPacketFactory.reassemblePacket(splitPackets, true, packetChecksum);
                } else {
                  packet = SteamPacketFactory.reassemblePacket(splitPackets);
                }
                resolve(packet);
              })
              .catch(function(e){
                reject(e);
              });
          } else {
            packet = SteamPacketFactory.getPacketFromData(me.buffer.get());
            
            resolve(packet);
          }
        });
      });
    }
}

module.exports = SourceSocket;
