// src/utils/base62.ts
const chars = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
const base = 62;

export function encode(num: number): string {
  if (num === 0) return '0';
  let str = '';
  while (num > 0) {
    str = chars[num % base] + str;
    num = Math.floor(num / base);
  }
  return str;
}

export function decode(str: string): number {
  let num = 0;
  for (let i = 0; i < str.length; i++) {
    num = num * base + chars.indexOf(str[i]);
  }
  return num;
}
