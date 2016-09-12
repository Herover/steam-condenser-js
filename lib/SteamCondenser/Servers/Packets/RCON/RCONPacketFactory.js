var Packet = require("./../Packet.js"); // FIXME
var SERVERDATA_RESPONSE_VALUE_Packet = require("./RCON_SERVERDATA_RESPONSE_VALUE_Packet.js"),
    SERVERDATA_AUTH_RESPONSE_Packet = require("./RCON_SERVERDATA_AUTH_RESPONSE_Packet.js");
var RCONPacketFactory = {
  getPacketFromData: function(buffer) {
    //var size = buffer.readInt32LE(0);
    var requestID = buffer.readInt32LE(0);
    var type = buffer.readInt32LE(4);
    var body = buffer.slice(8, buffer.length - 2); 
    switch(type) {
      case 0x00:
        return new SERVERDATA_RESPONSE_VALUE_Packet(requestID, body);
        break;
      case 0x02:
        return new SERVERDATA_AUTH_RESPONSE_Packet(requestID);
        break;
      default:
      console.log(buffer);
        throw new Error("Unknown packet type " + type);
    }
  }
}

module.exports = RCONPacketFactory