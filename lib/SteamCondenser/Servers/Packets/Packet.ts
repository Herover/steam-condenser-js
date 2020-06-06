
import bignum from 'bignum';
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

  readByte(): number {
    const res = this.buffer.readInt8(this.bufferPointer);
    this.bufferPointer += 1;
    return res;
  }

  readShort(): number {
    const res = this.buffer.readInt16LE(this.bufferPointer);
    this.bufferPointer += 2;
    return res;
  }

  readLong(): number {
    const res = this.buffer.readInt32LE(this.bufferPointer);
    this.bufferPointer += 4;
    return res;
  }

  readFloat(): number {
    const res = this.buffer.readFloatLE(this.bufferPointer);
    this.bufferPointer += 4;
    return res;
  }

  readLongLong(): string {
    const a = this.buffer.readInt32LE(this.bufferPointer);
    this.bufferPointer += 4;
    const b = this.buffer.readInt32LE(this.bufferPointer);
    this.bufferPointer += 4;
    return bignum.add(a, bignum.mul(bignum.pow(2, 16), b)).toString();
  }

  readString(): string {
    let txt = '';
    while (this.buffer.readInt8(this.bufferPointer) !== 0x00) {
      txt += String.fromCharCode(this.buffer.readInt8(this.bufferPointer));
      this.bufferPointer += 1;
    }
    this.bufferPointer += 1;
    return txt;
  }

  rest(): Buffer {
    return this.buffer.slice(this.bufferPointer);
  }

  writeByte(value: number): this {
    this.buffer.writeInt8(value, this.bufferPointer);
    this.bufferPointer += 1;
    return this;
  }

  writeShort(value: number): this {
    this.buffer.writeInt16LE(value, this.bufferPointer);
    this.bufferPointer += 2;
    return this;
  }

  writeLong(value: number): this {
    this.buffer.writeInt32LE(value, this.bufferPointer);
    this.bufferPointer += 4;
    return this;
  }

  writeFloat(value: number): this {
    this.buffer.writeInt32LE(value, this.bufferPointer);
    this.bufferPointer += 4;
    return this;
  }

  writeLongLong(value: string): this {
    this.buffer.write(value, this.bufferPointer, 8);
    this.bufferPointer += 8;
    return this;
  }

  /**
   * Write string to buffer.
   * @argument value Text to write, must include null(s)
   * @return packet
   */
  writeString(value: string | { toString: () => string }): this {
    let input = value;
    if (typeof input !== 'string') {
      input = input.toString();
    }
    if (typeof input === 'string') {
      this.buffer.write(input, this.bufferPointer);
      this.bufferPointer += input.length;
    }
    return this;
  }

  resetPointer(): void {
    this.bufferPointer = 0;
  }

  toString(): string {
    return this.buffer.toString();
  }

  toBuffer(): Buffer {
    return Buffer.from(this.buffer);
  }
}
