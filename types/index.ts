export type Content = {
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

export type NovuPushPayload = {
  target: string[];
  title: string;
  content: string;
  overrides: Record<string, unknown>;
  payload: {
    __source: string;
    subscriber: {
      _id: string;
      _organizationId: string;
      _environmentId: string;
      subscriberId: string;
      channels: unknown[];
      deleted: boolean;
      createdAt: string;
      updatedAt: string;
      __v: number;
      isOnline: boolean;
      lastOnlineAt: string;
      id: string;
    };
    step: {
      digest: boolean;
      events: unknown[];
      total_count: number;
    };
  };
};

export type PustNotificationData = {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
};

export type TiktokResponse = {
  aweme_list: {
    aweme_id: string;
    desc: string;
    create_time: number;
    author: {
      uid: string;
      nickname: string;
      signature: string;
      avatar_larger: {
        uri: string;
        url_list: string[];
        width: number;
        height: number;
      };
    };
    video: {
      cover: {
        uri: string;
        url_list: string[];
        width: number;
        height: number;
      };
      duration: number;
    };
    statistics: {
      comment_count: number;
      digg_count: number;
      download_count: number;
      play_count: number;
      share_count: number;
      forward_count: number;
      lose_count: number;
      lose_comment_count: number;
      whatsapp_share_count: number;
      collect_count: number;
      repost_count: number;
    };
  }[];
};
