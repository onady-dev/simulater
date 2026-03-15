export const adsConfig = {
  publisherId: process.env.NEXT_PUBLIC_ADSENSE_PUBLISHER_ID || '',
  slots: {
    topBanner: process.env.NEXT_PUBLIC_ADSENSE_TOP_BANNER_SLOT || '',
    inContent: process.env.NEXT_PUBLIC_ADSENSE_IN_CONTENT_SLOT || '',
    stickyBottom: process.env.NEXT_PUBLIC_ADSENSE_STICKY_BOTTOM_SLOT || '',
    sidebar: process.env.NEXT_PUBLIC_ADSENSE_SIDEBAR_SLOT || '',
  },
  enabled: process.env.NEXT_PUBLIC_ENABLE_ADS === 'true',
  stickyEnabled: process.env.NEXT_PUBLIC_ENABLE_STICKY_AD === 'true',
};

export const isAdsEnabled = (): boolean => {
  return adsConfig.enabled && adsConfig.publisherId !== '';
};
