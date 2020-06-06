'use strict';
import Socket from "./Socket";
import dgram from "dgram";
import { doWithin } from "./asyncTimer";

const bufferSize = 4096;

export default class UDPSocket extends Socket {
  protected socket: dgram.Socket = dgram.createSocket("udp4");
  private buffer = Buffer.alloc(bufferSize);
  private receivedBytes = 0;

  constructor(address: string, port: number) {
    super(address, port);
  }
  
  connect(): Promise<void> {
    return new Promise((resolve) => {
      this.socket = dgram.createSocket("udp4");
      this.open = true;
      this.buffer = Buffer.alloc(bufferSize);
      this.socket.on("message", (data) => {
        this.buffer = Buffer.concat([this.buffer.slice(0, this.receivedBytes), data]);
        this.receivedBytes += data.length;
      });
      this.socket.connect(this.port, this.ipAddress, () => resolve());
    });
  }
  
  async close(): Promise<void> {
    return new Promise(resolve => {
      try {
        this.socket.disconnect();
        this.socket.close();
        this.socket.on("close", () => {
          this.open = false;
          resolve();
        });
      } catch(e) {
        // FIXME: Ignore?
      }
    })
  }
  
  send(buffer: Buffer): Promise<void> {
    return new Promise((resolve, reject) => {
      if (typeof this.socket === "undefined") {
        throw new Error("socket is undefined")
      }

      this.socket.send(buffer, (err) => {
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

    return doWithin(new Promise<Buffer>((resolve, reject) => {
      const dataFn = () => {
        if (this.receivedBytes > 0) {
          if (bytes == 0) {
            this.socket.off("message", dataFn);
            this.socket.off("error", errorFn);
            this.receivedBytes = 0;
            resolve(this.buffer);
          } else {
            const readBytes = Math.min(this.receivedBytes, bytes-stored);
            this.buffer.copy(received, stored, 0, readBytes);
            this.buffer.copyWithin(0, readBytes, this.receivedBytes);
            this.receivedBytes -= readBytes;
            stored += readBytes;
            if (stored >= bytes) {
              this.socket.off("message", dataFn);
              this.socket.off("error", errorFn);
              resolve(received);
            }
          }
        }
      }

      const errorFn = (error: Error) => {
        reject(error);
      }

      this.socket.on("message", dataFn);
      this.socket.on("error", errorFn);
      dataFn();
    }), this.timeout);
  }

  recv(fn: (buffer: Buffer) => boolean): Promise<boolean> {
    let returned = false;
    return doWithin(new Promise((resolve, reject) => {
      const dataFn = (data: Buffer) => {
        if(returned){
          return;
        }


        const done = fn(data);
        if(done !== false) {
          returned = true;
          resolve(done);
          this.socket.off("message", dataFn);
          this.socket.off("error", errorFn);
        }
      };
      const errorFn = (err: Error) => {
        reject(err);
        this.socket.off("message", dataFn);
        this.socket.off("error", errorFn);
      };
      this.socket.on("message", dataFn);
      this.socket.on("error", errorFn);
    }), this.timeout);
  }
}
