import { HttpService } from '@nestjs/axios';
import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { lastValueFrom } from 'rxjs';
import { PrismaService } from 'src/prisma/prisma.service';
import { MinioService } from 'src/core/minio/minio.service';
import { PassThrough, Readable } from 'stream';
import archiver from 'archiver';
import { Content } from 'types';
import { GetFeedQueryDto } from './dto/get-feed-query.dto';
import { Prisma } from 'generated/prisma';
import { subDays } from 'date-fns';
import { fileTypeFromStream } from 'file-type';
import got from 'got';

@Injectable()
export class FeedService {
  private logger = new Logger(FeedService.name);

  constructor(
    private http: HttpService,
    private prisma: PrismaService,
    private minio: MinioService,
  ) {}

  async findMany(userId: string, { limit = 10, ...query }: GetFeedQueryDto) {
    const where: Prisma.FeedWhereInput = {
      threadMember: { threadId: query.thread_id, userId },
      content: { is: null },
    };
    let cursor: Prisma.FeedWhereUniqueInput | undefined = undefined;
    if (query.less_than) {
      const time = subDays(new Date(), parseInt(query.less_than));
      where.updatedAt = { gte: time };
    }
    if (query.cursor) {
      cursor = {
        id: query.cursor.id,
        createdAt: query.cursor.created_at,
      } satisfies Prisma.FeedWhereUniqueInput;
    }
    const data = await this.prisma.feed.findMany({
      where,
      take: limit,
      skip: cursor ? 1 : 0,
      orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
      include: {
        threadMember: { select: { thread: { select: { name: true } } } },
      },
      cursor,
    });
    const lastData = data.at(data.length - 1);
    return {
      data: await Promise.all(
        data.map(async ({ threadMember, ...rest }) => {
          const contentMeta = rest.contentMeta as Content;
          const files = await Promise.all(
            contentMeta.files.map(async (file) => {
              const stream = got.stream(file.url);
              return {
                ...file,
                mimeType: (await fileTypeFromStream(stream))?.mime,
              };
            }),
          );
          return {
            ...rest,
            contentMeta: { ...contentMeta, files },
            threadName: threadMember.thread.name,
          };
        }),
      ),
      cursor: lastData
        ? { createdAt: lastData.createdAt, id: lastData.id }
        : null,
    };
  }

  async findUnique(id: string) {
    return this.prisma.feed.findUnique({ where: { id } });
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
