"use strict";
import bignum from "bignum";

export default class ByteBuffer {
  private buffer: Buffer;
  private capacity: number;
  private mylimit: number;
  private myposition: number;

  constructor(buffer?: Buffer) {
    if(typeof buffer == "undefined") {
      buffer = Buffer.alloc(0); // Empty buffer: note \0 byte?
    }
    this.buffer = buffer;
    this.capacity = buffer.length;
    this.mylimit = this.capacity;
    this.myposition = 0;
  }
  
  clear(): this {
    this.mylimit = this.capacity;
    this.myposition = 0;
    this.buffer.fill(0x00);
    
    return this;
  }
  
  flip(): this {
    this.mylimit = this.myposition;
    this.myposition = 0;
    
    return this;
  }
  
  get(length?: number): Buffer {
    if(typeof length == "undefined") {
      length = this.mylimit - this.myposition;
    }
    else if(length > this.remaining()) {
      throw new Error("BufferUnderFlorException");
    }
    
    const data = this.buffer.slice(this.myposition, this.myposition + length);
    this.myposition += length;
    return data;
  }
  
  getByte(): number {
    const res = this.buffer.readInt8(this.myposition);
    this.myposition += 1;
    return res;
  }
  
  getShort(): number {
    const res = this.buffer.readInt16LE(this.myposition);
    this.myposition += 2;
    return res;
  }
  
  getUShort(): number {
    const res = this.buffer.readUInt16LE(this.myposition);
    this.myposition += 2;
    return res;
  }

  getLong(): number {
    const res = this.buffer.readInt32LE(this.myposition);
    this.myposition += 4;
    return res;
  }
  
  getUnsignedLong(): number {
    const res = this.buffer.readUInt32LE(this.myposition);
    this.myposition += 4;
    return res;
  }
  
  getFloat(): number {
    const res = this.buffer.readFloatLE(this.myposition);
    this.myposition += 4;
    return res;
  }
  
  getLongLong(): string {
    const a = this.buffer.readInt32LE(this.myposition);
    this.myposition += 4;
    const b = this.buffer.readInt32LE(this.myposition);
    this.myposition += 4;
    return bignum.add(a, bignum.mul(bignum.pow(2, 16), b)).toString();
  }
  
  getString(): string {
    let txt = "";
    while(this.buffer.readInt8(this.myposition) != 0x00) {
      txt += String.fromCharCode(this.buffer.readInt8(this.myposition));
      this.myposition++;
    }
    this.myposition++;
    return txt;
  }
  
  limit(newmylimit: number): number | void {
    if(typeof newmylimit == "undefined") {
      return this.mylimit;
    } else {
      this.mylimit = newmylimit;
    }
  }
  
  position(position?: number): number {
    if(typeof position == "number") {
      this.myposition = position;
    }
    return this.myposition;
  }

  getBuffer(): Buffer {
    return this.buffer;
  }
  
  put(source: Buffer): this {
    source.copy(this.buffer, this.myposition);
    //this.buffer.write(source, this.myposition);
    this.myposition += source.length;
    
    return this;
  }
  
  remaining(): number {
    return this.mylimit - this.myposition;
  }
  
  rewind(): this {
    this.myposition = 0;
    
    return this;
  }
  
  static Allocate (length: number): ByteBuffer {
    return new ByteBuffer(Buffer.alloc(length, 0x00));
  }

  static Wrap(buffer: Buffer): ByteBuffer {
    return new ByteBuffer(buffer);
  }
}
