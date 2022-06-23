const allocate = function (ArrayType, size) {
  if (ArrayType.allocUnsafe) {
    return ArrayType.allocUnsafe(size);
  }
  return new ArrayType(size);
};

export const boolToBuffer = function (boolVal: boolean): Buffer {
  const b: Buffer = allocate(Buffer, 1);
  b.writeUInt8(boolVal ? 1 : 0);
  return b;
};

console.log("running some stuff");

console.log(boolToBuffer(true));
console.log(boolToBuffer(false));
