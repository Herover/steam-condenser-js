'use strict';
import bignum from "bignum";
/**
 * High level class for data packets with helper-functions.
 * See https://developer.valvesoftware.com/wiki/Server_Queries#Data_Types
 */
export default class Packet {
  protected buffer: Buffer;
  private bufferPointer: number;

  constructor(data: Buffer) {
    this.bufferPointer = 0;
    this.buffer = data;
  }
  
  _readByte(): number {
    const res = this.buffer.readInt8(this.bufferPointer);
    this.bufferPointer += 1;
    return res;
  }
  
  _readShort(): number {
    const res = this.buffer.readInt16LE(this.bufferPointer);
    this.bufferPointer += 2;
    return res;
  }
  
  _readLong(): number {
    const res = this.buffer.readInt32LE(this.bufferPointer);
    this.bufferPointer += 4;
    return res;
  }
  
  _readFloat(): number {
    const res = this.buffer.readFloatLE(this.bufferPointer);
    this.bufferPointer += 4;
    return res;
  }
  
  _readLongLong(): string {
    const a = this.buffer.readInt32LE(this.bufferPointer);
    this.bufferPointer += 4;
    const b = this.buffer.readInt32LE(this.bufferPointer);
    this.bufferPointer += 4;
    return bignum.add(a, bignum.mul(bignum.pow(2, 16), b)).toString();
  }
  
  _readString(): string {
    let txt = "";
    while(this.buffer.readInt8(this.bufferPointer) != 0x00) {
      txt += String.fromCharCode(this.buffer.readInt8(this.bufferPointer));
      this.bufferPointer++;
    }
    this.bufferPointer++;
    return txt;
  }
  
  _rest(): Buffer {
    return this.buffer.slice(this.bufferPointer);
  }
  
  _writeByte(value: number): this {
    this.buffer.writeInt8(value, this.bufferPointer);
    this.bufferPointer += 1;
    return this;
  }
  
  _writeShort(value: number): this {
    this.buffer.writeInt16LE(value, this.bufferPointer);
    this.bufferPointer += 2;
    return this;
  }
  
  _writeLong(value: number): this {
    this.buffer.writeInt32LE(value, this.bufferPointer);
    this.bufferPointer += 4;
    return this;
  }
  
  _writeFloat(value: number): this {
    this.buffer.writeInt32LE(value, this.bufferPointer);
    this.bufferPointer += 4;
    return this;
  }
  
  _writeLongLong(value: string): this {
    this.buffer.write(value, this.bufferPointer, 8);
    this.bufferPointer += 8;
    return this;
  }
  
  /**
   * Write string to buffer.
   * @argument value Text to write, must include null(s)
   * @return packet
   */
  _writeString(value: string | { toString: () => string }): this {
    if(typeof value != "string") {
      value = value.toString();
    }
    if(typeof value == "string") {
      this.buffer.write(value, this.bufferPointer);
      this.bufferPointer += value.length;
    }
    return this;
  }
  
  _resetPointer(): void {
    this.bufferPointer = 0;
  }
  
  toString(): string {
    return this.buffer.toString();
  }
  
  toBuffer(): Buffer {
    return Buffer.from(this.buffer);
  }
}