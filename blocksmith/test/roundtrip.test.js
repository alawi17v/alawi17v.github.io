import assert from 'node:assert/strict';import {parseNBT,serializeNBT} from '../nbt.js';
const b=[];const u8=x=>b.push(x&255);const u16=x=>{u8(x>>8);u8(x)};const i32=x=>{u8(x>>24);u8(x>>16);u8(x>>8);u8(x)};const str=s=>{const a=new TextEncoder().encode(s);u16(a.length);b.push(...a)};
u8(10);str('Test');u8(3);str('score');i32(42);u8(4);str('big');b.push(0x11,0x22,0x10,0xf4,0x7d,0xe9,0x81,0x15);u8(8);str('note');str('hello');u8(0);
const root=parseNBT(new Uint8Array(b));assert.equal(root.name,'Test');assert.equal(root.value[0].value,42);assert.equal(root.value[1].value,0x112210f47de98115n);assert.deepEqual(Array.from(serializeNBT(root)),b);console.log('NBT parse → serialize round trip passed');
