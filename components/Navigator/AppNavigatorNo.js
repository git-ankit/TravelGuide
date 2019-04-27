import React, { Component } from "react";
import { createStackNavigator, createAppContainer } from "react-navigation";

// import the different screens
import LocationFetchNo from "../Screens/NoLogin/LocationFetchNo";
import AnswersNo from "../Screens/NoLogin/AnswersNo";
import ProfileNo from "../Screens/NoLogin/ProfileNo";
import placeByType from "../Screens/placeByType";
import BottomNavNo from "../Navigator/BottomNavNo";

export default class AppNavigatorMain extends React.Component {
  render() {
    return <AppContainer />;
  }
}

// create our app's navigation stack
const AppNavigatorNo = createStackNavigator(
  {
    BottomNavNoScreen: { screen: BottomNavNo },
    LocationFetchNoScreen: { screen: LocationFetchNo },
    placeByTypeScreen: { screen: placeByType },
    AnswersNoScreen: { screen: AnswersNo },
    ProfileNoScreen: { screen: ProfileNo }
  },
  {
    headerMode: "none"
  }
);

const AppContainer = createAppContainer(AppNavigatorNo);
