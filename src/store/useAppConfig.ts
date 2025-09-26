import { create } from "zustand";

export const useAppConfig = create((set) => ({
    homeScreenAds: [],
    isVisibleSlider: true,
    isVisibleCategorySection: true,
    topBarBackgroundColor: [],
    topBarForegroundColor: '#fff',
    activeTabColor: undefined,
    topBarBrandLogo: '',
    setConfig: (config: any) => set({
        homeScreenAds: config?.homeScreenAds || [],
        isVisibleSlider: config?.isVisibleSlider ?? true,
        isVisibleCategorySection: config?.isVisibleCategorySection ?? true,
        topBarBackgroundColor: config?.topBarBackgroundColor || ["#690ce9", "rgba(180, 17, 239, 0.3)", "#ffffff"],
        topBarForegroundColor: config?.topBarForegroundColor || '#fff',
        activeTabColor: config?.activeTabColor || undefined,
        topBarBrandLogo: config?.topBarBrandLogo || '',
    }),
}));
