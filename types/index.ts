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
