/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

const tintColorLight = '#FF7417';
const tintColorDark = '#fff';

export const Colors = {
  Primary: '#0a7ea4',
  // homeScreenHeaderBackground: ["#690ce9", "rgba(180, 17, 239, 0.3)", "#ffffff"],
  // homeScreenHeaderForeground: '#fff',
  light: {
    primary: '#6EE7B7',
    success: '#2FD258',
    danger: '#FB443A',
    text: '#11181C',
    background: '#fff',
    tint: tintColorLight,
    icon: '#687076',
    tabIconDefault: '#687076',
    tabIconSelected: tintColorLight,
    placeholderTextColor: '#666',
    link: '#005cc5',
    homeScreenHeaderBackground: {
      start: '#fa751cff',
      end: '#f5cdb3ff',
    },
    homeScreenHeaderForeground: '#2d2d2dff',

    primaryButtonBackground: {
      start: '#ffd814',
      end: '#ffd814',
    },
    primaryButtonForeground: '#333',
    primaryButton: '#333',
    primaryButtonText: '#fff'
  },
  dark: {
    text: '#ECEDEE',
    background: '#151718',
    tint: tintColorDark,
    icon: '#9BA1A6',
    tabIconDefault: '#9BA1A6',
    tabIconSelected: tintColorDark,
  },
  defaultBlack: '#000',
  defaultWhite: '#fff',
  StatusBarBg: 'transparent',
  StatusBarTextColor: '#222',
  ScreenBGColor: '#f8f9fa',
};
