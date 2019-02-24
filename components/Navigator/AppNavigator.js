import React, { Component } from "react";
import { createStackNavigator, createAppContainer } from "react-navigation";

// import the different screens
import LocationFetch from "../Screens/LocationFetch";
import Answers from "../Screens/Answers";


export default class AppNavigatorMain extends React.Component {
    
  render() {
    return <AppContainer />;
  }
}

// create our app's navigation stack
const AppNavigator = createStackNavigator(
  {
    LocationFetchScreen:{screen: LocationFetch},
    AnswersScreen:{screen: Answers}
  },
  {
    headerMode: "none"
  }
);

const AppContainer = createAppContainer(AppNavigator);
