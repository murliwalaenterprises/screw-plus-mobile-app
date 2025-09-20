module.exports = {
  presets: ['module:@react-native/babel-preset'],
  plugins: [
    "react-native-worklets/plugin",  // ✅ replace reanimated with worklets
  ],
};
