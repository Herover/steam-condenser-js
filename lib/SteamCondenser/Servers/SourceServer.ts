
import { MasterServer } from './MasterServer';
import GameServer from './GameServer';
import RCONSocket from './Sockets/RCONSocket';
import SourceSocket from './Sockets/SourceSocket';
import RCONServerdataAuthPacket from './Packets/RCON/RCONServerdataAuthPacket';
import RCONServerdataExeccommandPacket from './Packets/RCON/RCONServerdataExeccommandPacket';
import RCONTerminator from './Packets/RCON/RCONTerminator';
import RCONPacket from './Packets/RCON/RCONPacket';

class SourceServer extends GameServer {
  private rconSocket?: RCONSocket;

  protected socket?: SourceSocket;

  private rconRequestId = -1;

  async disconnect(): Promise<void> {
    await Promise.all([
      new Promise((resolve) => {
        if (typeof this.rconSocket === 'undefined') {
          throw new Error('rconSocket not ready');
        }
        this.rconSocket.close().then(resolve);
      }),
      new Promise((resolve) => {
        if (typeof this.socket === 'undefined') {
          throw new Error('socket not ready');
        }
        this.socket.close().then(resolve);
      }),
    ]);
  }

  async initSocket(): Promise<void> {
    this.rconSocket = new RCONSocket(this.ipAddress, this.port);
    this.socket = new SourceSocket(this.ipAddress, this.port);
    if (typeof this.socket === 'undefined') {
      throw new Error('socket not ready');
    }

    this.socket.setTimeout(this.timeout);
    this.rconSocket.setTimeout(this.timeout);

    await this.socket.connect();
  }

  async rconAuth(password: string): Promise<boolean> {
    this.rconRequestId = SourceServer.GenerateRconRequestId();

    if (typeof this.rconSocket === 'undefined') {
      throw new Error('rconSocket not set up');
    }

    await this.rconSocket.send(new RCONServerdataAuthPacket(this.rconRequestId, password));

    if (typeof this.rconSocket === 'undefined') {
      throw new Error('rconSocket not set up');
    }
    let reply = await this.rconSocket.getReply();

    if (!reply) {
      throw new Error('RCONBanException');
    }
    if (typeof this.rconSocket === 'undefined') {
      throw new Error('rconSocket not set up');
    }
    reply = await this.rconSocket.getReply();

    if (!reply) {
      throw new Error("Received no 2'nd rcon response");
    }

    this.rconAuthenticated = reply.ID === this.rconRequestId;
    return this.rconAuthenticated;
  }

  async rconExec(command: string): Promise<string> {
    if (!this.rconAuthenticated) {
      throw new Error('RCONNoAuthException');
    }

    let isMulti = false;
    let responsePacket: RCONPacket | void;
    const response: string[] = [];
    if (typeof this.rconSocket === 'undefined') {
      throw new Error('rconSocket not ready');
    }
    await this.rconSocket.send(new RCONServerdataExeccommandPacket(this.rconRequestId, command));

    do {
      // eslint-disable-next-line no-await-in-loop
      responsePacket = await this.rconSocket.getReply();

      if (typeof responsePacket === 'undefined' || responsePacket instanceof RCONServerdataAuthPacket) {
        this.rconAuthenticated = false;
        throw new Error('RCONNoAuthException');
      }

      if (!isMulti && responsePacket.body.length > 0) {
        isMulti = true;
        if (typeof this.rconSocket === 'undefined') {
          throw new Error('rconSocket not set up');
        }
        this.rconSocket.send(new RCONTerminator(this.rconRequestId));
      }

      response.push(responsePacket.body);
    } while (isMulti
      && !(
        response.length > 2
        // FIXME: Final 2 packets should be empty,
        && response[response.length - 2] === ''
        && response[response.length - 1].endsWith('\u0000\u0000')
      )
    );

    return response.slice(0, response.length - 2).join().trim();
  }

  setTimeout(time: number): void {
    super.setTimeout(time);
    this.socket?.setTimeout(time);
    this.rconSocket?.setTimeout(time);
  }

  static GenerateRconRequestId(): number {
    return Math.floor(Math.random() * (2 ** 16));
  }

  static GetMaster(): MasterServer {
    return new MasterServer(MasterServer.SOURCE_MASTER_SERVER);
  }
}

export { SourceServer };
