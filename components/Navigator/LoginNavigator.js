import React, { Component } from "react";

import {
  createSwitchNavigator,
  createAppContainer,
  createStackNavigator
} from "react-navigation";

import { Text } from "react-native";

// import the different screens
import Loading from "../Login/Loading";
import SignUp from "../Login/SignUp";
import LoginBackground from "../Login/LoginBackground";
import Login from "../Login/Login";
import ForgotPassword from "../Login/ForgotPassword";
import Main from "../Login/Main";
import RegisterInfo from "../Login/UserNavigation/RegisterInfo";
import AppNavigator from "./AppNavigator";
import BottomNav from "../Navigator/BottomNav";
import LocationFetchNo from "../Screens/NoLogin/LocationFetchNo";
import AppNavigatorNo from "../Navigator/AppNavigatorNo";

export default class LoginNavigatorMain extends React.Component {
  render() {
    return <AppContainer />;
  }
}

const LoginStack = createStackNavigator({
  LoginBackgroundScreen: {
    screen: LoginBackground,
    navigationOptions: ({ navigation }) => ({
      header: null
    })
  },
  AppNavigatorNoScreen: {
    screen: AppNavigatorNo,
    navigationOptions: ({ navigation }) => ({
      header: null
    })
  },
  LoginScreen: {
    screen: Login,
    navigationOptions: ({ navigation }) => ({
      headerTitle: (
        <Text style={{ fontWeight: "bold", color: "black" }}>Login</Text>
      )
    })
  },
  SignUpScreen: {
    screen: SignUp,
    navigationOptions: ({ navigation }) => ({
      headerTitle: (
        <Text style={{ fontWeight: "bold", color: "black" }}>Sign Up</Text>
      )
    })
  },
  ForgotPasswordScreen: {
    screen: ForgotPassword,
    navigationOptions: ({ navigation }) => ({
      headerTitle: (
        <Text style={{ fontWeight: "bold", color: "black" }}>
          Forgot Password
        </Text>
      )
    })
  }
});

// create our app's navigation stack
const LoginNavigator = createSwitchNavigator(
  {
    Loading,
    LoginStack,
    Main,
    RegisterInfo,
    AppNavigator,
    BottomNav
  },
  {
    initialRouteName: "Loading"
  }
);

const AppContainer = createAppContainer(LoginNavigator);
