"use strict";
var bignum = require("bignum");

class ByteBuffer {
  constructor(buffer) {
    this.buffer = buffer;
    this.capacity = buffer.length;
    this.mylimit = this.capacity;
    this.myposition = 0;
  }
  
  // Unused/unneeded in implementation?
  _array() {
    return this.buffer;
  }
  
  clear() {
    this.mylimit = this.capacity;
    this.myposition = 0;
    this.buffer.fill(0x00);
  }
  
  flip() {
    this.mylimit = this.myposition;
    this.myposition = 0;
    
    return this;
  }
  
  get(length) {
    if(typeof length == "undefined") {
      length = this.mylimit - this.myposition;
    }
    else if(length > this.remaining()) {
      throw new Error("BufferUnderFlorException");
    }
    
    var data = this.buffer.slice(this.myposition, this.myposition + length);
    this.myposition += length;
    return data;
  }
  
  getByte() {
    var res = this.buffer.readInt8(this.myposition);
    this.myposition += 1;
    return res;
  }
  
  getShort() {
    var res = this.buffer.readInt16LE(this.myposition);
    this.myposition += 2;
    return res;
  }
  
  getLong() {
    var res = this.buffer.readInt32LE(this.myposition);
    this.myposition += 4;
    return res;
  }
  
  getUnsignedLong() {
    var res = this.buffer.readUInt32LE(this.myposition);
    this.myposition += 4;
    return res;
  }
  
  getFloat() {
    var res = this.buffer.readFloatLE(this.myposition);
    this.myposition += 4;
    return res;
  }
  
  getLongLong() {
    var a = this.buffer.readInt32LE(this.myposition);
    this.myposition += 4;
    var b = this.buffer.readInt32LE(this.myposition);
    this.myposition += 4;
    return bignum.add(a, bignum.mul(bignum.pow(2, 16), b)).toString();
  }
  
  getString() {
    var txt = "";
    while(this.buffer.readInt8(this.myposition) != 0x00) {
      txt += String.fromCharCode(this.buffer.readInt8(this.myposition));
      this.myposition++;
    }
    this.myposition++;
    return txt;
  }
  
  limit(newmylimit) {
    if(typeof newmylimit == "undefined") {
      return this.mylimit;
    } else {
      this.mylimit = newmylimit;
    }
  }
  
  position(position) {
    if(typeof position == "number") {
      this.myposition = position;
    }
    else {
      return this.myposition;
    }
  }
  
  put(source) {
    source.copy(this.buffer, this.myposition);
    //this.buffer.write(source, this.myposition);
    this.myposition += source.length;
    
    return this;
  }
  
  remaining() {
    return this.mylimit - this.myposition;
  }
  
  rewind() {
    this.myposition = 0;
    
    return this;
  }
}

ByteBuffer.allocate = function(length) {
  return new ByteBuffer(Buffer.alloc(length, 0x00));
}

ByteBuffer.wrap = function(buffer) {
  return new ByteBuffer(buffer);
}

module.exports = ByteBuffer;