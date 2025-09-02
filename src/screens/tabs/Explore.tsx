import { useIsFocused } from "@react-navigation/native";
import React, { useEffect, useRef, useState } from "react";
import { Dimensions, FlatList, StyleSheet, View } from "react-native";
import Video from "react-native-video";

const { height, width } = Dimensions.get("window");

const reelsData = [
  { id: "1", url: "https://sidtok-app.web.app/assets/videos/video1.mp4" },
  { id: "2", url: "https://sidtok-app.web.app/assets/videos/video2.mp4" },
  { id: "3", url: "https://sidtok-app.web.app/assets/videos/video3.mp4" },
  { id: "4", url: "https://sidtok-app.web.app/assets/videos/video4.mp4" },
  {
    id: "5",
    url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
  },
];

export default function Explore() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const videoRefs = useRef<any[]>([]);
  const isFocused = useIsFocused();

  const viewabilityConfig = { itemVisiblePercentThreshold: 80 };

  const onViewableItemsChanged = useRef(({ viewableItems }: any) => {
    if (viewableItems.length > 0) {
      setCurrentIndex(viewableItems[0].index);
    }
  });

  // 👇 Restart video on index change
  useEffect(() => {
    if (isFocused) {
      const currentRef = videoRefs.current[currentIndex];
      if (currentRef && currentRef.seek) {
        currentRef.seek(0); // restart video
      }
    }
  }, [currentIndex, isFocused]);

  // 👇 Pause all videos when screen unfocused
  useEffect(() => {
    if (!isFocused) {
      videoRefs.current.forEach((ref) => {
        if (ref && ref.pause) {
          // react-native-video doesn't expose pauseAsync,
          // Instead we control play via `paused` prop
        }
      });
    }
  }, [isFocused]);

  return (
    <FlatList
      data={reelsData}
      keyExtractor={(item) => item.id}
      renderItem={({ item, index }) => (
        <View style={styles.videoContainer}>
          <Video
            ref={(ref) => {
              videoRefs.current[index] = ref;
            }}
            source={{ uri: item.url }}
            style={styles.video}
            resizeMode="cover"
            repeat
            paused={!isFocused || currentIndex !== index} // 👈 play only when focused
            volume={1.0}
            onError={(e) => console.log("Video error:", e)}
          />
        </View>
      )}
      pagingEnabled
      horizontal={false}
      showsVerticalScrollIndicator={false}
      onViewableItemsChanged={onViewableItemsChanged.current}
      viewabilityConfig={viewabilityConfig}
      snapToInterval={height}
      decelerationRate="fast"
      snapToAlignment="start"
    />
  );
}

const styles = StyleSheet.create({
  videoContainer: {
    width: width,
    height: height,
    backgroundColor: "black",
  },
  video: {
    width: "100%",
    height: "100%",
  },
});