// Domain rules for Experience playback and validation

export const autoplayPolicy = {
  spinnerMaxMs: 1500
};

export function isValidUrl(url) {
  try {
    const u = new URL(url);
    if (["javascript:", "data:"].includes(u.protocol)) return false;
    return true;
  } catch {
    return false;
  }
}

export function getCtaTarget(experience, slug) {
  const mode = experience?.cta_mode || 'ECARD';
  if (mode === 'CUSTOM_URL' && experience?.cta_custom_url) {
    return { type: 'external', url: experience.cta_custom_url };
  }
  if (mode === 'SHOP') return { type: 'page', page: 'ShopPublicStorefront', params: slug ? `slug=${slug}` : '' };
  if (mode === 'POSTS') return { type: 'page', page: 'Community', params: slug ? `author=${slug}` : '' };
  return { type: 'page', page: 'EcardView', params: slug ? `slug=${slug}` : '' };
}