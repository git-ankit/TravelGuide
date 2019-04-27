import React, { Component } from "react";
import {
  Text,
  View,
  TouchableOpacity,
  StyleSheet,
  ScrollView
} from "react-native";

import LocationFetchNo from "../Screens/NoLogin/LocationFetchNo";
import PlaceByType from "../Screens/placeByType";
import ProfileNo from "../Screens/NoLogin/ProfileNo";
import AnswersNo from "../Screens/NoLogin/AnswersNo";

import Icon from "react-native-vector-icons/SimpleLineIcons";
import { createStackNavigator, createAppContainer } from "react-navigation";

const LocationFetchNav = createStackNavigator(
  {
    LocationFetchNoScreen: { screen: LocationFetchNo },
    AnswersNoScreen: { screen: AnswersNo },
    ProfileNoScreen: { screen: ProfileNo }
  },
  {
    headerMode: "none"
  }
);

const AppContainerNo = createAppContainer(LocationFetchNav);

export default class BottomNavNo extends Component {
  constructor(props) {
    super(props);
    this.state = {
      currentScreen: "LocationFetch"
    };
  }

  render() {
    ScreenRender = <AppContainerNo />;
    currentScreen = this.state.currentScreen;
    if (currentScreen == "LocationFetch") {
      ScreenRender = <AppContainerNo />;
    }
    if (currentScreen == "NearBy") {
      ScreenRender = <PlaceByType />;
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
          </View>
        </View>
      </View>
    );
  }
}
