// These really should be an enum. However this doesn't seem super compatible
// with user code unless also exporting the types. I don't want to do that
// right now.
const ErrorLevels: {[index: string]: number} = {
  L: 1,
  M: 0,
  Q: 3,
  H: 2,
} as const;
type ErrorLevels = typeof ErrorLevels[keyof typeof ErrorLevels];

declare module 'qr.js/lib/QRCode' {
  export default class QRCode {
    constructor(typeNumber: number, errorCorrectLevel: ErrorLevels);
    make(): void;
    addData(data: any): void;
    modules: Array<Array<boolean>> | null;
  }
}

declare module 'qr.js/lib/ErrorCorrectLevel' {
  export default ErrorLevels;
}
