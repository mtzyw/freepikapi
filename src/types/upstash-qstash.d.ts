declare module "@upstash/qstash" {
  export class Receiver {
    constructor(opts: { currentSigningKey: string; nextSigningKey?: string });
    verify(opts: { signature: string; body: string; url?: string }): Promise<boolean> | boolean;
  }
}

