import React, { Component } from "react";
import { createStackNavigator, createAppContainer } from "react-navigation";

// import the different screens
import LocationFetch from "../Screens/LocationFetch";
import Answers from "../Screens/Answers";
import Profile from "../Screens/Profile";
import Profile2 from "../Screens/Profile";
import placeByType from "../Screens/placeByType";
import BottomNav from "../Navigator/BottomNav";
import ProfileOwn from "../Screens/ProfileOwn";
import FavUser from "../Screens/FavUser";

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
    ProfileScreen2: { screen: Profile2 },
    ProfileOwnScreen: { screen: ProfileOwn },
    FavUserScreen: { screen: FavUser }
  },
  {
    headerMode: "none"
  }
);

const AppContainer = createAppContainer(AppNavigator);
