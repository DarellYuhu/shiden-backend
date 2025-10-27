import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { firstValueFrom } from 'rxjs';
import { TiktokResponse } from 'types';
// import { UtilsService } from 'src/core/utils/utils.service';

@Injectable()
export class TiktokService {
  constructor(
    private readonly http: HttpService,
    // private readonly utils: UtilsService,
  ) {}

  async getVideoInfo({ id, url }: { id: string; url: string }) {
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
    const { data } = await firstValueFrom(
      this.http.get<TiktokResponse>('/aweme/v1/feed/', {
        params,
        headers,
      }),
    );

    // const images = await Promise.all([
    //   this.utils.fetchImageMeta(
    //     data.aweme_list[0].author.avatar_larger.url_list[0],
    //   ),
    //   this.utils.fetchImageMeta(data.aweme_list[0].video.cover.url_list[0]),
    // ]);

    const normalize = {
      url,
      images: {
        // avatar: images[0],
        // video: images[1],
        fileId: 'will_be_replaced',
      },
      author: {
        uid: data.aweme_list[0].author.uid,
        nickname: data.aweme_list[0].author.nickname,
        signature: data.aweme_list[0].author.signature,
      },
      video: {
        id,
        description: data.aweme_list[0].desc,
        createTime: data.aweme_list[0].create_time,
        duration: data.aweme_list[0].video.duration,
        comment: data.aweme_list[0].statistics.comment_count,
        like: data.aweme_list[0].statistics.digg_count,
        download: data.aweme_list[0].statistics.download_count,
        play: data.aweme_list[0].statistics.play_count,
        share: data.aweme_list[0].statistics.share_count,
        forward: data.aweme_list[0].statistics.forward_count,
        lose: data.aweme_list[0].statistics.lose_count,
        lose_comment: data.aweme_list[0].statistics.lose_comment_count,
        whatsapp_share: data.aweme_list[0].statistics.whatsapp_share_count,
        collect: data.aweme_list[0].statistics.collect_count,
        repost: data.aweme_list[0].statistics.repost_count,
      },
    };
    return normalize;
  }
}
