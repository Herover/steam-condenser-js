'use strict';
var bignum = require("bignum");
/**
 * High level class for data packets with helper-functions.
 * See https://developer.valvesoftware.com/wiki/Server_Queries#Data_Types
 */
module.exports = class Packet {
  constructor(data) {
    this._bufferPointer = 0;
    this.buffer = data;
  }
  
  _readByte() {
    var res = this.buffer.readInt8(this._bufferPointer);
    this._bufferPointer += 1;
    return res;
  }
  
  _readShort() {
    var res = this.buffer.readInt16LE(this._bufferPointer);
    this._bufferPointer += 2;
    return res;
  }
  
  _readLong() {
    var res = this.buffer.readInt32LE(this._bufferPointer);
    this._bufferPointer += 4;
    return res;
  }
  
  _readFloat() {
    var res = this.buffer.readFloatLE(this._bufferPointer);
    this._bufferPointer += 4;
    return res;
  }
  
  _readLongLong() {
    var a = this.buffer.readInt32LE(this._bufferPointer);
    this._bufferPointer += 4;
    var b = this.buffer.readInt32LE(this._bufferPointer);
    this._bufferPointer += 4;
    return bignum.add(a, bignum.mul(bignum.pow(2, 16), b)).toString();
  }
  
  _readString() {
    var txt = "";
    while(this.buffer.readInt8(this._bufferPointer) != 0x00) {
      txt += String.fromCharCode(this.buffer.readInt8(this._bufferPointer));
      this._bufferPointer++;
    }
    this._bufferPointer++;
    return txt;
  }
  
  _rest() {
    return this.buffer.slice(this._bufferPointer);
  }
  
  _writeByte(value) {
    this.buffer.writeInt8(value, this._bufferPointer);
    this._bufferPointer += 1;
    return this;
  }
  
  _writeShort(value) {
    this.buffer.writeInt16LE(value, this._bufferPointer);
    this._bufferPointer += 2;
    return this;
  }
  
  _writeLong(value) {
    this.buffer.writeInt32LE(value, this._bufferPointer);
    this._bufferPointer += 4;
    return this;
  }
  
  _writeFloat(value) {
    this.buffer.writeInt32LE(value, this._bufferPointer);
    this._bufferPointer += 4;
    return this;
  }
  
  _writeLongLong(value) {
    this.buffer.write(value, this._bufferPointer, 8);
    this._bufferPointer += 8;
    return this;
  }
  
  /**
   * Write string to buffer.
   * @argument value Text to write, must include null(s)
   * @return packet
   */
  _writeString(value) {
    if(typeof value != "string") {
      value = value.toString();
    }
    this.buffer.write(value, this._bufferPointer);
    this._bufferPointer += value.length;
    return this;
  }
  
  _resetPointer() {
    this._bufferPointer = 0;
  }
  
  toString() {
    return this.buffer.toString();
  }
  
  toBuffer() {
    return this.buffer;
  }
};