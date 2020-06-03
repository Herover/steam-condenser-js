"use strict";
import SteamPacket from "./SteamPacket";

export default class S2A_RULES_Packet extends SteamPacket {
  private rules: { [key:string]:string; } = {};

  constructor(contentData: Buffer) {
    super(SteamPacket.S2C_CHALLENGE_HEADER, contentData);
    if(typeof contentData == "undefined") {
      throw new Error("Wrong formatted S2A_RULES packet.");
    }
    
    var rulesCount = this.contentData.getShort();
    this.rules = {};
    
    for(var x = 0; x < rulesCount; x++) {
      var rule  = this.contentData.getString(),
          value = this.contentData.getString();
          
      if(rule == "") {
        //break;
      }
      this.rules[rule] = value;
    }
  }
  
  getRulesArray() {
    return this.rules;
  }
};
