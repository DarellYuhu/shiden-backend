import { HttpService } from '@nestjs/axios';
import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression, SchedulerRegistry } from '@nestjs/schedule';
import { subHours } from 'date-fns';
import { Prisma } from 'generated/prisma';
import { shuffle } from 'lodash';
import { lastValueFrom } from 'rxjs';
import { PrismaService } from 'src/prisma/prisma.service';
import { Content } from 'types';

@Injectable()
export class FeedScheduler {
  private NODE_ENV = process.env.NODE_ENV;
  private logger = new Logger(FeedScheduler.name);

  constructor(
    private scheduler: SchedulerRegistry,
    private prisma: PrismaService,
    private http: HttpService,
  ) {}

  @Cron(CronExpression.EVERY_HOUR, {
    name: 'auto-remove-feeds-scheduler',
    waitForCompletion: true,
  })
  async autoRemoveFeeds() {
    if (this.NODE_ENV === 'development')
      this.scheduler.deleteCronJob('auto-remove-feeds-scheduler');
    const sixtyHourAgo = subHours(new Date(), 60);
    await this.prisma.feed.deleteMany({
      where: { content: { is: null }, updatedAt: { lt: sixtyHourAgo } },
    });
  }

  @Cron(CronExpression.EVERY_HOUR, {
    name: 'fetch-feeds-scheduler',
    waitForCompletion: true,
  })
  async getFeeds() {
    // if (this.NODE_ENV === 'development')
    //   this.scheduler.deleteCronJob('fetch-feeds-scheduler');
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
    const feedPayload: Prisma.FeedCreateManyInput[] = uids
      .slice(0, contents.length)
      .map((threadMemberId, idx) => ({
        id: contents[idx].id,
        threadMemberId,
        contentMeta: contents[idx],
      }));
    // const feedPayload: Prisma.FeedCreateManyInput[] = contents.map(
    //   (ct, idx) => ({
    //     id: ct.id,
    //     threadMemberId: uids[idx % uids.length],
    //     contentMeta: ct,
    //   }),
    // );
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
