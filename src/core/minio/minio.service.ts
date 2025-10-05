import { Injectable } from '@nestjs/common';
import * as minio from 'minio';

@Injectable()
export class MinioService extends minio.Client {
  constructor() {
    super({
      endPoint: process.env.MINIO_ENDPOINT || '',
      port: parseInt(process.env.MINIO_PORT || '9000'),
      accessKey: process.env.MINIO_ACCESS_KEY,
      secretKey: process.env.MINIO_SECRET_KEY,
      useSSL: false,
    });
  }
}
