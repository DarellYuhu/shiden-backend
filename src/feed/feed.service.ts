import { HttpService } from '@nestjs/axios';
import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { lastValueFrom } from 'rxjs';
import { PrismaService } from 'src/prisma/prisma.service';
import { MinioService } from 'src/core/minio/minio.service';
import { PassThrough, Readable } from 'stream';
import archiver from 'archiver';
import { Content } from 'types';

@Injectable()
export class FeedService {
  private logger = new Logger(FeedService.name);

  constructor(
    private http: HttpService,
    private prisma: PrismaService,
    private minio: MinioService,
  ) {}

  findMany(threadId: string, userId: string) {
    return this.prisma.feed.findMany({
      where: { threadMember: { threadId, userId }, content: { is: null } },
    });
  }

  async download(feedId: string) {
    const feed = await this.prisma.feed.findUnique({
      where: { id: feedId },
    });
    if (!feed) throw new NotFoundException('Feed not found!');
    const metadata = feed.contentMeta as Content;
    const zipStream = new PassThrough();
    const archive = archiver('zip', { zlib: { level: 9 } });
    archive.pipe(zipStream);
    for (const file of metadata.files) {
      try {
        const { data } = await lastValueFrom(
          this.http.get<Readable>(file.url, { responseType: 'stream' }),
        );
        archive.append(data, { name: file.name });
      } catch {
        this.logger.error(`Fail to read: ${file.name}`);
      }
    }
    await archive.finalize();
    const bucket = 'tmp';
    const zipFileName = `archive-${Date.now()}.zip`;
    await this.minio.putObject(bucket, zipFileName, zipStream);
    const downloadUrl = await this.minio.presignedGetObject(
      bucket,
      zipFileName,
      60 * 60, // valid for 1 hour
    );
    return downloadUrl;
  }
}
