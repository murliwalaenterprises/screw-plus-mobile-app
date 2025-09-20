/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react/no-unstable-nested-components */
import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import {
  Home as HomeIcon,
  List,
  Compass,
  SearchIcon,
  User2,
} from "lucide-react-native";
import { StackNames } from "../constants/stackNames";
import Home from "../screens/tabs/Home";
import Categories from "../screens/tabs/Categories";
import Explore from "../screens/tabs/Explore";
import Profile from "../screens/tabs/Profile";
import Search from "../screens/tabs/Search";
import { Colors } from "../constants/Colors";
import { Platform, View } from "react-native";
import { BlurView } from "@react-native-community/blur";
import { scale } from "react-native-size-matters";

const Tab = createBottomTabNavigator();

export default function BottomTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarShowLabel: true,
        tabBarActiveTintColor: Colors.light.tint,
        tabBarInactiveTintColor: "#8e8e93",
        tabBarStyle: {
          position: "absolute",
          height: Platform.OS === "ios" ? 85 : 85,
          paddingHorizontal: 10,
          paddingTop: 10,
          paddingBottom: Platform.OS === "android" ? 10 : 20,
          marginBottom: Platform.OS === "android" ? 2 : 0,
          backgroundColor: "transparent", // Important for blur
          borderTopWidth: 0,
          elevation: Platform.OS === "android" ? 5 : 0,
        },
        tabBarIconStyle: {
          marginBottom: scale(5),
        },
        tabBarBackground: () =>
          Platform.OS === "ios" ? (
            <BlurView
              blurType="light"
              blurAmount={25}
              style={{
                flex: 1,
                borderTopLeftRadius: 20,
                borderTopRightRadius: 20,
                overflow: "hidden",
              }}
            />
          ) : (
            <View
              style={{
                position: "absolute",
                bottom: 0,
                left: 0,
                right: 0,
                height: 85, // Match tabBar height for Android
                borderTopLeftRadius: 20,
                borderTopRightRadius: 20,
                overflow: "hidden",
              }}
            >
              <BlurView
                blurType="light"
                blurAmount={15}
                style={{
                  width: "100%",
                  height: "100%",
                }}
              />
            </View>
          ),
      }}
      initialRouteName={StackNames.Home}
    >
      <Tab.Screen
        name={StackNames.Home}
        component={Home}
        options={{
          title: "Home",
          tabBarIcon: ({ color, size }) => (
            <HomeIcon color={color} size={size} />
          ),
          headerShown: false,
        }}
      />
      <Tab.Screen
        name={StackNames.Categories}
        component={Categories}
        options={{
          title: "Categories",
          tabBarIcon: ({ color, size }) => (
            <List color={color} size={size} />
          ),
          headerShown: false,
        }}
      />
      <Tab.Screen
        name={StackNames.Explore}
        component={Explore}
        options={{
          title: "Explore",
          tabBarIcon: ({ color, size }) => (
            <Compass color={color} size={size} />
          ),
          headerShown: false,
        }}
      />
      <Tab.Screen
        name={StackNames.Search}
        component={Search}
        options={{
          title: "Search",
          tabBarIcon: ({ color, size }) => (
            <SearchIcon color={color} size={size} />
          ),
          headerShown: false,
        }}
      />
      <Tab.Screen
        name={StackNames.Profile}
        component={Profile}
        options={{
          title: "Profile",
          tabBarIcon: ({ color, size }) => (
            <User2 color={color} size={size} />
          ),
          headerShown: false,
        }}
      />
    </Tab.Navigator>
  );
}
