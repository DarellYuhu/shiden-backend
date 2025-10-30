import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from 'src/prisma/prisma.service';
import { TiktokService } from './tiktok.service';
@Injectable()
export class TiktokScheduler {
  private logger = new Logger();
  constructor(
    private prisma: PrismaService,
    private tiktokService: TiktokService,
  ) {}

  @Cron(CronExpression.EVERY_HOUR)
  async getVideoStatistic() {
    try {
      const contents = await this.prisma.content.findMany({
        where: { platformAccount: { platform: 'TIKTOK' }, link: { not: null } },
      });
      const matchedContent = contents
        .map((c) => ({ ...c, match: this.tiktokUrlPattern(c.link!) }))
        .filter((c) => c.match);
      await Promise.all(
        matchedContent.map(async (c) => ({
          ...c,
          result: await this.tiktokService.getVideoInfo(c.match!.id),
        })),
      );
    } catch {
      this.logger.error('Fail fetch content statistics');
    }
  }

  private tiktokUrlPattern(url: string) {
    const regex =
      /^https?:\/\/(?:www\.)?tiktok\.com\/@([a-zA-Z0-9._]+)\/video\/(\d+)/;
    const match = url.match(regex);
    if (match) {
      return { username: match[1], id: match[2] };
    } else return null;
  }
}
