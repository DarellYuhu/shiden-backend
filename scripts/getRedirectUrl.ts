import { AxiosError } from 'axios';

async function getTikTokCanonical(url: string, timeout = 10000) {
  const HEADERS = {
    'User-Agent':
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36',
  };

  const _PATTERNS = [
    // Define your patterns here, for example:
    /\/@(?<user>[^/]+)\/(?<type>[^/]+)\/(?<id>\d+)/,
    /\/(?<user>[^/]+)\/(?<id>\d+)/,
  ];

  let urlsToCheck: string[] = [];

  // AbortController to handle the timeout
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: HEADERS,
      signal: controller.signal,
    });

    // Capture redirected URLs
    if (response.redirected) {
      urlsToCheck.push(response.url); // Add the final URL
    }

    // Check the history of redirects (fetch doesn't provide full redirect history like requests does)
    let redirectUrl = response.url;
    let location = response.headers.get('Location');
    while (location) {
      urlsToCheck.push(location);
      redirectUrl = location;
      location = response.headers.get('Location');
    }

    // Check the final URL as well
    urlsToCheck.push(redirectUrl);
  } catch (error) {
    if (error instanceof AxiosError) {
      if (error.name === 'AbortError') {
        console.log('Request timed out');
      } else {
        console.error('Request failed:', error);
      }
    }
    return null;
  } finally {
    clearTimeout(timeoutId);
  }

  // Remove duplicates from the URLs list
  urlsToCheck = [...new Set(urlsToCheck)];

  let foundUser: string | null = null;
  let foundId: string | null = null;
  let foundType: string | null = null;

  for (const u of urlsToCheck) {
    const base = u.split('?')[0];

    // Match the URL with the patterns
    for (const pat of _PATTERNS) {
      const match = pat.exec(base) || pat.exec(u);
      if (match) {
        const gd = match.groups || {};
        foundId = gd.id || foundId;
        foundType = gd.type || foundType || 'video';
        const user = gd.user || gd.maybe_user;

        if (user) {
          foundUser = user.startsWith('@') ? user.slice(1) : user;
        }

        if (foundUser && foundId) {
          break;
        }
      }
    }

    if (foundUser && foundId) {
      break;
    }
  }

  // If user and id are not found, attempt to extract the user
  if (foundId && !foundUser) {
    for (const u of urlsToCheck) {
      const match = /\/@(?<user>[^/]+)/.exec(u);
      if (match) {
        foundUser = match.groups?.user || null;
        break;
      }
    }
  }

  if (foundUser && foundId) {
    return `https://www.tiktok.com/@${foundUser}/${foundType}/${foundId}`;
  }

  return null;
}

// Example usage
const url = 'https://vt.tiktok.com/ZSUE48WxT/';
getTikTokCanonical(url).then((canonicalUrl) => {
  console.log(canonicalUrl);
});
