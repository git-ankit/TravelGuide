import React, { Component } from "react";
import { createStackNavigator, createAppContainer } from "react-navigation";

// import the different screens
import LocationFetch from "../Screens/LocationFetch";
import Answers from "../Screens/Answers";
import Profile from "../Screens/Profile";
import placeByType from "../Screens/placeByType";
import BottomNav from "../Navigator/BottomNav";
import ProfileOwn from "../Screens/ProfileOwn";

export default class AppNavigatorMain extends React.Component {
  render() {
    return <AppContainer />;
  }
}

// create our app's navigation stack
const AppNavigator = createStackNavigator(
  {
    BottomNavScreen: { screen: BottomNav },
    LocationFetchScreen: { screen: LocationFetch },
    placeByTypeScreen: { screen: placeByType },
    AnswersScreen: { screen: Answers },
    ProfileScreen: { screen: Profile },
    ProfileOwnScreen: { screen: ProfileOwn }
  },
  {
    headerMode: "none"
  }
);

const AppContainer = createAppContainer(AppNavigator);
