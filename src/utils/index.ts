import { Platform } from 'generated/prisma';

export const linkValidator = (link: string, platform: Platform) => {
  const match = link.match(LinkRegex[platform]);
  return !!match;
};

const LinkRegex: Record<Platform, RegExp> = {
  TIKTOK: /^https?:\/\/(?:www\.)?tiktok\.com\/@([a-zA-Z0-9._]+)\/video\/(\d+)/,
  FACEBOOK:
    /^https?:\/\/(?:www\.)?facebook\.com\/([^/]+)\/posts\/([A-Za-z0-9._-]+)(?:\?.*)?$/,
  INSTAGRAM:
    /^https?:\/\/(?:www\.)?instagram\.com\/(?:p|reel|tv)\/([A-Za-z0-9_-]+)\/?(?:\?.*)?$/,
  X: /^https?:\/\/(?:www\.)?(?:twitter\.com|x\.com)\/([A-Za-z0-9_]+)\/status\/(\d+)\/?(?:\?.*)?$/,
};
