'use strict';
import Socket from "./Socket";
import dgram from "dgram";

export default class UDPSocket extends Socket {
  protected socket?: dgram.Socket;

  constructor(address: string, port: number) {
    super(address, port);
  }
  
  connect() {
    return new Promise((resolve, reject) => {
      this.socket = dgram.createSocket("udp4");
      this.open = true;
      resolve();
    });
  }
  
  close() {
    return new Promise((resolve, reject) => {
      if (typeof this.socket === "undefined") {
        throw new Error("socket is undefined")
      }

      this.socket.close();
      this.socket.on("close", () => {
        this.open = false;
        resolve();
      });
    })
  }
  
  send(buffer: Buffer | any): Promise<void> { // TODO: remove or replace any type
    if(typeof buffer.toBuffer == "function") buffer = buffer.toBuffer();
    
    // console.log("udpsocket.js send", buffer);
    
    return new Promise((resolve, reject) => {
      if (typeof this.socket === "undefined") {
        throw new Error("socket is undefined")
      }

      this.socket.send(buffer, 0, buffer.length, this.port, this.ipAddress, function(err) {
        if(err) {
          reject(err);
        }
        else {
          resolve();
        }
      });
    });
  }
  
  recv(fn: (buffer: Buffer, rinfo: any) => boolean) {
    let returned = false;
    return new Promise((resolve, reject) => {
      if (typeof this.socket === "undefined") {
        throw new Error("socket is undefined")
      }
    
      this.socket.on("message", (data, rinfo) => {
        if(returned) {
          // TODO: why do we recieve too many packets sometimes?
          // Look into getPlayers maybe
          return;
        }

        var done = fn(data, rinfo);
        if(done !== false) {
          returned = true;
          resolve(done);
        }
      });
      this.socket.on("error", (err) => {
        if(returned) {
          return;
        }

        returned = true;
        reject(err);
      });
    });
  }
};
