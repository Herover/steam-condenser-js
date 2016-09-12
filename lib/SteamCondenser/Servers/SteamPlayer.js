"use strict";

module.exports = class SteamPlayer {
  constructor(id, name, score, connectTime) {
  this.connectTime = connectTime;
  this.id = id;
  this.name = name;
  this.score = score;
  this.extended = false;
  }

  /**
   * Extends a player object with information retrieved from a RCON call to
   * the status command
   *
   * @param string playerData The player data retrieved from
   *    <var>rcon status</var>
   * @throws SteamCondenserException if the information belongs to another
   *     player
   */
  addInformation(playerData) {
    if(playerData['name'] != this.name) {
      throw new SteamCondenserException('Information to add belongs to a different player.');
    }

    this.extended = true;
    this.connectionId = Number.parseInt(playerData['userid']);
    if(typeof playerData['state'] != "undefined") {
      this.state = playerData['state'];
    }
    this.steamId = playerData['uniqueid'];

    if(!this.isBot()) {
      this.loss = Number.parseInt(playerData['loss']);
      this.ping = Number.parseInt(playerData['ping']);

      if(typeof playerData['state'] != "undefined") {
        var address = playerData['adr'].split(':');
        this.ipAddress  = address[0];
        this.clientPort = Number.parseInt(address[1]);
      }

      if(typeof playerData['state'] != "undefined") {
        this.rate = playerData['rate'];
      }
    }
  }

  /**
   * Returns the client port of this player
   *
   * @return int The client port of the player
   */
  getClientPort() {
    return this.clientPort;
  }

  /**
   * Returns the connection ID (as used on the server) of this player
   *
   * @return int The connection ID of this player
   */
  getConnectionId() {
    return this.connectionId;
  }

  /**
   * Returns the time this player is connected to the server
   *
   * @return float The connection time of the player
   */
  getConnectTime() {
    return this.connectTime;
  }

  /**
   * Returns the ID of this player
   *
   * @return int The ID of this player
   */
  getId() {
    return this.id;
  }

  /**
   * Returns the IP address of this player
   *
   * @return string The IP address of this player
   */
  getIpAddress() {
    return this.ipAddress;
  }

  /**
   * Returns the packet loss of this player's connection
   *
   * @return string The packet loss of this player's connection
   */
  getLoss() {
    return this.loss;
  }

  /**
   * Returns the nickname of this player
   *
   * @return string The name of this player
   */
  getName() {
    return this.name;
  }

  /**
   * Returns the ping of this player
   *
   * @return int The ping of this player
   */
  getPing() {
    return this.ping;
  }

  /**
   * Returns the rate of this player
   *
   * @return int The rate of this player
   */
  getRate() {
    return this.rate;
  }

  /**
   * Returns the score of this player
   *
   * @return int The score of this player
   */
  getScore() {
    return this.score;
  }

  /**
   * Returns the connection state of this player
   *
   * @return string The connection state of this player
   */
  getState() {
    return this.state;
  }

  /**
   * Returns the SteamID of this player
   *
   * @return string The SteamID of this player
   */
  getSteamId() {
    return this.steamId;
  }

  /**
   * Returns whether this player is a bot
   *
   * @return bool <var>true</var> if this player is a bot
   */
  isBot() {
    return this.steamId == 'BOT';
  }

  /**
   * Returns whether this player object has extended information gathered
   * using RCON
   *
   * @return bool <var>true</var> if extended information for this player
   *     is available
   */
  isExtended() {
    return this.extended;
  }

  /**
   * Returns a string representation of this player
   *
   * @return string A string representing this player
   */
  __toString() {
    if(this.extended) {
      return "#{this.connectionId} \"{this.name}\", SteamID: {this.steamId} Score: {this.score}, Time: {this.connectTime}";
    } else {
      return "#{this.id} \"{this.name}\", Score: {this.score}, Time: {this.connectTime}";
    }
  }
}