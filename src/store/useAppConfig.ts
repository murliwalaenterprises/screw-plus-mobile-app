import { create } from "zustand";

export const useAppConfig = create((set) => ({
    topBarBackgroundColor: [],
    topBarForegroundColor: '#fff',
    activeTabColor: undefined,
    homeScreenAds: [],
    isShowSlider: true,
    topBarBrandLogo: '',
    setConfig: (config: any) => set({
        homeScreenAds: config?.homeScreenAds || [],
        isShowSlider: config?.isVisibleSlider ?? true,
        topBarBackgroundColor: config?.topBarBackgroundColor || ["#690ce9", "rgba(180, 17, 239, 0.3)", "#ffffff"],
        topBarForegroundColor: config?.topBarForegroundColor || '#fff',
        activeTabColor: config?.activeTabColor || undefined,
        topBarBrandLogo: config?.topBarBrandLogo || '',
    }),
}));
