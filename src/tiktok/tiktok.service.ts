import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { isAxiosError } from 'axios';
import { sleep } from 'bun';
import { firstValueFrom } from 'rxjs';
import { TiktokResponse } from 'types';
// import { UtilsService } from 'src/core/utils/utils.service';

@Injectable()
export class TiktokService {
  constructor(
    private readonly http: HttpService,
    // private readonly utils: UtilsService,
  ) {}

  async getVideoInfo(id: string) {
    const data = await this.makeRequestCall(id);
    const content = data?.aweme_list.find((item) => item.aweme_id === id);
    if (content) {
      const normalize = {
        author: {
          uid: content.author.uid,
          nickname: content.author.nickname,
          signature: content.author.signature,
        },
        video: {
          id,
          description: content.desc,
          createTime: content.create_time,
          duration: content.video.duration,
          comment: content.statistics.comment_count,
          like: content.statistics.digg_count,
          download: content.statistics.download_count,
          play: content.statistics.play_count,
          share: content.statistics.share_count,
          forward: content.statistics.forward_count,
          lose: content.statistics.lose_count,
          lose_comment: content.statistics.lose_comment_count,
          whatsapp_share: content.statistics.whatsapp_share_count,
          collect: content.statistics.collect_count,
          repost: content.statistics.repost_count,
        },
      };
      return normalize;
    } else return null;
  }

  private async makeRequestCall(id: string) {
    const params = {
      aweme_id: id,
      iid: '7318518857994389254',
      device_id: '7318517321748022790',
    };
    const headers = {
      accept:
        'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
      'accept-language': 'en-US,en;q=0.9',
      'cache-control': 'max-age=0',
      priority: 'u=0, i',
      'sec-ch-ua':
        '"Not A(Brand";v="8", "Chromium";v="132", "Microsoft Edge";v="132"',
      'sec-ch-ua-mobile': '?0',
      'sec-ch-ua-platform': 'Windows',
      'sec-fetch-dest': 'document',
      'sec-fetch-mode': 'navigate',
      'sec-fetch-site': 'cross-site',
      'sec-fetch-user': '?1',
      'upgrade-insecure-requests': '1',
      'user-agent':
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/132.0.0.0 Safari/537.36 Edg/132.0.0.0',
    };
    try {
      const { data } = await firstValueFrom(
        this.http.get<TiktokResponse>('/aweme/v1/feed/', {
          params,
          headers,
        }),
      );
      return data;
    } catch (error) {
      if (isAxiosError(error)) {
        if (error.code === '429') {
          await sleep(2000);
          await this.getVideoInfo(id);
        }
      }
    }
  }
}
