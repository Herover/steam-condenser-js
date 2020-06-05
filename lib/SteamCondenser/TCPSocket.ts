'use strict';
import Socket from "./Socket";
import net from 'net';
import SteamPacket from "./Servers/Packets/SteamPacket";

export default class TCPSocket extends Socket {
  protected socket?: net.Socket;
  private buffer = Buffer.alloc(4096);
  private receivedBytes = 0;

  constructor(address: string, port: number) {
    super(address, port);
  }
  
  connect() {
    return new Promise((resolve, reject) => {
      this.socket = net.createConnection({
        host: this.ipAddress,
        port: this.port
      });
      this.socket.on("connect", () => {
        this.open = true;
        resolve();
      });
      this.socket.on("error", () => {
        reject();
      });
      this.socket.on("data", (data) => {
        this.buffer = Buffer.concat([this.buffer.slice(0, this.receivedBytes), data]);
        this.receivedBytes += data.length;
      })
    })
  }
  
  close() {
    return new Promise((resolve, reject) => {
      if (typeof this.socket === "undefined") {
        throw new Error("Socket is undefined")
      }
      this.socket.on("end", () => resolve());
      this.socket.end();
    })
  }
  
  send(data: Buffer | SteamPacket): Promise<void> {
    if (!this.isOpen) {
      throw new Error("Socket not open");
    }
    let buffer: Buffer;
    if(data instanceof SteamPacket) buffer = data.toBuffer();
    else buffer = data;
    
    return new Promise((resolve, reject) => {
      if (typeof this.socket === "undefined") {
        throw new Error("Socket is undefined")
      }
      this.socket.write(buffer, (err) => {
        if(err) {
          reject(err);
        }
        else {
          resolve();
        }
      });
    });
  }

  recvBytes(bytes = 0): Promise<Buffer> {
    const received = Buffer.alloc(bytes);
    let stored = 0;
    return new Promise<Buffer>(resolve => {
      const dataFn = () => {
        if (this.receivedBytes > 0) {
          if (bytes == 0) {
            if (typeof this.socket != "undefined") {
              this.socket.off("data", dataFn);
            }

            this.receivedBytes = 0;
            resolve(this.buffer);
          } else {
            const readBytes = Math.min(this.receivedBytes, bytes-stored);
            this.buffer.copy(received, stored, 0, readBytes);
            this.buffer.copyWithin(0, readBytes, this.receivedBytes);
            this.receivedBytes -= readBytes;
            stored += readBytes;
            if (stored >= bytes) {
              if (typeof this.socket != "undefined") {
                this.socket.off("data", dataFn);
              }

              resolve(received);
            }
          }
        }
      }

      if (typeof this.socket == "undefined") {
        throw new Error("Socket not ready");
      }
      this.socket.on("data", dataFn);
      dataFn();
    });
  }
  
  recv(fn: (buffer: Buffer, rinfo?: any) => boolean) {
    let returned = false;
    return new Promise((resolve, reject) => {
      if (typeof this.socket === "undefined") {
        throw new Error("Socket is undefined")
      }
      const dataFn = (data: Buffer) => {
        if(returned){
          return;
        }

        const done = fn(data);
        if(done !== false) {
          returned = true;
          resolve(done);
          
          if (typeof this.socket != "undefined") {
            this.socket.off("data", dataFn);
            this.socket.off("error", errorFn);
          }
        }
      };
      const errorFn = (err: Error) => {
        reject(err);
        
        if (typeof this.socket != "undefined") {
          this.socket.off("data", dataFn);
          this.socket.off("error", errorFn);
        }
      };
      this.socket.on("data", dataFn);
      this.socket.on("error", errorFn);
    });
  }
}
