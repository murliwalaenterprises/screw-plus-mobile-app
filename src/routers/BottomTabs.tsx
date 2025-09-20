/* eslint-disable react/no-unstable-nested-components */
import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Home as HomeIcon, List, Compass, SearchIcon, User2 } from "lucide-react-native";
import { StackNames } from "../constants/stackNames";
import Home from "../screens/tabs/Home";
import Categories from "../screens/tabs/Categories";
import Explore from "../screens/tabs/Explore";
import Profile from "../screens/tabs/Profile";
import Search from "../screens/tabs/Search";
import {Colors} from "../constants/Colors";
import HomeScreen from "../screens/tabs/HomeScreen2";

const Tab = createBottomTabNavigator();

export default function BottomTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarShowLabel: true,
        tabBarActiveTintColor: Colors.light.tint,
        tabBarInactiveTintColor: "#8e8e93",
      }}
      initialRouteName={StackNames.Home}
    >
      <Tab.Screen
        name={StackNames.Home}
        // component={Home}
        component={HomeScreen}
        options={{
          title: "Home",
          tabBarIcon: ({ color, size }) => <HomeIcon color={color} size={size} />,
          headerShown: false
        }}
      />
      <Tab.Screen
        name={StackNames.Categories}
        component={Categories}
        options={{
          title: "Categories",
          tabBarIcon: ({ color, size }) => <List color={color} size={size} />,
          headerShown: false
        }}
      />
      <Tab.Screen
        name={StackNames.Explore}
        component={Explore}
        options={{
          title: "Explore",
          tabBarIcon: ({ color, size }) => <Compass color={color} size={size} />,
          headerShown: false
        }}
      />
      <Tab.Screen
        name={StackNames.Search}
        component={Search}
        options={{
          title: "Search",
          tabBarIcon: ({ color, size }) => <SearchIcon color={color} size={size} />,
          headerShown: false
        }}
      />
        <Tab.Screen
          name={StackNames.Profile}
          component={Profile}
          options={{
            title: "Profile",
            tabBarIcon: ({ color, size }) => <User2 color={color} size={size} />,
            headerShown: false
          }}
        />
    </Tab.Navigator>
  );
}
