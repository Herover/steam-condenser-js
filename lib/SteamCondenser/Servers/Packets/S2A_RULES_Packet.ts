"use strict";
var SteamPacket = require("./SteamPacket.js");

module.exports = class S2A_RULES_Packet extends SteamPacket {
  constructor(contentData) {
    if(typeof contentData == "undefined") {
      throw new Error("Wrong formatted S2A_RULES packet.");
    }
    super(SteamPacket.S2C_CHALLENGE_HEADER, contentData);
    
    var rulesCount = this.contentData.getShort();
    this.rulesArray = {}; //FIXME: Naming
    
    for(var x = 0; x < rulesCount; x++) {
      var rule  = this.contentData.getString(),
          value = this.contentData.getString();
          
      if(rule == "") {
        //break;
      }
      
      this.rulesArray[rule] = value;
    }
  }
  
  getRulesArray() {
    return this.rulesArray;
  }
};
