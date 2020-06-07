
import net from 'net';
import dgram from 'dgram';
import SteamPacket from './Servers/Packets/SteamPacket';

export default abstract class Socket {
  protected ipAddress: string;

  protected port: number;

  protected open: boolean;

  protected socket?: net.Socket | dgram.Socket;

  protected timeout = 30000;

  constructor(address: string, port: number) {
    let addr = address;
    this.port = port;
    if (addr.indexOf(':') !== -1) {
      const parts = addr.split(':');
      [addr] = parts;
      this.port = Number.parseInt(parts[1], 10);
    }
    this.ipAddress = addr;

    this.open = false;
  }

  // Open connection
  abstract connect(): Promise<void>;

  // Close connection, remove listeners
  abstract close(): Promise<void>;

  // Send buffer
  abstract send(buffer: Buffer | SteamPacket): Promise<void>;

  abstract recvBytes(bytes: number): Promise<Buffer>;

  // Receive data
  // fn returns true when no more packets are expected
  abstract recv(fn: (buffer: Buffer) => boolean): Promise<boolean>;

  setTimeout(time: number): void {
    this.timeout = time;
  }

  isOpen(): boolean {
    if (typeof this.socket === 'undefined') {
      return false;
    }
    return this.open;
  }

  resource(): net.Socket | dgram.Socket | void {
    return this.socket;
  }
}
