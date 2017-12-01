'use strict';

var Server = require("./Server.js"),
    S2C_CHALLENGE_Packet = require("./Packets/S2C_CHALLENGE_Packet.js"),
    S2A_INFO_BasePacket = require("./Packets/S2A_INFO_BasePacket.js"),
    S2A_PLAYER_Packet = require("./Packets/S2A_PLAYER_Packet.js"),
    S2A_RULES_Packet = require("./Packets/S2A_RULES_Packet.js"),
    A2S_PLAYER_Packet = require("./Packets/A2S_PLAYER_Packet.js"),
    A2S_INFO_Packet = require("./Packets/A2S_INFO_Packet.js"),
    A2S_RULES_Packet = require("./Packets/A2S_RULES_Packet.js")
;

class GameServer extends Server{
  
  getPlayerStatusAttributes(statusHeader) {
    var statusAttributes = [];
    var split = statusHeader.split(/\s+/);
    for(var i = 0; i < split.length; i ++) {
      var attr = split[i];
      if(attr == "connected") {
        statusAttributes.push("time");
      }
      else if(attr == "frag") {
        statusAttributes.push("score");
      }
      else {
        statusAttributes.push(attr);
      }
    }
    
    return statusAttributes;
  }
  
  splitPlayerStatus(attributes, playerStatus) {
    if(attributes[0] != "userid") {
      playerStatus = playerStatus.replace(/^\d+ +/, "");
    }
    
    var firstquote = playerStatus.indexOf('"'),
        lastquote = playerStatus.lastIndexOf('"');
    var data = playerStatus.substr(0, firstquote).split(/\s+/)
               .concat([playerStatus.substr(firstquote+1, lastquote-1-firstquote)])
               .concat(playerStatus.substr(lastquote+1).split(/\s+/))
               .filter((l) => {return l != "";});
    // TODO: Why?
    if(attributes.length > data.length && attributes.includes("state")) {
      data.splice(3, 0, null, null, null);
    }
    else if(attributes.length < data.length) {
      data.splice(1, 1);
    }
    
    var playerData = {};
    for(var part = 0; part < data.length; part ++) {
      playerData[attributes[part]] = data[part];
    }
    
    return playerData;
  }
  
  constructor(address, port) {
    super(address, port);
    
    this.rconAuthenticated = false;
  }
  
  getPing() {
    return new Promise((resolve, reject) => {
      if(typeof this.ping == "undefined") {
        resolve(this.updatePing());
      }
      else {
        resolve(this.ping);
      }
    });
  }
  
  getPlayers(rconPassword) {
    return new Promise((resolve, reject) => {
      if(typeof this.playerHash == "undefined") {
        this.updatePlayers(rconPassword)
          .then(() => {
            resolve(this.playerHash);
          })
          .catch(reject);
      }
      else {
        resolve(this.playerHash);
      }
    });
  }
  
  getRules() {
    return new Promise((resolve, reject) => {
      if(typeof this.rulesHash == "undefined") {
        this.updateRules()
          .then(() => {resolve(this.rulesHash);})
          .catch(reject);
      }
      else {
        resolve(this.rulesHash);
      }
    });
  }
  
  getServerInfo() {
    return new Promise((resolve, reject) => {
      if(typeof this.infoHash == "undefined") {
        resolve(this.updateServerInfo());
      }
      else {
        resolve(this.infoHash);
      }
    });
  }
  
  initialize() {
    return this.initSocket()
      .then(() => {return this.updatePing();})
      .then(() => {return this.updateServerInfo();})
      .then(() => {return this.updateChallengeNumber();})
      .catch((err) => {
        throw err;
      });
  }
  
  handleResponseForRequest(requestType, repeatOnFailure) {
    if(typeof repeatOnFailure == "undefined") {repeatOnFailure = true;}
    var expectedResponse, requestPacket;
    switch(requestType) {
      case GameServer.REQUEST_CHALLENGE:
        expectedResponse = S2C_CHALLENGE_Packet;
        requestPacket = new A2S_PLAYER_Packet();
        break;
      case GameServer.REQUEST_INFO:
        expectedResponse = S2A_INFO_BasePacket;
        requestPacket = new A2S_INFO_Packet();
        break;
      case GameServer.REQUEST_PLAYER:
        expectedResponse = S2A_PLAYER_Packet;
        requestPacket = new A2S_PLAYER_Packet(this.challengeNumber);
        break;
      case GameServer.REQUEST_RULES:
        expectedResponse = S2A_RULES_Packet;
        requestPacket = new A2S_RULES_Packet(this.challengeNumber);
        break;
      default:
        throw new Error("Called with wrong request type.");
    }
    
    return this.socket.send(requestPacket)
      .then(() => {
        return this.socket.getReply();
      })
      .then((responsePacket) => {
        if(responsePacket instanceof S2A_INFO_BasePacket) {
          this.infoHash = responsePacket.getInfo();
        } else if(responsePacket instanceof S2A_PLAYER_Packet) {
          this.playerHash = responsePacket.getPlayerHash();
        } else if(responsePacket instanceof S2A_RULES_Packet) {
          this.rulesHash = responsePacket.getRulesArray();
        } else if(responsePacket instanceof S2C_CHALLENGE_Packet) {
          this.challengeNumber = responsePacket.getChallengeNumber();
        }
        else {
          throw new Error("Response of type " + responsePacket + "cannot be handled by this method.");
        }
        
        if(!(responsePacket instanceof expectedResponse)) {
          // TODO: Logger
          console.error("was", responsePacket);
          console.error("expected", expectedResponse);
          console.error("sent", requestPacket);
          if(repeatOnFailure) {
            return this.handleResponseForRequest(requestType, false);
          }
          else {
            throw new Error("Response was not expected" + responsePacket );
          }
        }
      })
      .catch((err) => {
        throw err;
      });
  }
  
  isRconAuthenticated() {
    return this.rconAuthenticated;
  }
  
  rconAuth(password){throw new Error("Not implemented.");}
  rconExec(password){throw new Error("Not implemented.");}
  
  updateChallengeNumber() {
    return this.handleResponseForRequest(GameServer.REQUEST_CHALLENGE);
  }
  
  updatePing() {
    var startTime, endTime;
    return this.socket.send(new A2S_INFO_Packet())
      .then(() => {
        startTime = new Date().getTime();
        
        return  this.socket.getReply();
      })
      .then(() => {
        endTime = new Date().getTime();
        this.ping = endTime - startTime;
        
        return this.ping;
      })
      .catch((err) => {
        throw err;
      });
  }
  
  updatePlayers(rconPassword) {
    return this.handleResponseForRequest(GameServer.REQUEST_PLAYER)
      .then(() => {
        if(!this.rconAuthenticated) {
          if(typeof rconPassword == "undefined") {
            return false;
          }
          return this.rconAuth(rconPassword)
            .then(() => {
              return this.rconExec("status");
            })
            .catch((err) => {
              throw err;
            });
        }
        return this.rconExec("status");
      })
      .then((res) => {
        if(typeof res != "undefined" && res == false) {
          return false;
        }
        
        var players = [],
            lines = res.split("\n");
        for(var i = 0; i < lines.length; i++) {
          var line = lines[i];
          if(line.startsWith("#") && line != "#end") {
            players.push(line.substr(1).trim());
          }
        }
        
        var attributes = this.getPlayerStatusAttributes(players[0]);
        players = players.slice(1);
        
        for(var i = 0; i < players.length; i++) {
          var player = players[i],
              playerData = this.splitPlayerStatus(attributes, player);
          if(typeof this.playerHash[playerData.name] != "undefined") {
            this.playerHash[playerData.name].addInformation(playerData);
          }
        }
        
        return this.playerHash;
      })
      .catch((e) => {throw(e);});
  }
  
  updateRules() {
    return this.handleResponseForRequest(GameServer.REQUEST_RULES);
  }
  
  updateServerInfo() {
    return this.handleResponseForRequest(GameServer.REQUEST_INFO);
  }
  
  toString() {
    var returnString = "";
    returnString += "Ping: " + this.ping + "\n";
    returnString += "Challenge number: " + this.challengeNumber + "\n";
    
    if(typeof this.infoHash != "undefined") {
      returnString += "Info:\n";
      for(var key in this.infoHash) {
        if(this.infoHash[key] instanceof Array) {
          returnString += "  " + key + ":\n";
          for(var subkey in this.infoHash[key]) {
            returnString += "  " + subkey + " = " + this.infoHash[key][subkey] + "\n";
          }
        } else {
          returnString += "  " + key + ": " + this.infoHash[key] + "\n";
        }
      }
    }
    
    if(typeof this.playerHash != "undefined") {
      returnString += "Players:\n";
      for(var key in this.playerHash) {
        returnString += key + "\n";
      }
    }
    
    if(typeof this.rulesHash != "undefined") {
      returnString += "Rules:\n";
      for(var key in this.rulesHash) {
        returnString += "  " + key + ": " + this.rulesHash[key] + "\n";
      }
    }
    
    return returnString;
  }
}
GameServer.REQUEST_CHALLENGE = 0;
GameServer.REQUEST_INFO      = 1;
GameServer.REQUEST_PLAYER    = 2;
GameServer.REQUEST_RULES     = 3;
module.exports = GameServer;
