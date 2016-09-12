"use strict";
var SteamPacket = require("./SteamPacket.js"),
    S2C_CHALLENGE_Packet = require("./S2C_CHALLENGE_Packet.js"),
    S2A_INFO2_Packet = require("./S2A_INFO2_Packet.js"),
    S2A_PLAYER_Packet = require("./S2A_PLAYER_Packet.js"),
    S2A_RULES_Packet = require("./S2A_RULES_Packet.js"),
    A2S_PLAYER_Packet = require("./A2S_PLAYER_Packet.js"),
    A2S_INFO_Packet = require("./A2S_INFO_Packet.js"),
    A2S_RULES_Packet = require("./A2S_RULES_Packet.js");

class SteamPacketFactory {}

SteamPacketFactory.getPacketFromData = function(rawData) {
  var header = rawData[0],
      data = rawData.slice(1);
  switch(header) {
    case SteamPacket.A2S_INFO_HEADER:
      return new A2S_INFO_Packet();

    case SteamPacket.S2A_INFO_DETAILED_HEADER:
      return new S2A_INFO_DETAILED_Packet(data);

    case SteamPacket.S2A_INFO2_HEADER:
      return new S2A_INFO2_Packet(data);

    case SteamPacket.A2S_PLAYER_HEADER:
      return new A2S_PLAYER_Packet(Helper.integerFromByteArray(data));

    case SteamPacket.S2A_PLAYER_HEADER:
      return new S2A_PLAYER_Packet(data);

    case SteamPacket.A2S_RULES_HEADER:
      return new A2S_RULES_Packet(Helper.integerFromByteArray(data));

    case SteamPacket.S2A_RULES_HEADER:
      return new S2A_RULES_Packet(data);

    case SteamPacket.A2S_SERVERQUERY_GETCHALLENGE_HEADER:
      return new A2S_SERVERQUERY_GETCHALLENGE_Packet();

    case SteamPacket.S2C_CHALLENGE_HEADER:
      return new S2C_CHALLENGE_Packet(data);

    case SteamPacket.M2A_SERVER_BATCH_HEADER:
      return new M2A_SERVER_BATCH_Paket(data);

    case SteamPacket.RCON_GOLDSRC_CHALLENGE_HEADER:
    case SteamPacket.RCON_GOLDSRC_NO_CHALLENGE_HEADER:
    case SteamPacket.RCON_GOLDSRC_RESPONSE_HEADER:
      return new RCONGoldSrcResponsePacket(data);

    default:
      throw new Error("Unknown packet with header 0x"
              + header.toString(16) + " received.");
  }
}
SteamPacketFactory.reassemblePacket = function(splitPackets, isCompressed, packetChecksum) {
  if(typeof isCompressed == "undefined") {
    isCompressed = false;
  }
  if(typeof packetChecksum == "undefined") {
    packetChecksum = 0;
  }
  
  var packetData = Buffer.concat(splitPackets);
  
  if(isCompressed) {
    throw new Error("Uncompressing is unimplemented,");
    
    
  }
  packetData = packetData.slice(4);
  
  return SteamPacketFactory.getPacketFromData(packetData);
}

module.exports = SteamPacketFactory;