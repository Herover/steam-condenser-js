import GameServer from './GameServer';
import { MasterServer } from './MasterServer';
import { GoldSrcSocket } from './Sockets/GoldSrcSocket';

class GoldSrcServer extends GameServer {
  private isHLTV = false;

  private rconPassword: string | null = null;

  static getMaster(): MasterServer {
    return new MasterServer(MasterServer.GOLDSRC_MASTER_SERVER);
  }

  constructor(address: string, port = 27015, isHLTV = false) {
    super(address, port);
    this.isHLTV = isHLTV;
  }

  async initSocket(): Promise<void> {
    this.socket = new GoldSrcSocket(this.ipAddress, this.port, this.isHLTV);

    await this.socket.connect();
  }

  async disconnect(): Promise<void> {
    if (typeof this.socket !== 'undefined') {
      await this.socket.close();
    }
  }

  async rconAuth(password: string): Promise<boolean> {
    this.rconPassword = password;

    try {
      this.rconAuthenticated = true;
      await this.rconExec('');
    } catch (error) {
      this.rconAuthenticated = false;
      this.rconPassword = null;
    }

    return this.rconAuthenticated;
  }

  async rconExec(command: string): Promise<string> {
    if (!this.rconAuthenticated || this.rconPassword === null) {
      throw new Error('Unauthenticated');
    }

    try {
      return await (this.socket as GoldSrcSocket).rconExec(this.rconPassword, command);
    } catch (error) {
      this.rconAuthenticated = false;
      throw error;
    }
  }
}

export { GoldSrcServer };
