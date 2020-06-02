'use strict';
import Packet from "./../Packet";

export default class RCONPacket extends Packet{
  constructor(id: number, body: Buffer | string, type: number) {
    super(new Buffer(Buffer.byteLength(body) + 14))
    this._writeLong(this.buffer.length - 4);
    this._writeLong(id);
    this._writeLong(type);
    this._writeString(body);
    this._writeShort(0x00);
  }
  
  get size() {
    return this.buffer.readInt32LE(0);
  }
  
  get ID() {
    return this.buffer.readInt32LE(4);
  }
  
  get type() {
    return this.buffer.readInt32LE(8);
  }
  
  get body() {
    var txt = "", i = 0;
    /*while(this.buffer.readInt8(12 + i) != 0x00) {
      txt += String.fromCharCode(this.buffer.readUInt8(12 + i));
      i++;
    }*/
    txt = this.buffer.slice(12).toString()
    return txt;
  }
}
