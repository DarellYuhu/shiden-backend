import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression, SchedulerRegistry } from '@nestjs/schedule';
import { PrismaService } from 'src/prisma/prisma.service';
import { TiktokService } from './tiktok.service';
import { LinkRegex } from 'src/utils';
import { isAxiosError } from 'axios';
import pLimit from 'p-limit';

const limit = pLimit(10);

@Injectable()
export class TiktokScheduler {
  private logger = new Logger();
  constructor(
    private prisma: PrismaService,
    private tiktokService: TiktokService,
    private scheduler: SchedulerRegistry,
  ) {}

  @Cron(CronExpression.EVERY_12_HOURS, { name: 'tiktok-scheduler' })
  async getVideoStatistic() {
    if (process.env.NODE_ENV === 'development')
      this.scheduler.deleteCronJob('tiktok-scheduler');
    try {
      const contents = await this.prisma.content.findMany({
        where: { platformAccount: { platform: 'TIKTOK' }, link: { not: null } },
      });
      const matchedContent = contents
        .map((c) => ({
          ...c,
          match: this.tiktokUrlValidator(c.link!),
        }))
        .filter((c) => c.match);
      const contentWithStats = await Promise.all(
        matchedContent.map((c) =>
          limit(async () => ({
            ...c,
            result: await this.tiktokService.getVideoInfo(c.match!.id),
          })),
        ),
      );
      const payload = contentWithStats
        .filter((c) => !!c.result)
        .map((c) => {
          const data = {
            comment: c.result!.video.comment,
            like: c.result!.video.like,
            view: c.result!.video.play,
            share: c.result!.video.share,
            other: c.result!,
          };
          return this.prisma.content.update({
            where: { id: c.id },
            data: {
              statistic: {
                upsert: {
                  create: data,
                  update: data,
                },
              },
            },
          });
        });
      await this.prisma.$transaction(payload);
      this.logger.log('Successfully get Tiktok statistics');
    } catch (error) {
      if (isAxiosError(error)) {
        this.logger.error(`Fail fetch content statistics: ${error.message}`);
      }
    }
  }

  private tiktokUrlValidator(url: string) {
    const match = url.match(LinkRegex.TIKTOK);
    if (match) {
      return { username: match[1], id: match[2] };
    } else return null;
  }
}
