class SteamPlayer {
  private connectTime: number;

  private id: number;

  private name: string;

  private score: number;

  private extended: boolean;

  private connectionId?: number;

  private state?: string;

  private steamId?: string;

  private loss?: number;

  private ping?: number;

  private ipAddress?: string;

  private clientPort?: number;

  private rate?: number;


  constructor(id: number, name: string, score: number, connectTime: number) {
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
  addInformation(playerData: {[key: string]: string}): void {
    if (playerData.name !== this.name) {
      throw new Error('Information to add belongs to a different player.');
    }

    this.extended = true;
    this.connectionId = Number.parseInt(playerData.userid, 10);
    if (typeof playerData.state !== 'undefined') {
      this.state = playerData.state;
    }
    this.steamId = playerData.uniqueid;

    if (!this.isBot()) {
      this.loss = Number.parseInt(playerData.loss, 10);
      this.ping = Number.parseInt(playerData.ping, 10);

      if (typeof playerData.state !== 'undefined') {
        const address = playerData.adr.split(':');
        [this.ipAddress] = address;
        this.clientPort = Number.parseInt(address[1], 10);
      }

      if (typeof playerData.state !== 'undefined') {
        this.rate = Number.parseInt(playerData.rate, 10);
      }
    }
  }

  /**
   * Returns the client port of this player
   *
   * @return int The client port of the player
   */
  getClientPort(): number | undefined {
    return this.clientPort;
  }

  /**
   * Returns the connection ID (as used on the server) of this player
   *
   * @return int The connection ID of this player
   */
  getConnectionId(): number | undefined {
    return this.connectionId;
  }

  /**
   * Returns the time this player is connected to the server
   *
   * @return float The connection time of the player
   */
  getConnectTime(): number | undefined {
    return this.connectTime;
  }

  /**
   * Returns the ID of this player
   *
   * @return int The ID of this player
   */
  getId(): number | undefined {
    return this.id;
  }

  /**
   * Returns the IP address of this player
   *
   * @return string The IP address of this player
   */
  getIpAddress(): string | undefined {
    return this.ipAddress;
  }

  /**
   * Returns the packet loss of this player's connection
   *
   * @return string The packet loss of this player's connection
   */
  getLoss(): number | undefined {
    return this.loss;
  }

  /**
   * Returns the nickname of this player
   *
   * @return string The name of this player
   */
  getName(): string | undefined {
    return this.name;
  }

  /**
   * Returns the ping of this player
   *
   * @return int The ping of this player
   */
  getPing(): number | undefined {
    return this.ping;
  }

  /**
   * Returns the rate of this player
   *
   * @return int The rate of this player
   */
  getRate(): number | undefined {
    return this.rate;
  }

  /**
   * Returns the score of this player
   *
   * @return int The score of this player
   */
  getScore(): number | undefined {
    return this.score;
  }

  /**
   * Returns the connection state of this player
   *
   * @return string The connection state of this player
   */
  getState(): string | undefined {
    return this.state;
  }

  /**
   * Returns the SteamID of this player
   *
   * @return string The SteamID of this player
   */
  getSteamId(): string | undefined {
    return this.steamId;
  }

  /**
   * Returns whether this player is a bot
   *
   * @return bool <var>true</var> if this player is a bot
   */
  isBot(): boolean | undefined {
    return this.steamId === 'BOT';
  }

  /**
   * Returns whether this player object has extended information gathered
   * using RCON
   *
   * @return bool <var>true</var> if extended information for this player
   *     is available
   */
  isExtended(): boolean {
    return this.extended;
  }

  /**
   * Returns a string representation of this player
   *
   * @return string A string representing this player
   */
  toString(): string {
    if (this.extended) {
      return `#${this.connectionId} "${this.name}", SteamID: ${this.steamId} Score: ${this.score}, Time: ${this.connectTime}`;
    }
    return `#${this.id} "${this.name}", Score: ${this.score}, Time: ${this.connectTime}`;
  }
}

export { SteamPlayer };
