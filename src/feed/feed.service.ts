import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { Cron, CronExpression, SchedulerRegistry } from '@nestjs/schedule';
import { Prisma } from 'generated/prisma';
import { shuffle } from 'lodash';
import { lastValueFrom } from 'rxjs';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class FeedService {
  private NODE_ENV = process.env.NODE_ENV;
  constructor(
    private scheduler: SchedulerRegistry,
    private http: HttpService,
    private prisma: PrismaService,
  ) {}

  @Cron(CronExpression.EVERY_5_SECONDS, { name: 'fetch-feeds-scheduler' })
  async getFeeds() {
    if (this.NODE_ENV === 'development')
      this.scheduler.deleteCronJob('fetch-feeds-scheduler');
    const { data } = await lastValueFrom(this.http.get<Content[]>('/contents'));
    const groupedContent = await this.groupBySource(data);
    for (const [k, v] of groupedContent) {
      await this.distributeContent(k, v);
    }
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
