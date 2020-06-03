'use strict';
import Socket from "./Socket";
import net from 'net';
import SteamPacket from "./Servers/Packets/SteamPacket";

export default class TCPSocket extends Socket {
  protected socket?: net.Socket;

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
        //console.log("connected");
        resolve();
      });
      this.socket.on("error", () => {
        reject();
      });
    })
  }
  
  close() {
    return new Promise((resolve, reject) => {
      if (typeof this.socket === "undefined") {
        throw new Error("socket is undefined")
      }
      this.socket.on("end", () => resolve());
      this.socket.end();
    })
  }
  
  send(data: Buffer | SteamPacket): Promise<void> { // TODO: remove or replace any type
    var buffer: Buffer;
    if(data instanceof SteamPacket) buffer = data.toBuffer();
    else buffer = data;
     //console.log("tcpsocket.js send", buffer);
    
    return new Promise((resolve, reject) => {
      if (typeof this.socket === "undefined") {
        throw new Error("socket is undefined")
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
  
  recv(fn: (buffer: Buffer, rinfo?: any) => boolean) {
    var returned = false;
    return new Promise((resolve, reject) => {
      if (typeof this.socket === "undefined") {
        throw new Error("socket is undefined")
      }
      this.socket.on("data", (data: Buffer) => {
        if(returned){
          return;
        }

        var done = fn(data);
        if(done !== false) {
          returned = true;
          resolve(done);
        }
      });
      this.socket.on("error", (err) => {
        reject(err);
      });
    });
  }
};
