import { HttpService } from '@nestjs/axios';
import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { Cron, CronExpression, SchedulerRegistry } from '@nestjs/schedule';
import { Prisma } from 'generated/prisma';
import { shuffle } from 'lodash';
import { lastValueFrom } from 'rxjs';
import { PrismaService } from 'src/prisma/prisma.service';
import { subHours } from 'date-fns';
import { MinioService } from 'src/core/minio/minio.service';
import { PassThrough, Readable } from 'stream';
import archiver from 'archiver';

@Injectable()
export class FeedService {
  private NODE_ENV = process.env.NODE_ENV;
  private logger = new Logger(FeedService.name);
  constructor(
    private scheduler: SchedulerRegistry,
    private http: HttpService,
    private prisma: PrismaService,
    private minio: MinioService,
  ) {}

  findMany(threadId: string, userId: string) {
    return this.prisma.feed.findMany({
      where: { threadMember: { threadId, userId } },
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

  @Cron(CronExpression.EVERY_HOUR, { name: 'auto-remove-feeds-scheduler' })
  async autoRemoveFeeds() {
    if (this.NODE_ENV === 'development')
      this.scheduler.deleteCronJob('auto-remove-feeds-scheduler');
    const sixtyHourAgo = subHours(new Date(), 60);
    await this.prisma.feed.deleteMany({
      where: { content: { is: null }, updatedAt: { lt: sixtyHourAgo } },
    });
  }

  @Cron(CronExpression.EVERY_HOUR, { name: 'fetch-feeds-scheduler' })
  async getFeeds() {
    if (this.NODE_ENV === 'development')
      this.scheduler.deleteCronJob('fetch-feeds-scheduler');
    const { data } = await lastValueFrom(this.http.get<Content[]>('/contents'));
    const groupedContent = await this.groupBySource(data);
    for (const [k, v] of groupedContent) {
      await this.distributeContent(k, v);
    }
    this.logger.log('Scheduler Executed Successfuly');
  }

  private async distributeContent(workgroupId: string, contents: Content[]) {
    const thread = await this.prisma.thread.findMany({
      where: { source: { some: { workgroupId } } },
      include: {
        threadMember: { select: { id: true }, where: { isEnabled: true } },
      },
    });
    const uids = shuffle(
      thread.flatMap((t) => t.threadMember.map((tm) => tm.id)),
    );
    if (uids.length === 0) return;
    const feedPayload: Prisma.FeedCreateManyInput[] = contents.map(
      (ct, idx) => ({
        id: ct.id,
        threadMemberId: uids[idx % uids.length],
        contentMeta: ct,
      }),
    );
    await this.prisma.feed.createMany({
      data: feedPayload,
      skipDuplicates: true,
    });
  }

  private async groupBySource(contents: Content[]) {
    const sources = await this.prisma.source.findMany();
    const allowedId = new Set(sources.map((item) => item.workgroupId));
    return contents.reduce((map, content) => {
      if (!allowedId.has(content.workgroupId)) return map;
      if (!map.has(content.workgroupId)) map.set(content.workgroupId, []);
      map.get(content.workgroupId)!.push(content);
      return map;
    }, new Map<string, Content[]>());
  }
}

type Content = {
  id: string;
  isGenerated: boolean;
  captions: string[];
  createdAt: string;
  updatedAt: string;
  contentDistributionId: string;
  storyId: string;
  workgroupId: string;
  files: {
    id: number;
    name: string;
    path: string;
    bucket: string;
    fullPath: string;
    isTmp: boolean;
    createdAt: string;
    updatedAt: string;
    url: string;
  }[];
};
