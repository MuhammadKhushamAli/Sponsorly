/** Cache list payloads so detail routes work if a direct fetch is unavailable. */
export const creatorProfileCacheKey = (id) => `sponsorly:creator:${id}`;
export const sponsorProfileCacheKey = (id) => `sponsorly:sponsor:${id}`;

export function stashCreatorProfile(creator) {
  const id = creator?._id;
  if (!id) return;
  try {
    sessionStorage.setItem(creatorProfileCacheKey(id), JSON.stringify(creator));
  } catch {
    /* ignore quota / private mode */
  }
}

export function stashSponsorProfile(sponsor) {
  const id = sponsor?._id;
  if (!id) return;
  try {
    sessionStorage.setItem(sponsorProfileCacheKey(id), JSON.stringify(sponsor));
  } catch {
    /* ignore */
  }
}

export function readCachedCreator(id) {
  try {
    const raw = sessionStorage.getItem(creatorProfileCacheKey(id));
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function readCachedSponsor(id) {
  try {
    const raw = sessionStorage.getItem(sponsorProfileCacheKey(id));
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}
