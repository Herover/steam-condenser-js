import Server from './Server';
import S2CChallengePacket from './Packets/S2CChallengePacket';
import S2AInfoBasePacket, { IInfo } from './Packets/S2AInfoBasePacket';
import S2APlayerPacket from './Packets/S2APlayerPacket';
import S2ARulesPacket from './Packets/S2ARulesPacket';
import A2SPlayerPacket from './Packets/A2SPlayerPacket';
import A2SInfoPacket from './Packets/A2SInfoPacket';
import A2SRulesPacket from './Packets/A2SRulesPacket';
import SteamPacket from './Packets/SteamPacket';
import SteamSocket from './Sockets/SteamSocket';
import { SteamPlayer } from './SteamPlayer';

export default abstract class GameServer extends Server {
  protected rconAuthenticated: boolean;

  protected ping?: number;

  protected playerHash?: {[key: string]: SteamPlayer};

  protected rulesHash?: {[key: string]: string};

  protected infoHash = {} as IInfo;

  protected challengeNumber = -1;

  protected socket?: SteamSocket;

  constructor(address: string, port?: number) {
    super(address, port);

    this.rconAuthenticated = false;
  }

  async getPing(): Promise<number> {
    return new Promise((resolve) => {
      if (typeof this.ping === 'undefined') {
        resolve(this.updatePing());
      } else {
        resolve(this.ping);
      }
    });
  }

  async getPlayers(rconPassword?: string): Promise<{[key: string]: SteamPlayer}> {
    if (typeof this.playerHash === 'undefined') {
      await this.updatePlayers(rconPassword);
    }
    return this.playerHash || {};
  }

  async getRules(): Promise<{[key: string]: string}> {
    return new Promise((resolve, reject) => {
      if (typeof this.rulesHash === 'undefined') {
        this.updateRules()
          .then(() => { resolve(this.rulesHash); })
          .catch(reject);
      } else {
        resolve(this.rulesHash);
      }
    });
  }

  async getServerInfo(): Promise<IInfo> {
    if (typeof this.infoHash === 'undefined') {
      await this.updateServerInfo();
    }
    return this.infoHash;
  }

  async initialize(): Promise<void> {
    await this.initSocket();
    await this.updatePing();
    await this.updateServerInfo();
    await this.updateChallengeNumber();
  }

  async handleResponseForRequest(requestType: number, repeatOnFailure = true): Promise<void> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let expectedResponse: any; let
      requestPacket: SteamPacket;
    switch (requestType) {
      case GameServer.REQUEST_CHALLENGE:
        expectedResponse = S2CChallengePacket;
        requestPacket = new A2SPlayerPacket();
        break;
      case GameServer.REQUEST_INFO:
        expectedResponse = S2AInfoBasePacket;
        requestPacket = new A2SInfoPacket();
        break;
      case GameServer.REQUEST_PLAYER:
        expectedResponse = S2APlayerPacket;
        requestPacket = new A2SPlayerPacket(this.challengeNumber);
        break;
      case GameServer.REQUEST_RULES:
        expectedResponse = S2ARulesPacket;
        requestPacket = new A2SRulesPacket(this.challengeNumber);
        break;
      default:
        throw new Error('Called with wrong request type.');
    }

    if (typeof this.socket === 'undefined') {
      throw new Error('socket not set up');
    }

    await this.socket.send(requestPacket);
    if (typeof this.socket === 'undefined') {
      throw new Error('socket not set up');
    }

    const responsePacket = await this.socket.getReply();
    if (!(responsePacket instanceof SteamPacket)) {
      throw new Error(`Invalid response packet ${responsePacket}`);
    }

    if (responsePacket instanceof S2AInfoBasePacket) {
      this.infoHash = responsePacket.getInfo();
    } else if (responsePacket instanceof S2APlayerPacket) {
      this.playerHash = responsePacket.getPlayerHash();
    } else if (responsePacket instanceof S2ARulesPacket) {
      this.rulesHash = responsePacket.getRulesArray();
    } else if (responsePacket instanceof S2CChallengePacket) {
      this.challengeNumber = responsePacket.getChallengeNumber();
    } else {
      throw new Error(`Response of type ${responsePacket}cannot be handled by this method.`);
    }

    if (!(responsePacket instanceof expectedResponse)) {
      // TODO: Logger
      /* eslint-disable no-console */
      console.error('was', responsePacket);
      console.error('expected', expectedResponse);
      console.error('sent', requestPacket);
      /* eslint-enable no-console */
      if (repeatOnFailure) {
        return this.handleResponseForRequest(requestType, false);
      }

      // throw new Error(`Response was not expected${responsePacket}`);
    }
  }

  isRconAuthenticated(): boolean {
    return this.rconAuthenticated;
  }

  abstract rconAuth(password: string): Promise<boolean>;

  abstract rconExec(password: string): Promise<string>;

  async updateChallengeNumber(): Promise<void> {
    return this.handleResponseForRequest(GameServer.REQUEST_CHALLENGE);
  }

  async updatePing(): Promise<number> {
    if (typeof this.socket === 'undefined') {
      throw new Error('socket not set up');
    }
    await this.socket.send(new A2SInfoPacket());
    const startTime = new Date().getTime();

    if (typeof this.socket === 'undefined') {
      throw new Error('socket not set up');
    }

    await this.socket.getReply();
    const endTime = new Date().getTime();
    this.ping = endTime - startTime;

    return this.ping;
  }

  async updatePlayers(rconPassword?: string): Promise<{[key: string]: SteamPlayer} | boolean> {
    return this.handleResponseForRequest(GameServer.REQUEST_PLAYER)
      .then((): Promise<string> => {
        if (!this.rconAuthenticated) {
          if (typeof rconPassword === 'undefined') {
            return Promise.resolve('');
          }
          return this.rconAuth(rconPassword)
            .then(() => this.rconExec('status'))
            .catch((err) => {
              throw err;
            });
        }
        return this.rconExec('status');
      })
      .then((res?: string) => {
        if (typeof res === 'undefined' || !res) {
          return false;
        }

        let players = [];
        const lines = res.split('\n');
        for (let i = 0; i < lines.length; i += 1) {
          const line = lines[i];
          if (line.startsWith('#') && line !== '#end') {
            players.push(line.substr(1).trim());
          }
        }

        const attributes = GameServer.GetPlayerStatusAttributes(players[0]);
        players = players.slice(1);

        this.playerHash = {};

        for (let i = 0; i < players.length; i += 1) {
          const player = players[i];
          const playerData = GameServer.SplitPlayerStatus(attributes, player);
          if (typeof this.playerHash[playerData.name] !== 'undefined') {
            this.playerHash[playerData.name].addInformation(playerData);
          }
        }

        return this.playerHash;
      })
      .catch((e: Error) => { throw (e); });
  }

  async updateRules(): Promise<void> {
    return this.handleResponseForRequest(GameServer.REQUEST_RULES);
  }

  async updateServerInfo(): Promise<void> {
    return this.handleResponseForRequest(GameServer.REQUEST_INFO);
  }

  setTimeout(time: number): void {
    super.setTimeout(time);
    this.socket?.setTimeout(time);
  }

  toString(): string {
    let returnString = '';
    returnString += `Ping: ${this.ping}\n`;
    returnString += `Challenge number: ${this.challengeNumber}\n`;
    // Use infoHash as genereic json object
    const hash = this.infoHash as unknown as {[key: string]: string | number};
    if (typeof this.infoHash !== 'undefined') {
      returnString += 'Info:\n';
      Object.keys(this.infoHash).forEach((key) => {
        returnString += `  ${key}: ${hash}\n`;
      });
    }

    if (typeof this.playerHash !== 'undefined') {
      returnString += 'Players:\n';
      returnString = Object.keys(this.playerHash).join('\n');
    }

    if (typeof this.rulesHash !== 'undefined') {
      returnString += 'Rules:\n';
      Object.keys(this.rulesHash).forEach((key) => {
        // Typescript think rulehash might get undefined, even with above check
        if (typeof this.rulesHash !== 'undefined') {
          returnString += `  ${key}: ${this.rulesHash[key]}\n`;
        }
      });
    }

    return returnString;
  }

  static GetPlayerStatusAttributes(statusHeader: string): string[] {
    const statusAttributes = [];
    const split = statusHeader.split(/\s+/);
    for (let i = 0; i < split.length; i += 1) {
      const attr = split[i];
      if (attr === 'connected') {
        statusAttributes.push('time');
      } else if (attr === 'frag') {
        statusAttributes.push('score');
      } else {
        statusAttributes.push(attr);
      }
    }

    return statusAttributes;
  }

  static SplitPlayerStatus(attributes: string[], playerStatus: string): {[key: string]: string} {
    let statusStr = playerStatus;
    if (attributes[0] !== 'userid') {
      statusStr = statusStr.replace(/^\d+ +/, '');
    }

    const firstquote = statusStr.indexOf('"');
    const lastquote = statusStr.lastIndexOf('"');
    const data = statusStr.substr(0, firstquote).split(/\s+/)
      .concat([statusStr.substr(firstquote + 1, lastquote - 1 - firstquote)])
      .concat(statusStr.substr(lastquote + 1).split(/\s+/))
      .filter((l) => l !== '');
    // TODO: Why?
    if (attributes.length > data.length && attributes.includes('state')) {
      data.splice(3, 0);
    } else if (attributes.length < data.length) {
      data.splice(1, 1);
    }

    const playerData: {[key: string]: string} = {};
    for (let part = 0; part < data.length; part += 1) {
      playerData[attributes[part]] = data[part];
    }

    return playerData;
  }

  static REQUEST_CHALLENGE = 0;

  static REQUEST_INFO = 1;

  static REQUEST_PLAYER = 2;

  static REQUEST_RULES = 3;
}
