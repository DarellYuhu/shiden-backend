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
