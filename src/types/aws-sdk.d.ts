declare module "@aws-sdk/client-s3" {
  export class S3Client { constructor(config: any); send(command: any): Promise<any>; }
  export class HeadObjectCommand { constructor(input: any); }
}
declare module "@aws-sdk/lib-storage" {
  export class Upload { constructor(config: any); done(): Promise<any>; }
}
