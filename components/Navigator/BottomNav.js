import React, { Component } from "react";
import {
  Text,
  View,
  TouchableOpacity,
  StyleSheet,
  ScrollView
} from "react-native";

import LocationFetch from "../Screens/LocationFetch";
import PlaceByType from "../Screens/placeByType";
import Profile from "../Screens/Profile";
import Answers from "../Screens/Answers";
import ProfileOwn from "../Screens/ProfileOwn";

import Icon from "react-native-vector-icons/SimpleLineIcons";
import { createStackNavigator, createAppContainer } from "react-navigation";

const LocationFetchNav = createStackNavigator(
  {
    LocationFetchScreen: { screen: LocationFetch },
    AnswersScreen: { screen: Answers },
    ProfileScreen: { screen: Profile },
    ProfileOwnScreen: { screen: ProfileOwn }
  },
  {
    headerMode: "none"
  }
);

const AppContainer = createAppContainer(LocationFetchNav);

export default class BottomNav extends Component {
  constructor(props) {
    super(props);
    this.state = {
      currentScreen: "LocationFetch"
    };
  }

  render() {
    ScreenRender = <AppContainer />;
    currentScreen = this.state.currentScreen;
    if (currentScreen == "LocationFetch") {
      ScreenRender = <AppContainer />;
    }
    if (currentScreen == "NearBy") {
      ScreenRender = <PlaceByType />;
    }
    if (currentScreen == "Profile") {
      ScreenRender = <ProfileOwn />;
    }
    return (
      <View style={{ flex: 1 }}>
        <View style={{ height: "92%" }}>{ScreenRender}</View>
        <View
          style={{
            height: "8%",
            justifyContent: "center",
            backgroundColor: "#009688"
          }}
        >
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-evenly"
            }}
          >
            <TouchableOpacity
              onPress={() => this.setState({ currentScreen: "LocationFetch" })}
            >
              <View
                style={{
                  padding: 20,
                  flexDirection: "row"
                }}
              >
                <View style={{ paddingHorizontal: 5 }}>
                  <Icon color="#fff" size={18} name="map" />
                </View>
                <Text style={{ color: "#fff", fontWeight: "bold" }}>
                  Search
                </Text>
              </View>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => this.setState({ currentScreen: "NearBy" })}
            >
              <View
                style={{
                  padding: 20,
                  flexDirection: "row"
                }}
              >
                <View style={{ paddingHorizontal: 5 }}>
                  <Icon color="#fff" size={18} name="location-pin" />
                </View>
                <Text style={{ color: "#fff", fontWeight: "bold" }}>
                  Near By
                </Text>
              </View>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => this.setState({ currentScreen: "Profile" })}
            >
              <View
                style={{
                  padding: 20,
                  flexDirection: "row"
                }}
              >
                <View style={{ paddingHorizontal: 5 }}>
                  <Icon color="#fff" size={18} name="user" />
                </View>
                <Text style={{ color: "#fff", fontWeight: "bold" }}>
                  Profile
                </Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  }
}
